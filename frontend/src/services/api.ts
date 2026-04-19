import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export interface BackendChatResponse {
  conversationId: string;
  response: string;
}

interface SendChatPayload {
  conversationId?: string;
  message: string;
  file?: File;
}

const apiClient = axios.create({
  baseURL: API_BASE,
});

export const aiApi = {
  async sendChatMessage(payload: SendChatPayload): Promise<BackendChatResponse> {
    const { conversationId, message, file } = payload;

    if (file) {
      const formData = new FormData();
      formData.append("message", message);
      formData.append("file", file);
      if (conversationId) {
        formData.append("conversationId", conversationId);
      }

      const { data } = await apiClient.post<BackendChatResponse>("/api/chat", formData);
      return data;
    }

    const { data } = await apiClient.post<BackendChatResponse>("/api/chat", {
      conversationId,
      message,
    });
    return data;
  },
};
