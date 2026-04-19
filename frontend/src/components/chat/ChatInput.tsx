import { useState, useRef, useCallback } from "react";
import { Send, ImagePlus, Paperclip, X } from "lucide-react";
import { Mode } from "@/types/chat";

interface ChatInputProps {
  onSend: (content: string, imageUrl?: string, fileName?: string, file?: File) => void;
  isLoading: boolean;
  mode: Mode;
}

export function ChatInput({ onSend, isLoading, mode }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [preview, setPreview] = useState<{ url: string; name: string; file: File } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const text = input.trim();
    if (!text && !preview) return;
    onSend(text || "(attached file)", preview?.url, preview?.name, preview?.file);
    setInput("");
    setPreview(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setPreview({ url, name: file.name, file });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const showImageBtn = mode === "image";
  const showFileBtn = mode === "file";

  const placeholder = {
    chat: "Send a message…",
    text: "Enter your prompt for text generation…",
    image: "Describe or ask about the uploaded image…",
    file: "Ask about the uploaded file…",
  }[mode];

  return (
    <div
      className="border-t border-border bg-background p-4"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {preview && (
        <div className="mb-3 flex items-center gap-2 animate-fade-in">
          {preview.file.type.startsWith("image/") ? (
            <img src={preview.url} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-border" />
          ) : (
            <div className="h-16 px-4 flex items-center gap-2 bg-secondary rounded-lg text-sm">
              📎 {preview.name}
            </div>
          )}
          <button onClick={() => setPreview(null)} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        {(showImageBtn || showFileBtn) && (
          <>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept={showImageBtn ? "image/*" : "*"}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="p-2.5 rounded-xl bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
              title={showImageBtn ? "Upload image" : "Upload file"}
            >
              {showImageBtn ? <ImagePlus className="w-5 h-5" /> : <Paperclip className="w-5 h-5" />}
            </button>
          </>
        )}

        <div className="flex-1 relative">
          <textarea
            ref={textRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className="w-full resize-none bg-secondary rounded-xl px-4 py-3 pr-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring max-h-36 overflow-y-auto"
            style={{ minHeight: "48px" }}
          />
          <button
            onClick={handleSubmit}
            disabled={isLoading || (!input.trim() && !preview)}
            className="absolute right-2 bottom-2 p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
