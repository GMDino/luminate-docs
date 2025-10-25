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
    if (selectedFileId === fileId) setSelectedFileId(null);
  };

  const selectedFile = files.find((f) => f.id === selectedFileId) || null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-secondary/20 text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg p-2 bg-gradient-to-br from-primary to-accent shadow">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              PluteQ
            </h1>
          </div>
          <span className="hidden sm:block text-sm text-muted-foreground">
            Smart Document Workspace
          </span>
        </div>
      </header>

      {/* Main layout */}
      <main className="flex flex-1 overflow-hidden">
        {/* Sidebar / Viewer */}
        <aside
          className={`relative transition-all duration-500 ease-in-out border-r border-border bg-card/50 backdrop-blur-sm overflow-hidden
          ${selectedFile ? "w-full md:w-[40%]" : "w-full md:w-[30%]"}`}
        >
          <div className="absolute inset-0 overflow-auto p-6">
            {!selectedFile ? (
              <>
                <FileUpload onFilesUploaded={handleFilesUploaded} />
                {files.length > 0 ? (
                  <div className="mt-8">
                    <DocumentList
                      files={files}
                      selectedFileId={selectedFileId}
                      onFileSelect={setSelectedFileId}
                      onFileRemove={handleFileRemove}
                    />
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No documents yet. Upload to get started.
                  </div>
                )}
              </>
            ) : (
              <div className="animate-in fade-in slide-in-from-left duration-300">
                <DocumentViewer
                  file={selectedFile}
                  onClose={() => setSelectedFileId(null)}
                />
              </div>
            )}
          </div>
        </aside>

        {/* Chat area */}
        <section className="flex-1 relative bg-gradient-to-br from-card to-background overflow-hidden">
          <div className="absolute inset-0 p-6 overflow-auto">
            <div className="max-w-4xl mx-auto h-full flex flex-col rounded-2xl border border-border bg-card/70 backdrop-blur-sm shadow-xl transition-all duration-300">
              <ChatArea />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
export default Index;
