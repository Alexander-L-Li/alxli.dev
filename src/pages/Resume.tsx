const Resume = () => {
  return (
    <div className="mt-24 lg:max-w-6xl lg:ml-48 lg:mr-24 sm:w-full sm:px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl underline underline-offset-4 font-semibold text-foreground mb-8 pb-2">
          Resume
        </h1>
        <div className="flex flex-row gap-4 justify-center">
          <a
            href="docs/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-white text-center w-48 h-12 py-3 bg-green-900 rounded-lg transition duration-150 hover:bg-green-800 hover:scale-105"
          >
            View PDF
          </a>
          <a
            href="docs/resume.pdf"
            download
            className="inline-block text-white text-center w-48 h-12 py-3 bg-green-900 rounded-lg transition duration-150 hover:bg-green-800 hover:scale-105"
          >
            Download PDF
          </a>
        </div>
      </div>
    </div>
  );
};

export default Resume;
