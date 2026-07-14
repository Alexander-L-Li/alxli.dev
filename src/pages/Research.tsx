const Research = () => {
  const publications = [
    {
      title:
        "Inverse black-box diffusion modeling: multimodal parameter estimation from synthetically-rendered imagery",
      journal: "SPIE Defense + Security",
      year: "2026",
      abstract: "",
      status: "1st Author — Published",
      link: "https://www.spiedigitallibrary.org/conference-proceedings-of-spie/14029/140290L/Inverse-black-box-diffusion-modeling--multimodal-parameter-estimation-from/10.1117/12.3091221.full",
    },
    {
      title: "Investigation of racial bias in predictive policing algorithms",
      journal:
        "International Conference on Machine Learning Applications (ICMLA)",
      year: "2023",
      abstract: "",
      status: "1st Author — Published",
      link: "https://ieeexplore.ieee.org/document/10459796",
    },
  ];

  return (
    <div className="pb-20">
      <header className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-forest-dark tracking-tight">
          Research
        </h1>
        <p className="mt-3 text-[15px] leading-[1.7] text-neutral-600 max-w-xl">
          My academic work in deep learning, computer vision, and AI ethics.
        </p>
      </header>

      <div className="space-y-10">
        {publications.map((pub, index) => (
          <a
            key={index}
            href={pub.link}
            target={pub.link === "#" ? undefined : "_blank"}
            rel={pub.link === "#" ? undefined : "noopener noreferrer"}
            className="group block border-t border-neutral-200 pt-8"
          >
            <div className="flex items-baseline justify-between gap-4 flex-wrap">
              <h2 className="text-lg font-medium text-neutral-900 group-hover:text-forest-dark transition-colors duration-200">
                {pub.title}
              </h2>
              <span className="text-[12.5px] text-forest whitespace-nowrap">
                {pub.status}
              </span>
            </div>
            <p className="mt-1 text-[13.5px] text-neutral-500">
              {pub.journal} · {pub.year}
            </p>
            <p className="mt-3 text-[14.5px] leading-[1.7] text-neutral-600">
              {pub.abstract}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
};

export default Research;
