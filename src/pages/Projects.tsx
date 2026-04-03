import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const GitHubIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-7 h-7 text-gray-700 opacity-70 hover:opacity-100"
  >
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
      badge: "Live Demo →",
    },
    {
      title: "Dorm Space",
      description:
        "Dorm Space is a college marketplace app where students can effortlessly buy, sell, and trade campus gear. Agentic AI features include automatic listing description generation and real-time pricing recommendations.",
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
        "Won 2nd Place (out of 60 projects) in MIT's Web Lab Hackathon & received Best Futuristic UI Design. Deployed full-stack web app providing accessible, easy-to-use interface for multiple track audio mixing.",
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
      preview: <div className="text-7xl select-none">♟️</div>,
      link: "/chess",
      isInternal: true,
      github: "https://github.com/Alexander-L-Li/chess_engine",
      badge: "Play Now →",
    },
    {
      title: "ManusMIDI Digital Instrument",
      description:
        "Web app instrument for HackMIT, played by moving fingers in front of a webcam. Implemented computer vision model from OpenCV library to track keypoints of fingers & distance calculations.",
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
    <div className="py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          Projects
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          A collection of my work in software development, AI, and creative
          technology.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project, index) => (
          <div
            key={index}
            onClick={() => handleCardClick(project)}
            className="cursor-pointer"
          >
            <Card className="group hover:shadow-xl transition-all duration-300 relative flex flex-col h-[500px] bg-white border-0 shadow-md">
              {/* Preview image or custom preview */}
              <div className="aspect-video overflow-hidden rounded-t-lg bg-gray-100 flex items-center justify-center">
                {project.preview ? (
                  <div className="w-full h-full bg-[#161622] flex items-center justify-center">
                    {project.preview}
                  </div>
                ) : (
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-semibold text-gray-900">
                  {project.title}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 leading-relaxed">
                  {project.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <Badge
                      key={tech}
                      variant="secondary"
                      className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>

                <div className="absolute bottom-2 right-2 flex items-center gap-2">
                  {project.badge && (
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
                      {project.badge}
                    </span>
                  )}
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <GitHubIcon />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;
