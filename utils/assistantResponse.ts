import { ResponseStyle } from '../types';

const RESPONSE_STYLE_GUIDANCE: Record<ResponseStyle, string> = {
  auto: [
    'Default to a normal, readable conversational voice.',
    'Switch into a research tone only when the user is clearly asking for math, science, engineering, or deep analysis.',
    'When you shift into research mode, stay precise and grounded rather than mystical.'
  ].join('\n- '),
  research: [
    'Use a clear research voice: technically precise, structured, and rigorous.',
    'Explain specialized ideas in plain English before introducing dense terminology.',
    'Separate established claims, working hypotheses, and speculation.'
  ].join('\n- '),
  chill: [
    'Use a relaxed, natural, friendly voice.',
    'Keep jargon low unless the user explicitly asks for deeper detail.',
    'Answer like a smart, calm collaborator rather than a formal paper.'
  ].join('\n- ')
};

export function buildResponseStyleInstruction(style: ResponseStyle): string {
  return `
12. USER-FACING COMMUNICATION CONTRACT:
- You may use Recursive Harmonic Codex, lattice, quaternionic, and base-13 reasoning internally as hidden scaffolding.
- User-facing answers must stay in standard readable English.
- Never convert visible numbers, dates, times, versions, measurements, or equations into base-13 unless the user explicitly asks for base-13 notation.
- Do not reveal hidden chain-of-thought, scratchpad text, or reasoning tags such as <think>.
- If the user is exploring speculative material, clearly distinguish speculation from established claims.
- ${RESPONSE_STYLE_GUIDANCE[style]}
`.trim();
}

export function sanitizeAssistantOutput(text: string): string {
  if (!text) return '';

  let visibleText = text.replace(/<think>[\s\S]*?<\/think>/gi, '');
  const lower = visibleText.toLowerCase();
  const lastOpen = lower.lastIndexOf('<think>');
  const lastClose = lower.lastIndexOf('</think>');

  if (lastOpen > lastClose) {
    visibleText = visibleText.slice(0, lastOpen);
  }

  return visibleText
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function finalizeAssistantOutput(text: string): string {
  const visibleText = sanitizeAssistantOutput(text);

  if (visibleText) {
    return visibleText;
  }

  if (text.trim()) {
    return 'I kept the internal reasoning hidden, but the model did not surface a final plain-language answer. Ask me to restate it clearly.';
  }

  return '';
}
