export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  joinDate: string;
  performanceLog: string[];
}

export interface Candidate {
  id: string;
  name: string;
  role: string;
  status: 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Rejected';
  experience: string;
  email: string;
}

export interface Interview {
  id: string;
  candidateId: string;
  date: string;
  time: string;
  interviewer: string;
  type: 'Technical' | 'Behavioral' | 'Screening';
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  RECRUITMENT = 'RECRUITMENT',
  PERFORMANCE = 'PERFORMANCE',
  AUDIT = 'AUDIT',
  CHAT_ASSISTANT = 'CHAT_ASSISTANT',
  LIVE_VOICE = 'LIVE_VOICE'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  groundingMetadata?: {
    search?: { uri: string; title: string }[];
    maps?: { uri: string; title: string }[];
  };
}
