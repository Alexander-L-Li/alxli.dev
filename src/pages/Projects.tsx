import { useNavigate } from "react-router-dom";
import { Github } from "lucide-react";

interface Project {
  title: string;
  description: string;
  technologies: string[];
  image?: string;
  preview?: React.ReactNode;
  link: string;
  github?: string;
  isInternal?: boolean;
  badge?: string;
}

const Projects = () => {
  const navigate = useNavigate();

  const projects: Project[] = [
    {
      title: "MapHub",
      description:
        "Real-time collaborative trip planning on an interactive map. Create a room, invite friends with a code, and plan your itinerary together — pin locations by day, reorder stops, and sync live via Firestore.",
      technologies: [
        "React",
        "TypeScript",
        "Firebase Firestore",
        "Google Maps API",
        "Tailwind CSS",
        "Vite",
      ],
      image: "/maphub-preview.svg",
      link: "/maphub",
      isInternal: true,
      badge: "Live Demo",
    },
    {
      title: "RL Chess Engine",
      description:
        "AlphaZero-style chess engine trained from scratch via reinforcement learning self-play. Features a 10-layer ResNet with Squeeze-Excitation attention and a policy/value dual head. Play against it live in your browser.",
      technologies: [
        "PyTorch",
        "Python",
        "ONNX",
        "ResNet",
        "MCTS",
        "Reinforcement Learning",
        "React",
        "TypeScript",
      ],
      preview: <div className="text-6xl select-none">♟️</div>,
      link: "/chess",
      isInternal: true,
      github: "https://github.com/Alexander-L-Li/chess_engine",
      badge: "Play Now",
    },
    {
      title: "Dorm Space",
      description:
        "College marketplace app where students effortlessly buy, sell, and trade campus gear. Agentic AI features include automatic listing description generation and real-time pricing recommendations.",
      technologies: [
        "React.js",
        "HTML",
        "Tailwind CSS",
        "Node.js",
        "Express",
        "FastAPI",
        "PostgreSQL",
        "Supabase",
        "Docker",
      ],
      image: "/dormspace.png",
      link: "https://github.com/Alexander-L-Li/College-Marketplace",
      github: "https://github.com/Alexander-L-Li/College-Marketplace",
    },
    {
      title: "Chilldeck DJ",
      description:
        "Won 2nd Place (of 60 projects) at MIT Web Lab Hackathon & received Best Futuristic UI Design. Full-stack web app providing accessible, easy-to-use interface for multiple-track audio mixing.",
      technologies: [
        "Javascript",
        "HTML/CSS",
        "React",
        "Node",
        "MongoDB",
        "REST API",
        "Figma",
      ],
      image: "/chilldeck.png",
      link: "https://chilldeck.onrender.com",
      github: "https://github.com/Alexander-L-Li/ChillDeck-DJ",
    },
    {
      title: "ManusMIDI Digital Instrument",
      description:
        "Web-app instrument for HackMIT, played by moving fingers in front of a webcam. Uses OpenCV to track finger keypoints and distance calculations for musical control.",
      technologies: [
        "Python",
        "Javascript",
        "HTML/CSS",
        "TailwindCSS",
        "Flask",
        "Docker",
      ],
      image: "/ManusMIDI.png",
      link: "https://manusmidi.onrender.com",
      github: "https://github.com/Alexander-L-Li/ManusMIDI",
    },
  ];

  const handleCardClick = (project: Project) => {
    if (project.isInternal) {
      navigate(project.link);
    } else {
      window.open(project.link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="pb-20">
      <header className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-forest-dark tracking-tight">
          Projects
        </h1>
        <p className="mt-3 text-[15px] leading-[1.7] text-neutral-600 max-w-xl">
          A collection of my work in software development, AI, and creative
          technology.
        </p>
      </header>

      <div className="space-y-10">
        {projects.map((project, index) => (
          <article
            key={index}
            onClick={() => handleCardClick(project)}
            className="group grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-5 sm:gap-6 cursor-pointer border-t border-neutral-200 pt-8"
          >
            {/* Preview */}
            <div className="aspect-video sm:aspect-square overflow-hidden rounded bg-neutral-100 flex items-center justify-center">
              {project.preview ? (
                <div className="w-full h-full bg-[#161622] flex items-center justify-center">
                  {project.preview}
                </div>
              ) : (
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
              )}
            </div>

            {/* Content */}
            <div className="flex flex-col">
              <div className="flex items-baseline justify-between gap-4 flex-wrap">
                <h2 className="text-lg font-medium text-neutral-900 group-hover:text-forest-dark transition-colors duration-200">
                  {project.title}
                </h2>
                <div className="flex items-center gap-3 text-[13px]">
                  {project.badge && (
                    <span className="text-forest">{project.badge} →</span>
                  )}
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-neutral-500 hover:text-forest transition-colors"
                      aria-label="GitHub repository"
                    >
                      <Github size={16} strokeWidth={1.5} />
                    </a>
                  )}
                </div>
              </div>

              <p className="mt-2 text-[14.5px] leading-[1.65] text-neutral-600">
                {project.description}
              </p>

              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[12.5px] text-neutral-500">
                {project.technologies.map((tech) => (
                  <span key={tech}>{tech}</span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Projects;
