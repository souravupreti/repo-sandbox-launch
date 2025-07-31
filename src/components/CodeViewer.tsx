import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Folder, 
  Code, 
  Eye,
  Download,
  ExternalLink
} from "lucide-react";
import { useState } from "react";

interface FileItem {
  name: string;
  type: "file" | "dir";
  size?: number;
  download_url?: string;
  html_url?: string;
}

interface CodeViewerProps {
  files: FileItem[];
  repoUrl: string;
}

const CodeViewer = ({ files, repoUrl }: CodeViewerProps) => {
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const getFileIcon = (fileName: string, type: string) => {
    if (type === "dir") return <Folder className="w-4 h-4 text-blue-400" />;
    
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return <Code className="w-4 h-4 text-yellow-400" />;
      case 'html':
        return <Code className="w-4 h-4 text-orange-400" />;
      case 'css':
        return <Code className="w-4 h-4 text-blue-400" />;
      case 'json':
        return <Code className="w-4 h-4 text-green-400" />;
      case 'md':
        return <FileText className="w-4 h-4 text-gray-400" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getLanguage = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      case 'py':
        return 'python';
      default:
        return 'text';
    }
  };

  const loadFileContent = async (file: FileItem) => {
    if (!file.download_url || file.type === "dir") return;
    
    setIsLoading(true);
    setSelectedFile(file);
    
    try {
      const response = await fetch(file.download_url);
      const content = await response.text();
      setFileContent(content);
    } catch (error) {
      console.error('Error loading file:', error);
      setFileContent('Error loading file content');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur">
      <div className="flex items-center gap-3 mb-4">
        <Eye className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-semibold">Code Preview</h3>
        <Button variant="outline" size="sm" asChild>
          <a href={repoUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4" />
            View on GitHub
          </a>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-96">
        {/* File Explorer */}
        <div className="lg:col-span-1">
          <div className="mb-2">
            <Badge variant="outline" className="text-xs">
              {files.length} files
            </Badge>
          </div>
          <ScrollArea className="h-80 border rounded-lg bg-muted/20 p-3">
            <div className="space-y-1">
              {files.slice(0, 20).map((file, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted/30 transition-colors ${
                    selectedFile?.name === file.name ? 'bg-primary/20' : ''
                  }`}
                  onClick={() => loadFileContent(file)}
                >
                  {getFileIcon(file.name, file.type)}
                  <span className="text-sm truncate">{file.name}</span>
                  {file.size && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      {(file.size / 1024).toFixed(1)}KB
                    </span>
                  )}
                </div>
              ))}
              {files.length > 20 && (
                <div className="text-xs text-muted-foreground p-2">
                  ... and {files.length - 20} more files
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Code Display */}
        <div className="lg:col-span-2">
          {selectedFile ? (
            <div className="h-full">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getFileIcon(selectedFile.name, selectedFile.type)}
                  <span className="font-mono text-sm">{selectedFile.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {getLanguage(selectedFile.name)}
                  </Badge>
                </div>
                {selectedFile.download_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={selectedFile.download_url} target="_blank" rel="noopener noreferrer">
                      <Download className="w-3 h-3" />
                    </a>
                  </Button>
                )}
              </div>
              <ScrollArea className="h-72 border rounded-lg bg-black/50 p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                    {fileContent || 'Click on a file to view its content'}
                  </pre>
                )}
              </ScrollArea>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center border rounded-lg bg-muted/10">
              <div className="text-center text-muted-foreground">
                <Code className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Select a file to view its content</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CodeViewer;