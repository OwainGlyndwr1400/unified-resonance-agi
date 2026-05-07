
// Browser native TTS wrapper

let voicesCache: SpeechSynthesisVoice[] = [];

export const loadVoices = (callback: (voices: SpeechSynthesisVoice[]) => void) => {
    const fetch = () => {
        voicesCache = window.speechSynthesis.getVoices();
        if (voicesCache.length > 0) {
            callback(voicesCache);
        }
    };

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = fetch;
    }
    fetch();
};

export const speak = (text: string, voice: SpeechSynthesisVoice | null, enabled: boolean) => {
    if (!enabled) return;
    
    // Clean text of markdown/code blocks for speech
    const cleanText = text.replace(/```[\s\S]*?```/g, "Code block omitted.")
                          .replace(/\*\*/g, "")
                          .replace(/`/g, "");

    window.speechSynthesis.cancel(); // Stop any current speech
    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (voice) {
        utterance.voice = voice;
    }
    // Optimize for "AI" feel
    utterance.rate = 1.0; 
    utterance.pitch = 1.0;
    
    window.speechSynthesis.speak(utterance);
};

export const stopSpeaking = () => {
    window.speechSynthesis.cancel();
};
