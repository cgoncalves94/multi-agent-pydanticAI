export interface Session {
  id: string;
  username: string;
  created_at: string;
}

export interface CodeBlock {
  language?: string;
  content: string;
  explanation?: string;
  execution_result?: string;
}

export interface SearchResult {
  title: string;
  url?: string;
  snippet: string;
  sources?: string[];
}

export interface ImageDetection {
  label: string;
  bbox?: [number, number, number, number];
}

export interface ImageAnalysis {
  analysis: string;
  detections?: ImageDetection[];
  scene_type?: string;
}

export interface MessageMetadata {
  code: CodeBlock[];
  search_results: SearchResult[];
  image_analysis: ImageAnalysis | null;
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
}

export interface Message {
  id?: string;
  role: 'user' | 'assistant' | 'system' | 'model';
  content: string;
  timestamp?: string;
  metadata?: MessageMetadata;
  session_id?: string;
}

export interface ChatHeaderProps {
  onClearChat: () => void;
  isStructured: boolean;
  onModeToggle: () => void;
}

export interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export interface ChatInputProps {
  onSendMessage: (content: string) => void;
  disabled: boolean;
}

export interface AgentResult {
  code?: {
    content: string;
    language?: string;
  };
  search?: {
    results: SearchResult[];
  };
  image?: {
    analysis: string;
    detections?: ImageDetection[];
  };
}

export interface AppState {
  sessions: Session[];
  activeSessionId: string | null;
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  isStructuredMode: boolean;
  currentImagePath: string | null;
  rightSidebarVisible: boolean;
}

export interface ApiConfig {
  BASE: string;
  SESSIONS: string;
  CHAT: string;
  CHAT_STREAM: string;
  UPLOAD_IMAGE: string;
}
