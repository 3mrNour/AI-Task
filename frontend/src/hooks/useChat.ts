import { useState, useCallback } from "react";
import { Message, Mode, ConversationState } from "@/types/chat";
import { aiApi } from "@/services/api";

const createEmptyConversation = () => ({
  messages: [] as Message[],
  systemPrompt: "",
  isLoading: false,
});

const initialState: ConversationState = {
  chat: createEmptyConversation(),
  text: createEmptyConversation(),
  image: createEmptyConversation(),
  file: createEmptyConversation(),
};

function makeId() {
  return crypto.randomUUID();
}

export function useChat() {
  const [state, setState] = useState<ConversationState>(initialState);
  const [activeMode, setActiveMode] = useState<Mode>("chat");

  const conversation = state[activeMode];

  const setSystemPrompt = useCallback((prompt: string) => {
    setState((prev) => ({
      ...prev,
      [activeMode]: { ...prev[activeMode], systemPrompt: prompt },
    }));
  }, [activeMode]);

  const sendMessage = useCallback(async (content: string, imageUrl?: string, fileName?: string, file?: File) => {
    const userMsg: Message = {
      id: makeId(),
      role: "user",
      content,
      timestamp: new Date(),
      imageUrl,
      fileName,
    };

    setState((prev) => ({
      ...prev,
      [activeMode]: {
        ...prev[activeMode],
        messages: [...prev[activeMode].messages, userMsg],
        isLoading: true,
      },
    }));

    try {
      const currentConversationId = state[activeMode].conversationId;
      const systemPrompt = state[activeMode].systemPrompt?.trim();
      const messageWithPrompt = systemPrompt
        ? `[System prompt]\n${systemPrompt}\n\n[User message]\n${content}`
        : content;

      const res = await aiApi.sendChatMessage({
        conversationId: currentConversationId,
        message: messageWithPrompt,
        file,
      });
      const reply = res.response;

      const assistantMsg: Message = {
        id: makeId(),
        role: "assistant",
        content: reply,
        timestamp: new Date(),
      };
      setState((prev) => ({
        ...prev,
        [activeMode]: {
          ...prev[activeMode],
          conversationId: res.conversationId,
          messages: [...prev[activeMode].messages, assistantMsg],
          isLoading: false,
        },
      }));
    } catch {
      const errorMsg: Message = {
        id: makeId(),
        role: "assistant",
        content: "Sorry, something went wrong. Please check your API connection.",
        timestamp: new Date(),
      };
      setState((prev) => ({
        ...prev,
        [activeMode]: {
          ...prev[activeMode],
          messages: [...prev[activeMode].messages, errorMsg],
          isLoading: false,
        },
      }));
    }
  }, [activeMode, state]);

  const clearChat = useCallback(() => {
    setState((prev) => ({
      ...prev,
      [activeMode]: createEmptyConversation(),
    }));
  }, [activeMode]);

  const exportChat = useCallback(() => {
    const data = JSON.stringify(conversation.messages, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-${activeMode}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [conversation.messages, activeMode]);

  return {
    state,
    activeMode,
    setActiveMode,
    conversation,
    setSystemPrompt,
    sendMessage,
    clearChat,
    exportChat,
  };
}
