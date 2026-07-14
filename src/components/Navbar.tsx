import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/", label: "home" },
    { path: "/projects", label: "projects" },
    { path: "/research", label: "research" },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Hamburger Menu */}
      <nav className="fixed top-6 right-6 z-[100] sm:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "relative w-11 h-11 rounded-full bg-white border border-neutral-200 flex items-center justify-center transition-all duration-200 hover:border-forest",
            isOpen && "border-forest"
          )}
          aria-label="Toggle navigation menu"
        >
          <div className="flex flex-col items-center justify-center w-5 h-5">
            <span
              className={cn(
                "block w-4 h-px bg-neutral-700 transition-all duration-300 ease-in-out",
                isOpen && "rotate-45 translate-y-[3px]"
              )}
            />
            <span
              className={cn(
                "block w-4 h-px bg-neutral-700 mt-1 transition-all duration-300 ease-in-out",
                isOpen && "opacity-0"
              )}
            />
            <span
              className={cn(
                "block w-4 h-px bg-neutral-700 mt-1 transition-all duration-300 ease-in-out",
                isOpen && "-rotate-45 -translate-y-[5px]"
              )}
            />
          </div>
        </button>

        <div
          className={cn(
            "absolute top-14 right-0 w-44 bg-white rounded-md border border-neutral-200 overflow-hidden transition-all duration-200 origin-top-right z-[101]",
            isOpen
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="py-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigation(item.path);
                }}
                className={cn(
                  "w-full px-4 py-2.5 text-left text-sm transition-colors duration-150 hover:bg-neutral-50 flex items-center cursor-pointer",
                  isActive(item.path)
                    ? "text-forest-dark font-medium"
                    : "text-neutral-700"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {isOpen && (
          <div
            className="fixed inset-0 bg-black/10 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </nav>

      {/* Desktop Navigation Bar */}
      <nav className="hidden sm:block absolute top-0 left-0 right-0 z-[100]">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-end h-20">
            <div className="flex items-center space-x-8 text-[15px]">
              {navItems.map((item, i) => (
                <span key={item.path} className="flex items-center space-x-8">
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={cn(
                      "transition-colors duration-200 cursor-pointer",
                      isActive(item.path)
                        ? "text-forest-dark"
                        : "text-neutral-500 hover:text-forest-dark"
                    )}
                  >
                    {item.label}
                  </button>
                  {i < navItems.length - 1 && (
                    <span className="text-neutral-300 select-none">/</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
