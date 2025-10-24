import { useState } from "react";
import { BookOpen } from "lucide-react";
import { FileUpload } from "../components/FileUpload";
import { DocumentList } from "../components/DocumentList";
import { DocumentViewer } from "../components/DocumentViewer";
import { ChatArea } from "../components/ChatArea";


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
              PluteQ
            </h1>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Pane — File List or Viewer */}
        <div className="w-1/3 border-r border-border overflow-auto transition-all duration-300">
          {!selectedFile && (
            <div className="p-6">
              <FileUpload onFilesUploaded={handleFilesUploaded} />
              {files.length > 0 && (
                <div className="mt-8">
                  <DocumentList
                    files={files}
                    selectedFileId={selectedFileId}
                    onFileSelect={setSelectedFileId}
                    onFileRemove={handleFileRemove}
                  />
                </div>
              )}
              {files.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No documents yet. Upload to get started.
                </div>
              )}
            </div>
          )}

          {selectedFile && (
            <DocumentViewer
              file={selectedFile}
              onClose={() => setSelectedFileId(null)}
            />
          )}
        </div>

        {/* Middle Pane — Chat Area */}
        <div className="flex-1 overflow-auto">
          <ChatArea />
        </div>
      </div>
    </div>
  );
};

export default Index;
