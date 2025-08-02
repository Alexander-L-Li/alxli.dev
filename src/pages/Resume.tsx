const Resume = () => {
  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          Resume
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          Download my resume to learn more about my experience and skills.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-white text-center w-full sm:w-48 h-12 py-3 bg-green-700 rounded-lg transition duration-300 hover:bg-green-800 hover:shadow-lg font-medium"
          >
            View PDF
          </a>
          <a
            href="/resume.pdf"
            download
            className="inline-block text-white text-center w-full sm:w-48 h-12 py-3 bg-green-700 rounded-lg transition duration-300 hover:bg-green-800 hover:shadow-lg font-medium"
          >
            Download PDF
          </a>
        </div>
      </div>
    </div>
  );
};

export default Resume;
