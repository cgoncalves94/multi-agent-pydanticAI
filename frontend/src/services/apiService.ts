import { Message, Session, SearchResult } from '@/types';

interface ChatResponse {
  result: {
    answer: string;
    code_result?: {
      code: string;
      explanation: string;
      execution_result: string;
    };
    search_result?: {
      sources: string[];
      answer: string;
    };
    image_analysis_result?: {
      description: string;
      objects: string[];
      scene_type: string;
    };
  };
  usage: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    requests?: number;
  };
}

interface StreamChunkData {
  type: 'content' | 'final';
  role?: 'user' | 'assistant';
  content?: string;
  metadata?: {
    code?: Array<{
      language?: string;
      content: string;
      explanation: string;
      execution_result: string;
    }>;
    search_results?: SearchResult[];
    image_analysis?: {
      analysis: string;
      detections?: Array<{
        label: string;
        confidence?: number;
        bbox?: [number, number, number, number];
      }>;
      scene_type?: string;
    };
  };
  // Original agent results from backend
  code_result?: {
    code: string;
    explanation: string;
    execution_result: string;
  };
  search_result?: {
    answer: string;
    sources: string[];
  };
  image_analysis_result?: {
    description: string;
    objects: string[];
    scene_type: string;
  };
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface ImageUploadResponse {
  filename: string;
  image_url: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export const API = {
  SESSIONS: `${API_BASE_URL}/api/sessions`,
  CHAT: `${API_BASE_URL}/api/chat`,
  CHAT_STREAM: `${API_BASE_URL}/api/chat/stream`,
  UPLOAD_IMAGE: `${API_BASE_URL}/api/upload-image`,
  SESSION_MESSAGES: (sessionId: string) => `${API_BASE_URL}/api/sessions/${sessionId}/messages`,
  DELETE_SESSION: (sessionId: string) => `${API_BASE_URL}/api/sessions/${sessionId}`,
  CLEAR_SESSION: (sessionId: string) => `${API_BASE_URL}/api/sessions/${sessionId}/clear`,
  // Helper function to normalize image URL paths to a format the backend expects
  getImageUrl: (imagePath: string) => {
    if (!imagePath) return null;

    // Return the path as-is - do not modify it
    // The backend expects to receive exactly what it provided in the upload response
    return imagePath;
  }
};

class ApiService {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || response.statusText);
    }
    return response.json();
  }

  async createSession(username: string): Promise<Session> {
    try {
      const response = await fetch(API.SESSIONS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });
      return this.handleResponse<Session>(response);
    } catch (error) {
      console.error('Create session error:', error);
      throw error;
    }
  }

  async getSessions(): Promise<Session[]> {
    try {
      const response = await fetch(API.SESSIONS);
      return this.handleResponse<Session[]>(response);
    } catch (error) {
      console.error('Get sessions error:', error);
      throw error;
    }
  }

  async getMessages(sessionId: string): Promise<Message[]> {
    try {
      const response = await fetch(API.SESSION_MESSAGES(sessionId));
      const messages = await this.handleResponse<Message[]>(response);

      const processedMessages = messages.map(msg => {

        const processedMsg = {
          ...msg,
          session_id: sessionId,
          metadata: msg.metadata || {
            code: [],
            search_results: [],
            image_analysis: null,
          },
        };

        return processedMsg;
      });

      return processedMessages;
    } catch (error) {
      console.error('Get messages error:', error);
      throw error;
    }
  }

  async sendMessage(sessionId: string, content: string, imageUrl?: string | null): Promise<Message> {
    try {
      // Convert image URL to direct file path if needed
      const imagePath = imageUrl ? API.getImageUrl(imageUrl) : undefined;

      const response = await fetch(API.CHAT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          message: content,
          image_url: imagePath || null, // Always include image_url, even if null
        }),
      });
      const result = await this.handleResponse<ChatResponse>(response);

      // Transform the response into a Message with initialized metadata
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

      // Handle code results
      if (result.result.code_result) {
        message.metadata!.code = [{
          content: result.result.code_result.code,
          explanation: result.result.code_result.explanation,
          execution_result: result.result.code_result.execution_result
        }];
      }

      // Handle search results
      if (result.result.search_result) {
        message.metadata!.search_results = [{
          title: 'Search Results',
          snippet: result.result.search_result.answer,
          sources: result.result.search_result.sources
        }];
      }

      // Handle image analysis
      if (result.result.image_analysis_result) {
        message.metadata!.image_analysis = {
          analysis: result.result.image_analysis_result.description || '',
          detections: (result.result.image_analysis_result.objects || []).map((obj: string) => ({
            label: obj
          })),
          scene_type: result.result.image_analysis_result.scene_type || undefined
        };
      }

      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      const response = await fetch(API.DELETE_SESSION(sessionId), {
        method: 'DELETE',
      });
      await this.handleResponse(response);
    } catch (error) {
      console.error('Delete session error:', error);
      throw error;
    }
  }

  async clearSession(sessionId: string): Promise<void> {
    try {
      const response = await fetch(API.CLEAR_SESSION(sessionId), {
        method: 'POST',
      });
      await this.handleResponse(response);
    } catch (error) {
      console.error('Clear session error:', error);
      throw error;
    }
  }

  async *streamChat(sessionId: string, content: string, imageUrl?: string | null): AsyncGenerator<StreamChunkData, void, unknown> {
    // Convert image URL to direct file path if needed
    const imagePath = imageUrl ? API.getImageUrl(imageUrl) : undefined;

    try {
      const response = await fetch(API.CHAT_STREAM, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          session_id: sessionId,
          message: content,
          image_url: imagePath || null // Always include image_url, even if null
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

          // Decode the chunk and add to buffer
          buffer += decoder.decode(value, { stream: true });

          // Process complete event chunks from buffer
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
    } catch (error) {
      console.error('Stream chat error:', error);
      throw error;
    }
  }

  async uploadImage(file: File): Promise<ImageUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(API.UPLOAD_IMAGE, {
        method: 'POST',
        body: formData,
      });

      // Use the result as-is without modifying paths
      const result = await this.handleResponse<ImageUploadResponse>(response);
      return result;
    } catch (error) {
      console.error('Upload image error:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
// API is already exported above, no need to export it again
