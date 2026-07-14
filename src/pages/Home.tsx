import SocialLinks from "@/components/SocialLinks";

const Home = () => {
  return (
    <div className="pb-24">
      {/* Page title */}
      <h1
        className="text-5xl sm:text-6xl md:text-7xl font-bold text-forest-dark tracking-tight leading-[1.05] text-center
 md:text-left mb-16 md:mb-20"
      >
        Alexander L. Li<span className="text-forest">.</span>
      </h1>

      {/* Hero: headshot + intro */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">
        {/* Left column: headshot */}
        <div className="flex justify-center md:justify-start">
          <img
            src="/headshot.jpg"
            alt="Alexander L. Li"
            className="w-72 h-72 sm:w-80 sm:h-80 rounded-full object-cover border border-neutral-200"
          />
        </div>

        {/* Right column: socials (centered) + intro (left-aligned) */}
        <div className="md:pt-6">
          {/* Socials — centered */}
          <div className="flex justify-center mb-7">
            <SocialLinks />
          </div>

          {/* Intro — left-aligned */}
          <div className="space-y-5 text-[16px] leading-[1.65] text-neutral-800 text-left">
            <p>
              Hello! I&rsquo;m a rising 3rd-year undergraduate studying{" "}
              <span className="text-neutral-900">
                Artificial Intelligence &amp; Mathematics
              </span>{" "}
              at MIT, currently passionate about deep learning, RL, computer
              vision, and startups.
            </p>

            <p>
              I&rsquo;m a member of{" "}
              <a
                className="link"
                href="https://startup.mit.edu/"
                target="_blank"
                rel="noopener noreferrer"
              >
                StartLabs
              </a>
              , sing acappella with the{" "}
              <a
                className="link"
                href="https://www.themitlogs.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                MIT Logarhythms
              </a>
              , and fence saber for the{" "}
              <a
                className="link"
                href="https://mitathletics.com/sports/mens-fencing/roster/alexander-li/13720"
                target="_blank"
                rel="noopener noreferrer"
              >
                MIT Men&rsquo;s Fencing Team
              </a>
              .
            </p>

            <p>
              Reach out at{" "}
              <a className="link" href="mailto:alxli@mit.edu">
                alxli [at] mit [dot] edu
              </a>{" "}
              &mdash; I&rsquo;d love to chat.
            </p>
          </div>
        </div>
      </section>

      {/* Resume */}
      <section className="mt-12 md:mt-16">
        <h2 className="text-2xl font-medium text-neutral-900 mb-4">Resume</h2>
        <p className="text-[15px] leading-[1.7] text-neutral-700 mb-6">
          A short version of my experience &amp; skills.
        </p>
        <div className="flex flex-wrap gap-3 text-[15px]">
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center h-10 px-5 border border-forest text-forest hover:bg-forest hover:text-white transition-colors duration-200 rounded"
          >
            View PDF
          </a>
          <a
            href="/resume.pdf"
            download
            className="inline-flex items-center h-10 px-5 border border-neutral-300 text-neutral-700 hover:border-forest hover:text-forest transition-colors duration-200 rounded"
          >
            Download
          </a>
        </div>
      </section>
    </div>
  );
};

export default Home;
