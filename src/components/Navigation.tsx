import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/projects", label: "Projects" },
    { path: "/research", label: "Research" },
    { path: "/resume", label: "Resume" },
  ];

  return (
    <nav className="fixed top-0 right-28 z-50 h-screen flex flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center">
        {/* Top circle */}
        <div className="w-2 h-2 rounded-full bg-[#7A8271] mb-2" />

        {navItems.map(({ path, label }, index) => {
          const isActive = location.pathname === path;
          return (
            <div key={path} className="flex flex-col items-center">
              {/* Label */}
              <Link
                to={path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-forest duration-200 px-2",
                  isActive
                    ? "text-forest text-bold border-forest"
                    : "text-black opacity-25"
                )}
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
