export type Role = 'admin' | 'doctor' | 'patient';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  token?: string;
}

export interface Doctor {
  id: string;
  name: string;
  email: string; // Added to link with User login
  specialization: string;
  image: string;
  availability: string[];
  experience: number; // years
  description: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  date: string; // ISO string
  status: 'pending' | 'confirmed' | 'cancelled';
  symptoms: string;
  createdAt: string;
  isRead?: boolean; // For patient notifications
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  image: string;
  category: 'announcement' | 'health-tip' | 'event';
}