
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
  appliedDate: string;
  notes?: string;
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
  LIVE_VOICE = 'LIVE_VOICE',
  EMPLOYEE_PORTAL = 'EMPLOYEE_PORTAL',
  ADMIN_ASSISTANT = 'ADMIN_ASSISTANT',
  ADMIN_MESSAGES = 'ADMIN_MESSAGES'
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

export type UserRole = 'ADMIN' | 'EMPLOYEE';

export interface Task {
  id: string;
  title: string;
  description: string;
  period: 'Day' | 'Week' | 'Month';
  status: 'Not Started' | 'In Progress' | 'Completed';
}

export interface DirectMessage {
  id: string;
  employeeId: string; // The ID of the employee involved in the chat
  sender: 'ADMIN' | 'EMPLOYEE';
  text: string;
  timestamp: Date;
  isReport?: boolean; // If true, it was sent via the daily report form
  targetsMet?: boolean; // specific to reports
}

export interface DailyReport {
  id: string;
  employeeName: string;
  date: string;
  content: string;
  targetsMet: boolean;
  timestamp: Date;
}
