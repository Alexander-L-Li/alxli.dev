import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <Navbar />
      <main className="pt-24 sm:pt-28 px-6 sm:px-8 lg:px-10 max-w-5xl w-full mx-auto flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
