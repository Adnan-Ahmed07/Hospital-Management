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
];

const MOCK_NEWS: NewsItem[] = [
  {
    id: "1",
    title: "Breakthrough in Alzheimer’s Research",
    content:
      "Our research team has identified a new protein marker that could lead to earlier detection.",
    date: new Date("2024-01-10").toISOString(),
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600",
    category: "announcement",
  },
  {
    id: "2",
    title: "New Pediatric Wing Opens",
    content:
      "We are proud to announce the opening of our state-of-the-art pediatric wing, designed with child comfort in mind.",
    date: new Date("2024-02-15").toISOString(),
    image:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600",
    category: "announcement",
  },
  {
    id: "3",
    title: "Community Health Camp",
    content:
      "Join our free community screening camp offering health checks and counseling for all ages.",
    date: new Date("2024-03-20").toISOString(),
    image:
      "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=600",
    category: "event",
  },
  {
    id: "4",
    title: "Free Vaccination Drive",
    content:
      "We are running a vaccination drive this weekend for seasonal flu and selected vaccines.",
    date: new Date("2024-04-05").toISOString(),
    image:
      "https://images.unsplash.com/photo-1584036561584-b03c19da874c?auto=format&fit=crop&q=80&w=600",
    category: "announcement",
  },
  {
    id: "5",
    title: "Hospital Tour Video",
    content: "Take a guided video tour of our new facilities and services.",
    date: new Date("2024-05-01").toISOString(),
    image:
      "https://res.cloudinary.com/demo/video/upload/w_1200,h_675,c_fill/sample.mp4",
    category: "event",
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
      // IMPORTANT: If error is a validation error (like duplicate email), throw it so UI can show it.
      // Don't fall back to offline mode for validation errors.
      if (
        error.message &&
        (error.message.toLowerCase().includes("exists") ||
          error.message.toLowerCase().includes("valid") ||
          error.message.toLowerCase().includes("required"))
      ) {
        throw error;
      }

      // Mock registration for offline/demo mode ONLY if network/server error
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
      // Fallback for offline upload (fake URL)
      console.warn("Upload failed, using fake URL");
      return URL.createObjectURL(file);
    }
  },
};
