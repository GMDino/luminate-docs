import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { DocumentList } from "@/components/DocumentList";
import { DocumentViewer } from "@/components/DocumentViewer";
import { BookOpen } from "lucide-react";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
}

const Index = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  const handleFilesUploaded = (newFiles: UploadedFile[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleFileRemove = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (selectedFileId === fileId) {
      setSelectedFileId(null);
    }
  };

  const selectedFile = files.find((f) => f.id === selectedFileId) || null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div 
              className="rounded-lg p-2 bg-gradient-to-br from-primary to-accent"
              style={{ boxShadow: 'var(--shadow-soft)' }}
            >
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              NotebookAI
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Document Viewer - Left Pane */}
        {selectedFile && (
          <div className="w-1/2 border-r border-border">
            <DocumentViewer 
              file={selectedFile} 
              onClose={() => setSelectedFileId(null)} 
            />
          </div>
        )}

        {/* Main Content Area - Right Pane */}
        <div className={`${selectedFile ? 'w-1/2' : 'w-full'} overflow-auto transition-all duration-300`}>
          <div className="container mx-auto px-6 py-8 max-w-4xl">
            {/* Upload Section */}
            <div className="mb-8">
              <FileUpload onFilesUploaded={handleFilesUploaded} />
            </div>

            {/* Document List */}
            {files.length > 0 && (
              <div className="mb-8">
                <DocumentList
                  files={files}
                  selectedFileId={selectedFileId}
                  onFileSelect={setSelectedFileId}
                  onFileRemove={handleFileRemove}
                />
              </div>
            )}

            {/* Empty State */}
            {files.length === 0 && (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">
                    Welcome to NotebookAI
                  </h2>
                  <p className="text-muted-foreground">
                    Upload your documents to get started. Organize your research, notes, and ideas all in one place.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
