import { User, Doctor, Appointment, NewsItem } from "../types";

// Use relative path to leverage the Vite proxy defined in vite.config.ts
const API_URL = "/api";
const REQUEST_TIMEOUT_MS = 8000; // Increased timeout for better reliability

// --- MOCK DATA FOR FALLBACKS ---
const MOCK_DOCTORS: Doctor[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    email: "sarah@hospital.com",
    specialization: "Cardiology",
    image:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300",
    availability: ["Mon", "Wed", "Fri"],
    experience: 12,
    description:
      "Expert cardiologist with over a decade of experience in treating complex heart conditions.",
  },
  {
    id: "2",
    name: "Dr. Michael Chen",
    email: "michael@hospital.com",
    specialization: "Neurology",
    image:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&h=300",
    availability: ["Tue", "Thu"],
    experience: 8,
    description:
      "Specializes in neurological disorders and stroke rehabilitation.",
  },
  {
    id: "3",
    name: "Dr. Emily Williams",
    email: "emily@hospital.com",
    specialization: "Pediatrics",
    image:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=300&h=300",
    availability: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    experience: 15,
    description:
      "Dedicated to providing compassionate care for children of all ages.",
  },
  {
    id: "4",
    name: "Dr. Aisha Rahman",
    email: "aisha@hospital.com",
    specialization: "Dermatology",
    image:
      "https://images.unsplash.com/photo-1502791451861-8a5fbb0f8f50?auto=format&fit=crop&q=80&w=300&h=300",
    availability: ["Mon", "Thu"],
    experience: 7,
    description:
      "Board-certified dermatologist focusing on medical and cosmetic skin care.",
  },
  {
    id: "5",
    name: "Dr. Luis Alvarez",
    email: "luis@hospital.com",
    specialization: "Orthopedics",
    image:
      "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&q=80&w=300&h=300",
    availability: ["Tue", "Wed"],
    experience: 11,
    description:
      "Experienced orthopedic surgeon specializing in sports injuries and joint replacement.",
  },
  {
    id: "6",
    name: "Dr. Priya Kapoor",
    email: "priya@hospital.com",
    specialization: "Endocrinology",
    image:
      "https://images.unsplash.com/photo-1542736667-069246bdbc19?auto=format&fit=crop&q=80&w=300&h=300",
    availability: ["Wed", "Fri"],
    experience: 9,
    description:
      "Endocrinologist with a focus on diabetes management and thyroid disorders.",
  },
  {
    id: "7",
    name: "Dr. Daniel Okafor",
    email: "daniel@hospital.com",
    specialization: "Psychiatry",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=300&h=300",
    availability: ["Mon", "Tue", "Thu"],
    experience: 14,
    description:
      "Provides evidence-based psychiatric care for adolescents and adults.",
  },
  {
    id: "8",
    name: "Dr. Elena Petrova",
    email: "elena@hospital.com",
    specialization: "Oncology",
    image:
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=300&h=300",
    availability: ["Tue", "Thu", "Fri"],
    experience: 18,
    description:
      "Medical oncologist with expertise in precision therapies and clinical trials.",
  },
  {
    id: "9",
    name: "Dr. Omar Farouk",
    email: "omar@hospital.com",
    specialization: "Gastroenterology",
    image:
      "https://images.unsplash.com/photo-1521790945508-bf2a36314e85?auto=format&fit=crop&q=80&w=300&h=300",
    availability: ["Mon", "Fri"],
    experience: 10,
    description:
      "Specialist in GI disorders, endoscopy, and liver disease management.",
  },
  {
    id: "10",
    name: "Dr. Mei Lin",
    email: "mei@hospital.com",
    specialization: "Ophthalmology",
    image:
      "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300&h=300",
    availability: ["Wed", "Thu"],
    experience: 6,
    description:
      "Ophthalmologist providing comprehensive eye care and minor surgical procedures.",
  },
];

const MOCK_NEWS: NewsItem[] = [
  {
    id: "1",
    title: "Breakthrough in Alzheimer’s Research",
    content:
      "Our research team has identified a new protein marker that could lead to earlier detection.",
    date: new Date("2023-11-15").toISOString(),
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600",
    category: "announcement",
  },
  {
    id: "2",
    title: "New Pediatric Wing Opens",
    content:
      "We are proud to announce the opening of our state-of-the-art pediatric wing, designed with child comfort in mind.",
    date: new Date("2023-12-01").toISOString(),
    image:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600",
    category: "announcement",
  },
];

// --- REQUEST HANDLER ---
const request = async (endpoint: string, options: RequestInit = {}) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as any),
  };
  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  // AbortController for timeout
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    // Ensure we don't double slash if endpoint starts with /
    const url = `${API_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(id);

    if (!response.ok) {
      // Read text once to avoid "body stream already read" error
      const text = await response.text();
      let errorInfo = text;
      try {
        const json = JSON.parse(text);
        errorInfo = json.message || json.error || JSON.stringify(json);
      } catch (e) {
        if (
          text.trim().startsWith("<!DOCTYPE html>") ||
          text.trim().startsWith("<html")
        ) {
          errorInfo = `Server Error (${response.status})`;
        }
      }
      throw new Error(
        errorInfo || `API Error: ${response.status} ${response.statusText}`
      );
    }

    if (response.status === 204) return null;

    const text = await response.text();
    try {
      return text ? JSON.parse(text) : {};
    } catch (e) {
      console.warn("Response was not JSON:", text.substring(0, 50));
      return {};
    }
  } catch (error: any) {
    clearTimeout(id);

    if (error.name === "AbortError") {
      // console.warn('Request timed out, switching to offline mode');
      throw new Error("Request timed out");
    }
    // console.warn(`Request failed for ${endpoint}:`, error.message);
    throw error;
  }
};

export const authApi = {
  login: async (
    email: string,
    password: string
  ): Promise<{ user: User; token: string }> => {
    // 1. Bypass network for Demo Credentials to ensure instant login
    if (email === "admin@medicare.com" && password === "admin123") {
      await new Promise((r) => setTimeout(r, 600)); // Fake delay for UX
      return {
        user: { id: "admin", name: "Admin User", email, role: "admin" },
        token: "mock-admin-token",
      };
    }
    if (email === "patient@test.com" && password === "patient123") {
      await new Promise((r) => setTimeout(r, 600)); // Fake delay for UX
      return {
        user: { id: "patient", name: "John Doe", email, role: "patient" },
        token: "mock-patient-token",
      };
    }
    if (email === "sarah@hospital.com" && password === "doctor123") {
      await new Promise((r) => setTimeout(r, 600)); // Fake delay for UX
      return {
        user: { id: "doc1", name: "Dr. Sarah Johnson", email, role: "doctor" },
        token: "mock-doctor-token",
      };
    }

    // 2. Try actual network request
    try {
      return await request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
    } catch (error) {
      throw error;
    }
  },

  register: async (
    name: string,
    email: string,
    password: string
  ): Promise<{ user: User; token: string }> => {
    try {
      return await request("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
    } catch (error: any) {
      if (
        error.message &&
        (error.message.toLowerCase().includes("exists") ||
          error.message.toLowerCase().includes("valid") ||
          error.message.toLowerCase().includes("required"))
      ) {
        throw error;
      }

      console.warn(
        "Registration failed (network/server error), using offline fallback"
      );
      const mockUser = {
        id: "mock-user-" + Date.now(),
        name,
        email,
        role: "patient" as const,
      };
      return { user: mockUser, token: "mock-token-" + Date.now() };
    }
  },
};

export const doctorApi = {
  getAll: async (filters?: { email?: string }): Promise<Doctor[]> => {
    try {
      let query = "";
      if (filters?.email) query = `?email=${encodeURIComponent(filters.email)}`;
      return await request(`/doctors${query}`);
    } catch (error) {
      console.warn("Using offline doctor data");
      let docs = MOCK_DOCTORS;
      if (filters?.email) {
        docs = docs.filter((d) => d.email === filters.email);
      }
      return docs;
    }
  },

  getById: async (id: string): Promise<Doctor> => {
    try {
      return await request(`/doctors/${id}`);
    } catch (error) {
      const doc = MOCK_DOCTORS.find((d) => d.id === id);
      if (doc) return doc;
      throw error;
    }
  },

  create: async (doctor: Omit<Doctor, "id">): Promise<Doctor> => {
    return request("/doctors", {
      method: "POST",
      body: JSON.stringify(doctor),
    });
  },

  update: async (id: string, updates: Partial<Doctor>): Promise<Doctor> => {
    return request(`/doctors/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  delete: async (id: string): Promise<void> => {
    return request(`/doctors/${id}`, { method: "DELETE" });
  },
};

export const appointmentApi = {
  create: async (
    data: Omit<Appointment, "id" | "status" | "createdAt">
  ): Promise<Appointment> => {
    try {
      return await request("/appointments", {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      // Mock success for offline mode
      return {
        id: "mock-appt-" + Date.now(),
        ...data,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
    }
  },

  // FEATURE 1: AI Scheduling
  getAiSchedule: async (
    doctorId: string,
    date: string
  ): Promise<{ recommendedSlot: string; reason: string }> => {
    try {
      const res = await request("/appointments/ai-schedule", {
        method: "POST",
        body: JSON.stringify({ doctorId, date }),
      });
      return res; // Returns { recommendedSlot: "10:00", reason: "..." }
    } catch (error) {
      // Fallback Heuristic if server offline
      return {
        recommendedSlot: "10:00",
        reason: "AI Service Offline (Fallback)",
      };
    }
  },

  // FEATURE 2: Telemedicine
  generateMeetingLink: async (appointmentId: string): Promise<string> => {
    try {
      const res = await request(`/appointments/${appointmentId}/telemedicine`, {
        method: "POST",
      });
      return res.link;
    } catch (error) {
      return `https://meet.jit.si/ADH-${appointmentId}`;
    }
  },

  // FEATURE 5: FHIR Compatibility
  getFhirData: async (email: string): Promise<any> => {
    try {
      return await request(`/patients/${email}/fhir`);
    } catch (error) {
      return { resourceType: "Bundle", type: "document", entry: [] };
    }
  },

  getAll: async (filters?: {
    patientEmail?: string;
    doctorId?: string;
  }): Promise<Appointment[]> => {
    try {
      const params = new URLSearchParams();
      if (filters?.patientEmail)
        params.append("patientEmail", filters.patientEmail);
      if (filters?.doctorId) params.append("doctorId", filters.doctorId);
      const queryString = params.toString();
      return await request(
        `/appointments${queryString ? "?" + queryString : ""}`
      );
    } catch (error) {
      return [];
    }
  },

  getBookedSlots: async (doctorId: string, date: string): Promise<string[]> => {
    try {
      return await request(
        `/appointments/booked-slots?doctorId=${doctorId}&date=${date}`
      );
    } catch (error) {
      return []; // Return no booked slots if offline
    }
  },

  updateStatus: async (
    id: string,
    status: Appointment["status"]
  ): Promise<void> => {
    return request(`/appointments/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },

  markAsRead: async (id: string): Promise<void> => {
    return request(`/appointments/${id}`, {
      method: "PUT",
      body: JSON.stringify({ isRead: true }),
    });
  },
};

export const newsApi = {
  getAll: async (): Promise<NewsItem[]> => {
    try {
      return await request("/news");
    } catch (error) {
      console.warn("Using offline news data");
      return MOCK_NEWS;
    }
  },

  create: async (news: Omit<NewsItem, "id">): Promise<NewsItem> => {
    return request("/news", {
      method: "POST",
      body: JSON.stringify(news),
    });
  },

  update: async (id: string, updates: Partial<NewsItem>): Promise<NewsItem> => {
    return request(`/news/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  delete: async (id: string): Promise<void> => {
    return request(`/news/${id}`, { method: "DELETE" });
  },
};

export const uploadApi = {
  uploadFile: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await request("/upload", {
        method: "POST",
        body: formData,
      });
      return response.url;
    } catch (error) {
      console.warn("Upload failed, using fake URL");
      return URL.createObjectURL(file);
    }
  },
};
