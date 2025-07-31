import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, GitBranch } from "lucide-react";
import heroIcon from "@/assets/hero-icon.png";

const Hero = () => {
  const [repoUrl, setRepoUrl] = useState("");
  const [isValidUrl, setIsValidUrl] = useState(false);

  const validateGitHubUrl = (url: string) => {
    const githubRegex = /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+\/?$/;
    const isValid = githubRegex.test(url);
    setIsValidUrl(isValid);
    return isValid;
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setRepoUrl(url);
    validateGitHubUrl(url);
  };

  const handleAnalyze = () => {
    if (isValidUrl) {
      console.log("Analyzing repository:", repoUrl);
      // TODO: Implement repository analysis
    }
  };

  const tryExampleRepo = () => {
    const exampleUrl = "https://github.com/vercel/next.js-commerce";
    setRepoUrl(exampleUrl);
    validateGitHubUrl(exampleUrl);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Hero Icon */}
        <div className="flex justify-center mb-8">
          <img 
            src={heroIcon} 
            alt="Code Unbox" 
            className="w-24 h-24 animate-glow-pulse"
          />
        </div>

        {/* Main Heading */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-accent bg-clip-text text-transparent">
            Code Unbox
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Transform any GitHub repository into a live, interactive development environment. 
            Paste a link, start coding instantly.
          </p>
        </div>

        {/* URL Input Section */}
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Input
                placeholder="https://github.com/username/repository"
                value={repoUrl}
                onChange={handleUrlChange}
                className={`h-14 text-lg bg-card/50 backdrop-blur border-2 transition-all duration-300 ${
                  repoUrl && !isValidUrl 
                    ? "border-destructive focus:border-destructive" 
                    : isValidUrl 
                    ? "border-primary focus:border-primary shadow-glow" 
                    : "border-border focus:border-primary"
                }`}
              />
              {repoUrl && (
                <GitBranch className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                  isValidUrl ? "text-primary" : "text-destructive"
                }`} />
              )}
            </div>
            <Button 
              variant="hero"
              onClick={handleAnalyze}
              disabled={!isValidUrl}
              className="h-14"
            >
              <ExternalLink className="w-5 h-5" />
              Open in IDE
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>Supports public repositories • Private repos coming soon</span>
            <Button 
              variant="link" 
              onClick={tryExampleRepo}
              className="text-primary hover:text-primary/80"
            >
              Try Example
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;