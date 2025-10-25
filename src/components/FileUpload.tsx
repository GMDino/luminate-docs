import { useCallback, useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string; // Can be text or blob URL
  blobUrl?: string; // Used for cleanup
}

interface FileUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
}

export const FileUpload = ({ onFilesUploaded }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // --- Process Files (Shared Logic) ---
  const processFiles = useCallback(
    async (files: FileList) => {
      const uploadedFiles: UploadedFile[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (file.type.startsWith("text/") || file.type.includes("json")) {
          const text = await file.text();
          uploadedFiles.push({
            id: `${Date.now()}-${i}`,
            name: file.name,
            size: file.size,
            type: file.type,
            content: text,
          });
        } else {
          const blobUrl = URL.createObjectURL(file);
          uploadedFiles.push({
            id: `${Date.now()}-${i}`,
            name: file.name,
            size: file.size,
            type: file.type,
            content: blobUrl,
            blobUrl,
          });
        }
      }

      onFilesUploaded(uploadedFiles);
      toast.success(`${uploadedFiles.length} file(s) uploaded successfully`);
    },
    [onFilesUploaded]
  );

  // --- Handle Local Drop Area ---
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files?.length) {
        processFiles(e.dataTransfer.files);
        e.dataTransfer.clearData();
      }
    },
    [processFiles]
  );

  // --- Handle File Input (Manual Upload) ---
  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        processFiles(e.target.files);
        e.target.value = "";
      }
    },
    [processFiles]
  );

  // --- Global Drag and Drop ---
  useEffect(() => {
    const handleGlobalDragOver = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleGlobalDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (e.dataTransfer?.files?.length) {
        processFiles(e.dataTransfer.files);
      }
    };

    const handleGlobalDragLeave = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
    };

    window.addEventListener("dragover", handleGlobalDragOver);
    window.addEventListener("drop", handleGlobalDrop);
    window.addEventListener("dragleave", handleGlobalDragLeave);

    return () => {
      window.removeEventListener("dragover", handleGlobalDragOver);
      window.removeEventListener("drop", handleGlobalDrop);
      window.removeEventListener("dragleave", handleGlobalDragLeave);
    };
  }, [processFiles]);

  return (
    <>
      {/* Optional Global Overlay */}
      {isDragging && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-none transition-all">
          <div className="text-center space-y-3">
            <Upload className="h-12 w-12 text-primary mx-auto animate-bounce" />
            <p className="text-lg font-medium text-primary">
              Drop files anywhere to upload
            </p>
          </div>
        </div>
      )}

      {/* Original Upload Box */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={`relative rounded-xl border-2 border-dashed p-12 text-center cursor-pointer transition-all select-none ${
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border bg-card hover:border-primary/50 hover:bg-card/80"
        }`}
        style={{ boxShadow: "var(--shadow-soft)" }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-4 pointer-events-none">
          <div
            className="rounded-full p-6 bg-gradient-to-br from-primary/10 to-accent/10"
            style={{ boxShadow: "var(--shadow-soft)" }}
          >
            <Upload className="h-12 w-12 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              Drop files here or click to upload
            </h3>
            <p className="text-sm text-muted-foreground">
              Supports PDF, images, text, and more
            </p>
          </div>
          <Button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
            className="mt-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity pointer-events-auto"
          >
            Select Files
          </Button>
        </div>
      </div>
    </>
  );
};
