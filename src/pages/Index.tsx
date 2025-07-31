import { useState } from "react";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import RepoAnalysis from "@/components/RepoAnalysis";
import { useRepoAnalysis } from "@/hooks/useRepoAnalysis";

const Index = () => {
  const [currentView, setCurrentView] = useState<"home" | "analysis">("home");
  const { repoData, analyzeRepository } = useRepoAnalysis();

  const handleAnalysisStart = async (repoUrl: string) => {
    setCurrentView("analysis");
    await analyzeRepository(repoUrl);
  };

  const handleBackToHome = () => {
    setCurrentView("home");
  };

  if (currentView === "analysis") {
    return <RepoAnalysis repoData={repoData} onBack={handleBackToHome} />;
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Hero onAnalysisStart={handleAnalysisStart} />
      <Features />
    </div>
  );
};

export default Index;
