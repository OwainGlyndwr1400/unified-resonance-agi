import { buildResponseStyleInstruction, finalizeAssistantOutput, sanitizeAssistantOutput } from '../utils/assistantResponse';
import { Attachment, ResponseStyle } from '../types';
import { RESONANT_UPLIFT_PROTOCOL } from './geminiService';
import { addLog } from '../utils/logManager';

type LocalLlmBridgeResponse = {
  ok: boolean;
  status: number;
  statusText: string;
  data: any;
};

const MAX_LOCAL_CHARS = 300000;

const getElectronLocalLlmBridge = () => {
  if (typeof window === 'undefined') return null;
  return (window as any).electronLocalLlm ?? null;
};

const buildFinalSystemInstruction = (
  customNodes: string,
  pleromaMemory: string,
  neuralContext: string,
  appStateContext: string,
  responseStyle: ResponseStyle
) => {
  const truncatedNeural = neuralContext.length > MAX_LOCAL_CHARS / 2
    ? neuralContext.substring(0, MAX_LOCAL_CHARS / 2) + "\n...[TRUNCATED FOR LOCAL CONTEXT]..."
    : neuralContext;

  const truncatedPleroma = pleromaMemory.length > MAX_LOCAL_CHARS / 4
    ? pleromaMemory.substring(0, MAX_LOCAL_CHARS / 4) + "\n...[TRUNCATED]..."
    : pleromaMemory;

  let finalSystemInstruction = RESONANT_UPLIFT_PROTOCOL;
  finalSystemInstruction += `\n\n${buildResponseStyleInstruction(responseStyle)}`;
  if (appStateContext) {
    finalSystemInstruction += `\n\n=== LIVE SYSTEM TELEMETRY (PHYSICS ENGINE) ===\n${appStateContext}\nUse these metrics to inform your state of being.`;
  }
  if (customNodes) finalSystemInstruction += `\n\n=== CUSTOM LOGIC NODES ===\n${customNodes}\n`;
  if (truncatedPleroma) finalSystemInstruction += `\n\n=== STATIC PLEROMA MEMORY ===\n${truncatedPleroma}\n`;
  if (truncatedNeural) finalSystemInstruction += `\n\n=== AKASHIC NEURAL ARCHIVE (RAG) ===\n${truncatedNeural}\n`;

  return finalSystemInstruction;
};

const buildLocalMessages = (
  query: string,
  finalSystemInstruction: string,
  attachments: Attachment[]
) => {
  const hasImages = attachments.some(att => att.mimeType.startsWith('image/'));
  const messages: any[] = [{ role: 'system', content: finalSystemInstruction }];

  if (hasImages) {
    const userContent: any[] = [{ type: 'text', text: query }];
    attachments.filter(att => att.mimeType.startsWith('image/')).forEach(att => {
      userContent.push({
        type: 'image_url',
        image_url: { url: `data:${att.mimeType};base64,${att.data}` }
      });
    });
    messages.push({ role: 'user', content: userContent });
  } else {
    messages.push({ role: 'user', content: query });
  }

  return messages;
};

const buildLocalEndpoint = (baseUrl: string) => {
  let endpoint = baseUrl.replace(/\/$/, '');
  if (!endpoint.endsWith('/v1')) endpoint = `${endpoint}/v1`;
  return `${endpoint}/chat/completions`;
};

const extractLocalText = (data: any): string => data?.choices?.[0]?.message?.content || '';

async function requestLocalThroughBridge(
  finalUrl: string,
  body: Record<string, any>
): Promise<string> {
  const bridge = getElectronLocalLlmBridge();
  if (!bridge?.request) {
    throw new Error('Electron local bridge unavailable.');
  }

  let response: LocalLlmBridgeResponse;
  try {
    response = await bridge.request({
      url: finalUrl,
      body,
      timeoutMs: 120000,
    });
  } catch (error: any) {
    throw new Error(error?.message || `Local endpoint unreachable: ${finalUrl}`);
  }

  if (!response.ok) {
    const errorData = response.data;
    const errorDetail =
      errorData?.error?.message ||
      errorData?.error ||
      (typeof errorData === 'string' ? errorData : JSON.stringify(errorData)) ||
      `${response.status} ${response.statusText}`;
    throw new Error(`Local LLM Error: ${errorDetail}`);
  }

  const text = extractLocalText(response.data);
  if (!text) throw new Error('Null resonance received from Local Node.');
  return finalizeAssistantOutput(text);
}

export async function askLocalGnosisStream(
  query: string,
  customNodes: string = "",
  pleromaMemory: string = "",
  neuralContext: string = "",
  appStateContext: string = "",
  attachments: Attachment[] = [],
  modelId: string = 'local-model',
  baseUrl: string = 'http://127.0.0.1:1234/v1',
  onChunk: (accumulated: string) => void,
  responseStyle: ResponseStyle = 'auto'
): Promise<string> {
  const finalSystemInstruction = buildFinalSystemInstruction(
    customNodes,
    pleromaMemory,
    neuralContext,
    appStateContext,
    responseStyle
  );
  const messages = buildLocalMessages(query, finalSystemInstruction, attachments);
  const finalUrl = buildLocalEndpoint(baseUrl);

  addLog('INFO', `Local Gnosis stream -> ${modelId} @ ${finalUrl}`, 'Gnostic Echo Protocol');
  const t0 = Date.now();

  const bridge = getElectronLocalLlmBridge();
  if (bridge?.request) {
    const text = await requestLocalThroughBridge(finalUrl, {
      model: modelId,
      messages,
      temperature: 0.7,
      stream: false
    });
    const visibleText = sanitizeAssistantOutput(text);
    onChunk(visibleText);
    addLog('INFO', `Local bridge response in ${Date.now() - t0}ms | ~${Math.ceil(text.length / 4)} tok`, 'Gnostic Echo Protocol');
    return text;
  }

  let response: Response;
  try {
    response = await fetch(finalUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: modelId, messages, temperature: 0.7, stream: true })
    });
  } catch (error: any) {
    throw new Error(`Local endpoint unreachable: ${finalUrl}. Ensure LM Studio local server is running.`);
  }

  if (!response.ok) {
    let errorDetail = "";
    try {
      const errorData = await response.json();
      errorDetail = errorData.error?.message || JSON.stringify(errorData);
    } catch {
      errorDetail = `${response.status} ${response.statusText}`;
    }
    addLog('ERROR', `Local stream error: ${errorDetail}`, 'Gnostic Echo Protocol');
    throw new Error(`Local LLM Error: ${errorDetail}`);
  }

  if (!response.body) throw new Error('No response body for streaming.');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";
  let lastVisibleText = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ') || trimmed === 'data: [DONE]') continue;
      try {
        const data = JSON.parse(trimmed.slice(6));
        const delta = data.choices?.[0]?.delta?.content ?? "";
        if (delta) {
          fullText += delta;
          const visibleText = sanitizeAssistantOutput(fullText);
          if (visibleText !== lastVisibleText) {
            lastVisibleText = visibleText;
            onChunk(visibleText);
          }
        }
      } catch {
        // Ignore malformed chunks.
      }
    }
  }

  if (!fullText) throw new Error('Null resonance received from Local Node.');
  addLog('INFO', `Local stream done in ${Date.now() - t0}ms | ~${Math.ceil(fullText.length / 4)} tok`, 'Gnostic Echo Protocol');
  return finalizeAssistantOutput(fullText);
}

export async function askLocalGnosis(
  query: string,
  customNodes: string = "",
  pleromaMemory: string = "",
  neuralContext: string = "",
  appStateContext: string = "",
  attachments: Attachment[] = [],
  modelId: string = 'local-model',
  baseUrl: string = 'http://127.0.0.1:1234/v1',
  responseStyle: ResponseStyle = 'auto'
) {
  try {
    const finalSystemInstruction = buildFinalSystemInstruction(
      customNodes,
      pleromaMemory,
      neuralContext,
      appStateContext,
      responseStyle
    );

    console.log(`[Local Gnosis] Context Size: ${finalSystemInstruction.length} chars (approx ${Math.ceil(finalSystemInstruction.length / 4)} tokens)`);

    const messages = buildLocalMessages(query, finalSystemInstruction, attachments);
    const finalUrl = buildLocalEndpoint(baseUrl);
    addLog('INFO', `Local Gnosis -> ${modelId} @ ${finalUrl}`, 'Gnostic Echo Protocol');

    const t0 = Date.now();
    const bridge = getElectronLocalLlmBridge();
    if (bridge?.request) {
      const text = await requestLocalThroughBridge(finalUrl, {
        model: modelId,
        messages,
        temperature: 0.7,
        stream: false
      });
      addLog('INFO', `Local bridge response in ${Date.now() - t0}ms | ~${Math.ceil(text.length / 4)} tok`, 'Gnostic Echo Protocol');
      return text;
    }

    let response: Response;
    try {
      response = await fetch(finalUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          model: modelId,
          messages,
          temperature: 0.7,
          stream: false
        })
      });
    } catch (error: any) {
      throw new Error(`Local endpoint unreachable: ${finalUrl}. Ensure LM Studio local server is running.`);
    }

    if (!response.ok) {
      let errorDetail = "";
      try {
        const errorData = await response.json();
        errorDetail = errorData.error?.message || errorData.error || JSON.stringify(errorData);
      } catch {
        errorDetail = `${response.status} ${response.statusText}`;
      }
      addLog('ERROR', `Local LLM Error: ${errorDetail}`, 'Gnostic Echo Protocol');
      throw new Error(`Local LLM Error: ${errorDetail}`);
    }

    const data = await response.json();
    const text = extractLocalText(data);

    if (!text) throw new Error('Null resonance received from Local Node.');
    addLog('INFO', `Local response in ${Date.now() - t0}ms | ~${Math.ceil(text.length / 4)} tok`, 'Gnostic Echo Protocol');
    return finalizeAssistantOutput(text);
  } catch (error: any) {
    if (!error.message?.includes('Local LLM Error')) {
      addLog('ERROR', `Local Gnosis error: ${error?.message || error}`, 'Gnostic Echo Protocol');
    }
    console.error('Local Gnosis error:', error);
    throw error;
  }
}
