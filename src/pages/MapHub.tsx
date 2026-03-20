import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  GoogleAuthProvider,
  type User,
} from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { MapPin, LogOut, ChevronRight } from 'lucide-react';

const DEFAULT_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#a855f7', // violet
];

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

const MapHub = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tripName, setTripName] = useState('');
  const [numDaysStr, setNumDaysStr] = useState('3');
  const [joinCode, setJoinCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Handle redirect sign-in result (fires after page reload from signInWithRedirect)
    getRedirectResult(auth).catch(() => {});
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
  }, []);

  const handleSignIn = async () => {
    setSigningIn(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? '';
      // Popup blocked or closed — fall back to full-page redirect
      if (code === 'auth/popup-blocked' || code === 'auth/popup-closed-by-user') {
        await signInWithRedirect(auth, provider);
        return; // page will reload
      }
      // Unauthorized domain → tell the user exactly what to do
      if (code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized. Add it in Firebase Console → Authentication → Settings → Authorized domains.');
      } else if (code === 'auth/operation-not-allowed') {
        setError('Google sign-in is not enabled. Enable it in Firebase Console → Authentication → Sign-in method → Google.');
      } else {
        setError(`Sign-in failed (${code || 'unknown'}). Please try again.`);
      }
      setSigningIn(false);
    }
  };

  const handleSignOut = () => signOut(auth);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !tripName.trim()) return;
    setCreating(true);
    setError('');
    try {
      let code = generateRoomCode();
      for (let i = 0; i < 10; i++) {
        const snap = await getDoc(doc(db, 'rooms', code));
        if (!snap.exists()) break;
        code = generateRoomCode();
      }
      const days = Math.min(30, Math.max(1, parseInt(numDaysStr) || 1));
      await setDoc(doc(db, 'rooms', code), {
        name: tripName.trim(),
        createdAt: serverTimestamp(),
        numDays: days,
        ownerId: user.uid,
        ownerName: user.displayName || user.email || 'Owner',
        defaultPermission: 'edit',
        dayColors: DEFAULT_COLORS.slice(0, days),
      });
      navigate(`/maphub/${code}`);
    } catch {
      setError('Failed to create room. Please try again.');
      setCreating(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    setJoining(true);
    setError('');
    try {
      const snap = await getDoc(doc(db, 'rooms', code));
      if (!snap.exists()) {
        setError('Room not found. Check the code and try again.');
        setJoining(false);
        return;
      }
      navigate(`/maphub/${code}`);
    } catch {
      setError('Failed to join. Please try again.');
      setJoining(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-white" />
          <span className="font-semibold text-white tracking-tight">MapHub</span>
        </div>
        {user && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.displayName || ''}
                  className="w-7 h-7 rounded-full"
                />
              )}
              <span className="text-sm text-zinc-400 hidden sm:block">
                {user.displayName || user.email}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="text-zinc-500 hover:text-white transition-colors p-1.5 rounded hover:bg-zinc-800"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tight mb-3">
            MapHub
          </h1>
          <p className="text-zinc-500 text-lg">Plan trips together, in real time.</p>
        </div>

        {!user ? (
          /* Sign in */
          <div className="w-full max-w-sm">
            <button
              onClick={handleSignIn}
              disabled={signingIn}
              className="w-full flex items-center justify-center gap-3 bg-white text-zinc-900 font-medium rounded-lg px-5 py-3 hover:bg-zinc-100 transition-colors disabled:opacity-60"
            >
              {/* Google logo */}
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {signingIn ? 'Signing in...' : 'Continue with Google'}
            </button>
            <p className="text-center text-zinc-600 text-xs mt-4">
              Sign in to create or join a trip
            </p>
          </div>
        ) : (
          /* Create + Join */
          <div className="w-full max-w-2xl grid sm:grid-cols-2 gap-4">
            {/* Create */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-white font-semibold mb-4">Create a Trip</h2>
              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Trip Name</label>
                  <input
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                    placeholder="e.g. Japan 2025"
                    value={tripName}
                    onChange={(e) => setTripName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">
                    Days <span className="text-zinc-600">(max 30)</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500 transition-colors"
                    value={numDaysStr}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === '' || /^\d+$/.test(raw)) setNumDaysStr(raw);
                    }}
                    onBlur={() => {
                      const val = Math.min(30, Math.max(1, parseInt(numDaysStr) || 1));
                      setNumDaysStr(String(val));
                    }}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full flex items-center justify-center gap-2 bg-white text-zinc-900 font-medium rounded-lg px-4 py-2.5 text-sm hover:bg-zinc-100 transition-colors disabled:opacity-50 mt-1"
                >
                  {creating ? 'Creating...' : 'Create Trip'}
                  {!creating && <ChevronRight className="w-4 h-4" />}
                </button>
              </form>
            </div>

            {/* Join */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-white font-semibold mb-4">Join a Trip</h2>
              <form onSubmit={handleJoin} className="space-y-3">
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Room Code</label>
                  <input
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xl text-white placeholder-zinc-600 font-mono tracking-widest text-center uppercase focus:outline-none focus:border-zinc-500 transition-colors"
                    placeholder="ABC123"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    required
                  />
                </div>
                <p className="text-xs text-zinc-600">Get a code from your trip organizer.</p>
                <button
                  type="submit"
                  disabled={joining}
                  className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-medium rounded-lg px-4 py-2.5 text-sm transition-colors disabled:opacity-50"
                >
                  {joining ? 'Joining...' : 'Join Trip'}
                  {!joining && <ChevronRight className="w-4 h-4" />}
                </button>
              </form>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 text-sm text-red-400 bg-red-950/50 border border-red-900 px-4 py-2.5 rounded-lg">
            {error}
          </div>
        )}
      </main>

      <footer className="text-center text-zinc-700 text-sm pb-6">
        <a href="/" className="hover:text-zinc-400 transition-colors">
          ← alxli.dev
        </a>
      </footer>
    </div>
  );
};

export default MapHub;
