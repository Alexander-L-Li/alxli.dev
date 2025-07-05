import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavItem {
  path: string;
  label: string;
  id: string;
}

interface NavigationProps {
  currentSection: number;
  sections: NavItem[];
}

const Navigation = ({ currentSection, sections }: NavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = sections.map((section) => ({
    path: section.path,
    label: section.label,
    id: section.id,
  }));

  const handleNavigation = (path: string, index: number) => {
    // Navigate to the new route if not already there
    if (location.pathname !== path) {
      navigate(path);
    }

    // Scroll to the section with offset for header
    const section = document.getElementById(sections[index].id);
    if (section) {
      const headerOffset = 80; // Adjust this value based on your header height
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <nav className="fixed top-0 right-28 z-50 h-screen flex-col items-center justify-center px-4 hidden xl:flex">
      <div className="flex flex-col items-center">
        {navItems.map(({ path, label }, index) => {
          const isActive = currentSection === index;
          return (
            <div key={path} className="flex flex-col items-center">
              {/* Label */}
              <button
                onClick={() => handleNavigation(path, index)}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-forest duration-200 px-2 text-left",
                  isActive
                    ? "text-forest font-bold border-forest"
                    : "text-black opacity-25"
                )}
              >
                {label}
              </button>

              {/* Line between items (except after last) */}
              {index < navItems.length - 1 && (
                <div className="w-px h-24 bg-[#7A8271] my-1" />
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
