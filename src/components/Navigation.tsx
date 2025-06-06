import { Link } from "react-router-dom";
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
  const navItems = sections.map(section => ({
    path: section.path,
    label: section.label,
    id: section.id
  }));

  return (
    <nav className="fixed top-0 right-28 z-50 h-screen flex flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center">
        {/* Top circle */}
        <div className="w-2 h-2 rounded-full bg-[#7A8271] mb-2" />

        {navItems.map(({ path, label }, index) => {
          const isActive = currentSection === index;
          return (
            <div key={path} className="flex flex-col items-center">
              {/* Label */}
              <Link
                to={path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-forest duration-200 px-2",
                  isActive
                    ? "text-forest font-bold border-forest"
                    : "text-black opacity-25"
                )}
                onClick={(e) => {
                  // Prevent default to handle scrolling in parent
                  e.preventDefault();
                  window.history.pushState({}, '', path);
                  window.dispatchEvent(new Event('popstate'));
                }}
              >
                {label}
              </Link>

              {/* Line between items (except after last) */}
              {index < navItems.length - 1 && (
                <div className="w-0.5 h-20 bg-[#7A8271] my-2" />
              )}
            </div>
          );
        })}

        {/* Bottom circle */}
        <div className="w-2 h-2 rounded-full bg-[#7A8271] mt-2" />
      </div>
    </nav>
  );
};

export default Navigation;
