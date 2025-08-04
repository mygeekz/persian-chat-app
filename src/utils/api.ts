import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('agent_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('agent_token');
          window.location.href = '/login';
          return { success: false, error: 'غیر مجاز' };
        }
        return { success: false, error: data.error || 'خطای سرور' };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'خطای شبکه' };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      toast.error('خطای ارتباط با سرور');
      return { success: false, error: 'خطای شبکه' };
    }
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: data ? JSON.stringify(data) : undefined
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      toast.error('خطای ارتباط با سرور');
      return { success: false, error: 'خطای شبکه' };
    }
  }

  async put<T>(endpoint:string, data?: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: data ? JSON.stringify(data) : undefined
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      toast.error('خطای ارتباط با سرور');
      return { success: false, error: 'خطای شبکه' };
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      toast.error('خطای ارتباط با سرور');
      return { success: false, error: 'خطای شبکه' };
    }
  }

  async upload<T>(endpoint: string, file: File): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('agent_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      toast.error('خطای ارتباط با سرور');
      return { success: false, error: 'خطای شبکه' };
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

import { User, ChatMessage, Task, FileItem } from '@/context/AppContext';

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<{ token: string; user: User }>('/auth/login', { email, password }),

  getProfile: () =>
    apiClient.get<User>('/auth/me'),
  
  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, password: string) =>
    apiClient.post('/auth/reset-password', { token, password }),
  
  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.post('/auth/change-password', { currentPassword, newPassword }),
  
  regenerateApiKey: () =>
    apiClient.post<{ apiKey: string }>('/auth/regen-key')
};

// Chat API
export const chatApi = {
  sendMessage: (message: string) =>
    apiClient.post<{ response: string; source: string }>('/chat', { message }),
  
  getHistory: () =>
    apiClient.get<ChatMessage[]>('/chat/history')
};

// Tasks API
export const tasksApi = {
  getTasks: () =>
    apiClient.get<Task[]>('/tasks'),
  
  createTask: (task: { title: string; description: string; status: string }) =>
    apiClient.post<Task>('/tasks', task),
  
  updateTask: (id: string, task: Partial<Task>) =>
    apiClient.put<Task>(`/tasks/${id}`, task),
  
  deleteTask: (id: string) =>
    apiClient.delete(`/tasks/${id}`)
};

// Files API
export const filesApi = {
  getFiles: () =>
    apiClient.get<FileItem[]>('/files'),
  
  uploadFile: (file: File) =>
    apiClient.upload<FileItem>('/files/upload', file),
  
  deleteFile: (id: string) =>
    apiClient.delete(`/files/${id}`)
};