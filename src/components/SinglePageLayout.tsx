import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import Navigation from "./Navigation";
import Index from "@/pages/Index";
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
    { path: "/", component: <Index />, id: "home", label: "Home" },
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
    { path: "/resume", component: <Resume />, id: "resume", label: "Resume" },
  ];

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      if (isScrolling) return;

      const scrollPosition = window.scrollY + 80; // Account for header
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

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentSection, location.pathname, navigate, isScrolling]);

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
    
    // Update current section state
    setCurrentSection(targetSection);
    
    // Update URL without adding to history if needed
    if (location.pathname !== sections[targetSection].path) {
      navigate(sections[targetSection].path, { replace: true });
    }

    // Scroll to the section
    const scrollToSection = () => {
      const sectionElement = document.getElementById(sections[targetSection].id);
      if (sectionElement) {
        const headerOffset = 80; // Should match the value in Navigation.tsx
        const elementPosition = sectionElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    };

    // Small timeout to ensure the DOM is ready
    const scrollTimer = setTimeout(() => {
      setIsScrolling(true);
      scrollToSection();
      
      // Reset scrolling flag after animation completes
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false);
      }, 1000);
    }, 100);

    return () => clearTimeout(scrollTimer);
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
              index === 0 ? "min-h-screen" : "min-h-[80vh] py-12"
            )}
            style={{ 
              paddingTop: index === 0 ? "80px" : index === 1 ? "6rem" : "2rem",
              scrollMarginTop: "80px"
            }}
          >
            <div className="animate-fade-in">
              {section.component}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default SinglePageLayout;
