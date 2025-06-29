import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Projects = () => {
  const projects = [
    {
      title: "Chilldeck DJ",
      description:
        "Won 2nd Place (out of 60 projects) in MIT’s Web Lab Hackathon & received Best Futuristic UI Design. Deployed full-stack web app providing accessible, easy-to-use interface for multiple track audio mixing.",
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
    },
    {
      title: "Coming Soon...",
      description: "",
      technologies: [""],
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
      link: "#",
    },
  ];

  return (
    <div className="lg:max-w-6xl lg:mx-36 sm:w-full sm:px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl underline underline-offset-4 font-semibold text-foreground mb-4">
          Projects
        </h1>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) =>
          project.title === "Chilldeck DJ" ? (
            <a
              href="https://chilldeck.onrender.com"
              target="_blank"
              rel="noopener noreferrer"
              key={index}
            >
              <Card className="group hover:shadow-lg transition-shadow duration-200 relative">
                <div className="aspect-video overflow-hidden rounded-t-lg">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <CardDescription className="text-sm text-black">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap text-yellow-900 gap-2">
                    {project.technologies.map((tech) => (
                      <Badge key={tech} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <a
                      href="https://github.com/Alexander-L-Li/ChillDeck-DJ"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-7 h-7 text-black opacity-70 hover:opacity-100"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 0C5.373 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.26.82-.577
                          0-.285-.01-1.04-.016-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729
                          1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.606-2.665-.304-5.466-1.332-5.466-5.931
                          0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23a11.5 11.5 0 0 1 3.003-.404c1.019.005
                          2.047.138 3.003.404 2.291-1.553 3.297-1.23 3.297-1.23.654 1.653.243 2.874.12 3.176.77.84 1.235 1.911 1.235 3.221
                          0 4.609-2.803 5.625-5.475 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .32.216.694.825.576C20.565
                          21.796 24 15.299 24 12c0-6.627-5.373-12-12-12z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </a>
          ) : project.title === "ManusMIDI Digital Instrument" ? (
            <Card
              key={index}
              className="group hover:shadow-lg transition-shadow duration-200 relative"
            >
              <div className="aspect-video overflow-hidden rounded-t-lg">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{project.title}</CardTitle>
                <CardDescription className="text-sm text-black">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap text-yellow-900 gap-2">
                  {project.technologies.map((tech) => (
                    <Badge key={tech} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
                <div className="absolute bottom-2 right-2">
                  <a
                    href="https://github.com/Alexander-L-Li/ManusMIDI"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-7 h-7 text-black opacity-70 hover:opacity-100"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 0C5.373 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.26.82-.577
                          0-.285-.01-1.04-.016-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729
                          1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.606-2.665-.304-5.466-1.332-5.466-5.931
                          0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23a11.5 11.5 0 0 1 3.003-.404c1.019.005
                          2.047.138 3.003.404 2.291-1.553 3.297-1.23 3.297-1.23.654 1.653.243 2.874.12 3.176.77.84 1.235 1.911 1.235 3.221
                          0 4.609-2.803 5.625-5.475 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .32.216.694.825.576C20.565
                          21.796 24 15.299 24 12c0-6.627-5.373-12-12-12z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card
              key={index}
              className="group hover:shadow-lg transition-shadow duration-200 relative"
            >
              <div className="aspect-video overflow-hidden rounded-t-lg">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{project.title}</CardTitle>
                <CardDescription className="text-sm text-black">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap text-yellow-900 gap-2">
                  {project.technologies.map((tech) => (
                    <Badge key={tech} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
                <div className="absolute bottom-2 right-2">
                  <a
                    href="https://github.com/placeholder"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-7 h-7 text-black opacity-70 hover:opacity-100"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 0C5.373 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.26.82-.577
                        0-.285-.01-1.04-.016-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729
                        1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.606-2.665-.304-5.466-1.332-5.466-5.931
                        0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23a11.5 11.5 0 0 1 3.003-.404c1.019.005
                        2.047.138 3.003.404 2.291-1.553 3.297-1.23 3.297-1.23.654 1.653.243 2.874.12 3.176.77.84 1.235 1.911 1.235 3.221
                        0 4.609-2.803 5.625-5.475 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .32.216.694.825.576C20.565
                        21.796 24 15.299 24 12c0-6.627-5.373-12-12-12z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
};

export default Projects;
