import { Zap, Wrench, Rocket, Code, Database, Settings } from "lucide-react";
import { Card } from "@/components/ui/card";

const Features = () => {
  const features = [
    {
      icon: Zap,
      title: "Instant Setup",
      description: "No local environment needed. Auto-detects your stack and sets up everything in seconds.",
      gradient: "from-yellow-400 to-orange-500"
    },
    {
      icon: Code,
      title: "Framework Detection",
      description: "Automatically identifies React, Next.js, Django, Express, and more from your project structure.",
      gradient: "from-blue-400 to-cyan-500"
    },
    {
      icon: Rocket,
      title: "Live Preview",
      description: "See your changes instantly with our containerized execution environment and real-time builds.",
      gradient: "from-green-400 to-emerald-500"
    },
    {
      icon: Database,
      title: "Database Emulation",
      description: "Automatic database setup with SQLite or Dockerized PostgreSQL including mock data generation.",
      gradient: "from-purple-400 to-violet-500"
    },
    {
      icon: Settings,
      title: "Environment Variables",
      description: "Smart detection of .env files and automatic generation of missing environment configurations.",
      gradient: "from-pink-400 to-rose-500"
    },
    {
      icon: Wrench,
      title: "Error Recovery",
      description: "Intelligent fallback UI for missing dependencies or configuration issues with guided fixes.",
      gradient: "from-indigo-400 to-blue-500"
    }
  ];

  return (
    <div className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-accent bg-clip-text text-transparent">
            Powerful Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to run any GitHub repository instantly, with intelligent automation and modern tooling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="p-8 bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-elevated group"
              >
                <div className="space-y-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} p-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-full h-full text-white" />
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-2xl font-semibold text-foreground group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Features;