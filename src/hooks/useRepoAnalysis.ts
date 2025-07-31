import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RepoData {
  name: string;
  framework: string;
  language: string;
  hasEnvFile: boolean;
  envVarsNeeded: string[];
  buildStatus: "pending" | "building" | "success" | "error";
  previewUrl?: string;
  files?: any[];
}

export const useRepoAnalysis = () => {
  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeRepository = async (repoUrl: string) => {
    setIsAnalyzing(true);
    setError(null);
    setRepoData(null);

    // Set initial analyzing state
    const initialData: RepoData = {
      name: "Analyzing...",
      framework: "Detecting...",
      language: "Detecting...",
      hasEnvFile: false,
      envVarsNeeded: [],
      buildStatus: "building"
    };
    setRepoData(initialData);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-repo', {
        body: { repoUrl }
      });

      if (error) throw error;

      setRepoData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      setRepoData({
        name: "Analysis Failed",
        framework: "Error",
        language: "Error",
        hasEnvFile: false,
        envVarsNeeded: [],
        buildStatus: "error"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    repoData,
    isAnalyzing,
    error,
    analyzeRepository
  };
};