import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Research = () => {
  const publications = [
    {
      title: "Inverse Black-box Diffusion Modeling",
      journal: "Air Force Research Laboratory",
      year: "2025",
      abstract: "Abstract coming soon!",
      status: "In Progress",
      link: "#",
    },
    {
      title: "Investigation of Racial Bias in Predictive Policing",
      journal: "International Conference on Machine Learning Applications",
      year: "2023",
      abstract:
        "Machine learning can be utilized to enhance proper police response to Property Crime. However, many current predictive policing strategies unfairly target underprivileged racial demographics by training models with biased data. This is due in part to the racial bias patterns prevalent in policing, which are ultimately replicated by machine learning models. In our study, we focus on the city of Boston and investigate their publicly available Census and Crime Incident datasets to identify the possibility to create less racially biased machine learning models for Property Crime prediction. By utilizing a Multi-Variable Regression model, we propose an alternative to more traditional crime mapping methods. The performance of the model shows a 74.2% correlation to accurately mapping the hotspots of crime. Furthermore, we utilize GIS software to map and visualize geographic property crime rates based on Census Tracts. After running multiple Machine Learning Regression Analyses on our data, we discovered that underprivileged racial demographic variables have an overall low correlation to the rate of Property Crime in the Boston area. Thus, this work is a small step for the possibility of creating machine learning models that both effectively map predicted property crime and are less racially biased against select demographics.",
      status: "1st Author - Published",
      link: "https://ieeexplore.ieee.org/document/10459796",
    },
  ];

  const researchAreas = [
    "Inverse Black-box Models",
    "Diffusion Models",
    "Computational Methods",
  ];

  return (
    <div className="lg:max-w-6xl lg:mx-36 lg:py-32 sm:w-full sm:px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl underline underline-offset-4 font-semibold text-foreground mb-4">
          Research
        </h1>
      </div>

      {/* Publications */}
      <div>
        <div className="space-y-6">
          {publications.map((pub, index) => (
            <Card
              key={index}
              className="hover:shadow-md transition-shadow duration-200"
            >
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <CardTitle className="text-lg leading-tight">
                    {pub.title}
                  </CardTitle>
                  <Badge
                    variant={
                      pub.status === "Published" ? "default" : "secondary"
                    }
                    className="text-xs whitespace-nowrap"
                  >
                    {pub.status}
                  </Badge>
                </div>
                <CardDescription>
                  {pub.journal} • {pub.year}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {pub.abstract}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Research;
