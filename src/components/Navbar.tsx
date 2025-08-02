import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/projects", label: "Projects" },
    { path: "/research", label: "Research" },
  ];

  const handleNavigation = (path: string) => {
    console.log("Navigating to:", path); // Debug log
    navigate(path);
    setIsOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Hamburger Menu */}
      <nav className="fixed top-8 right-8 z-[100] sm:hidden">
        {/* Hamburger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "relative w-16 h-16 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-300 ease-in-out hover:shadow-xl",
            isOpen && "bg-gray-50"
          )}
          aria-label="Toggle navigation menu"
        >
          {/* Hamburger Icon */}
          <div className="flex flex-col items-center justify-center w-6 h-6">
            <span
              className={cn(
                "block w-5 h-0.5 bg-gray-700 transition-all duration-300 ease-in-out",
                isOpen && "rotate-45 translate-y-1"
              )}
            />
            <span
              className={cn(
                "block w-5 h-0.5 bg-gray-700 mt-1 transition-all duration-300 ease-in-out",
                isOpen && "opacity-0"
              )}
            />
            <span
              className={cn(
                "block w-5 h-0.5 bg-gray-700 mt-1 transition-all duration-300 ease-in-out",
                isOpen && "-rotate-45 -translate-y-1"
              )}
            />
          </div>
        </button>

        {/* Dropdown Menu */}
        <div
          className={cn(
            "absolute top-16 right-0 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden transition-all duration-300 ease-in-out transform origin-top-right z-[101]",
            isOpen
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="py-2">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigation(item.path);
                }}
                className={cn(
                  "w-full px-4 py-3 text-left text-sm font-medium transition-colors duration-200 hover:bg-gray-50 flex items-center cursor-pointer",
                  isActive(item.path)
                    ? "text-green-900 bg-green-50 border-r-2 border-green-900"
                    : "text-gray-700"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Backdrop for mobile */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </nav>

      {/* Desktop Navigation Bar */}
      <nav className="hidden sm:block fixed top-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Name */}
            <button
              onClick={() => handleNavigation("/")}
              className="text-xl font-bold text-gray-900 hover:text-green-900 transition-colors duration-200 cursor-pointer"
            >
              Alexander L. Li
            </button>

            {/* Navigation Links */}
            <div className="flex items-center space-x-12">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={cn(
                    "text-lg font-medium transition-colors duration-200 hover:text-green-900 cursor-pointer relative",
                    isActive(item.path) ? "text-green-900" : "text-gray-700"
                  )}
                >
                  {item.label}
                  {isActive(item.path) && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-900"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
