import { useRef, useEffect } from "react";
import { Conversation, Mode } from "@/types/chat";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";
import { SystemPrompt } from "./SystemPrompt";
import { Trash2, Download, MessageSquare, Type, Image, FileText } from "lucide-react";

interface ChatAreaProps {
  conversation: Conversation;
  mode: Mode;
  onSend: (content: string, imageUrl?: string, fileName?: string, file?: File) => void;
  onSetSystemPrompt: (prompt: string) => void;
  onClear: () => void;
  onExport: () => void;
}

const modeConfig = {
  chat: { icon: MessageSquare, label: "Chat Conversation", desc: "Multi-turn chat with AI" },
  text: { icon: Type, label: "Text Generation", desc: "Generate text from a prompt" },
  image: { icon: Image, label: "Image Input", desc: "Upload and analyze images" },
  file: { icon: FileText, label: "File Upload", desc: "Upload and process files" },
};

export function ChatArea({ conversation, mode, onSend, onSetSystemPrompt, onClear, onExport }: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [conversation.messages, conversation.isLoading]);

  const cfg = modeConfig[mode];
  const Icon = cfg.icon;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-sm font-semibold text-foreground">{cfg.label}</h2>
            <p className="text-xs text-muted-foreground">{cfg.desc}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {conversation.messages.length > 0 && (
            <>
              <button
                onClick={onExport}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                title="Export conversation"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={onClear}
                className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors"
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      <SystemPrompt value={conversation.systemPrompt} onChange={onSetSystemPrompt} />

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {conversation.messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-3">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
              <Icon className="w-8 h-8 text-primary/60" />
            </div>
            <p className="text-lg font-medium text-foreground/70">Start a conversation</p>
            <p className="text-sm max-w-sm">
              {mode === "image"
                ? "Upload an image and ask questions about it."
                : mode === "file"
                ? "Upload a file and interact with its contents."
                : "Type a message below to get started."}
            </p>
          </div>
        )}
        {conversation.messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {conversation.isLoading && <TypingIndicator />}
      </div>

      <ChatInput onSend={onSend} isLoading={conversation.isLoading} mode={mode} />
    </div>
  );
}
