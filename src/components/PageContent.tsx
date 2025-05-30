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
  <div className="max-w-6xl mx-48 py-28">
    <div className="flex flex-col items-start text-left max-w-6xl space-y-6">
      <img
        src="/headshot.jpg"
        alt="Profile"
        className="w-72 h-72 object-cover border-4 border-muted shadow-lg"
      />
      <h1 className="text-4xl font-semibold text-foreground">
        Alexander L. Li
      </h1>
      <p className="text-xl text-forest font-medium">AI + Math @ MIT</p>
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

<hr className="border-t border-[#7A8271] w-full my-24" />;

export const ProjectsContent = () => {
  const projects = [
    {
      title: "Research Data Analysis Platform",
      description:
        "A comprehensive platform for analyzing and visualizing research data with advanced statistical tools and machine learning integration.",
      technologies: ["Python", "React", "TensorFlow", "PostgreSQL"],
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
      link: "#",
    },
    {
      title: "Academic Paper Management System",
      description:
        "A streamlined system for organizing, tracking, and collaborating on academic papers with automated citation management.",
      technologies: ["TypeScript", "Node.js", "MongoDB", "Docker"],
      image:
        "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=250&fit=crop",
      link: "#",
    },
    {
      title: "Experimental Design Framework",
      description:
        "A flexible framework for designing and conducting reproducible experiments with built-in statistical analysis.",
      technologies: ["R", "Shiny", "MySQL", "AWS"],
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
      link: "#",
    },
  ];

  return (
    <div className="max-w-6xl mx-48 py-48">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-semibold text-foreground mb-4">
          Projects
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          A collection of personal and professional projects showcasing my work
          in research, development, and problem-solving.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <Card
            key={index}
            className="group hover:shadow-lg transition-shadow duration-200"
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
              <CardDescription className="text-sm">
                {project.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

<hr className="border-t border-[#7A8271] w-full my-24" />;

export const ResearchContent = () => {
  const publications = [
    {
      title: "Advanced Machine Learning Approaches in Data Analysis",
      journal: "Journal of Computational Research",
      year: "2024",
      abstract:
        "This study explores novel machine learning techniques for complex data analysis, demonstrating significant improvements in accuracy and efficiency over traditional methods.",
      status: "Published",
      link: "#",
    },
    {
      title: "Optimization Strategies for Large-Scale Systems",
      journal: "International Conference on Systems Engineering",
      year: "2023",
      abstract:
        "We present innovative optimization strategies that address scalability challenges in large-scale distributed systems, with practical applications in cloud computing.",
      status: "Published",
      link: "#",
    },
    {
      title: "Emerging Trends in Computational Methods",
      journal: "Future Computing Symposium",
      year: "2024",
      abstract:
        "An analysis of emerging computational methods and their potential impact on various fields, including recommendations for future research directions.",
      status: "Under Review",
      link: "#",
    },
  ];

  const researchAreas = [
    "Machine Learning & AI",
    "Data Analysis & Visualization",
    "Systems Optimization",
    "Computational Methods",
    "Research Methodology",
  ];

  return (
    <div className="max-w-6xl mx-48 py-48">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-semibold text-foreground mb-4">
          Research
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          My research focuses on developing innovative computational methods and
          analyzing complex systems to solve real-world problems.
        </p>
      </div>

      {/* Research Areas */}
      <div className="mb-12">
        <h2 className="text-xl font-medium text-foreground mb-4">
          Research Areas
        </h2>
        <div className="flex flex-wrap gap-2">
          {researchAreas.map((area) => (
            <Badge key={area} variant="outline" className="text-sm px-3 py-1">
              {area}
            </Badge>
          ))}
        </div>
      </div>

      {/* Publications */}
      <div>
        <h2 className="text-xl font-medium text-foreground mb-6">
          Recent Publications
        </h2>
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

<hr className="border-t border-[#7A8271] w-full my-24" />;

export const ResumeContent = () => (
  <div className="max-w-6xl mx-48 py-48">
    <div className="text-center mb-12">
      <h1 className="text-3xl font-semibold text-foreground mb-8">Resume</h1>
      <Button className="bg-forest hover:bg-forest-dark text-white">
        Download PDF
      </Button>
    </div>

    <div className="space-y-8">
      {/* Experience */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-forest">
            Professional Experience
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-foreground">
              Senior Research Analyst
            </h3>
            <p className="text-sm text-muted-foreground">
              Research Institute • 2022 - Present
            </p>
            <ul className="mt-2 text-sm text-muted-foreground space-y-1 ml-4">
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
            <h3 className="font-semibold text-foreground">
              Research Associate
            </h3>
            <p className="text-sm text-muted-foreground">
              University Lab • 2020 - 2022
            </p>
            <ul className="mt-2 text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Conducted independent research on computational methods</li>
              <li>• Collaborated with international research teams</li>
              <li>• Mentored graduate students and research assistants</li>
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
              Ph.D. in Computer Science
            </h3>
            <p className="text-sm text-muted-foreground">
              University Name • 2020
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Dissertation: "Advanced Computational Methods for Complex Systems"
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              M.S. in Applied Mathematics
            </h3>
            <p className="text-sm text-muted-foreground">
              University Name • 2016
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              B.S. in Mathematics
            </h3>
            <p className="text-sm text-muted-foreground">
              University Name • 2014
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
              <p className="text-sm text-muted-foreground">
                Python, R, JavaScript, TypeScript, MATLAB, SQL
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">
                Frameworks & Tools
              </h4>
              <p className="text-sm text-muted-foreground">
                TensorFlow, React, Node.js, Docker, AWS, Git
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">
                Research Methods
              </h4>
              <p className="text-sm text-muted-foreground">
                Statistical Analysis, Machine Learning, Data Visualization
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Languages</h4>
              <p className="text-sm text-muted-foreground">
                English (Native), Spanish (Conversational)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);
