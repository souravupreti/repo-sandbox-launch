import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import CodeViewer from "@/components/CodeViewer";
import { 
  FileText, 
  Package, 
  Settings, 
  Play, 
  CheckCircle, 
  AlertCircle,
  Clock,
  ExternalLink,
  ArrowLeft
} from "lucide-react";
import { RepoData } from "@/hooks/useRepoAnalysis";

interface RepoAnalysisProps {
  repoData: RepoData | null;
  onBack: () => void;
}

const RepoAnalysis = ({ repoData, onBack }: RepoAnalysisProps) => {
  const [buildProgress] = useState(repoData?.buildStatus === "building" ? 65 : 100);
  
  if (!repoData) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing analysis...</p>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gradient-hero">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{repoData.name}</h1>
              <p className="text-muted-foreground">Repository Analysis & Preview</p>
            </div>
          </div>
          {repoData.buildStatus === "success" && repoData.previewUrl && (
            <Button variant="gradient" size="lg" asChild>
              <a href={repoData.previewUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-5 h-5" />
                Open Preview
              </a>
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

      {/* Code Viewer */}
      {repoData.files && repoData.files.length > 0 && (
        <CodeViewer 
          files={repoData.files} 
          repoUrl={`https://github.com/${repoData.name}`}
        />
      )}

      {/* Build Logs */}
      <Card className="p-6 bg-card/50 backdrop-blur">
        <div className="flex items-center gap-3 mb-4">
          <Play className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-semibold">Build Logs</h3>
        </div>
        
        <div className="bg-black/50 rounded-lg p-4 font-mono text-sm space-y-1 max-h-64 overflow-y-auto">
          <div className="text-green-400">✓ Repository cloned successfully</div>
          <div className="text-blue-400">→ Detected {repoData.framework} framework</div>
          <div className="text-blue-400">→ Installing dependencies...</div>
          <div className="text-green-400">✓ Dependencies installed</div>
          <div className="text-blue-400">→ Building application...</div>
          {repoData.buildStatus === "success" && (
            <>
              <div className="text-green-400">✓ Build completed successfully</div>
              {repoData.envVarsNeeded.length > 0 && (
                <div className="text-yellow-400">⚠ Missing environment variables detected</div>
              )}
              <div className="text-green-400">✓ Container started on port 3000</div>
              {repoData.previewUrl && (
                <div className="text-cyan-400">🚀 Preview available at: {repoData.previewUrl}</div>
              )}
            </>
          )}
          {repoData.buildStatus === "building" && (
            <div className="text-blue-400 animate-pulse">→ Building in progress...</div>
          )}
          {repoData.buildStatus === "error" && (
            <div className="text-red-400">✗ Build failed - check repository configuration</div>
          )}
        </div>
      </Card>
    </div>
    </div>
  );
};

export default RepoAnalysis;