import { useCallback, useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;  // Text content or blob URL
  blobUrl?: string;  // Used for cleanup/rendering
}

interface FileUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  small?: boolean;
}

export const FileUpload = ({ onFilesUploaded, small }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // --- Upload to server ---
  const uploadFileToAPI = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();

      if (result === true) toast.success(`File "${file.name}" uploaded successfully`);
      else toast.error(`Failed to upload "${file.name}"`);
    } catch (error) {
      toast.error(`Error uploading "${file.name}"`);
      console.error(error);
    }
  };

  // --- Process uploaded files ---
  const processFiles = useCallback(async (files: FileList) => {
    const uploadedFiles: UploadedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Send to server (async, no await)
      uploadFileToAPI(file);

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
          content: blobUrl, // used by DocumentViewer
          blobUrl,          // for cleanup
        });
      }
    }

    onFilesUploaded(uploadedFiles);
  }, [onFilesUploaded]);

  // --- Drag & drop handlers ---
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      processFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  }, [processFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      processFiles(e.target.files);
      e.target.value = "";
    }
  }, [processFiles]);

  // --- Global drag events ---
  useEffect(() => {
    const handleGlobalDragOver = (e: DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const handleGlobalDrop = (e: DragEvent) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer?.files?.length) processFiles(e.dataTransfer.files); };
    const handleGlobalDragLeave = (e: DragEvent) => { e.preventDefault(); setIsDragging(false); };

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
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        className={`relative cursor-pointer select-none transition-all flex items-center justify-center
          ${small ? "px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20" : "rounded-xl border-2 border-dashed p-12 bg-card hover:border-primary/50 hover:bg-card/80"}`}
        style={{ boxShadow: "var(--shadow-soft)" }}
      >
        <input ref={inputRef} type="file" multiple onChange={handleFileInput} className="hidden" />

        {small ? (
          <div className="flex items-center gap-2 pointer-events-none text-sm text-foreground font-medium">
            <Upload className="h-4 w-4" /> Add more files
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 pointer-events-none">
            <div className="rounded-full p-6 bg-gradient-to-br from-primary/10 to-accent/10" style={{ boxShadow: "var(--shadow-soft)" }}>
              <Upload className="h-12 w-12 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">Drop files here or click to upload</h3>
              <p className="text-sm text-muted-foreground">Supports PDF, images, text, and more</p>
            </div>
            <Button type="button" onClick={e => { e.stopPropagation(); inputRef.current?.click(); }} className="mt-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity pointer-events-auto">Select Files</Button>
          </div>
        )}
      </div>
    </>
  );
};
