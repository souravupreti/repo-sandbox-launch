import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Package, 
  Settings, 
  Play, 
  CheckCircle, 
  AlertCircle,
  Clock,
  ExternalLink
} from "lucide-react";

interface RepoData {
  name: string;
  framework: string;
  language: string;
  hasEnvFile: boolean;
  envVarsNeeded: string[];
  buildStatus: "pending" | "building" | "success" | "error";
  previewUrl?: string;
}

const RepoAnalysis = () => {
  const [repoData] = useState<RepoData>({
    name: "next.js-commerce",
    framework: "Next.js",
    language: "TypeScript",
    hasEnvFile: false,
    envVarsNeeded: ["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "STRIPE_SECRET_KEY", "DATABASE_URL"],
    buildStatus: "success",
    previewUrl: "https://preview.codeunbox.dev/abc123"
  });

  const [buildProgress, setBuildProgress] = useState(100);

  const getStatusIcon = () => {
    switch (repoData.buildStatus) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "building":
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (repoData.buildStatus) {
      case "pending":
        return "Queued for analysis";
      case "building":
        return "Building container...";
      case "success":
        return "Ready for preview";
      case "error":
        return "Build failed";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{repoData.name}</h1>
          <p className="text-muted-foreground">Repository Analysis & Preview</p>
        </div>
        {repoData.buildStatus === "success" && repoData.previewUrl && (
          <Button variant="gradient" size="lg">
            <ExternalLink className="w-5 h-5" />
            Open Preview
          </Button>
        )}
      </div>

      {/* Status Card */}
      <Card className="p-6 bg-card/50 backdrop-blur">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <span className="font-semibold">{getStatusText()}</span>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {repoData.framework}
          </Badge>
        </div>
        
        {repoData.buildStatus === "building" && (
          <div className="space-y-2">
            <Progress value={buildProgress} className="h-2" />
            <p className="text-sm text-muted-foreground">Setting up {repoData.framework} environment...</p>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Details */}
        <Card className="p-6 bg-card/50 backdrop-blur">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold">Project Details</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Framework:</span>
              <Badge variant="outline" className="border-primary/20 text-primary">
                {repoData.framework}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Language:</span>
              <Badge variant="outline" className="border-primary/20 text-primary">
                {repoData.language}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Package Manager:</span>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span>npm</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Environment Variables */}
        <Card className="p-6 bg-card/50 backdrop-blur">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold">Environment Variables</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">.env file detected:</span>
              <Badge variant={repoData.hasEnvFile ? "default" : "destructive"}>
                {repoData.hasEnvFile ? "Yes" : "No"}
              </Badge>
            </div>
            
            {repoData.envVarsNeeded.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Required variables:</p>
                <div className="space-y-1">
                  {repoData.envVarsNeeded.map((envVar, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                      <code className="text-primary">{envVar}</code>
                      <Badge variant="outline" className="text-xs">
                        Missing
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  Configure Environment
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Build Logs */}
      <Card className="p-6 bg-card/50 backdrop-blur">
        <div className="flex items-center gap-3 mb-4">
          <Play className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-semibold">Build Logs</h3>
        </div>
        
        <div className="bg-black/50 rounded-lg p-4 font-mono text-sm space-y-1 max-h-64 overflow-y-auto">
          <div className="text-green-400">✓ Repository cloned successfully</div>
          <div className="text-blue-400">→ Detected Next.js framework</div>
          <div className="text-blue-400">→ Installing dependencies...</div>
          <div className="text-green-400">✓ Dependencies installed</div>
          <div className="text-blue-400">→ Building application...</div>
          <div className="text-green-400">✓ Build completed successfully</div>
          <div className="text-yellow-400">⚠ Missing environment variables detected</div>
          <div className="text-green-400">✓ Container started on port 3000</div>
          <div className="text-cyan-400">🚀 Preview available at: {repoData.previewUrl}</div>
        </div>
      </Card>
    </div>
  );
};

export default RepoAnalysis;