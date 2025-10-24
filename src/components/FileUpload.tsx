import { useCallback, useState } from "react";
import { Upload, FileText, Image, FileCode, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
}

interface FileUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return Image;
  if (type.includes('pdf') || type.includes('document')) return FileText;
  if (type.includes('text') || type.includes('json')) return FileCode;
  return File;
};

export const FileUpload = ({ onFilesUploaded }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = useCallback(async (files: FileList) => {
    const uploadedFiles: UploadedFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      
      await new Promise((resolve) => {
        reader.onload = (e) => {
          uploadedFiles.push({
            id: `${Date.now()}-${i}`,
            name: file.name,
            size: file.size,
            type: file.type,
            content: e.target?.result as string,
          });
          resolve(null);
        };
        
        if (file.type.startsWith('text/') || file.type.includes('json')) {
          reader.readAsText(file);
        } else {
          reader.readAsDataURL(file);
        }
      });
    }
    
    onFilesUploaded(uploadedFiles);
    toast.success(`${uploadedFiles.length} file(s) uploaded successfully`);
  }, [onFilesUploaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  }, [processFiles]);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`
        relative rounded-xl border-2 border-dashed p-12 text-center transition-all
        ${isDragging 
          ? 'border-primary bg-primary/5 scale-[1.02]' 
          : 'border-border bg-card hover:border-primary/50 hover:bg-card/80'
        }
      `}
      style={{ boxShadow: 'var(--shadow-soft)' }}
    >
      <input
        type="file"
        multiple
        onChange={handleFileInput}
        className="hidden"
        id="file-upload"
      />
      
      <div className="flex flex-col items-center gap-4">
        <div 
          className="rounded-full p-6 bg-gradient-to-br from-primary/10 to-accent/10"
          style={{ boxShadow: 'var(--shadow-soft)' }}
        >
          <Upload className="h-12 w-12 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">
            Drop files here or click to upload
          </h3>
          <p className="text-sm text-muted-foreground">
            Support for multiple files • PDF, images, text, and more
          </p>
        </div>
        
        <label htmlFor="file-upload">
          <Button className="mt-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity">
            Select Files
          </Button>
        </label>
      </div>
    </div>
  );
};
