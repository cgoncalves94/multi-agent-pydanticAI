import { SearchResult } from "./chatTypes";

export interface ChatResponse {
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

export interface StreamChunkData {
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

export interface ImageUploadResponse {
  filename: string;
  image_url: string;
}
