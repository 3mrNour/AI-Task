import { Settings2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface SystemPromptProps {
  value: string;
  onChange: (value: string) => void;
}

export function SystemPrompt({ value, onChange }: SystemPromptProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <Settings2 className="w-4 h-4" />
        <span>System Instructions</span>
        {open ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
      </button>
      {open && (
        <div className="px-4 pb-3 animate-fade-in">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder='e.g. "You are a frontend developer. Only answer frontend-related questions."'
            rows={3}
            className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>
      )}
    </div>
  );
}
