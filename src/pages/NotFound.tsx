import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-6xl sm:text-8xl font-bold text-gray-900">404</h1>
        <p className="text-xl sm:text-2xl text-gray-600">
          Oops! Page not found
        </p>
        <a
          href="/"
          className="inline-block text-green-700 hover:text-green-800 underline text-lg transition-colors"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
