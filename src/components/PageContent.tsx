import SocialLinks from "@/components/SocialLinks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const HomeContent = () => (
  <div className="lg:max-w-6xl sm:max-w-3xl mx-48 py-28">
    <div className="flex flex-col items-start text-left max-w-6xl space-y-6">
      <img
        src="/headshot.jpg"
        alt="Profile"
        className="w-72 h-72 object-cover border-4 border-muted shadow-lg"
      />
      <h1 className="text-4xl font-semibold text-foreground">
        Alexander L. Li
      </h1>
      <p className="text-xl text-yellow-900 font-medium">AI + Math @ MIT</p>
      <div className="text-black leading-relaxed space-y-4">
        <p>
          Hello! I'm an undergraduate student studying Artificial Intelligence
          (6-4) & Mathematics (18) at MIT. Currently passionate about computer
          vision, ML engineering, and full-stack development!
        </p>
      </div>
      <SocialLinks />
      <div className="py-4 w-full flex flex-col items-center mt-4">
        <svg
          className="w-8 h-8 text-black opacity-40 animate-bounce"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
        <p className="mt-2 text-sm text-black opacity-40">
          Scroll for more info!
        </p>
      </div>
    </div>
  </div>
);

export const ProjectsContent = () => {
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
    <div className="max-w-6xl mx-48">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-semibold text-foreground mb-4">
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

export const ResearchContent = () => {
  const publications = [
    {
      title: "Inverse Black-box Diffusion Modeling",
      journal: "Air Force Research Laboratory",
      year: "2025",
      abstract: "Abstract coming soon!",
      status: "In Progress",
      link: "#",
    },
    {
      title: "Investigation of Racial Bias in Predictive Policing",
      journal: "International Conference on Machine Learning Applications",
      year: "2023",
      abstract:
        "Machine learning can be utilized to enhance proper police response to Property Crime. However, many current predictive policing strategies unfairly target underprivileged racial demographics by training models with biased data. This is due in part to the racial bias patterns prevalent in policing, which are ultimately replicated by machine learning models. In our study, we focus on the city of Boston and investigate their publicly available Census and Crime Incident datasets to identify the possibility to create less racially biased machine learning models for Property Crime prediction. By utilizing a Multi-Variable Regression model, we propose an alternative to more traditional crime mapping methods. The performance of the model shows a 74.2% correlation to accurately mapping the hotspots of crime. Furthermore, we utilize GIS software to map and visualize geographic property crime rates based on Census Tracts. After running multiple Machine Learning Regression Analyses on our data, we discovered that underprivileged racial demographic variables have an overall low correlation to the rate of Property Crime in the Boston area. Thus, this work is a small step for the possibility of creating machine learning models that both effectively map predicted property crime and are less racially biased against select demographics.",
      status: "1st Author - Published",
      link: "https://ieeexplore.ieee.org/document/10459796",
    },
  ];

  const researchAreas = [
    "Inverse Black-box Models",
    "Diffusion Models",
    "Computational Methods",
  ];

  return (
    <div className="max-w-6xl mx-48 py-32">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-semibold text-foreground mb-4">
          Research
        </h1>
      </div>

      {/* Publications */}
      <div>
        <div className="space-y-6">
          {publications.map((pub, index) => (
            <Card
              key={index}
              className="hover:shadow-md transition-shadow duration-200"
            >
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <CardTitle className="text-lg leading-tight">
                    {pub.title}
                  </CardTitle>
                  <Badge
                    variant={
                      pub.status === "Published" ? "default" : "secondary"
                    }
                    className="text-xs whitespace-nowrap"
                  >
                    {pub.status}
                  </Badge>
                </div>
                <CardDescription>
                  {pub.journal} • {pub.year}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {pub.abstract}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ResumeContent = () => (
  <div className="max-w-6xl mx-48 py-12">
    <div className="text-center mb-12">
      <h1 className="text-3xl font-semibold text-foreground mb-8">Resume</h1>
      <a
        href="/docs/assets/resume.pdf"
        download
        className="inline-block bg-green-900 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-center"
      >
        Download PDF
      </a>
    </div>

    <div className="space-y-8">
      {/* Experience */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Professional Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold">AI/ML Research Intern</h3>
            <p className="text-sm">
              Air Force Research Laboratory • May 2025 - Aug 2025
            </p>
            <ul className="mt-2 text-sm text-black space-y-1 ml-4">
              <li>
                • Led cross-functional research projects with teams of 5-10
                members
              </li>
              <li>
                • Developed novel analytical methods improving efficiency by 40%
              </li>
              <li>• Published 8 peer-reviewed papers in top-tier journals</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Software Engineer Intern</h3>
            <p className="text-sm">Fetch.AI • Jun 2025 - Sep 2025</p>
            <ul className="mt-2 text-sm text-black space-y-1 ml-4">
              <li>• Conducted independent research on computational methods</li>
              <li>• Collaborated with international research teams</li>
              <li>• Mentored graduate students and research assistants</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Data Science Intern</h3>
            <p className="text-sm">Yoomi Health • Sep 2022 - May 2023</p>
            <ul className="mt-2 text-sm text-black space-y-1 ml-4">
              <li>
                • Automated a web-scraping data collection process for pose
                images to train Yoomi’s A.I. physical therapy model
              </li>
              <li>
                • Achieved ∼15% increase in accuracy & ∼80% reduction of racial
                bias on images with darker skin tone
              </li>
              <li>
                • Utilized YOLOv5 & COCO annotations to map keypoints on both
                human & synthetic video/image data
              </li>
              <li>
                • Contributed to model that won Dr. Pepper’s Hail Mary Contest
                sponsored by Mark Cuban for $23K
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
      {/* Education */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-forest">Education</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-foreground">
              B.S. Candidate in Artificial Intelligence & Mathematics
            </h3>
            <p className="text-sm text-muted-foreground">
              Massachusetts Institute of Technology • Exp. 2028
            </p>
            <p className="py-2 text-sm text-black">
              Relevant Coursework: Computer Vision (6.8300), Machine Learning
              (6.3900), Algorithms (6.1210), Fundamentals of Programming
              (6.1010), Web Design Lab (6.9620), Low-level C & Assembly
              (6.1900), Discrete Applied Mathematics (18.200), Linear Algebra
              (18.06), Probability & Random Variables (18.600), Fundamentals of
              Statistics (18.650)
            </p>
            <p className="py-2 text-sm text-black">
              Activities: NCAA Men’s Fencing, Logarhythms A Cappella, Phi Kappa
              Theta Fraternity, StartLabs Premier Entrepreneurship Club
            </p>
          </div>
        </CardContent>
      </Card>
      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-forest">
            Technical Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-2">Programming</h4>
              <p className="text-sm text-yellow-900">
                Python, Java, C++, JavaScript, HTML/CSS, TypeScript, SQL, R
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">
                Frameworks & Tools
              </h4>
              <p className="text-sm text-yellow-900">
                TensorFlow, React, Node.js, Docker, AWS, Git
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">
                Research Methods
              </h4>
              <p className="text-sm text-yellow-900">
                Deep Learning, Computational Methods
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Languages</h4>
              <p className="text-sm text-yellow-900">
                English (Native), Mandarin (Professional), Spanish
                (Conversational)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);
