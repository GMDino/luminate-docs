import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
}

interface DocumentViewerProps {
  file: UploadedFile | null;
  onClose: () => void;
}

export const DocumentViewer = ({ file, onClose }: DocumentViewerProps) => {
  if (!file) return null;

  const renderContent = () => {
    if (!file.content) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p>Unable to preview this file type</p>
        </div>
      );
    }

    if (file.type.startsWith('image/')) {
      return (
        <div className="flex items-center justify-center h-full p-6">
          <img 
            src={file.content} 
            alt={file.name} 
            className="max-w-full max-h-full object-contain rounded-lg"
            style={{ boxShadow: 'var(--shadow-elevated)' }}
          />
        </div>
      );
    }

    if (file.type.startsWith('text/') || file.type.includes('json')) {
      return (
        <div className="h-full overflow-auto p-6">
          <pre className="text-sm text-foreground font-mono whitespace-pre-wrap break-words bg-muted/50 p-4 rounded-lg">
            {file.content}
          </pre>
        </div>
      );
    }

    if (file.type === 'application/pdf') {
      return (
        <iframe 
          src={file.content} 
          className="w-full h-full rounded-lg"
          title={file.name}
        />
      );
    }

    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Preview not available for this file type</p>
      </div>
    );
  };

  return (
    <div 
      className="h-full flex flex-col bg-card border-r border-border animate-in slide-in-from-left duration-300"
      style={{ boxShadow: 'var(--shadow-elevated)' }}
    >
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
        <h2 className="font-semibold text-foreground truncate flex-1 pr-4">
          {file.name}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="hover:bg-destructive/10 hover:text-destructive shrink-0"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};
