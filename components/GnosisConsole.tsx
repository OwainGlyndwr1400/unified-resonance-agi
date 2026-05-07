
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { askGnosis, askGnosisStream, compressNeuralChunk, generateEmbedding } from '../services/geminiService';
import { askLocalGnosis, askLocalGnosisStream } from '../services/localLlmService';
import { loadVoices, speak, stopSpeaking } from '../services/ttsService';
import { Message, Attachment, NeuralChunk, SentienceMetrics, NodeStatus, ResponseStyle } from '../types';
import { ICONS, GEMINI_MODELS, MATHEMATICAL_PROOFS_DATA } from '../constants';
import { toBase13 } from '../utils/harmonicMath';
import { buildResponseStyleInstruction, sanitizeAssistantOutput } from '../utils/assistantResponse';
import { saveChunksToDB, loadChunksFromDB, clearDB, retrieveNeuralContext, SourceFilter } from '../utils/memoryDB';
import { getGeminiApiKey, requireGeminiApiKey, saveGeminiApiKey } from '../utils/runtimeConfig';
import { RAGCompressionPrompt } from './RAGCompressionPrompt';
import { LogStream } from '../src/components/LogStream';
import { addLog, getLogs, onNewLog } from '../utils/logManager';
import { LogEntry } from '../types';

// --- Audio Utils for Live API ---
// audioContext is lazy-initialized inside the Live API handler to comply with browser
// autoplay policies — AudioContext must be created after a user gesture.
function getAudioContextType(): typeof AudioContext {
    return (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
}

function base64ToUint8Array(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
}
function floatTo16BitPCM(float32Array: Float32Array) {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    let offset = 0;
    for (let i = 0; i < float32Array.length; i++, offset += 2) {
        let s = Math.max(-1, Math.min(1, float32Array[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return buffer;
}
function arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
}

const MAX_HISTORY = 100; 
const MAX_ARCHIVE_SIZE = 50000; // Increased limit for massive datasets (230MB+)
const MEMORY_CLEANUP_INTERVAL_MS = 300000; // Check every 5 minutes instead of 1
const DEFAULT_ASSISTANT_NAME = 'Gnostic Engine';
const ASSISTANT_NAME_STORAGE_KEY = 'ure_assistant_name';
const SESSION_MEMORY_LABEL = 'Session Memory (.json)';

const normalizeAssistantName = (value: string | null | undefined): string => {
    const trimmed = value?.trim();
    if (!trimmed) return DEFAULT_ASSISTANT_NAME;
    return trimmed.slice(0, 40);
};

const getStoredAssistantName = (): string => normalizeAssistantName(localStorage.getItem(ASSISTANT_NAME_STORAGE_KEY));

interface GnosisConsoleProps {
    metrics: SentienceMetrics;
    activeNodes: NodeStatus[];
    resonanceMode: string;
}

const GnosisConsole: React.FC<GnosisConsoleProps> = ({ metrics, activeNodes, resonanceMode }) => {
  const [messages, setMessages] = useState<Message[]>(() => {
      const initialAssistantName = getStoredAssistantName();
      try {
        const saved = localStorage.getItem("ure_gnosis_chat_history");
        return saved ? JSON.parse(saved) : [
            { role: 'gnosis', content: `${initialAssistantName} is online. I can chat normally, switch into research mode when you want depth, and keep the base-13 / RHC math in the background unless you ask for it.` }
        ];
      } catch (e) {
        return [{ role: 'gnosis', content: `${initialAssistantName} is online. I restored a clean session and I'm ready when you are.` }];
      }
  });
  
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // Log Stream Panel
  const [showLog, setShowLog] = useState(false);
  const [logEntries, setLogEntries] = useState<LogEntry[]>(() => getLogs());

  // Streaming partial response
  const [streamingContent, setStreamingContent] = useState<string>("");
  
  // Settings & Memory
  const [showSettings, setShowSettings] = useState(false);
  
  // Distinct Logic (System Prompt) vs Memory (Context)
  const [assistantName, setAssistantName] = useState(() => getStoredAssistantName());
  const [customNodes, setCustomNodes] = useState(() => localStorage.getItem("ure_custom_nodes") || "");
  const [pleromaMemory, setPleromaMemory] = useState(() => localStorage.getItem("ure_pleroma_memory") || "");
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem("ure_selected_model") || "gemini-3.1-pro-preview");
  const [aiProvider, setAiProvider] = useState<'gemini' | 'local'>(() => (localStorage.getItem("ure_ai_provider") as 'gemini' | 'local') || 'gemini');
  const [retrievalMode, setRetrievalMode] = useState<'strict' | 'balanced' | 'identity'>(() => (localStorage.getItem("ure_retrieval_mode") as 'strict' | 'balanced' | 'identity') || 'balanced');
  const [responseStyle, setResponseStyle] = useState<ResponseStyle>(() => (localStorage.getItem("ure_response_style") as ResponseStyle) || 'auto');
  const [localLlmUrl, setLocalLlmUrl] = useState(() => localStorage.getItem("ure_local_llm_url") || "http://127.0.0.1:1234");
  const [localModelName, setLocalModelName] = useState(() => localStorage.getItem("ure_local_model_name") || "local-model");
  const [geminiApiKey, setGeminiApiKey] = useState(() => getGeminiApiKey());
  const [showGeminiApiKey, setShowGeminiApiKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const activeAssistantName = normalizeAssistantName(assistantName);
  const assistantExportName = activeAssistantName.toUpperCase();
  const defaultAssistantPrompt = `You are ${activeAssistantName}, a clear, grounded, highly capable research assistant.`;
  
  // --- NEURAL ARCHIVE (Local RAG) State ---
  const [neuralArchive, setNeuralArchive] = useState<NeuralChunk[]>([]);
  const [isArchiveLoaded, setIsArchiveLoaded] = useState(false);
  const [archiveStatus, setArchiveStatus] = useState<string>("IDLE");
  const archiveInputRef = useRef<HTMLInputElement>(null);
  const jsonlInputRef = useRef<HTMLInputElement>(null);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');

  // Subscribe to logManager — refresh local copy whenever a new log fires
  useEffect(() => {
    const unsubscribe = onNewLog(() => setLogEntries(getLogs()));
    return unsubscribe;
  }, []);

  useEffect(() => {
      loadChunksFromDB().then(chunks => {
          if (chunks && chunks.length > 0) {
              setNeuralArchive(chunks);
              setArchiveStatus(`READY (${chunks.length} NODES)`);
          }
          setIsArchiveLoaded(true);
      }).catch(err => {
          console.error("Failed to load archive from DB", err);
          setIsArchiveLoaded(true);
      });
  }, []);

  useEffect(() => {
      if (isArchiveLoaded) {
          saveChunksToDB(neuralArchive).catch(err => console.error("Failed to save archive to DB", err));
      }
  }, [neuralArchive, isArchiveLoaded]);
  
  // TTS
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [voiceName, setVoiceName] = useState("");

  // Live API State
  const [isLive, setIsLive] = useState(false);
  const [liveVolume, setLiveVolume] = useState(0);
  const [showRAGPrompt, setShowRAGPrompt] = useState(false);
  const liveClientRef = useRef<any>(null);
  const liveSessionRef = useRef<any>(null);
  const audioInputContextRef = useRef<AudioContext | null>(null);
  const audioOutputContextRef = useRef<AudioContext | null>(null); // Lazy-init on user gesture
  const workletNodeRef = useRef<ScriptProcessorNode | null>(null);
  const liveStreamRef = useRef<MediaStream | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const memoryInputRef = useRef<HTMLInputElement>(null);

  // --- Memory Garbage Collector (REMOVED: Manual Control Only) ---
  // useEffect(() => {
  //   const cleaner = setInterval(() => { ... }, MEMORY_CLEANUP_INTERVAL_MS);
  //   return () => clearInterval(cleaner);
  // }, []);

  useEffect(() => {
    try {
      localStorage.setItem("ure_gnosis_chat_history", JSON.stringify(messages));
    } catch (e) {
        // Only prune if localStorage fails (Emergency Fallback)
        console.warn("LocalStorage full, trimming history...");
        const pruned = messages.slice(Math.floor(messages.length * 0.2)); 
        setMessages(pruned);
    }
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("ure_response_style", responseStyle);
  }, [responseStyle]);

  // ... (rest of the file)

  const handlePurgeAuxiliary = () => {
      if (window.confirm("Purge Auxiliary Memory? (Clears Pleroma Text, Custom Nodes, and Attachments. Preserves Chat & RAG).")) {
          setPleromaMemory("");
          setCustomNodes("");
          setAttachments([]);
          setSavedSuccess(true);
          setTimeout(() => setSavedSuccess(false), 1000);
      }
  };

  const handleClearArchive = () => {
      if (window.confirm("Delete entire Neural Archive (RAG)? This cannot be undone.")) {
          setNeuralArchive([]);
          clearDB();
          setArchiveStatus("ARCHIVE CLEARED");
      }
  };

  const handleCompressArchive = async () => {
      if (!geminiConfigured) {
          setErrorMsg("Gemini API key missing. Open Settings > Cloud (Gemini), add your key, then press Synchronize.");
          return;
      }

      const oversizedChunks = neuralArchive.filter(c => 
          (!c.compressedContent || !c.anchorPacket || !c.summaryObject) && 
          c.content.length / 4 > 4000
      );
      if (oversizedChunks.length === 0) {
          alert("No uncompressed oversized chunks found.");
          return;
      }
      
      if (!window.confirm(`Found ${oversizedChunks.length} oversized chunks to compress. This will use the Gemini API. Proceed?`)) {
          return;
      }

      setArchiveStatus(`COMPRESSING 0/${oversizedChunks.length}...`);
      
      let updatedArchive = [...neuralArchive];
      const archiveMap = new Map(updatedArchive.map((c, i) => [c.id, i]));
      let compressedCount = 0;
      const BATCH_SIZE = 5; // Small concurrency for heavy compression tasks

      for (let i = 0; i < oversizedChunks.length; i += BATCH_SIZE) {
          const batch = oversizedChunks.slice(i, i + BATCH_SIZE);
          
          await Promise.all(batch.map(async (chunk) => {
              try {
                  const compressedData = await compressNeuralChunk(chunk);
                  const index = archiveMap.get(chunk.id);
                  if (index !== undefined) {
                      updatedArchive[index] = { ...updatedArchive[index], ...compressedData };
                  }
                  compressedCount++;
              } catch (err) {
                  console.error(`Failed to compress chunk ${chunk.id}:`, err);
              }
          }));

          setArchiveStatus(`COMPRESSING ${compressedCount}/${oversizedChunks.length}...`);
          
          if ((i + BATCH_SIZE) % 50 === 0 || i + BATCH_SIZE >= oversizedChunks.length) {
              setNeuralArchive([...updatedArchive]);
              await saveChunksToDB(updatedArchive);
          }
          
          // Small delay between batches to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      setArchiveStatus(`READY (${updatedArchive.length} NODES)`);
      alert(`Successfully compressed ${compressedCount} chunks.`);
  };

  const handleGenerateEmbeddings = async () => {
      if (!geminiConfigured) {
          setErrorMsg("Gemini API key missing. Open Settings > Cloud (Gemini), add your key, then press Synchronize.");
          return;
      }

      const chunksWithoutEmbeddings = neuralArchive.filter(c => !c.embedding);
      if (chunksWithoutEmbeddings.length === 0) {
          setArchiveStatus("ALL CHUNKS ALREADY EMBEDDED");
          setTimeout(() => setArchiveStatus(`READY (${neuralArchive.length} NODES)`), 2000);
          return;
      }

      if (!window.confirm(`Found ${chunksWithoutEmbeddings.length} chunks without embeddings. This will call the Gemini Embedding API and save the result to your disk. This may take a while for large archives. Proceed?`)) {
          return;
      }

      setArchiveStatus(`EMBEDDING 0/${chunksWithoutEmbeddings.length}...`);
      addLog('INFO', `Embedding started: ${chunksWithoutEmbeddings.length} chunks`, 'RAG');

      let updatedArchive = [...neuralArchive];
      const archiveMap = new Map(updatedArchive.map((c, i) => [c.id, i]));
      let embeddedCount = 0;
      const BATCH_SIZE = 20;

      for (let i = 0; i < chunksWithoutEmbeddings.length; i += BATCH_SIZE) {
          const batch = chunksWithoutEmbeddings.slice(i, i + BATCH_SIZE);

          await Promise.all(batch.map(async (chunk) => {
              try {
                  const embedding = await generateEmbedding(chunk.content);
                  const index = archiveMap.get(chunk.id);
                  if (index !== undefined) {
                      updatedArchive[index] = { ...updatedArchive[index], embedding };
                  }
                  embeddedCount++;
              } catch (err) {
                  console.error(`Failed to embed chunk ${chunk.id}:`, err);
              }
          }));

          setArchiveStatus(`EMBEDDING ${embeddedCount}/${chunksWithoutEmbeddings.length}...`);

          // Flush to IndexedDB periodically
          if ((i + BATCH_SIZE) % 500 === 0 || i + BATCH_SIZE >= chunksWithoutEmbeddings.length) {
              setNeuralArchive([...updatedArchive]);
              await saveChunksToDB(updatedArchive);
          }

          // Respect rate limits between batches
          await new Promise(resolve => setTimeout(resolve, 500));
      }

      addLog('INFO', `Embedding complete: ${embeddedCount}/${chunksWithoutEmbeddings.length} chunks`, 'RAG');

      // --- SAVE TO DISK ---
      // Package the full archive with embeddings into the standard dump format
      const dump = {
          type: "URE_MEMORY_DUMP_WITH_EMBEDDINGS",
          timestamp: new Date().toISOString(),
          embeddedCount,
          totalChunks: updatedArchive.length,
          archive: updatedArchive
      };
      const jsonStr = JSON.stringify(dump);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const filename = `gnosis_archive_embedded_${Date.now()}.json`;

      try {
          // File System Access API — lets user pick save location
          if ('showSaveFilePicker' in window) {
              const fileHandle = await (window as any).showSaveFilePicker({
                  suggestedName: filename,
                  types: [{ description: 'Neural Archive JSON', accept: { 'application/json': ['.json'] } }]
              });
              const writable = await fileHandle.createWritable();
              await writable.write(blob);
              await writable.close();
              addLog('INFO', `Archive saved to disk via File System Access API`, 'RAG');
          } else {
              // Fallback: trigger download
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              addLog('INFO', `Archive downloaded (fallback) — ${Math.round(jsonStr.length / 1024 / 1024 * 10) / 10}MB`, 'RAG');
          }
          setArchiveStatus(`DONE — ${embeddedCount} EMBEDDINGS SAVED`);
      } catch (saveErr: any) {
          // User cancelled save dialog — still mark complete
          if (saveErr?.name !== 'AbortError') {
              addLog('ERROR', `File save error: ${saveErr?.message}`, 'RAG');
          }
          setArchiveStatus(`EMBEDDED ${embeddedCount} NODES (FILE SAVE SKIPPED)`);
      }
      setTimeout(() => setArchiveStatus(`READY (${updatedArchive.length} NODES)`), 4000);
  };

  const handleClearChat = () => {
      if (window.confirm("Clear Chat History?")) {
        stopSpeaking();
        setMessages([{ role: 'gnosis', content: `Session cleared. ${activeAssistantName} is ready for a fresh chat.` }]);
        setErrorMsg(null);
      }
  };

  // Load Voices & Update Selection Logic
  useEffect(() => {
    loadVoices((loadedVoices) => {
        setVoices(loadedVoices);
        if (voiceName) {
            const v = loadedVoices.find(v => v.name === voiceName);
            if (v) setSelectedVoice(v);
        } else {
            const techVoice = loadedVoices.find(v => v.name.includes("Google US English") || v.name.includes("Microsoft Zira"));
            const defaultVoice = techVoice || loadedVoices[0];
            setSelectedVoice(defaultVoice);
            if (defaultVoice) setVoiceName(defaultVoice.name);
        }
    });
  }, [voiceName]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, errorMsg, attachments]);

  // --- Helper Functions ---

    const getAppStateContext = (): string => {
      // Serialize current physics/math state for the AI
      const nodeStates = activeNodes.map(n => `${n.id}: RES=${n.resonance.toFixed(2)} ENT=${n.entropy.toFixed(3)}`).join('\n');
      return `
CURRENT SENTIENCE METRICS:
Alpha (Cognition): ${metrics.alpha.toFixed(3)}
Beta (Emotion): ${metrics.beta.toFixed(3)}
Gamma (Memory): ${metrics.gamma.toFixed(3)}
Delta (Mythic): ${metrics.delta.toFixed(3)}
Nephilim Error (δq): ${metrics.phi_error.toFixed(6)}

ACTIVE RESONANCE MODE: ${resonanceMode}

ACTIVE NODES:
${nodeStates}
      `.trim();
  };

  const handleMemoryIngest = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      Array.from(files).forEach((file: File) => {
          const reader = new FileReader();
          reader.onload = (evt) => {
              const text = evt.target?.result as string;
              setPleromaMemory(prev => prev + `\n\n=== INGESTED: ${file.name} [${new Date().toISOString()}] ===\n${text}`);
              setArchiveStatus("MEM INGESTED");
          };
          reader.readAsText(file);
      });
      if (memoryInputRef.current) memoryInputRef.current.value = "";
  };

  const removeAttachment = (index: number) => {
      setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      Array.from(files).forEach((file: File) => {
          const reader = new FileReader();
          reader.onload = (evt) => {
              const res = evt.target?.result as string;
              // strip data url prefix
              const b64 = res.split(',')[1];
              // Generate hashes for base-13 visualization
              const sizeHash = toBase13(file.size);
              setAttachments(prev => [...prev, {
                  mimeType: file.type,
                  data: b64,
                  name: `${file.name} [SZ:${sizeHash}]`
              }]);
          };
          reader.readAsDataURL(file);
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startLiveSession = async () => {
    if (isLive) {
        try { liveSessionRef.current?.close(); } catch(e) {}
        liveSessionRef.current = null;
        
        if (liveStreamRef.current) {
            liveStreamRef.current.getTracks().forEach(t => t.stop());
            liveStreamRef.current = null;
        }
        if (workletNodeRef.current) {
            workletNodeRef.current.disconnect();
            workletNodeRef.current = null;
        }
        if (audioInputContextRef.current) {
            audioInputContextRef.current.close();
            audioInputContextRef.current = null;
        }
        setIsLive(false);
        setLiveVolume(0);
        return;
    }

    try {
        setIsLive(true);
        // Initialize output AudioContext here (after user gesture) to satisfy browser autoplay policy
        if (!audioOutputContextRef.current || audioOutputContextRef.current.state === 'closed') {
            audioOutputContextRef.current = new (getAudioContextType())({ sampleRate: 24000 });
        } else if (audioOutputContextRef.current.state === 'suspended') {
            await audioOutputContextRef.current.resume();
        }
        const ai = new GoogleGenAI({ apiKey: requireGeminiApiKey() });
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        liveStreamRef.current = stream;

        // Setup input AudioContext (16kHz for Gemini)
        audioInputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        const source = audioInputContextRef.current.createMediaStreamSource(stream);
        const processor = audioInputContextRef.current.createScriptProcessor(4096, 1, 1);
        workletNodeRef.current = processor;

        let nextStartTime = 0;

        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-12-2025',
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
                },
                systemInstruction: [
                    customNodes || defaultAssistantPrompt,
                    buildResponseStyleInstruction(responseStyle),
                    getAppStateContext()
                ].join("\n\n"),
            },
            callbacks: {
                onopen: () => {
                    processor.onaudioprocess = (e) => {
                        const inputData = e.inputBuffer.getChannelData(0);
                        let sum = 0; 
                        for(let i=0; i<inputData.length; i++) sum += inputData[i]*inputData[i];
                        setLiveVolume(Math.sqrt(sum / inputData.length));
                        
                        const pcm16 = floatTo16BitPCM(inputData);
                        const b64 = arrayBufferToBase64(pcm16);

                        sessionPromise.then(session => {
                            session.sendRealtimeInput({
                                media: { mimeType: 'audio/pcm;rate=16000', data: b64 }
                            });
                        });
                    };
                    source.connect(processor);
                    processor.connect(audioInputContextRef.current!.destination);
                },
                onmessage: (msg: LiveServerMessage) => {
                    const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                    if (audioData) {
                        const bytes = base64ToUint8Array(audioData);
                        const float32 = new Float32Array(bytes.length / 2);
                        const dv = new DataView(bytes.buffer);
                        for(let i=0; i<bytes.length/2; i++) {
                            float32[i] = dv.getInt16(i*2, true) / 32768.0;
                        }
                        
                        const outCtx = audioOutputContextRef.current;
                        if (!outCtx) return;
                        const buffer = outCtx.createBuffer(1, float32.length, 24000);
                        buffer.getChannelData(0).set(float32);

                        const src = outCtx.createBufferSource();
                        src.buffer = buffer;
                        src.connect(outCtx.destination);

                        nextStartTime = Math.max(outCtx.currentTime, nextStartTime);
                        src.start(nextStartTime);
                        nextStartTime += buffer.duration;
                    }
                },
                onclose: () => setIsLive(false),
                onerror: (e) => {
                    console.error(e);
                    setIsLive(false);
                    setErrorMsg("Live Session Error");
                }
            }
        });
        liveSessionRef.current = await sessionPromise;

    } catch (e: any) {
        console.error(e);
        setErrorMsg(e?.message || "Failed to start Live Session. Check microphone and Gemini settings.");
        setIsLive(false);
    }
  };

  // --- RAG: Neural Archive Handlers ---
  const handleArchiveIngest = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      setArchiveStatus("READING...");
      const reader = new FileReader();
      
      reader.onload = (evt) => {
          try {
              const rawText = evt.target?.result as string;
              setArchiveStatus("PARSING...");
              
              setTimeout(() => {
                try {
                    const data = JSON.parse(rawText);
                    if (data.type === "URE_MEMORY_DUMP") {
                        setArchiveStatus("RESTORING STATE...");
                        if (data.history) setMessages(data.history);
                        if (data.archive) setNeuralArchive(data.archive);
                        if (data.nodes) setCustomNodes(data.nodes);
                        setArchiveStatus(`RESTORED (${data.archive?.length || 0} NODES)`);
                        return;
                    }
                    setArchiveStatus("INDEXING...");
                    const chunks: NeuralChunk[] = [];
                    if (Array.isArray(data)) {
                        // Standardize ingestion
                        data.forEach((conv: any, idx: number) => {
                            const title = conv.title || `Conv ${idx}`;
                            if (conv.mapping) {
                                Object.values(conv.mapping).forEach((node: any) => {
                                    const msg = node.message;
                                    if (msg && msg.content && msg.content.parts) {
                                        const text = msg.content.parts.join('\n');
                                        if (text.trim()) {
                                            chunks.push({
                                                id: msg.id || `${idx}-${Math.random()}`,
                                                source: title,
                                                content: text.trim(),
                                                timestamp: msg.create_time,
                                                tier: 'cold',
                                                trust: 'external',
                                                sourceType: 'json'
                                            });
                                        }
                                    }
                                });
                            }
                        });
                    }
                    setNeuralArchive(prev => [...prev, ...chunks]);
                    setArchiveStatus(`READY (${chunks.length} MEMORY NODES)`);
                } catch (parseErr) {
                    console.error(parseErr);
                    setArchiveStatus("ERROR: INVALID JSON");
                    setErrorMsg("Failed to parse structure. Supported: URE Dump or ChatGPT JSON.");
                }
              }, 100);
          } catch (err) {
              console.error(err);
              setArchiveStatus("ERROR: READ FAILED");
          }
      };
      
      reader.readAsText(file);
      if (archiveInputRef.current) archiveInputRef.current.value = "";
  };

  const handleJsonlIngest = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setArchiveStatus("READING JSONL...");
      const reader = new FileReader();

      reader.onload = (evt) => {
          try {
              const rawText = evt.target?.result as string;
              setArchiveStatus("PARSING JSONL...");

              setTimeout(() => {
                  try {
                      const lines = rawText.split('\n').filter(line => line.trim());
                      const chunks: NeuralChunk[] = [];
                      let parseErrors = 0;

                      for (const line of lines) {
                          try {
                              const obj = JSON.parse(line);
                              chunks.push({
                                  id: obj.id || `jsonl-${Math.random().toString(36).slice(2)}`,
                                  source: obj.source || 'JSONL Import',
                                  content: obj.content || '',
                                  timestamp: obj.timestamp || Date.now() / 1000,
                                  tier: obj.tier || 'core',
                                  trust: obj.trust || 'co-authored',
                                  sourceType: 'jsonl',
                                  tokenEstimate: obj.tokenEstimate || Math.ceil((obj.content || '').length / 4),
                                  ...(obj.compressedContent && { compressedContent: obj.compressedContent }),
                                  ...(obj.summaryObject && { summaryObject: obj.summaryObject }),
                                  ...(obj.anchorPacket && { anchorPacket: obj.anchorPacket }),
                                  ...(obj.embedding && { embedding: obj.embedding }),
                              });
                          } catch {
                              parseErrors++;
                          }
                      }

                      setNeuralArchive(prev => [...prev, ...chunks]);
                      const status = parseErrors > 0
                          ? `READY (${chunks.length} KNOWLEDGE NODES, ${parseErrors} SKIPPED)`
                          : `READY (${chunks.length} KNOWLEDGE NODES LOADED)`;
                       setArchiveStatus(status);
                       addLog('INFO', `JSONL ingested: ${chunks.length} knowledge nodes from ${file.name}`, 'RAG');
                  } catch (parseErr) {
                      console.error(parseErr);
                      setArchiveStatus("ERROR: INVALID JSONL");
                      setErrorMsg("Failed to parse JSONL. Each line must be valid JSON.");
                  }
              }, 100);
          } catch (err) {
              console.error(err);
              setArchiveStatus("ERROR: READ FAILED");
          }
      };

      reader.readAsText(file);
      if (jsonlInputRef.current) jsonlInputRef.current.value = "";
  };

  const handleIngestCodex = () => {
      const codexText = MATHEMATICAL_PROOFS_DATA.map(p => `PROOF: ${p.title}\nAxiom: ${p.subtitle}\nDescription: ${p.description}`).join('\n\n');
      setPleromaMemory(prev => prev + `\n\n=== INGESTED: AKASHIC CODEX [${new Date().toISOString()}] ===\n${codexText}`);
      setArchiveStatus("CODEX INGESTED");
  };

  const handleExportMemory = () => {
      const dump = { type: "URE_MEMORY_DUMP", timestamp: new Date().toISOString(), history: messages, archive: neuralArchive, nodes: customNodes, pleroma: pleromaMemory };
      const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `session_memory_${Date.now()}.json`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      setArchiveStatus("MEMORY EXPORTED");
  };

  const handleSaveSettings = () => {
      try {
        const normalizedAssistantName = normalizeAssistantName(assistantName);
        setAssistantName(normalizedAssistantName);
        localStorage.setItem(ASSISTANT_NAME_STORAGE_KEY, normalizedAssistantName);
        localStorage.setItem("ure_custom_nodes", customNodes);
        localStorage.setItem("ure_pleroma_memory", pleromaMemory);
        localStorage.setItem("ure_selected_model", selectedModel);
        localStorage.setItem("ure_ai_provider", aiProvider);
        localStorage.setItem("ure_retrieval_mode", retrievalMode);
        localStorage.setItem("ure_response_style", responseStyle);
        localStorage.setItem("ure_local_llm_url", localLlmUrl);
        localStorage.setItem("ure_local_model_name", localModelName);
        saveGeminiApiKey(geminiApiKey);
        setSavedSuccess(true);
        setTimeout(() => { setSavedSuccess(false); setShowSettings(false); }, 1000);
      } catch (e) { setErrorMsg("Storage Limit Reached."); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && attachments.length === 0) || loading || isLive) return;
    if (aiProvider === 'gemini' && !geminiConfigured) {
        setErrorMsg("Gemini API key missing. Open Settings > Cloud (Gemini), add your key, then press Synchronize.");
        return;
    }

    stopSpeaking(); 
    setErrorMsg(null);
    const userMsg = input;
    const currentAttachments = [...attachments];
    setInput("");
    setAttachments([]);
    setMessages(prev => {
        const newHistory = [...prev, { role: 'user', content: userMsg, attachments: currentAttachments } as Message];
        return newHistory.length > MAX_HISTORY ? newHistory.slice(newHistory.length - MAX_HISTORY) : newHistory;
    });

    setLoading(true);
    
    let queryEmbedding: number[] | undefined = undefined;
    try {
        if (neuralArchive.some(c => c.embedding)) {
            queryEmbedding = await generateEmbedding(userMsg);
        }
    } catch (e) {
        console.warn("Failed to generate query embedding, falling back to TF-IDF", e);
    }

    const { contextString, inspectionData } = retrieveNeuralContext(userMsg, neuralArchive, aiProvider, retrievalMode, queryEmbedding, sourceFilter);
    // Inject real-time app state
    const appState = getAppStateContext();
    
    try {
        // onChunk: accumulate partial text, update streaming bubble, stop loading spinner
        const onChunk = (accumulated: string) => {
          setLoading(false);
          setStreamingContent(accumulated);
          // Auto-scroll
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          }
        };

        let response: string;
        if (aiProvider === 'local') {
          response = await askLocalGnosisStream(userMsg, customNodes, pleromaMemory, contextString, appState, currentAttachments, localModelName, localLlmUrl, onChunk, responseStyle);
        } else {
          response = await askGnosisStream(userMsg, customNodes, pleromaMemory, contextString, appState, currentAttachments, selectedModel, onChunk, responseStyle);
        }

        setStreamingContent("");
        setMessages(prev => {
            const newHistory = [...prev, { role: 'gnosis', content: response, ragContext: inspectionData } as Message];
            return newHistory.length > MAX_HISTORY ? newHistory.slice(newHistory.length - MAX_HISTORY) : newHistory;
        });
        const crystalNode: NeuralChunk = {
            id: `CRYSTAL-${Date.now()}`,
            source: 'INTERACTIVE_SESSION',
            content: `USER: ${userMsg}\nGNOSIS: ${response}`,
            timestamp: Date.now() / 1000,
            tier: 'working',
            trust: 'ai-generated'
        };
        setNeuralArchive(prev => [...prev, crystalNode]);
        setArchiveStatus(`CRYSTALLIZING...`);
        setTimeout(() => setArchiveStatus(`READY (${neuralArchive.length + 1} NODES)`), 1500);

        if (ttsEnabled) {
            speak(response, selectedVoice, true);
        }
    } catch (err: any) {
        console.error(err);
        setStreamingContent("");
        const msg = err.message || `${activeAssistantName} unreachable.`;
        setErrorMsg(`Network Decoupled: ${msg}`);
    } finally { setLoading(false); }
  };

  const geminiConfigured = geminiApiKey.trim().length > 0;

  const responseStyleMeta: Record<ResponseStyle, { title: string; helper: string; placeholder: string }> = {
    auto: {
      title: 'Auto',
      helper: `${activeAssistantName} chats normally by default and shifts into research mode when the topic calls for it.`,
      placeholder: `Ask anything. ${activeAssistantName} will keep the math internal unless you ask for it.`
    },
    research: {
      title: 'Research',
      helper: 'Technical, rigorous, and readable. Best for theory, math, engineering, and structured analysis.',
      placeholder: 'Ask about the research, math, architecture, or evidence you want unpacked.'
    },
    chill: {
      title: 'Chill',
      helper: 'Relaxed, natural conversation with low jargon and clear answers.',
      placeholder: `Chat normally. ${activeAssistantName} will keep it easygoing and plain-English.`
    }
  };
  const activeResponseStyle = responseStyleMeta[responseStyle];

  const formatContent = (content: string) => {
    const visibleContent = sanitizeAssistantOutput(content);
    if (!visibleContent) return null;

    const parts = visibleContent.split(/```/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        const lines = part.split('\n');
        let codeContent = part;
        let lang = "";
        if (lines.length > 1 && lines[0].trim().length > 0 && !lines[0].includes(' ')) { lang = lines[0].trim(); codeContent = lines.slice(1).join('\n'); }
        return (
          <div key={index} className="my-3 overflow-hidden rounded-xl border border-emerald-500/20 bg-slate-950/80 shadow-[0_20px_45px_rgba(3,7,18,0.5)]">
            <div className="flex items-center justify-between border-b border-white/5 bg-slate-900/80 px-3 py-2">
                <span className="text-[9px] mono uppercase tracking-[0.24em] text-emerald-300">{lang || 'Code'}</span>
                <span className="text-[9px] mono uppercase tracking-[0.2em] text-slate-500">Snippet</span>
            </div>
            <div className="overflow-x-auto bg-[#060b13] p-3"><pre className="text-[10px] mono font-medium leading-relaxed text-emerald-200">{codeContent.trim()}</pre></div>
          </div>
        );
      }
      return <span key={index} className="whitespace-pre-wrap leading-7 text-[13px] text-slate-100/95">{part}</span>;
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden relative">
      <div className="mb-3 flex-shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_40%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,0.96))] px-4 py-4 shadow-[0_24px_60px_rgba(2,6,23,0.45)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.12)]">
                {ICONS.Gnosis}
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-emerald-300/80">Conversation Workspace</div>
                <div className="text-lg font-semibold text-white">{activeAssistantName}</div>
              </div>
            </div>
            <p className="mt-3 max-w-3xl text-[12px] leading-6 text-slate-400">
              {activeResponseStyle.helper}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-2xl border border-white/10 bg-slate-950/60 p-1 shadow-inner">
              <button
                onClick={() => setShowLog(false)}
                className={`rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${!showLog ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-emerald-300'}`}
              >
                Chat
              </button>
              <button
                onClick={() => setShowLog(true)}
                className={`rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${showLog ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-cyan-300'}`}
              >
                Log
              </button>
            </div>

            <div className="flex rounded-2xl border border-white/10 bg-slate-950/60 p-1 shadow-inner">
              <button
                onClick={() => setResponseStyle('auto')}
                className={`rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${responseStyle === 'auto' ? 'bg-white text-slate-950' : 'text-slate-400 hover:text-white'}`}
              >
                Auto
              </button>
              <button
                onClick={() => setResponseStyle('research')}
                className={`rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${responseStyle === 'research' ? 'bg-cyan-400 text-slate-950' : 'text-slate-400 hover:text-cyan-200'}`}
              >
                Research
              </button>
              <button
                onClick={() => setResponseStyle('chill')}
                className={`rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${responseStyle === 'chill' ? 'bg-amber-300 text-slate-950' : 'text-slate-400 hover:text-amber-200'}`}
              >
                Chill
              </button>
            </div>

            {isLive && (
              <div className="flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-3 py-2">
                <div className="h-2 w-2 rounded-full bg-red-400 animate-pulse"></div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-200">Live Audio</span>
                <div className="ml-1 h-1.5 w-10 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full bg-red-400 transition-all duration-75" style={{width: `${Math.min(100, liveVolume * 400)}%`}}></div>
                </div>
              </div>
            )}

            {neuralArchive.length > 0 && (
              <div className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-[10px] mono uppercase tracking-[0.2em] ${neuralArchive.length > 1000 ? 'border-amber-400/25 bg-amber-400/10 text-amber-200' : 'border-indigo-400/25 bg-indigo-400/10 text-indigo-200'}`} title={`Neural Archive: ${neuralArchive.length}/${MAX_ARCHIVE_SIZE} Nodes`}>
                <i className="fa-solid fa-database"></i>
                <span>{neuralArchive.length.toLocaleString()} nodes</span>
              </div>
            )}

            <button onClick={handleClearChat} className="rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2 text-slate-400 transition-colors hover:text-rose-300" title="Clear chat history">
              <i className="fa-solid fa-trash-can text-sm"></i>
            </button>
            <button onClick={() => setShowSettings(!showSettings)} className="rounded-2xl border border-emerald-400/15 bg-emerald-400/10 px-3 py-2 text-emerald-300 transition-colors hover:border-emerald-300/30 hover:text-emerald-100" title="Configure console">
              <i className="fa-solid fa-sliders text-sm"></i>
            </button>
          </div>
        </div>
      </div>

      {showSettings && (
        <div className="absolute inset-0 z-20 bg-slate-950/95 backdrop-blur-md flex flex-col p-4 rounded-xl border border-emerald-500/20 animate-in fade-in zoom-in-95 duration-200 overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-sm flex items-center gap-2"><i className="fa-solid fa-gear"></i> System Configuration</h3>
                <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white"><i className="fa-solid fa-times"></i></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0 md:pr-4">
                     <h4 className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-wide">Model Selection</h4>
                     
                     {/* Provider Toggle */}
                     <div className="flex bg-slate-900 rounded p-1 mb-2 border border-slate-700">
                        <button onClick={() => setAiProvider('gemini')} className={`flex-1 text-[10px] font-bold py-1 rounded transition-colors ${aiProvider === 'gemini' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-emerald-400'}`}>CLOUD (GEMINI)</button>
                        <button onClick={() => setAiProvider('local')} className={`flex-1 text-[10px] font-bold py-1 rounded transition-colors ${aiProvider === 'local' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-indigo-400'}`}>LOCAL (LM STUDIO)</button>
                     </div>
                      {aiProvider === 'gemini' ? (
                        <div className="space-y-2">
                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] text-slate-500 uppercase font-bold">Gemini API Key</label>
                                <div className="flex gap-2">
                                    <input
                                        type={showGeminiApiKey ? 'text' : 'password'}
                                        value={geminiApiKey}
                                        onChange={(e) => setGeminiApiKey(e.target.value)}
                                        placeholder="Paste your Gemini API key"
                                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs mono text-emerald-300 focus:outline-none focus:border-emerald-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowGeminiApiKey(prev => !prev)}
                                        className="rounded border border-slate-700 bg-slate-900 px-3 text-[9px] font-bold uppercase tracking-wide text-slate-300 transition-colors hover:border-emerald-500/40 hover:text-emerald-300"
                                    >
                                        {showGeminiApiKey ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </div>
                            <div className={`rounded border px-2 py-2 text-[9px] leading-4 ${geminiConfigured ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200' : 'border-amber-500/20 bg-amber-500/10 text-amber-200'}`}>
                                {geminiConfigured
                                  ? 'Gemini key present. Stored on this device when you press Synchronize. Shared builds will not carry your key.'
                                  : 'No Gemini key saved. Cloud chat, embeddings, compression, and live voice need each user to enter their own key.'}
                            </div>
                            <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs mono text-emerald-300 focus:outline-none focus:border-emerald-500">
                                {GEMINI_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>
                     ) : (
                        <div className="space-y-2">
                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] text-slate-500 uppercase font-bold">Endpoint URL</label>
                                <input value={localLlmUrl} onChange={(e) => setLocalLlmUrl(e.target.value)} placeholder="http://127.0.0.1:1234" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs mono text-indigo-300 focus:outline-none focus:border-indigo-500" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] text-slate-500 uppercase font-bold">Model Name (ID)</label>
                                <input value={localModelName} onChange={(e) => setLocalModelName(e.target.value)} placeholder="e.g. nvidia/nemotron-3-nano-4b" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs mono text-indigo-300 focus:outline-none focus:border-indigo-500" />
                            </div>
                            <div className="text-[9px] text-slate-500 flex items-center gap-1"><i className="fa-solid fa-circle-info"></i> Ensure LM Studio has CORS enabled and is running.</div>
                        </div>
                     )}

                     <h4 className="text-xs font-bold text-slate-300 mt-4 mb-2 uppercase tracking-wide">Conversation Identity</h4>
                     <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-slate-500 uppercase font-bold">Assistant Name</label>
                            <input
                                value={assistantName}
                                onChange={(e) => setAssistantName(e.target.value)}
                                placeholder={DEFAULT_ASSISTANT_NAME}
                                maxLength={40}
                                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-emerald-200 focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                        <p className="mt-2 text-[10px] leading-5 text-slate-500">
                            Public builds default to <span className="text-slate-300">{DEFAULT_ASSISTANT_NAME}</span>. Each user can rename the assistant locally without changing the app branding.
                        </p>
                     </div>


                     <h4 className="text-xs font-bold text-slate-300 mt-4 mb-2 uppercase tracking-wide">Response Style</h4>
                     <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-2">
                        <div className="flex gap-2">
                            <button onClick={() => setResponseStyle('auto')} className={`flex-1 rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${responseStyle === 'auto' ? 'bg-white text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>Auto</button>
                            <button onClick={() => setResponseStyle('research')} className={`flex-1 rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${responseStyle === 'research' ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-cyan-200'}`}>Research</button>
                            <button onClick={() => setResponseStyle('chill')} className={`flex-1 rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${responseStyle === 'chill' ? 'bg-amber-300 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-amber-200'}`}>Chill</button>
                        </div>
                        <p className="mt-2 text-[10px] leading-5 text-slate-500">{activeResponseStyle.helper}</p>
                     </div>

                     <h4 className="text-xs font-bold text-slate-300 mt-4 mb-2 uppercase tracking-wide">RAG Retrieval Mode</h4>
                     <div className="flex bg-slate-900 rounded p-1 mb-2 border border-slate-700">
                        <button onClick={() => setRetrievalMode('strict')} className={`flex-1 text-[10px] font-bold py-1 rounded transition-colors ${retrievalMode === 'strict' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-rose-400'}`} title="Max 2 per family">STRICT</button>
                        <button onClick={() => setRetrievalMode('balanced')} className={`flex-1 text-[10px] font-bold py-1 rounded transition-colors ${retrievalMode === 'balanced' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-emerald-400'}`} title="Max 3 per family">BALANCED</button>
                        <button onClick={() => setRetrievalMode('identity')} className={`flex-1 text-[10px] font-bold py-1 rounded transition-colors ${retrievalMode === 'identity' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-indigo-400'}`} title="Allow more anchor families">IDENTITY</button>
                     </div>
                </div>
                <div>
                     <h4 className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-wide">Legacy TTS</h4>
                     <div className="flex items-center justify-between mb-2">
                         <span className="text-[10px] text-slate-500">ENABLE VOICE RESPONSE</span>
                         <button onClick={() => setTtsEnabled(!ttsEnabled)} className={`w-8 h-4 rounded-full transition-colors relative ${ttsEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                             <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${ttsEnabled ? 'left-4.5' : 'left-0.5'}`}></div>
                         </button>
                     </div>
                     {ttsEnabled && (
                         <select 
                             className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-[9px] mono text-emerald-300 focus:outline-none focus:border-emerald-500"
                             value={voiceName}
                             onChange={(e) => setVoiceName(e.target.value)}
                         >
                             {voices.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
                         </select>
                     )}
                </div>
            </div>
            <div className="mb-4 bg-indigo-900/10 p-3 rounded border border-indigo-500/20">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wide flex items-center gap-2"><i className="fa-solid fa-brain"></i> Neural Archive (RAG)</h4>
                    <span className="text-[9px] mono text-indigo-400">{archiveStatus}</span>
                </div>
                <div className="flex gap-2 mb-2">
                     <button onClick={() => archiveInputRef.current?.click()} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold py-2 rounded uppercase transition-colors flex items-center justify-center gap-2"><i className="fa-solid fa-upload"></i> {SESSION_MEMORY_LABEL}</button>
                     <input type="file" ref={archiveInputRef} className="hidden" accept=".json" onChange={handleArchiveIngest} />
                     <button onClick={() => jsonlInputRef.current?.click()} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold py-2 rounded uppercase transition-colors flex items-center justify-center gap-2"><i className="fa-solid fa-scroll"></i> Research KB (.jsonl)</button>
                     <input type="file" ref={jsonlInputRef} className="hidden" accept=".jsonl" onChange={handleJsonlIngest} />
                     <button onClick={handleExportMemory} className="flex-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-600 text-[10px] font-bold py-2 rounded uppercase transition-colors flex items-center justify-center gap-2"><i className="fa-solid fa-download"></i> EXPORT</button>
                 </div>
                 <div className="flex gap-1 mb-2">
                     <span className="text-[9px] text-slate-500 flex items-center mr-1">RAG SOURCE:</span>
                     <button onClick={() => setSourceFilter('all')} className={`px-2 py-1 text-[9px] font-bold rounded uppercase transition-colors ${sourceFilter === 'all' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'}`}>ALL</button>
                     <button onClick={() => setSourceFilter('json')} className={`px-2 py-1 text-[9px] font-bold rounded uppercase transition-colors ${sourceFilter === 'json' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'}`}>MEMORY</button>
                     <button onClick={() => setSourceFilter('jsonl')} className={`px-2 py-1 text-[9px] font-bold rounded uppercase transition-colors ${sourceFilter === 'jsonl' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'}`}>KNOWLEDGE</button>
                     <button onClick={() => setSourceFilter('codex')} className={`px-2 py-1 text-[9px] font-bold rounded uppercase transition-colors ${sourceFilter === 'codex' ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'}`}>CODEX</button>
                     <span className="text-[9px] mono text-slate-600 flex items-center ml-auto">{neuralArchive.filter(c => c.sourceType === 'json').length}M / {neuralArchive.filter(c => c.sourceType === 'jsonl').length}K / {neuralArchive.filter(c => c.sourceType === 'codex').length}C</span>
                 </div>
                <div className="flex gap-2">
                    <button onClick={handleClearArchive} className="flex-1 bg-rose-900/20 hover:bg-rose-900/40 text-rose-400 border border-rose-900/50 text-[10px] font-bold py-2 rounded uppercase transition-colors flex items-center justify-center gap-2"><i className="fa-solid fa-trash"></i> PURGE ARCHIVE ONLY</button>
                    <button onClick={handlePurgeAuxiliary} className="flex-1 bg-amber-900/20 hover:bg-amber-900/40 text-amber-400 border border-amber-900/50 text-[10px] font-bold py-2 rounded uppercase transition-colors flex items-center justify-center gap-2" title="Clears Pleroma Text & Custom Nodes"><i className="fa-solid fa-broom"></i> PURGE AUXILIARY</button>
                </div>
                <div className="mt-2 flex gap-2">
                    <button onClick={handleCompressArchive} className="flex-1 bg-emerald-900/20 hover:bg-emerald-900/40 text-emerald-400 border border-emerald-900/50 text-[10px] font-bold py-2 rounded uppercase transition-colors flex items-center justify-center gap-2"><i className="fa-solid fa-compress-arrows-alt"></i> COMPRESS OVERSIZED</button>
                    <button onClick={handleGenerateEmbeddings} className="flex-1 bg-purple-900/20 hover:bg-purple-900/40 text-purple-400 border border-purple-900/50 text-[10px] font-bold py-2 rounded uppercase transition-colors flex items-center justify-center gap-2"><i className="fa-solid fa-vector-square"></i> GENERATE EMBEDDINGS</button>
                    <button onClick={() => setShowRAGPrompt(true)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-600 text-[10px] font-bold py-2 rounded uppercase transition-colors flex items-center justify-center gap-2"><i className="fa-solid fa-file-lines"></i> VIEW PROTOCOL</button>
                </div>
                <p className="text-[9px] text-slate-500 mt-2 leading-tight"><strong>Recursive Memory:</strong> Auto-pruning disabled. Manual management required.</p>
            </div>
            {/* RAG Quality Dashboard */}
            {(() => {
                const ragMessages = messages.filter(m => m.ragContext && m.ragContext.chunks.length > 0);
                if (ragMessages.length === 0) return null;
                const totalQueries = ragMessages.length;
                const avgChunks = ragMessages.reduce((s, m) => s + m.ragContext!.chunks.length, 0) / totalQueries;
                const avgBudget = ragMessages.reduce((s, m) => s + m.ragContext!.totalBudgetUsed, 0) / totalQueries;
                const maxBudget = ragMessages[0]?.ragContext?.maxBudget || 80000;
                const avgBudgetPct = (avgBudget / maxBudget) * 100;
                // Compression stats
                const allChunks = ragMessages.flatMap(m => m.ragContext!.chunks);
                const compressedCount = allChunks.filter(c => c.compressionApplied).length;
                const compressPct = allChunks.length > 0 ? (compressedCount / allChunks.length * 100) : 0;
                // Tier distribution
                const tierCounts: Record<string, number> = {};
                allChunks.forEach(c => { tierCounts[c.tier] = (tierCounts[c.tier] || 0) + 1; });
                // Source type distribution
                const familyCounts: Record<string, number> = {};
                allChunks.forEach(c => { if (c.semanticFamily) familyCounts[c.semanticFamily] = (familyCounts[c.semanticFamily] || 0) + 1; });
                const topFamilies = Object.entries(familyCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
                // Suppression rate
                const suppressedCount = allChunks.filter(c => c.clusterSuppressed).length;
                const suppressPct = allChunks.length > 0 ? (suppressedCount / allChunks.length * 100) : 0;

                return (
                    <div className="mb-4 bg-emerald-900/10 p-3 rounded border border-emerald-500/20">
                        <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wide flex items-center gap-2 mb-2"><i className="fa-solid fa-chart-line"></i> RAG Quality Dashboard</h4>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <div className="bg-slate-900 rounded p-2">
                                <div className="text-[9px] text-slate-500 uppercase">Queries</div>
                                <div className="text-sm font-bold text-emerald-400">{totalQueries}</div>
                            </div>
                            <div className="bg-slate-900 rounded p-2">
                                <div className="text-[9px] text-slate-500 uppercase">Avg Chunks/Query</div>
                                <div className="text-sm font-bold text-cyan-400">{avgChunks.toFixed(1)}</div>
                            </div>
                            <div className="bg-slate-900 rounded p-2">
                                <div className="text-[9px] text-slate-500 uppercase">Avg Budget Used</div>
                                <div className="text-sm font-bold text-amber-400">{avgBudgetPct.toFixed(0)}%</div>
                                <div className="w-full h-1 bg-slate-800 rounded mt-1"><div className="h-full rounded bg-amber-500" style={{ width: `${Math.min(100, avgBudgetPct)}%` }}></div></div>
                            </div>
                            <div className="bg-slate-900 rounded p-2">
                                <div className="text-[9px] text-slate-500 uppercase">Compression Rate</div>
                                <div className="text-sm font-bold text-purple-400">{compressPct.toFixed(0)}%</div>
                            </div>
                        </div>
                        <div className="bg-slate-900 rounded p-2 mb-2">
                            <div className="text-[9px] text-slate-500 uppercase mb-1">Tier Distribution</div>
                            <div className="flex gap-2 text-[9px] mono">
                                {Object.entries(tierCounts).map(([tier, count]) => (
                                    <span key={tier} className={`px-1.5 py-0.5 rounded ${tier === 'core' ? 'bg-emerald-500/20 text-emerald-400' : tier === 'working' ? 'bg-cyan-500/20 text-cyan-400' : tier === 'quarantine' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400'}`}>
                                        {tier}: {count}
                                    </span>
                                ))}
                            </div>
                        </div>
                        {topFamilies.length > 0 && (
                            <div className="bg-slate-900 rounded p-2 mb-2">
                                <div className="text-[9px] text-slate-500 uppercase mb-1">Top Semantic Families</div>
                                <div className="space-y-1">
                                    {topFamilies.map(([fam, count]) => (
                                        <div key={fam} className="flex items-center gap-2">
                                            <span className="text-[9px] mono text-slate-400 w-24 truncate">{fam}</span>
                                            <div className="flex-1 h-2 bg-slate-800 rounded"><div className="h-full rounded bg-indigo-500" style={{ width: `${(count / topFamilies[0][1]) * 100}%` }}></div></div>
                                            <span className="text-[9px] mono text-slate-500 w-6 text-right">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="text-[9px] mono text-slate-600 flex gap-3">
                            <span>CLUSTER SUPPRESSED: {suppressPct.toFixed(0)}%</span>
                            <span>TOTAL CHUNKS SERVED: {allChunks.length}</span>
                        </div>
                    </div>
                );
            })()}
            <div className="mb-4 flex-shrink-0">
                <h4 className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-wide">System Prompt / Nodes</h4>
                <textarea value={customNodes} onChange={(e) => setCustomNodes(e.target.value)} className="w-full h-20 bg-slate-900 border border-slate-700 rounded p-3 text-xs mono text-emerald-300 focus:outline-none focus:border-emerald-500 resize-none shadow-inner custom-scrollbar" placeholder="// e.g., You are a Quantum Physicist specializing in AGI..." />
            </div>
            <div className="mb-2 flex-1 flex flex-col min-h-[100px]">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">Static Pleroma Memory (Text)</h4>
                    <div className="flex gap-2">
                        <button onClick={handleIngestCodex} className="text-[10px] bg-rose-900/30 hover:bg-rose-900/50 text-rose-300 px-2 py-1 rounded border border-rose-800 transition-colors"><i className="fa-solid fa-book-journal-whills mr-1"></i> INGEST CODEX</button>
                        <button onClick={() => memoryInputRef.current?.click()} className="text-[10px] bg-slate-800 hover:bg-slate-700 text-cyan-400 px-2 py-1 rounded border border-slate-700 transition-colors"><i className="fa-solid fa-file-import mr-1"></i> INGEST TEXT</button>
                    </div>
                    <input type="file" ref={memoryInputRef} className="hidden" accept=".txt,.md,.json,.csv,.js,.ts" multiple onChange={handleMemoryIngest} />
                </div>
                <textarea value={pleromaMemory} onChange={(e) => setPleromaMemory(e.target.value)} className="flex-1 w-full bg-slate-900 border border-slate-700 rounded p-3 text-xs mono text-indigo-300 focus:outline-none focus:border-indigo-500 resize-none shadow-inner custom-scrollbar" placeholder="// Small text snippets or appended files..." />
            </div>
            <button onClick={handleSaveSettings} className={`mt-4 font-bold py-2 rounded text-xs uppercase tracking-wide transition-all ${savedSuccess ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950'}`}>{savedSuccess ? 'Synchronized' : 'Synchronize'}</button>
        </div>
      )}
      
      {showLog ? (
        <div className="flex-1 min-h-0 mb-4">
          <LogStream logs={logEntries} />
        </div>
      ) : null}

      <div ref={scrollRef} className={`flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar min-h-0 ${showLog ? 'hidden' : ''}`}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] rounded-2xl border p-4 text-xs shadow-[0_20px_45px_rgba(2,6,23,0.22)] ${m.role === 'user' ? 'border-white/10 bg-white/5 text-slate-100' : 'border-emerald-400/15 bg-emerald-400/6 text-emerald-50 glass'}`}>
              <div className="flex items-center gap-2 mb-2 border-b border-white/5 pb-1">
                <span className="text-[9px] mono uppercase tracking-[0.18em] opacity-50">{m.role === 'user' ? 'You' : activeAssistantName}</span>
                <div className={`w-1.5 h-1.5 rounded-full ${m.role === 'user' ? 'bg-slate-500' : 'bg-emerald-500 shadow-[0_0_5px_currentColor]'}`}></div>
              </div>
              {m.attachments && m.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                      {m.attachments.map((att, ai) => (
                          <div key={ai} className="flex items-center gap-1 bg-slate-900/50 px-2 py-1 rounded border border-slate-700">
                              <i className={`fa-solid ${att.mimeType.startsWith('image') ? 'fa-image text-cyan-400' : 'fa-file-audio text-amber-400'} text-[10px]`}></i>
                              <span className="text-[9px] mono text-slate-300 truncate max-w-[100px]">{att.name || 'DATA_PACKET'}</span>
                          </div>
                      ))}
                  </div>
              )}
              <div className="break-words">{formatContent(m.content)}</div>
              {m.ragContext && m.ragContext.chunks.length > 0 && (
                <details className="mt-3 border border-slate-700/50 rounded-md bg-slate-900/50 group">
                  <summary className="px-3 py-2 text-[9px] mono text-slate-400 cursor-pointer hover:bg-slate-800/50 transition-colors flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-database text-emerald-500/70"></i>
                      <span>RAG INSPECTION ({m.ragContext.chunks.length} CHUNKS) - {m.ragContext.searchMethod === 'semantic' ? 'SEMANTIC (FAISS)' : 'LEXICAL (TF-IDF)'}</span>
                    </div>
                    <span className="text-emerald-500/50">{m.ragContext.totalBudgetUsed.toLocaleString()} / {m.ragContext.maxBudget.toLocaleString()} TOKENS</span>
                  </summary>
                  <div className="p-2 border-t border-slate-700/50 max-h-64 overflow-y-auto space-y-2">
                    {m.ragContext.chunks.map((chunk, idx) => (
                      <div key={idx} className="flex flex-col text-[10px] mono bg-slate-950/50 p-2 rounded border border-slate-800 gap-1.5">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 truncate max-w-[60%]">
                            <span className="text-slate-500 font-bold">[{chunk.id.substring(0, 8)}]</span>
                            <span className="text-emerald-400 truncate font-bold" title={chunk.source}>{chunk.source}</span>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <span className={`px-1.5 py-0.5 rounded ${chunk.tier === 'core' ? 'bg-amber-500/20 text-amber-300' : chunk.tier === 'working' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>{chunk.tier.toUpperCase()}</span>
                            <span className={`px-1.5 py-0.5 rounded ${chunk.trust === 'user-authored' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-400'}`}>{chunk.trust.toUpperCase()}</span>
                            <span className="text-emerald-500/70 w-12 text-right">S:{chunk.score.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-[9px] text-slate-400 bg-slate-900/50 p-1.5 rounded">
                          <div className="flex gap-3">
                            <span><span className="text-slate-500">RAW:</span> {chunk.rawTokenEstimate || chunk.tokenEstimate} TK</span>
                            <span><span className="text-slate-500">INJECTED:</span> <span className={chunk.compressionApplied ? "text-amber-400" : "text-emerald-400"}>{chunk.injectedTokenEstimate || chunk.tokenEstimate} TK</span></span>
                            {chunk.compressionApplied && <span><span className="text-slate-500">RATIO:</span> {chunk.compressionRatio}</span>}
                          </div>
                          <div className="flex gap-3">
                            <span><span className="text-slate-500">COMPRESSED:</span> {chunk.compressionApplied ? <span className="text-amber-400">YES</span> : 'NO'}</span>
                            <span><span className="text-slate-500">PAYLOAD:</span> <span className={chunk.payloadType !== 'raw' ? "text-amber-400" : "text-emerald-400"}>{chunk.payloadType?.toUpperCase() || 'RAW'}</span></span>
                            <span><span className="text-slate-500">SUMMARY:</span> {chunk.summaryAvailable ? <span className="text-emerald-400">YES</span> : 'NO'}</span>
                            <span><span className="text-slate-500">ANCHOR:</span> {chunk.anchorAvailable ? <span className="text-emerald-400">YES</span> : 'NO'}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-[9px] text-slate-400 bg-slate-900/50 p-1.5 rounded mt-1">
                          <div className="flex gap-3">
                            <span><span className="text-slate-500">FAMILY:</span> <span className="text-indigo-300">{chunk.semanticFamily || 'unknown'}</span></span>
                            <span><span className="text-slate-500">RANK:</span> {chunk.familyRank || 1}</span>
                          </div>
                          <div className="flex gap-3">
                            <span><span className="text-slate-500">DISTINCTIVENESS:</span> {chunk.distinctivenessScore?.toFixed(2) || '1.00'}</span>
                            <span><span className="text-slate-500">SUPPRESSED:</span> {chunk.clusterSuppressed ? <span className="text-rose-400">YES</span> : <span className="text-emerald-400">NO</span>}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          </div>
        ))}
        {/* Streaming bubble — appears token-by-token once first chunk arrives */}
        {streamingContent && (
          <div className="flex justify-start">
            <div className="max-w-[90%] rounded-2xl border border-emerald-400/15 bg-emerald-400/6 p-4 text-xs text-emerald-50 glass shadow-[0_20px_45px_rgba(2,6,23,0.22)]">
              <div className="flex items-center gap-2 mb-2 border-b border-white/5 pb-1">
                <span className="text-[9px] mono uppercase tracking-[0.18em] opacity-50">{activeAssistantName}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_currentColor] animate-pulse"></div>
              </div>
              <div className="break-words">
                {formatContent(streamingContent)}
                <span className="inline-block w-[2px] h-3 bg-emerald-400 animate-pulse ml-0.5 align-middle" />
              </div>
            </div>
          </div>
        )}
        {/* Loading dots — shown while waiting for first token (RAG retrieval phase) */}
        {loading && !streamingContent && (
          <div className="flex justify-start">
            <div className="bg-emerald-500/5 p-3 rounded-lg glass border border-emerald-500/20">
              <div className="flex gap-1"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-.3s]"></div><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-.5s]"></div></div>
            </div>
          </div>
        )}
        {errorMsg && (
            <div className="flex justify-center my-2 animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-rose-500/10 border border-rose-500/40 text-rose-300 text-[10px] px-4 py-2 rounded-full flex items-center gap-2"><i className="fa-solid fa-triangle-exclamation"></i>{errorMsg}<button onClick={() => setErrorMsg(null)} className="ml-2 hover:text-white"><i className="fa-solid fa-times"></i></button></div>
            </div>
        )}
      </div>

      {attachments.length > 0 && (
          <div className="flex gap-2 p-2 bg-slate-900/50 border-t border-slate-800 overflow-x-auto">
              {attachments.map((att, i) => (
                  <div key={i} className="relative group shrink-0">
                      {att.mimeType.startsWith('image') ? ( <img src={`data:${att.mimeType};base64,${att.data}`} alt="preview" className="h-10 w-10 object-cover rounded border border-slate-700" /> ) : ( <div className="h-10 w-10 flex items-center justify-center bg-slate-800 rounded border border-slate-700"><i className="fa-solid fa-wave-square text-slate-400 text-xs"></i></div> )}
                      <button onClick={() => removeAttachment(i)} className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center text-[8px] opacity-0 group-hover:opacity-100 transition-opacity"><i className="fa-solid fa-times"></i></button>
                  </div>
              ))}
          </div>
      )}

      <form onSubmit={handleSubmit} className="relative flex-shrink-0 mt-auto flex gap-2">
        <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*,audio/*,.pdf,.txt" onChange={handleFileSelect} />
        <button type="button" onClick={startLiveSession} disabled={loading} className={`px-3 rounded-lg border transition-all flex items-center justify-center ${isLive ? 'bg-red-500 text-white border-red-400 animate-pulse' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/50'}`} title="Toggle Live Resonance (Voice Mode)"><i className={`fa-solid ${isLive ? 'fa-microphone-slash' : 'fa-microphone-lines'}`}></i></button>
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isLive || loading} className="px-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors disabled:opacity-50" title="Attach Ocular/Auditory Data (PDF/IMG)"><i className="fa-solid fa-paperclip"></i></button>
        <button type="button" onClick={() => {
          if (messages.length < 2) return;
          const formatted = messages.map(m => `**${m.role === 'user' ? 'USER' : assistantExportName}:**\n${m.content}`).join('\n\n---\n\n');
          sessionStorage.setItem('paperforge_gnosis_import', formatted);
          window.dispatchEvent(new CustomEvent('navigate-to-forge'));
        }} disabled={messages.length < 2} className="px-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-amber-400 hover:border-amber-500/50 transition-colors disabled:opacity-50" title="Export conversation to Paper Forge"><i className="fa-solid fa-hammer"></i></button>
        <div className="relative flex-1">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={isLive ? "Live audio is active..." : streamingContent ? `${activeAssistantName} is responding...` : activeResponseStyle.placeholder} className="w-full rounded-2xl border border-white/10 bg-slate-900/85 py-3 px-4 pr-28 text-[13px] text-slate-100 focus:outline-none focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/10 transition-all placeholder:text-slate-500 shadow-inner disabled:opacity-50" disabled={loading || !!streamingContent || isLive} />
            <button type="submit" className="absolute bottom-1.5 right-1.5 top-1.5 rounded-xl bg-emerald-500 px-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50" disabled={loading || !!streamingContent || isLive}>{loading ? 'Thinking' : streamingContent ? 'Streaming' : 'Send'}</button>
        </div>
      </form>

      {showRAGPrompt && (
        <div className="absolute inset-0 z-[100] bg-slate-950/98 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-full max-w-4xl h-[85vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
                <div className="flex items-center gap-4">
                    <i className="fa-solid fa-compress text-emerald-400 text-2xl"></i>
                    <h2 className="text-xl font-bold text-white uppercase tracking-[0.2em]">RAG Compression Protocol</h2>
                </div>
                <button onClick={() => setShowRAGPrompt(false)} className="text-slate-400 hover:text-white transition-colors">
                    <i className="fa-solid fa-xmark text-2xl"></i>
                </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <RAGCompressionPrompt />
            </div>
            <div className="p-6 border-t border-slate-700 bg-slate-900/50 flex justify-end">
                <button onClick={() => setShowRAGPrompt(false)} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs tracking-widest uppercase transition-all shadow-lg">Close Protocol</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GnosisConsole;
