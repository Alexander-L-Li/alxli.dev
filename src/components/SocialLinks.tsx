import { Instagram, Linkedin, Github } from "lucide-react";

const SocialLinks = () => {
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

  return (
    <div className="flex justify-center space-x-8 mt-8">
      {socialLinks.map(({ icon: Icon, href, label }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 text-foreground hover:bg-forest hover:text-white transition-all duration-200 rounded-lg group"
          aria-label={label}
        >
          <Icon
            size={20}
            className="group-hover:scale-110 transition-transform duration-200"
          />
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;
