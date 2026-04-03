import { useState, useEffect, useRef, useCallback } from "react";
import { Chess as ChessGame, Square, Move } from "chess.js";
import { Chessboard } from "react-chessboard";
import * as ort from "onnxruntime-web";

// ─────────────────────────────────────────────
// ActionMapper  (must mirror utils.py exactly)
// ─────────────────────────────────────────────
interface ActionMapper {
  moveToId: Map<string, number>;
  vocabSize: number;
}

function buildActionMapper(): ActionMapper {
  const moveToId = new Map<string, number>();
  let idx = 0;
  const files = "abcdefgh";

  for (let src = 0; src < 64; src++) {
    for (let dst = 0; dst < 64; dst++) {
      if (src === dst) continue;

      const srcFile = files[src % 8];
      const srcRank = String(Math.floor(src / 8) + 1);
      const dstFile = files[dst % 8];
      const dstRank = String(Math.floor(dst / 8) + 1);
      const uci = srcFile + srcRank + dstFile + dstRank;

      if (!moveToId.has(uci)) moveToId.set(uci, idx);
      idx++;

      // Promotion extras  (r, b, n – queen uses the plain uci above)
      const srcRankIdx = Math.floor(src / 8);
      const dstRankIdx = Math.floor(dst / 8);
      const isPromoSq =
        (dstRankIdx === 7 && srcRankIdx === 6) ||
        (dstRankIdx === 0 && srcRankIdx === 1);

      if (isPromoSq) {
        for (const p of ["r", "b", "n"]) {
          const promoUci = uci + p;
          if (!moveToId.has(promoUci)) moveToId.set(promoUci, idx);
          idx++;
        }
      }
    }
  }
  return { moveToId, vocabSize: idx };
}

// ─────────────────────────────────────────────
// Board → tensor  (mirrors utils.py board_to_tensor)
// ─────────────────────────────────────────────
const PIECE_TYPES = ["p", "n", "b", "r", "q", "k"] as const;
const HIST = 8;

function piecePlanes(fen: string): Float32Array {
  // Returns 12 * 64 floats; perspective = side-to-move of THIS board
  const chess = new ChessGame(fen);
  const board = chess.board();
  const cur = chess.turn() as "w" | "b";
  const opp = cur === "w" ? "b" : "w";
  const out = new Float32Array(12 * 64);
  let ci = 0;
  for (const color of [cur, opp]) {
    for (const pt of PIECE_TYPES) {
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const pc = board[row][col];
          if (pc && pc.type === pt && pc.color === color) {
            // chess.js row 0 = rank-8; python-chess rank = 7-row
            out[ci * 64 + (7 - row) * 8 + col] = 1;
          }
        }
      }
      ci++;
    }
  }
  return out;
}

function boardToTensor(curFen: string, histFens: string[]): Float32Array {
  const tensor = new Float32Array(119 * 64);

  // history list: most-recent-first, length padded to HIST
  const fens: string[] = [curFen, ...histFens.slice(0, HIST - 1)];
  while (fens.length < HIST) fens.push("empty");

  let off = 0;
  for (const f of fens) {
    if (f !== "empty") {
      try {
        tensor.set(piecePlanes(f), off);
      } catch { /* leave zeros */ }
    }
    off += 12 * 64;
  }

  // Auxiliary (23 planes)
  const parts = curFen.split(" ");
  const castling = parts[2] ?? "-";
  const ep = parts[3] ?? "-";
  const hmc = parseInt(parts[4] ?? "0", 10);
  const turn = parts[1] as "w" | "b";

  // Castling (4)
  const cur = turn;
  const opp2 = cur === "w" ? "b" : "w";
  for (const hasRight of [
    castling.includes(cur === "w" ? "K" : "k"),
    castling.includes(cur === "w" ? "Q" : "q"),
    castling.includes(opp2 === "w" ? "K" : "k"),
    castling.includes(opp2 === "w" ? "Q" : "q"),
  ]) {
    if (hasRight) tensor.fill(1, off, off + 64);
    off += 64;
  }

  // En-passant (1)
  if (ep !== "-" && ep.length === 2) {
    const f = ep.charCodeAt(0) - 97;
    const r = parseInt(ep[1], 10) - 1;
    if (f >= 0 && f < 8 && r >= 0 && r < 8) tensor[off + r * 8 + f] = 1;
  }
  off += 64;

  // Fifty-move (1)
  tensor.fill(Math.min(hmc / 100, 1), off, off + 64);
  off += 64;

  // Color (1)
  if (turn === "w") tensor.fill(1, off, off + 64);
  off += 64;

  // Repetitions (2)
  const posKey = (s: string) => s.split(" ").slice(0, 4).join(" ");
  const curKey = posKey(curFen);
  const reps = histFens.filter((f) => {
    try { return posKey(f) === curKey; } catch { return false; }
  }).length;
  if (reps >= 1) tensor.fill(1, off, off + 64);
  off += 64;
  if (reps >= 2) tensor.fill(1, off, off + 64);
  // remaining 14 planes = 0

  return tensor;
}

// ─────────────────────────────────────────────
// Sound engine  (synthetic, no external files)
// ─────────────────────────────────────────────
class SoundEngine {
  private ctx: AudioContext | null = null;

  private ac(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext();
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  }

  private noise(freq: number, dur: number, vol: number) {
    const ctx = this.ac();
    const sr = ctx.sampleRate;
    const buf = ctx.createBuffer(1, Math.ceil(sr * dur), sr);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++)
      d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (d.length * 0.35));
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type = "bandpass";
    filt.frequency.value = freq;
    filt.Q.value = 0.8;
    const gain = ctx.createGain();
    gain.gain.value = vol;
    src.connect(filt);
    filt.connect(gain);
    gain.connect(ctx.destination);
    src.start();
  }

  private tone(freqs: number[], gap = 0.14) {
    const ctx = this.ac();
    const t0 = ctx.currentTime;
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      const t = t0 + i * gap;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.22, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  }

  move()     { this.noise(750, 0.045, 0.28); }
  capture()  { this.noise(480, 0.07, 0.48); }
  check()    { this.tone([880, 1100]); }
  win()      { this.tone([523, 659, 784, 1047]); }
  lose()     { this.tone([523, 494, 440, 392]); }
  draw()     { this.tone([523, 523, 440]); }
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type Color = "w" | "b";
type Status = "loading" | "playing" | "checkmate" | "stalemate" | "draw" | "error";
type SqStyles = Record<string, React.CSSProperties>;

// ─────────────────────────────────────────────
// GitHub icon  (reused from Projects.tsx)
// ─────────────────────────────────────────────
const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path
      fillRule="evenodd"
      d="M12 0C5.373 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.26.82-.577
         0-.285-.01-1.04-.016-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756
         -1.089-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.809 1.304 3.495.997
         .108-.775.418-1.305.762-1.606-2.665-.304-5.466-1.332-5.466-5.931 0-1.31.469-2.381 1.236-3.221
         -.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23a11.5 11.5 0 0 1 3.003-.404c1.019.005
         2.047.138 3.003.404 2.291-1.553 3.297-1.23 3.297-1.23.654 1.653.243 2.874.12 3.176.77.84 1.235
         1.911 1.235 3.221 0 4.609-2.803 5.625-5.475 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.898
         -.015 3.293 0 .32.216.694.825.576C20.565 21.796 24 15.299 24 12c0-6.627-5.373-12-12-12z"
      clipRule="evenodd"
    />
  </svg>
);

// ─────────────────────────────────────────────
// Chess page component
// ─────────────────────────────────────────────
export default function ChessPage() {
  const [game, setGame] = useState(() => new ChessGame());
  const [posHist, setPosHist] = useState<string[]>([]);
  const [playerColor, setPlayerColor] = useState<Color>("w");
  const [status, setStatus] = useState<Status>("loading");
  const [msg, setMsg] = useState("Loading chess engine…");
  const [moveSans, setMoveSans] = useState<string[]>([]);
  const [sqStyles, setSqStyles] = useState<SqStyles>({});
  const [selSq, setSelSq] = useState<Square | null>(null);

  const sessionRef = useRef<ort.InferenceSession | null>(null);
  const mapperRef  = useRef<ActionMapper | null>(null);
  const soundRef   = useRef(new SoundEngine());
  const thinkRef   = useRef(false);          // prevent double-trigger
  const gameRef    = useRef(game);
  const histRef    = useRef(posHist);
  const colorRef   = useRef(playerColor);
  const histListRef = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState(480);

  // Compute board size from viewport
  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 1024) {
        const maxH = window.innerHeight - 160;   // subtract top bar + labels
        const maxW = window.innerWidth - 380;    // subtract side panel + gaps + padding
        setBoardSize(Math.max(400, Math.min(720, maxH, maxW)));
      } else {
        setBoardSize(Math.min(window.innerWidth - 32, 520));
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Keep refs in sync
  useEffect(() => { gameRef.current  = game;        }, [game]);
  useEffect(() => { histRef.current  = posHist;     }, [posHist]);
  useEffect(() => { colorRef.current = playerColor; }, [playerColor]);

  // ── Load ONNX model ──────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        mapperRef.current = buildActionMapper();
        ort.env.wasm.wasmPaths = "/";
        ort.env.wasm.numThreads = 1;   // single-threaded; no SharedArrayBuffer needed
        const session = await ort.InferenceSession.create("/chess_model.onnx", {
          executionProviders: ["wasm"],
        });
        sessionRef.current = session;
        setStatus("playing");
        setMsg("Your turn — you play as White");
      } catch (e) {
        console.error(e);
        setStatus("error");
        setMsg("Failed to load chess engine. Please refresh.");
      }
    })();
  }, []);

  // ── AI move trigger ──────────────────────────────────────────
  useEffect(() => {
    if (
      status !== "playing" ||
      game.turn() === playerColor ||
      game.isGameOver() ||
      !sessionRef.current ||
      thinkRef.current
    ) return;
    doAiMove(game, posHist, playerColor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, playerColor, status]);

  // ── Helpers ──────────────────────────────────────────────────
  const highlights = useCallback(
    (chess: ChessGame, from: string, to: string) => {
      const s: SqStyles = {
        [from]: { backgroundColor: "rgba(255,255,0,0.38)" },
        [to]:   { backgroundColor: "rgba(255,255,0,0.38)" },
      };
      if (chess.inCheck()) {
        const b = chess.board();
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const pc = b[r][c];
            if (pc?.type === "k" && pc.color === chess.turn()) {
              s["abcdefgh"[c] + (8 - r)] = {
                backgroundColor: "rgba(220,38,38,0.65)",
              };
            }
          }
        }
      }
      setSqStyles(s);
    },
    []
  );

  const checkOver = useCallback(
    (chess: ChessGame, plColor: Color): boolean => {
      if (chess.isCheckmate()) {
        const playerWon = chess.turn() !== plColor;
        setStatus("checkmate");
        setMsg(playerWon ? "Checkmate — You win! 🎉" : "Checkmate — AI wins.");
        if (playerWon) soundRef.current.win(); else soundRef.current.lose();
        return true;
      }
      if (chess.isStalemate()) {
        setStatus("stalemate");
        setMsg("Stalemate — draw.");
        soundRef.current.draw();
        return true;
      }
      if (chess.isDraw()) {
        setStatus("draw");
        setMsg("Draw.");
        soundRef.current.draw();
        return true;
      }
      return false;
    },
    []
  );

  const applyAndCommit = useCallback(
    (
      newGame: ChessGame,
      result: Move,
      prevFen: string,
      prevHist: string[],
      plColor: Color,
      afterMsg: string
    ) => {
      const newHist = [prevFen, ...prevHist.slice(0, HIST - 1)];

      if (newGame.inCheck())      soundRef.current.check();
      else if (result.captured)   soundRef.current.capture();
      else                        soundRef.current.move();

      setGame(newGame);
      setPosHist(newHist);
      setMoveSans((prev) => [...prev, result.san]);
      highlights(newGame, result.from, result.to);
      setSelSq(null);

      if (!checkOver(newGame, plColor)) setMsg(afterMsg);
    },
    [highlights, checkOver]
  );

  // ── AI move logic ─────────────────────────────────────────────
  const doAiMove = useCallback(
    async (chess: ChessGame, hist: string[], plColor: Color) => {
      if (thinkRef.current) return;
      thinkRef.current = true;

      // Yield to paint "AI thinking…"
      await new Promise<void>((r) => setTimeout(r, 60));

      try {
        const t = boardToTensor(chess.fen(), hist);
        const inp = new ort.Tensor("float32", t, [1, 119, 8, 8]);
        const res = await sessionRef.current!.run({ input: inp });
        const logits = res.policy.data as Float32Array;

        const legal = chess.moves({ verbose: true });
        if (legal.length === 0) { thinkRef.current = false; return; }

        let best: Move | null = null;
        let bestScore = -Infinity;

        for (const mv of legal) {
          const key =
            mv.promotion && mv.promotion !== "q"
              ? mv.from + mv.to + mv.promotion
              : mv.from + mv.to;
          const idx = mapperRef.current!.moveToId.get(key);
          if (idx !== undefined && logits[idx] > bestScore) {
            bestScore = logits[idx];
            best = mv;
          }
        }

        if (!best) best = legal[Math.floor(Math.random() * legal.length)];

        const ng = new ChessGame(chess.fen());
        const prevFen = chess.fen();
        const r = ng.move({
          from: best.from,
          to: best.to,
          promotion: best.promotion ?? "q",
        });
        if (r) applyAndCommit(ng, r, prevFen, hist, plColor, "Your turn");
      } catch (err) {
        console.error("AI error:", err);
        // random fallback
        const legal = chess.moves({ verbose: true });
        if (legal.length > 0) {
          const mv = legal[Math.floor(Math.random() * legal.length)];
          const ng = new ChessGame(chess.fen());
          const prevFen = chess.fen();
          const r = ng.move({ from: mv.from, to: mv.to, promotion: mv.promotion ?? "q" });
          if (r) applyAndCommit(ng, r, prevFen, hist, plColor, "Your turn");
        }
      }

      thinkRef.current = false;
    },
    [applyAndCommit]
  );

  // ── Player move handlers ──────────────────────────────────────
  const tryPlayerMove = (from: Square, to: Square) => {
    if (thinkRef.current) return false;
    if (game.turn() !== playerColor) return false;
    if (["checkmate", "stalemate", "draw", "loading", "error"].includes(status))
      return false;

    const piece = game.get(from);
    const isPromo =
      piece?.type === "p" &&
      ((playerColor === "w" && to[1] === "8") ||
       (playerColor === "b" && to[1] === "1"));

    const ng = new ChessGame(game.fen());
    const prevFen = game.fen();
    let result: Move | null = null;
    try {
      result = ng.move({ from, to, promotion: isPromo ? "q" : undefined });
    } catch { return false; }
    if (!result) return false;

    applyAndCommit(ng, result, prevFen, posHist, playerColor, "AI is thinking…");
    return true;
  };

  const onDrop = (src: string, tgt: string): boolean =>
    tryPlayerMove(src as Square, tgt as Square);

  const onSqClick = (sq: string) => {
    if (thinkRef.current) return;
    if (game.turn() !== playerColor) return;
    if (["checkmate", "stalemate", "draw", "loading", "error"].includes(status))
      return;

    const square = sq as Square;

    if (selSq) {
      const moved = tryPlayerMove(selSq, square);
      if (moved) return;
      // Didn't move — maybe re-select a new piece
    }

    const piece = game.get(square);
    if (piece && piece.color === playerColor) {
      setSelSq(square);
      const moves = game.moves({ verbose: true }).filter((m) => m.from === square);
      const styles: SqStyles = {
        [square]: { backgroundColor: "rgba(255,255,0,0.5)" },
      };
      for (const m of moves) {
        styles[m.to] = game.get(m.to as Square)
          ? {
              background:
                "radial-gradient(circle, rgba(200,50,50,0.55) 75%, transparent 75%)",
            }
          : {
              background:
                "radial-gradient(circle, rgba(0,0,0,0.18) 28%, transparent 28%)",
            };
      }
      setSqStyles(styles);
    } else {
      setSelSq(null);
      setSqStyles({});
    }
  };

  // ── Game controls ─────────────────────────────────────────────
  const newGame = (color?: Color) => {
    const c = color ?? playerColor;
    thinkRef.current = false;
    const ng = new ChessGame();
    gameRef.current  = ng;
    histRef.current  = [];
    colorRef.current = c;
    setGame(ng);
    setPosHist([]);
    setMoveSans([]);
    setSqStyles({});
    setSelSq(null);
    setStatus("playing");
    setPlayerColor(c);
    setMsg(
      c === "w" ? "Your turn — you play as White" : "AI is thinking…"
    );
  };

  const toggleColor = () => newGame(playerColor === "w" ? "b" : "w");

  // ── Scroll move list ──────────────────────────────────────────
  useEffect(() => {
    if (histListRef.current)
      histListRef.current.scrollTop = histListRef.current.scrollHeight;
  }, [moveSans]);

  // ── Derived UI state ──────────────────────────────────────────
  const isThinking  = thinkRef.current;
  const isOver      = ["checkmate", "stalemate", "draw"].includes(status);
  const orientation = playerColor === "w" ? "white" : "black";

  // Move history as pairs
  const pairs: { n: number; w: string; b?: string }[] = [];
  for (let i = 0; i < moveSans.length; i += 2) {
    pairs.push({ n: i / 2 + 1, w: moveSans[i], b: moveSans[i + 1] });
  }

  // Status colour
  const msgColor =
    status === "error" ? "text-red-400" :
    status === "checkmate" ? "text-yellow-400" :
    status === "loading" ? "text-gray-400" :
    game.turn() !== playerColor ? "text-blue-400" :
    "text-green-400";

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#161622] text-white flex flex-col">

      {/* ── Top bar ── */}
      <header className="shrink-0 flex items-center gap-4 px-5 py-3 border-b border-[#2a2a3d]">
        <a
          href="/projects"
          className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1"
        >
          ← Projects
        </a>
        <div className="flex-1 text-center">
          <h1 className="text-lg font-bold tracking-tight leading-none">Chess Engine</h1>
          <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">
            AlphaZero-style RL model
          </p>
        </div>
        <a
          href="https://github.com/Alexander-L-Li/chess_engine"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-white transition-colors"
          title="View source"
        >
          <GitHubIcon />
        </a>
      </header>

      {/* ── Main area ── */}
      <main className="flex-1 flex flex-col lg:flex-row gap-5 p-4 lg:p-6 items-center lg:items-start justify-center">

        {/* ── Board column ── */}
        <div className="flex flex-col items-center gap-2 shrink-0">

          {/* Opponent label */}
          <div className="flex items-center gap-2" style={{ width: boardSize }}>
            <div className="w-8 h-8 rounded-full bg-[#2a2a3d] flex items-center justify-center text-base shrink-0">
              🤖
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-tight truncate">RL Chess Engine</p>
              <p className="text-xs text-gray-500">AlphaZero-style AI</p>
            </div>
            {game.turn() !== playerColor && !isOver && status === "playing" && (
              <div className="flex gap-1 items-center">
                {[0, 150, 300].map((d) => (
                  <span
                    key={d}
                    className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${d}ms` }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Board */}
          <div className="select-none">
            <Chessboard
              boardWidth={boardSize}
              position={game.fen()}
              onPieceDrop={onDrop}
              onSquareClick={onSqClick}
              boardOrientation={orientation}
              customSquareStyles={sqStyles}
              customBoardStyle={{
                borderRadius: "6px",
                boxShadow: "0 12px 48px rgba(0,0,0,0.7)",
              }}
              customLightSquareStyle={{ backgroundColor: "#f0d9b5" }}
              customDarkSquareStyle={{ backgroundColor: "#b58863" }}
              animationDuration={160}
              arePiecesDraggable={
                !isThinking && game.turn() === playerColor && !isOver && status === "playing"
              }
            />
          </div>

          {/* Player label */}
          <div className="flex items-center gap-2" style={{ width: boardSize }}>
            <div className="w-8 h-8 rounded-full bg-[#2a2a3d] flex items-center justify-center text-base shrink-0">
              👤
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">You</p>
              <p className="text-xs text-gray-500">
                Playing as {playerColor === "w" ? "White" : "Black"}
              </p>
            </div>
          </div>
        </div>

        {/* ── Side panel ── */}
        <div className="w-full lg:w-72 xl:w-80 shrink-0 flex flex-col gap-3">

          {/* Status */}
          <div className="bg-[#1e1e2e] rounded-xl p-4 border border-[#2a2a3d]">
            <p className={`text-sm font-medium ${msgColor}`}>{msg}</p>
            {status === "loading" && (
              <div className="mt-3 h-1.5 bg-[#2a2a3d] rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full w-2/3 animate-pulse" />
              </div>
            )}
            {isOver && (
              <button
                onClick={() => newGame()}
                className="mt-3 w-full py-1.5 bg-green-700 hover:bg-green-600 rounded-lg text-sm font-medium transition-colors"
              >
                Play Again
              </button>
            )}
          </div>

          {/* Move history */}
          <div className="bg-[#1e1e2e] rounded-xl border border-[#2a2a3d] overflow-hidden">
            <div className="px-4 py-2.5 border-b border-[#2a2a3d] text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Moves
            </div>
            <div ref={histListRef} className="h-52 lg:h-64 overflow-y-auto px-2 py-1">
              {pairs.length === 0 ? (
                <p className="text-gray-600 text-xs text-center py-6">Game not started</p>
              ) : (
                pairs.map(({ n, w, b }) => (
                  <div
                    key={n}
                    className="flex gap-1 py-0.5 px-1 rounded hover:bg-[#2a2a3d] text-sm font-mono"
                  >
                    <span className="text-gray-600 w-7 text-right shrink-0">{n}.</span>
                    <span className="text-gray-200 w-16 truncate">{w}</span>
                    {b && <span className="text-gray-400 w-16 truncate">{b}</span>}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="bg-[#1e1e2e] rounded-xl p-4 border border-[#2a2a3d] flex flex-col gap-2">
            <button
              onClick={() => newGame()}
              className="w-full py-2 bg-green-800 hover:bg-green-700 rounded-lg text-sm font-semibold transition-colors"
            >
              New Game
            </button>
            <button
              onClick={toggleColor}
              className="w-full py-2 bg-[#2a2a3d] hover:bg-[#35354f] rounded-lg text-sm font-medium transition-colors text-gray-300"
            >
              {playerColor === "w" ? "Switch to Black" : "Switch to White"}
            </button>
          </div>

          {/* AI info */}
          <div className="bg-[#1e1e2e] rounded-xl p-4 border border-[#2a2a3d] text-xs text-gray-500 space-y-2">
            <p className="text-gray-300 font-semibold text-sm">About the Model</p>
            <p>
              10-layer ResNet with Squeeze-Excitation attention (AlphaZero
              architecture). Trained via RL self-play.
              12.8M parameters — policy + value dual head.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
