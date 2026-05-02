export type UserRole = 'patient' | 'doctor';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  age?: number;
  gender?: string;
  bloodGroup?: string;
  address?: string;
  degree?: string;
  sharingEnabled?: boolean;
  onboarded?: boolean;
}

export type RecordType = 'prescription' | 'report';

export interface MedicalRecord {
  id: string;
  patientId: string;
  fileURL: string;
  fileName: string;
  type: RecordType;
  createdAt: any;
}

export type ReminderType = 'medication' | 'appointment' | 'general';

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  time: string;
  type: ReminderType;
  completed: boolean;
  createdAt: any;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}
