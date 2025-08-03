import SocialLinks from "@/components/SocialLinks";

const Home = () => {
  return (
    <div className="pt-36 min-h-screen flex flex-col justify-center">
      <div className="text-center space-y-8">
        {/* Profile Image */}
        <div className="flex justify-center">
          <img
            src="/headshot.jpg"
            alt="Alexander L. Li"
            className="w-48 h-48 sm:w-64 sm:h-64 rounded-full object-cover shadow-lg border-4 border-white"
          />
        </div>

        {/* Name and Title */}
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
            Alexander L. Li
          </h1>
          <p className="text-xl sm:text-2xl text-green-900 font-medium">
            AI + Math @ MIT
          </p>
        </div>

        {/* Description */}
        <div className="max-w-2xl mx-auto space-y-4 text-gray-600 leading-relaxed">
          {/* <p className="text-lg">
            I'm an undergraduate student studying Artificial Intelligence &
            Mathematics at MIT.
          </p> */}
          <p className="text-lg pt-8">
            Let's connect :)
            <br />
            <a
              className="text-blue-700 hover:text-blue-800 transition-colors"
              href="mailto:alxli@mit.edu"
            >
              alxli [at] mit [dot] edu
            </a>
          </p>
        </div>

        {/* Social Links */}
        <div className="pt-4">
          <SocialLinks />
        </div>

        {/* About Me Section */}
        <div className="pt-48 pb-24">
          <div className="text-center sm:text-left sm:ml-0 sm:mr-auto">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
              About
            </h2>
            <div className="max-w-4xl sm:max-w-none">
              <p className="text-lg text-gray-600 leading-relaxed">
                Hello! I'm a 2nd-year undergraduate student studying{" "}
                <span className="underline">
                  Artificial Intelligence & Mathematics at MIT
                </span>
                .
                <br />
                I'm currently exploring and curious about the startup space,
                computer vision, ML engineering, and full-stack development.
                <br />
                <br />
                Outside of academics, I sing/perform acappella as a member of
                the{" "}
                <a
                  className="text-blue-700 hover:text-blue-800 transition-colors"
                  href="https://www.themitlogs.com/"
                >
                  MIT Logarhythms
                </a>{" "}
                and fence Sabre on the Varsity Men's Fencing Team.
              </p>
            </div>
          </div>
        </div>

        {/* Resume Section */}
        <div className="pb-48">
          <div className="text-center sm:text-left sm:ml-0 sm:mr-auto">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
              Resume
            </h2>
            <div className="max-w-4xl sm:max-w-none">
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Download my resume to learn more about my experience and skills.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="/resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-white text-center w-full sm:w-48 h-12 py-3 bg-green-900 rounded-lg transition duration-300 hover:bg-green-800 hover:shadow-lg font-medium"
                >
                  View PDF
                </a>
                <a
                  href="/resume.pdf"
                  download
                  className="inline-block text-white text-center w-full sm:w-48 h-12 py-3 bg-green-900 rounded-lg transition duration-300 hover:bg-green-800 hover:shadow-lg font-medium"
                >
                  Download PDF
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
