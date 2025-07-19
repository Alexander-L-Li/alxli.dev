import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import Navigation from "../components/Navigation";
import Home from "@/pages/Home";
import Projects from "@/pages/Projects";
import Research from "@/pages/Research";
import Resume from "@/pages/Resume";

const SinglePageLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<NodeJS.Timeout>();

  const sections = [
    { path: "/", component: <Home />, id: "home", label: "Home" },
    { path: "/resume", component: <Resume />, id: "resume", label: "Resume" },
    {
      path: "/projects",
      component: <Projects />,
      id: "projects",
      label: "Projects",
    },
    {
      path: "/research",
      component: <Research />,
      id: "research",
      label: "Research",
    },
  ];

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      if (isScrolling) return;

      const scrollPosition = window.scrollY + 80; // Account for header
      const windowHeight = window.innerHeight;

      // Find which section is currently in view
      let activeSectionIndex = 0;
      for (let i = 0; i < sections.length; i++) {
        const sectionElement = document.getElementById(sections[i].id);
        if (sectionElement) {
          const rect = sectionElement.getBoundingClientRect();
          const sectionTop = rect.top + window.scrollY;
          const sectionBottom = sectionTop + rect.height;

          // Check if the scroll position is within this section
          if (
            scrollPosition >= sectionTop - 100 &&
            scrollPosition < sectionBottom - 100
          ) {
            activeSectionIndex = i;
            break;
          }
        }
      }

      if (activeSectionIndex !== currentSection) {
        setCurrentSection(activeSectionIndex);
        const newPath = sections[activeSectionIndex].path;
        if (location.pathname !== newPath) {
          navigate(newPath, { replace: true });
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentSection, location.pathname, navigate, isScrolling, sections]);

  // Handle direct navigation to routes
  useEffect(() => {
    // Find the section index based on the current path
    const sectionIndex = sections.findIndex(
      (section) =>
        section.path === location.pathname ||
        (section.path !== "/" && location.pathname.startsWith(section.path))
    );

    // Default to home if no matching section found
    const targetSection = sectionIndex !== -1 ? sectionIndex : 0;

    // Only update if we need to change sections
    if (
      targetSection !== currentSection ||
      location.pathname !== sections[targetSection].path
    ) {
      setIsScrolling(true);
      setCurrentSection(targetSection);

      // Update URL without adding to history
      if (location.pathname !== sections[targetSection].path) {
        navigate(sections[targetSection].path, { replace: true });
      }

      // Find the section element and scroll to it with offset
      const sectionElement = document.getElementById(
        sections[targetSection].id
      );
      if (sectionElement) {
        const headerOffset = 80; // Should match the value in Navigation.tsx
        const elementPosition = sectionElement.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }

      // Reset scrolling flag after animation completes
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false);
      }, 1000);
    }
  }, [location.pathname]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

  return (
    <div className="bg-background">
      <Navigation currentSection={currentSection} sections={sections} />
      <div className="snap-y snap-mandatory">
        {sections.map((section, index) => (
          <section
            key={section.id}
            id={section.id}
            className={cn(
              "snap-start relative scroll-mt-20",
              index === 0 ? "py-12" : "py-48"
            )}
            style={{
              paddingTop: index === 0 ? "80px" : index === 1 ? "4rem" : "2rem",
              scrollMarginTop: "80px",
            }}
          >
            <div className="animate-fade-in">{section.component}</div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default SinglePageLayout;
