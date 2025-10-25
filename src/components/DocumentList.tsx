import { FileText, Image, FileCode, File, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
}

interface DocumentListProps {
  files: UploadedFile[];
  selectedFileId: string | null;
  onFileSelect: (fileId: string) => void;
  onFileRemove: (fileId: string) => void;
  selectedSources: Set<string>;
  onToggleSource: (fileId: string) => void;
}

const getFileIcon = (type: string) => {
  if (type.startsWith("image/")) return Image;
  if (type.includes("pdf") || type.includes("document")) return FileText;
  if (type.includes("text") || type.includes("json")) return FileCode;
  return File;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

export const DocumentList = ({
  files,
  selectedFileId,
  onFileSelect,
  onFileRemove,
  selectedSources,
  onToggleSource,
}: DocumentListProps) => {
  if (!files.length) return null;

  const allSelected = selectedSources.size === files.length;

  return (
    // Wrap list in scrollable container
    <div className="flex-1 overflow-auto no-scrollbar space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">
          Your Sources ({files.length})
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (allSelected) {
              files.forEach((f) => onToggleSource(f.id));
            } else {
              files.forEach((f) => {
                if (!selectedSources.has(f.id)) onToggleSource(f.id);
              });
            }
          }}
        >
          {allSelected ? "Deselect All" : "Select All"}
        </Button>
      </div>

      {/* File List */}
      <div className="space-y-2">
        {files.map((file) => {
          const Icon = getFileIcon(file.type);
          const isSelected = selectedFileId === file.id;
          const isChecked = selectedSources.has(file.id);

          return (
            <div
              key={file.id}
              className={`
                group relative flex items-center gap-3 rounded-lg p-3 cursor-pointer transition-all
                ${isSelected
                  ? "bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary"
                  : "bg-card hover:bg-card/80 border border-border hover:border-primary/30"
                }
              `}
              style={{
                boxShadow: isSelected ? "var(--shadow-elevated)" : "var(--shadow-soft)",
              }}
            >
              {/* Modern Checkbox */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSource(file.id);
                }}
                className={`flex items-center justify-center w-5 h-5 rounded-md border transition-colors shrink-0 cursor-pointer
                  ${isChecked
                    ? "bg-primary border-primary"
                    : "bg-card border-border hover:border-primary/50"
                  }`}
              >
                {isChecked && <Check className="w-4 h-4 text-white" />}
              </div>

              {/* File Icon */}
              <div
                className={`rounded-lg p-2 transition-colors shrink-0
                  ${isSelected ? "bg-primary/20" : "bg-muted"}`}
              >
                <Icon
                  className={`h-5 w-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                />
              </div>

              {/* File Info */}
              <div
                className="flex-1 min-w-0"
                onClick={() => onFileSelect(file.id)}
              >
                <p className={`font-medium truncate ${isSelected ? "text-primary" : "text-foreground"}`}>
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatFileSize(file.size)}
                </p>
              </div>

              {/* Remove Button */}
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileRemove(file.id);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
