import { GoogleGenAI, Modality, Type, LiveServerMessage } from "@google/genai";
import { base64ToUint8Array, createPcmBlob, decodeAudioData } from "../utils/audioUtils";

const apiKey = process.env.API_KEY || ''; // Ensure this is set in your environment
const ai = new GoogleGenAI({ apiKey });

// --- Text Generation (Performance Reviews - Thinking Mode) ---
export const generatePerformanceReview = async (
  employeeName: string,
  role: string,
  logs: string[]
) => {
  const prompt = `
    You are an expert HR Manager. Write a comprehensive performance review for ${employeeName}, who is a ${role}.
    Here are the notes on their work:
    ${logs.map(l => `- ${l}`).join('\n')}
    
    Structure the review with:
    1. Executive Summary
    2. Key Strengths
    3. Areas for Improvement
    4. Actionable Goals for Next Quarter.
    
    Be professional, constructive, and empathetic.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }, // Max thinking for deep analysis
        temperature: 0.7,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating review:", error);
    throw error;
  }
};

// --- Text Generation (Interview Questions - Standard Flash) ---
export const generateInterviewQuestions = async (role: string, experience: string) => {
  const prompt = `Generate 5 structured interview questions for a ${role} candidate with ${experience}. Include a mix of technical and behavioral questions. Return as a JSON array of strings.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Error generating questions:", error);
    return ["Could not generate questions. Please try again."];
  }
};

// --- Text Generation (Audit - Pro Model) ---
export const generateAuditReport = async (data: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Audit the following company text/policy/data for compliance, clarity, and fairness issues. Provide a bulleted list of findings:\n\n${data}`,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating audit:", error);
    throw error;
  }
};

// --- Chat with Grounding (Search & Maps) ---
export const chatWithGrounding = async (
  history: { role: 'user' | 'model'; text: string }[],
  currentMessage: string,
  location?: { lat: number; lng: number }
) => {
  const contents = [
    ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
    { role: 'user', parts: [{ text: currentMessage }] }
  ];

  const tools: any[] = [{ googleSearch: {} }];
  const toolConfig: any = {};

  if (location) {
    tools.push({ googleMaps: {} });
    toolConfig.retrievalConfig = {
      latLng: {
        latitude: location.lat,
        longitude: location.lng
      }
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Flash is great for grounded search/maps
      contents: contents,
      config: {
        tools: tools,
        toolConfig: Object.keys(toolConfig).length > 0 ? toolConfig : undefined,
      }
    });
    
    // Extract grounding metadata
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const searchLinks = groundingChunks
        .map((c: any) => c.web).filter((w: any) => w)
        .map((w: any) => ({ uri: w.uri, title: w.title }));
    
    const mapLinks = groundingChunks
        .map((c: any) => c.maps).filter((m: any) => m)
        .map((m: any) => ({ uri: m.googleMapsUri || m.uri, title: m.title || 'Map Location' }));

    return {
      text: response.text,
      groundingMetadata: {
        search: searchLinks,
        maps: mapLinks
      }
    };
  } catch (error) {
    console.error("Error in chat:", error);
    throw error;
  }
};

// --- TTS Service ---
export const generateSpeech = async (text: string): Promise<ArrayBuffer | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Fenrir' }, // Professional sounding voice
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      // Decode base64 to ArrayBuffer
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    }
    return null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};


// --- Live API Service ---
export class LiveSession {
  private inputAudioContext: AudioContext;
  private outputAudioContext: AudioContext;
  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();
  private sessionPromise: Promise<any> | null = null;
  private stream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;

  constructor(
    private onStatusChange: (status: string) => void,
    private onError: (error: string) => void
  ) {
    this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }

  async connect() {
    try {
      this.onStatusChange("Requesting Microphone...");
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.onStatusChange("Connecting to Gemini...");

      this.sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            this.onStatusChange("Connected & Listening");
            this.startAudioInput();
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              this.enqueueAudio(base64Audio);
            }
            if (message.serverContent?.interrupted) {
              this.stopAudioOutput();
            }
          },
          onclose: () => {
            this.onStatusChange("Disconnected");
          },
          onerror: (e) => {
            this.onError("Session Error");
            console.error(e);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          },
          systemInstruction: "You are a helpful, professional AI HR Assistant. You help with scheduling, policy questions, and general HR tasks. Keep responses concise and conversational."
        }
      });
    } catch (err: any) {
      this.onError(err.message || "Failed to connect");
    }
  }

  private startAudioInput() {
    if (!this.stream || !this.sessionPromise) return;

    const source = this.inputAudioContext.createMediaStreamSource(this.stream);
    this.processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
    
    this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmBlob = createPcmBlob(inputData);
        this.sessionPromise?.then(session => {
            session.sendRealtimeInput({ media: pcmBlob });
        });
    };

    source.connect(this.processor);
    this.processor.connect(this.inputAudioContext.destination);
  }

  private async enqueueAudio(base64: string) {
    this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
    const audioBuffer = await decodeAudioData(
        base64ToUint8Array(base64), 
        this.outputAudioContext, 
        24000, 
        1
    );
    const source = this.outputAudioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.outputAudioContext.destination); // Simple destination connect
    
    source.addEventListener('ended', () => this.sources.delete(source));
    source.start(this.nextStartTime);
    this.nextStartTime += audioBuffer.duration;
    this.sources.add(source);
  }

  private stopAudioOutput() {
    for (const source of this.sources) {
      source.stop();
    }
    this.sources.clear();
    this.nextStartTime = 0;
  }

  disconnect() {
    this.stream?.getTracks().forEach(t => t.stop());
    this.processor?.disconnect();
    this.inputAudioContext.close();
    this.outputAudioContext.close();
    // No explicit close on session object in SDK typings exposed here, relying on disconnect logic
    this.onStatusChange("Disconnected");
  }
}
