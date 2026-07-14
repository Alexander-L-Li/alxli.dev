import { Linkedin, Github, Mail } from "lucide-react";

const XIcon = ({ size = 22 }: { size?: number }) => (
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

const SocialLinks = () => {
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
      icon: (props: { size?: number }) => <Mail {...props} strokeWidth={1.5} />,
      href: "mailto:alxli@mit.edu",
      label: "Email",
    },
    {
      icon: (props: { size?: number }) => <XIcon {...props} />,
      href: "https://x.com/alecs_li",
      label: "X (Twitter)",
    },
  ];

  return (
    <div className="flex items-center space-x-8">
      {socialLinks.map(({ icon: Icon, href, label }) => (
        <a
          key={label}
          href={href}
          target={href.startsWith("mailto:") ? undefined : "_blank"}
          rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
          className="text-neutral-500 hover:text-forest transition-colors duration-200"
          aria-label={label}
        >
          <Icon size={20} />
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;
