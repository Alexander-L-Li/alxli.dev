import { Instagram, Linkedin, Github, Mail } from "lucide-react";

const Footer = () => {
  const socialLinks = [
    {
      icon: Linkedin,
      href: "https://linkedin.com/in/alexander-l-li",
      label: "LinkedIn",
    },
    {
      icon: Instagram,
      href: "https://instagram.com/alecss_li",
      label: "Instagram",
    },
    {
      icon: Github,
      href: "https://github.com/Alexander-L-Li",
      label: "Github",
    },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          {/* Copyright */}
          <div className="text-sm text-gray-500">
            © {currentYear} Alexander L. Li. All rights reserved.
          </div>

          {/* Email */}
          <div className="flex items-center space-x-2">
            <Mail size={16} className="text-gray-500" />
            <a
              href="mailto:alxli@mit.edu"
              className="text-sm text-gray-600 hover:text-green-700 transition-colors duration-200"
            >
              alxli [at] mit [dot] edu
            </a>
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-4">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-green-700 transition-colors duration-200 group"
                aria-label={label}
              >
                <Icon
                  size={20}
                  className="group-hover:scale-110 transition-transform duration-200"
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
