import { useState, useRef, useEffect } from "react";
import { BookOpen, GripVertical, Menu, X as CloseIcon } from "lucide-react";
import { FileUpload } from "../components/FileUpload";
import { DocumentList } from "../components/DocumentList";
import { DocumentViewer } from "../components/DocumentViewer";
import { ChatArea } from "../components/ChatArea";
import { Button } from "@/components/ui/button";

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
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set());
  const [sidebarWidth, setSidebarWidth] = useState(35); // % width
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isResizing = useRef(false);

  // File handlers
  const handleFilesUploaded = (newFiles: UploadedFile[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleFileRemove = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    setSelectedSources((prev) => {
      const newSet = new Set(prev);
      newSet.delete(fileId);
      return newSet;
    });
    if (selectedFileId === fileId) setSelectedFileId(null);
  };

  // Source selection handlers
  const handleToggleSource = (id: string) => {
    setSelectedSources((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleSelectAllSources = () => {
    if (selectedSources.size === files.length) setSelectedSources(new Set());
    else setSelectedSources(new Set(files.map((f) => f.id)));
  };

  const selectedFile = files.find((f) => f.id === selectedFileId) || null;

  // Sidebar resizing
  const startResize = () => {
    isResizing.current = true;
    document.body.style.cursor = "col-resize";
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = (e.clientX / window.innerWidth) * 100;
    setSidebarWidth(Math.min(Math.max(newWidth, 20), 60));
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
    // -> use h-screen & overflow-hidden so only internal panes scroll
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-secondary/20 text-foreground">
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
            <span className="hidden sm:block text-sm text-muted-foreground"></span>
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
      {/* keep main height locked to viewport minus header; don't let body scroll */}
      <main className="flex flex-1 h-[calc(100vh-73px)] overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`flex-shrink-0 border-r border-border bg-card/50 backdrop-blur-sm transition-all duration-200 ease-in-out
            ${mobileSidebarOpen ? "fixed z-20 left-0 top-0 h-full" : "sm:relative sm:flex-shrink-0 sm:block"}`}
          style={{ width: mobileSidebarOpen ? "80%" : `${sidebarWidth}%`, minWidth: "240px", maxWidth: "700px" }}
        >
          {/* ensure aside occupies full height and its inner content is scrollable */}
          <div className="h-full flex flex-col p-6 overflow-auto no-scrollbar">
            {/* Upload pill + Select All */}
            {files.length > 0 ? (
              <div className="mb-4 flex items-center justify-between gap-2">
                <FileUpload onFilesUploaded={handleFilesUploaded} small />
                <Button variant="ghost" size="sm" onClick={handleSelectAllSources}>
                  {selectedSources.size === files.length ? "Deselect All" : "Select All"}
                </Button>
              </div>
            ) : (
              <div className="mb-4">
                <FileUpload onFilesUploaded={handleFilesUploaded} />
              </div>
            )}

            {/* Selected count */}
            {files.length > 0 && (
              <div className="mb-2 text-sm text-muted-foreground">
                {selectedSources.size} selected
              </div>
            )}

            {!selectedFile ? (
              <DocumentList
                files={files}
                selectedFileId={selectedFileId}
                onFileSelect={setSelectedFileId}
                onFileRemove={handleFileRemove}
                selectedSources={selectedSources}
                onToggleSource={handleToggleSource}
              />
            ) : (
              <DocumentViewer file={selectedFile} onClose={() => setSelectedFileId(null)} />
            )}
          </div>

          {/* Resize handle */}
          <div onMouseDown={startResize} className="hidden sm:flex absolute top-0 right-0 w-4 h-full items-center justify-center cursor-col-resize hover:bg-border/20 transition">
            <GripVertical className="text-muted-foreground" />
          </div>

          {/* Mobile close button */}
          {mobileSidebarOpen && <button className="sm:hidden absolute top-2 right-2 p-2 rounded hover:bg-border/20 z-30" onClick={() => setMobileSidebarOpen(false)}><CloseIcon className="w-5 h-5" /></button>}
        </aside>

        {/* Overlay for mobile */}
        {mobileSidebarOpen && <div className="sm:hidden fixed inset-0 bg-black/20 z-10" onClick={() => setMobileSidebarOpen(false)} />}

        {/* Chat */}
        {/* make the section itself overflow-hidden and put the scroll on an inner flex-1 container */}
        <section className="flex-1 bg-gradient-to-br from-card to-background overflow-hidden no-scrollbar p-6">
          <div className="h-full flex flex-col max-w-4xl mx-auto rounded-2xl border border-border bg-card/70 backdrop-blur-sm shadow-xl overflow-hidden">
            {/* THIS wrapper is the one that will hold the scrollable chat messages */}
            <div className="flex-1 overflow-auto no-scrollbar">
              {/* ChatArea should be implemented as a column with a messages area that can stretch */}
              <ChatArea />
            </div>
          </div>
        </section>
      </main>

      <style>{`
        .no-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default Index;
