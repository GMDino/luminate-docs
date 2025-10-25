import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import mammoth from "mammoth";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
}

interface DocumentViewerProps {
  file: UploadedFile | null;
  onClose: () => void;
}

export const DocumentViewer = ({ file, onClose }: DocumentViewerProps) => {
  const [wordHTML, setWordHTML] = useState<string>("");
  const contentRef = useRef<HTMLDivElement>(null);
  const [showButton, setShowButton] = useState(false);
  const [buttonPos, setButtonPos] = useState({ top: 0, left: 0 });

  /** Load Word document */
  useEffect(() => {
    if (!file || file.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return;
    if (!file.content) return;

    const loadWord = async () => {
      try {
        const response = await fetch(file.content);
        const arrayBuffer = await response.arrayBuffer();
        const { value } = await mammoth.convertToHtml({ arrayBuffer });
        setWordHTML(value);
      } catch (err) {
        console.error("Failed to load Word file:", err);
      }
    };

    loadWord();
  }, [file]);

  /** Handle text selection for floating highlight button */
  const handleSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !contentRef.current) {
      setShowButton(false);
      return;
    }

    const range = selection.getRangeAt(0);
    if (!contentRef.current.contains(range.commonAncestorContainer)) {
      setShowButton(false);
      return;
    }

    if (selection.toString().trim() === "") {
      setShowButton(false);
      return;
    }

    const container = contentRef.current;
    const containerRect = container.getBoundingClientRect();
    const rangeRect = range.getBoundingClientRect();

    // Center horizontally above the selection
    const left =
      rangeRect.left -
      containerRect.left +
      rangeRect.width / 2 +
      container.scrollLeft;

    const top =
      rangeRect.top -
      containerRect.top -
      40 + // height above selection
      container.scrollTop;

    setButtonPos({ top, left });
    setShowButton(true);
  };

  /** Highlight selected text */
  const handleHighlight = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !contentRef.current) return;

    const range = selection.getRangeAt(0);
    if (!contentRef.current.contains(range.commonAncestorContainer)) return;

    const span = document.createElement("span");
    span.style.backgroundColor = "yellow";
    span.appendChild(range.extractContents());
    range.insertNode(span);

    selection.removeAllRanges();
    setShowButton(false);
  };

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelection);
    return () => document.removeEventListener("selectionchange", handleSelection);
  }, []);

  if (!file) return null;

  /** Render content by file type */
  const renderContent = () => {
    if (!file.content) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p>Unable to preview this file type</p>
        </div>
      );
    }

    // ✅ Image preview
    if (file.type.startsWith("image/")) {
      return (
        <div className="flex items-center justify-center h-full p-4">
          <img
            src={file.content}
            alt={file.name}
            className="max-w-full max-h-full object-contain rounded-lg shadow-md"
          />
        </div>
      );
    }

    // ✅ Text / JSON preview
    if (file.type.startsWith("text/") || file.type.includes("json")) {
      return (
        <div className="h-full overflow-auto p-6">
          <pre className="text-sm text-foreground font-mono whitespace-pre-wrap break-words bg-muted/50 p-4 rounded-lg">
            {file.content}
          </pre>
        </div>
      );
    }

    // ✅ PDF preview — iframe
    if (file.type === "application/pdf") {
      return (
        <div className="flex-1 h-full overflow-hidden bg-muted/10">
          <iframe
            src={file.content}
            title={file.name}
            className="w-full h-full border-none rounded-b-lg"
            style={{
              height: "calc(100vh - 100px)",
            }}
          />
        </div>
      );
    }

    // ✅ Word preview with highlight
    if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      return (
        <div className="h-full overflow-auto p-4 relative" ref={contentRef}>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: wordHTML }}
          />
          {showButton && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleHighlight}
              className="absolute z-50 shadow-md"
              style={{
                top: `${buttonPos.top}px`,
                left: `${buttonPos.left}px`,
                transform: "translateX(-50%)", // perfect center
              }}
            >
              Highlight
            </Button>
          )}
        </div>
      );
    }

    // ✅ Fallback
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Preview not available for this file type</p>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-xl shadow-md overflow-hidden border border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
        <h2 className="font-semibold text-foreground truncate flex-1 pr-4">{file.name}</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="hover:bg-destructive/10 hover:text-destructive shrink-0"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">{renderContent()}</div>
    </div>
  );
};
