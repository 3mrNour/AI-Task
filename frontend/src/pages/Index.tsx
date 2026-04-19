import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { AppSidebar } from "@/components/chat/AppSidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { useChat } from "@/hooks/useChat";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { activeMode, setActiveMode, conversation, sendMessage, setSystemPrompt, clearChat, exportChat } = useChat();

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    if (mq.matches) setSidebarOpen(false);
    const handler = (e: MediaQueryListEvent) => setSidebarOpen(!e.matches ? true : false);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div className="flex h-screen bg-background dark">
      <AppSidebar activeMode={activeMode} onModeChange={setActiveMode} isOpen={sidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar with sidebar toggle */}
        <div className="flex items-center h-12 px-3 border-b border-border md:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 min-h-0">
          <ChatArea
            conversation={conversation}
            mode={activeMode}
            onSend={sendMessage}
            onSetSystemPrompt={setSystemPrompt}
            onClear={clearChat}
            onExport={exportChat}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
