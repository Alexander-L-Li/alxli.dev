import { Linkedin, Github, Mail } from "lucide-react";

const XIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const Footer = () => {
  const socialLinks = [
    {
      icon: (props: { size?: number }) => (
        <Github {...props} strokeWidth={1.5} />
      ),
      href: "https://github.com/Alexander-L-Li",
      label: "Github",
    },
    {
      icon: (props: { size?: number }) => (
        <Linkedin {...props} strokeWidth={1.5} />
      ),
      href: "https://linkedin.com/in/alexander-l-li",
      label: "LinkedIn",
    },
    {
      icon: (props: { size?: number }) => <XIcon {...props} />,
      href: "https://x.com/alecss_li",
      label: "X (Twitter)",
    },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-200 py-8 px-6 sm:px-8 lg:px-10 mt-16">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-neutral-500">
          <div>© {currentYear} Alexander L. Li</div>

          <div className="flex items-center gap-2">
            <Mail size={14} strokeWidth={1.5} />
            <a
              href="mailto:alxli@mit.edu"
              className="hover:text-forest transition-colors duration-200"
            >
              alxli [at] mit [dot] edu
            </a>
          </div>

          <div className="flex items-center gap-5">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-forest transition-colors duration-200"
                aria-label={label}
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
