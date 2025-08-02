import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="pt-16 sm:pt-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
