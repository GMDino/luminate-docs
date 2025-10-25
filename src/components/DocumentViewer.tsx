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

    // ✅ Image preview
    if (file.type.startsWith("image/")) {
      return (
        <div className="flex items-center justify-center h-full p-4">
          <img
            src={file.content}
            alt={file.name}
            className="max-w-full max-h-full object-contain rounded-lg shadow-md"
          />
        </div>
      );
    }

    // ✅ Text / JSON preview
    if (file.type.startsWith("text/") || file.type.includes("json")) {
      return (
        <div className="h-full overflow-auto p-6">
          <pre className="text-sm text-foreground font-mono whitespace-pre-wrap break-words bg-muted/50 p-4 rounded-lg">
            {file.content}
          </pre>
        </div>
      );
    }

    // ✅ PDF preview — full height
    if (file.type === "application/pdf") {
      return (
        <div className="flex-1 h-full overflow-hidden bg-muted/10">
          <iframe
            src={file.content}
            title={file.name}
            className="w-full h-full min-h-[80vh] border-none rounded-b-lg"
            style={{
              height: "calc(100vh - 100px)", // ensure it fills available height
            }}
          />
        </div>
      );
    }

    // ✅ Fallback
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Preview not available for this file type</p>
      </div>
    );
  };

  return (
    <div
      className="flex flex-col h-full bg-card rounded-xl shadow-md overflow-hidden border border-border"
      style={{ boxShadow: "var(--shadow-elevated)" }}
    >
      {/* Header */}
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

      {/* Content */}
      <div className="flex-1 overflow-hidden">{renderContent()}</div>
    </div>
  );
};
