import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navigation from "./Navigation";
import Index from "@/pages/Index";
import Projects from "@/pages/Projects";
import Research from "@/pages/Research";
import Resume from "@/pages/Resume";

const SinglePageLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(0);

  const sections = [
    { path: "/", component: <Index />, id: "home" },
    { path: "/projects", component: <Projects />, id: "projects" },
    { path: "/research", component: <Research />, id: "research" },
    { path: "/resume", component: <Resume />, id: "resume" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const sectionIndex = Math.round(scrollPosition / windowHeight);

      if (
        sectionIndex !== currentSection &&
        sectionIndex >= 0 &&
        sectionIndex < sections.length
      ) {
        setCurrentSection(sectionIndex);
        const newPath = sections[sectionIndex].path;
        if (location.pathname !== newPath) {
          navigate(newPath, { replace: true });
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentSection, location.pathname, navigate]);

  // Set initial section based on current route
  useEffect(() => {
    const sectionIndex = sections.findIndex(
      (section) => section.path === location.pathname
    );
    if (sectionIndex !== -1 && sectionIndex !== currentSection) {
      setCurrentSection(sectionIndex);
      window.scrollTo({
        top: sectionIndex * window.innerHeight,
        behavior: "smooth",
      });
    }
  }, [location.pathname]);

  return (
    <div className="bg-background">
      <Navigation />
      <div className="snap-y snap-mandatory">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className="min-h-screen snap-start relative"
            style={{ paddingTop: index === 0 ? "80px" : "0" }}
          >
            <div className="animate-fade-in">{section.component}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SinglePageLayout;
