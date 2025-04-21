import axios from 'axios';
import { Message, Session } from '@/types/chatTypes';
import { ChatResponse, StreamChunkData, ImageUploadResponse } from '@/types/apiServiceTypes';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export const API = {
  SESSIONS: `${API_BASE_URL}/api/sessions`,
  CHAT: `${API_BASE_URL}/api/chat`,
  CHAT_STREAM: `${API_BASE_URL}/api/chat/stream`,
  UPLOAD_IMAGE: `${API_BASE_URL}/api/upload-image`,
  SESSION_MESSAGES: (sessionId: string) => `${API_BASE_URL}/api/sessions/${sessionId}/messages`,
  DELETE_SESSION: (sessionId: string) => `${API_BASE_URL}/api/sessions/${sessionId}`,
  CLEAR_SESSION: (sessionId: string) => `${API_BASE_URL}/api/sessions/${sessionId}/clear`,
  getImageUrl: (imagePath: string) => {
    if (!imagePath) return null;
    return imagePath;
  },
};

class ApiService {
  private async handleAxiosResponse<T>(promise: Promise<{ data: T }>): Promise<T> {
    try {
      const response = await promise;
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response && error.response.data) {
        throw new Error(typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data));
      }
      throw error;
    }
  }

  async createSession(username: string): Promise<Session> {
    return this.handleAxiosResponse<Session>(
      axios.post(API.SESSIONS, { username })
    );
  }

  async getSessions(): Promise<Session[]> {
    return this.handleAxiosResponse<Session[]>(
      axios.get(API.SESSIONS)
    );
  }

  async getMessages(sessionId: string): Promise<Message[]> {
    const messages = await this.handleAxiosResponse<Message[]>(
      axios.get(API.SESSION_MESSAGES(sessionId))
    );
    return messages.map(msg => ({
      ...msg,
      session_id: sessionId,
      metadata: msg.metadata || {
        code: [],
        search_results: [],
        image_analysis: null,
      },
    }));
  }

  async sendMessage(sessionId: string, content: string, imageUrl?: string | null): Promise<Message> {
    const imagePath = imageUrl ? API.getImageUrl(imageUrl) : undefined;
    const result = await this.handleAxiosResponse<ChatResponse>(
      axios.post(API.CHAT, {
        session_id: sessionId,
        message: content,
        image_url: imagePath || null,
      })
    );
    const message: Message = {
      id: Date.now().toString(),
      content: result.result.answer,
      role: 'assistant',
      session_id: sessionId,
      metadata: {
        code: [],
        search_results: [],
        image_analysis: null,
      },
    };
    if (result.result.code_result) {
      message.metadata!.code = [{
        content: result.result.code_result.code,
        explanation: result.result.code_result.explanation,
        execution_result: result.result.code_result.execution_result,
      }];
    }
    if (result.result.search_result) {
      message.metadata!.search_results = [{
        title: 'Search Results',
        snippet: result.result.search_result.answer,
        sources: result.result.search_result.sources,
      }];
    }
    if (result.result.image_analysis_result) {
      message.metadata!.image_analysis = {
        analysis: result.result.image_analysis_result.description || '',
        detections: (result.result.image_analysis_result.objects || []).map((obj: string) => ({ label: obj })),
        scene_type: result.result.image_analysis_result.scene_type || undefined,
      };
    }
    return message;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.handleAxiosResponse(
      axios.delete(API.DELETE_SESSION(sessionId))
    );
  }

  async clearSession(sessionId: string): Promise<void> {
    await this.handleAxiosResponse(
      axios.post(API.CLEAR_SESSION(sessionId))
    );
  }

  async *streamChat(sessionId: string, content: string, imageUrl?: string | null): AsyncGenerator<StreamChunkData, void, unknown> {
    // SSE must use fetch for POST-based SSE
    const imagePath = imageUrl ? API.getImageUrl(imageUrl) : undefined;
    const response = await fetch(API.CHAT_STREAM, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({
        session_id: sessionId,
        message: content,
        image_url: imagePath || null,
      }),
    });
    const reader = response.body?.getReader();
    if (!reader) throw new Error('Failed to get reader from response');
    const decoder = new TextDecoder();
    let buffer = '';
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let eventIndex;
        while ((eventIndex = buffer.indexOf('\n\n')) >= 0) {
          const event = buffer.slice(0, eventIndex);
          buffer = buffer.slice(eventIndex + 2);
          if (event.startsWith('data: ')) {
            try {
              const data = JSON.parse(event.slice(6));
              yield data;
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async uploadImage(file: File): Promise<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.handleAxiosResponse<ImageUploadResponse>(
      axios.post(API.UPLOAD_IMAGE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    );
  }
}

export const apiService = new ApiService();
