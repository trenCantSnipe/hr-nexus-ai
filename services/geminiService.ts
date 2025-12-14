
import { GoogleGenAI, Modality, Type, LiveServerMessage, FunctionDeclaration } from "@google/genai";
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

// --- Interview Response Analysis ---
export const analyzeCandidateResponse = async (role: string, question: string, answer: string) => {
  const prompt = `
    You are an expert interviewer hiring for a ${role} position.
    
    Question Asked: "${question}"
    Candidate Answer: "${answer}"
    
    Analyze the candidate's response. Provide:
    1. A rating out of 10.
    2. A concise feedback summary (2 sentences max).
    3. Key improvements or missing points (bullet points).
    
    Return pure JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                rating: { type: Type.INTEGER },
                feedback: { type: Type.STRING },
                improvements: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Analysis Error:", error);
    return {
        rating: 0,
        feedback: "Could not analyze response.",
        improvements: []
    };
  }
};

// --- Auto-Schedule Proposal ---
export const suggestInterviewTime = async (candidateName: string, role: string) => {
  const prompt = `
    You are an intelligent AI scheduler for HR Nexus. 
    Suggest an optimal interview time for ${candidateName}, who is applying for the ${role} position.
    
    Assume today is ${new Date().toDateString()}.
    Rules:
    - Schedule for a weekday within the next 7 days.
    - Business hours only (09:00 to 17:00).
    - Avoid common lunch times (12:00-13:00).
    
    Return a JSON object with:
    - date (YYYY-MM-DD)
    - time (HH:MM 24-hour format)
    - reason (A brief, professional explanation of why this time was chosen, e.g., "Mid-week morning slots often result in better candidate focus.")
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING },
            time: { type: Type.STRING },
            reason: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || 'null');
  } catch (error) {
    console.error("Scheduling Error:", error);
    throw error;
  }
};

// --- Email Auto-Drafting ---
export const draftRecruitmentEmail = async (candidateName: string, role: string, status: string) => {
  const prompt = `
    You are an HR Manager at "HR Nexus AI". Write a professional email to ${candidateName}, who applied for the ${role} position.
    
    Current Status: "${status}"
    
    Instructions based on status:
    - Applied: Acknowledge receipt of application.
    - Screening: Invite them for a preliminary phone screen.
    - Interview: Confirm they have moved to the interview stage or ask for availability.
    - Offer: Congratulate them and mention an offer letter is attached.
    - Rejected: Politely decline the application.

    Return JSON with 'subject' and 'body'. The body should be formatted with newlines.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            body: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || '{"subject": "", "body": ""}');
  } catch (error) {
    console.error("Drafting Error:", error);
    return { subject: "Update regarding your application", body: "" };
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

// --- Admin Assistant with Tools ---
const taskFunctionDeclaration: FunctionDeclaration = {
  name: "assign_task_to_all",
  description: "Assign a task to all employees that will appear in their portal.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "The title of the task." },
      description: { type: Type.STRING, description: "Detailed description of the task." },
      period: { 
        type: Type.STRING, 
        description: "The time period for the task (Day, Week, or Month).",
        enum: ["Day", "Week", "Month"]
      },
      status: {
        type: Type.STRING,
        description: "The initial status of the task.",
        enum: ["Not Started", "In Progress", "Completed"]
      }
    },
    required: ["title", "description", "period"]
  }
};

const emailFunctionDeclaration: FunctionDeclaration = {
  name: "send_email_to_all",
  description: "Send an email announcement to all employees.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      subject: { type: Type.STRING, description: "Subject of the email." },
      body: { type: Type.STRING, description: "Body content of the email." }
    },
    required: ["subject", "body"]
  }
};

const messageEmployeeFunctionDeclaration: FunctionDeclaration = {
    name: "message_employee",
    description: "Send a direct message to a specific employee.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            employeeId: { type: Type.STRING, description: "The ID of the employee (e.g., '1', '2', '20')." },
            message: { type: Type.STRING, description: "The message content to send." }
        },
        required: ["employeeId", "message"]
    }
};

const scheduleInterviewFunctionDeclaration: FunctionDeclaration = {
  name: "schedule_interview",
  description: "Schedule an interview for a candidate.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      candidateName: { type: Type.STRING, description: "The name of the candidate." },
      date: { type: Type.STRING, description: "Date of interview in YYYY-MM-DD format." },
      time: { type: Type.STRING, description: "Time of interview in HH:MM format." },
      type: { type: Type.STRING, description: "Type of interview (Technical, Behavioral, Screening).", enum: ["Technical", "Behavioral", "Screening"] }
    },
    required: ["candidateName", "date", "time", "type"]
  }
};

export const chatWithAdminTools = async (
  history: { role: 'user' | 'model'; text: string }[],
  currentMessage: string
) => {
    const contents = [
        ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
        { role: 'user', parts: [{ text: currentMessage }] }
    ];

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                tools: [{ functionDeclarations: [
                    taskFunctionDeclaration, 
                    emailFunctionDeclaration, 
                    messageEmployeeFunctionDeclaration,
                    scheduleInterviewFunctionDeclaration 
                ] }],
            }
        });
        
        return {
            text: response.text,
            functionCalls: response.functionCalls,
            candidates: response.candidates // Pass candidates back for context if needed later
        };
    } catch (error) {
        console.error("Admin Tool Error", error);
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
