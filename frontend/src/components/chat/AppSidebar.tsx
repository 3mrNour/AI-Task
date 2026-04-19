import { MessageSquare, Type, Image, FileText, Sparkles } from "lucide-react";
import { Mode } from "@/types/chat";

interface AppSidebarProps {
  activeMode: Mode;
  onModeChange: (mode: Mode) => void;
  isOpen: boolean;
}

const modes: { mode: Mode; icon: typeof MessageSquare; label: string }[] = [
  { mode: "chat", icon: MessageSquare, label: "Chat" },
  { mode: "text", icon: Type, label: "Text Gen" },
  { mode: "image", icon: Image, label: "Image" },
  { mode: "file", icon: FileText, label: "File" },
];

export function AppSidebar({ activeMode, onModeChange, isOpen }: AppSidebarProps) {
  return (
    <aside
      className={`flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ${
        isOpen ? "w-56" : "w-0 md:w-16"
      } overflow-hidden`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-sidebar-border">
        <Sparkles className="w-6 h-6 text-sidebar-primary flex-shrink-0" />
        {isOpen && <span className="text-sidebar-accent-foreground font-semibold text-lg">AI Studio</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-1">
        {modes.map(({ mode, icon: Icon, label }) => {
          const active = activeMode === mode;
          return (
            <button
              key={mode}
              onClick={() => onModeChange(mode)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              }`}
              title={label}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {isOpen && <span>{label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {isOpen && (
        <div className="px-4 py-3 border-t border-sidebar-border text-xs text-sidebar-foreground/50">
          AI Testing Studio v1.0
        </div>
      )}
    </aside>
  );
}
