import { ApiConfig } from '@/types';

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';

export const API: ApiConfig = {
  BASE,
  SESSIONS: `${BASE}/api/sessions`,
  CHAT: `${BASE}/api/chat`,
  CHAT_STREAM: `${BASE}/api/chat/stream`,
  UPLOAD_IMAGE: `${BASE}/api/upload-image`,
};

export const WS_ENDPOINT = WS_URL;
