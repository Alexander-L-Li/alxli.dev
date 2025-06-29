import SocialLinks from "@/components/SocialLinks";

const Home = () => {
  return (
    <div className="lg:max-w-6xl lg:mx-36 lg:py-20 sm:w-full sm:px-4">
      <div className="flex flex-col items-start text-left max-w-6xl sm:w-full sm:px-4 sm:space-y-6">
        <img
          src="/headshot.jpg"
          alt="Profile"
          className="mt-4 w-80 h-80 object-cover border-4 border-transparent shadow-md"
        />
        <h1 className="mt-4 text-3xl sm:text-4xl font-semibold">
          Alexander L. Li
        </h1>
        <p className="mt-2 sm:mt-0 sm:text-md lg:text-xl text-yellow-900 font-medium">
          AI + Math @ MIT
        </p>
        <div className="mt-2 sm:mt-0 sm:text-sm lg:text-md text-black leading-relaxed space-y-4">
          <p>
            Hello! I'm an undergraduate student studying Artificial Intelligence
            (6-4) & Mathematics (18) at MIT. Currently passionate about computer
            vision, ML engineering, and full-stack development!
          </p>
          <p>
            My email:{" "}
            <a className="italic text-blue-800" href="mailto:alxli@mit.edu">
              alxli [at] mit [dot] edu
            </a>
          </p>
        </div>
        <SocialLinks />
        <div className="w-full flex flex-col items-center sm:mt-2 lg:mt-4 lg:py-4">
          <svg
            className="w-8 h-8 text-black opacity-40 animate-bounce"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
          <p className="mt-2 text-sm text-black opacity-40">
            Scroll for more info!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
