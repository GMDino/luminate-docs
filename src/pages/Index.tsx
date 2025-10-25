import { useState, useRef, useEffect } from "react";
import { BookOpen, GripVertical, Menu } from "lucide-react";
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
  const [sidebarWidth, setSidebarWidth] = useState(35); // % width
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isResizing = useRef(false);

  const handleFilesUploaded = (newFiles: UploadedFile[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleFileRemove = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (selectedFileId === fileId) setSelectedFileId(null);
  };

  const selectedFile = files.find((f) => f.id === selectedFileId) || null;

  // Sidebar resizing (desktop/tablet only)
  const startResize = () => {
    isResizing.current = true;
    document.body.style.cursor = "col-resize";
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = (e.clientX / window.innerWidth) * 100;
    setSidebarWidth(Math.min(Math.max(newWidth, 20), 60)); // clamp 20%-60%
  };

  const stopResize = () => {
    isResizing.current = false;
    document.body.style.cursor = "default";
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopResize);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopResize);
    };
  }, []);

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
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-muted-foreground">
              Smart Document Workspace
            </span>
            {/* Mobile menu button */}
            <button
              className="sm:hidden p-2 rounded hover:bg-border/20"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <main className="flex flex-1 overflow-hidden relative">
        {/* Sidebar / Viewer */}
        <aside
          className={`
            transition-all duration-200 ease-in-out border-r border-border bg-card/50 backdrop-blur-sm overflow-hidden select-none
            ${mobileSidebarOpen ? "fixed z-20 left-0 top-0 h-full" : "sm:relative sm:flex-shrink-0 sm:block"}
          `}
          style={{
            width: mobileSidebarOpen ? "80%" : `${sidebarWidth}%`,
            minWidth: "240px",
            maxWidth: "700px",
          }}
        >
          <div className="absolute inset-0 overflow-auto no-scrollbar p-6">
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

          {/* Resize handle (desktop/tablet only) */}
          <div
            onMouseDown={startResize}
            className="hidden sm:flex absolute top-0 right-0 w-4 h-full items-center justify-center cursor-col-resize hover:bg-border/20 transition"
          >
            <GripVertical className="text-muted-foreground" />
          </div>

          {/* Mobile close button */}
          {mobileSidebarOpen && (
            <button
              className="sm:hidden absolute top-2 right-2 p-2 rounded hover:bg-border/20 z-30"
              onClick={() => setMobileSidebarOpen(false)}
            >
              ✕
            </button>
          )}
        </aside>

        {/* Overlay for mobile */}
        {mobileSidebarOpen && (
          <div
            className="sm:hidden fixed inset-0 bg-black/20 z-10"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Chat area */}
        <section className="flex-1 relative bg-gradient-to-br from-card to-background overflow-hidden">
          <div className="absolute inset-0 p-6 overflow-auto no-scrollbar">
            <div className="max-w-4xl mx-auto h-full flex flex-col rounded-2xl border border-border bg-card/70 backdrop-blur-sm shadow-xl transition-all duration-300">
              <ChatArea />
            </div>
          </div>
        </section>
      </main>

      {/* Global scrollbar hide */}
      <style>{`
        .no-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Index;
