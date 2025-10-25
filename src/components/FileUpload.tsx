import { useCallback, useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
  blobUrl?: string;
}

interface FileUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  small?: boolean; // Shrink into pill if true
}

export const FileUpload = ({ onFilesUploaded, small = false }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const processFiles = useCallback(async (files: FileList) => {
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
  }, [onFilesUploaded]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) processFiles(e.target.files);
    e.target.value = "";
  };

  // Global drag & drop
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer?.files?.length) processFiles(e.dataTransfer.files);
    };
    const handleDragLeave = (e: DragEvent) => { e.preventDefault(); setIsDragging(false); };

    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);
    window.addEventListener("dragleave", handleDragLeave);
    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
      window.removeEventListener("dragleave", handleDragLeave);
    };
  }, [processFiles]);

  return (
    <>
      {isDragging && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-none transition-all">
          <div className="text-center space-y-3">
            <Upload className="h-12 w-12 text-primary mx-auto animate-bounce" />
            <p className="text-lg font-medium text-primary">Drop files anywhere to upload</p>
          </div>
        </div>
      )}

      <div
        onClick={() => inputRef.current?.click()}
        className={`
          relative cursor-pointer transition-all select-none
          ${small 
            ? "flex items-center gap-2 p-2 rounded-full border border-border w-max hover:bg-card/80"
            : "rounded-xl border-2 border-dashed p-12 text-center hover:border-primary/50 hover:bg-card/80"
          }
        `}
      >
        <input ref={inputRef} type="file" multiple className="hidden" onChange={handleFileInput} />

        {small ? (
          <Upload className="w-5 h-5 text-primary" />
        ) : (
          <div className="flex flex-col items-center gap-4 pointer-events-none">
            <div className="rounded-full p-6 bg-gradient-to-br from-primary/10 to-accent/10">
              <Upload className="h-12 w-12 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">Drop files here or click to upload</h3>
              <p className="text-sm text-muted-foreground">Supports PDF, images, text, and more</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
