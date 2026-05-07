const GEMINI_API_KEY_STORAGE_KEY = 'ure_gemini_api_key';

export function getGeminiApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY)?.trim() || '';
}

export function saveGeminiApiKey(apiKey: string) {
  if (typeof window === 'undefined') return;

  const normalized = apiKey.trim();
  if (normalized) {
    localStorage.setItem(GEMINI_API_KEY_STORAGE_KEY, normalized);
  } else {
    localStorage.removeItem(GEMINI_API_KEY_STORAGE_KEY);
  }
}

export function hasGeminiApiKey(): boolean {
  return Boolean(getGeminiApiKey());
}

export function requireGeminiApiKey(): string {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key missing. Open Settings > Cloud (Gemini) and add your own key.');
  }
  return apiKey;
}
