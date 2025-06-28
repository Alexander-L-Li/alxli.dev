interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <main className="transition-all duration-700 ease-in-out">
        <div className="animate-fade-in">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
