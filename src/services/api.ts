// API service for backend communication
import { getUserData, setUserData, removeUserData } from '../utils/indexedDB';
import { Item, Price } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  type: 'guest' | 'google';
  created_at: string;
  updated_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserResponse {
  user: User;
  token: Token;
}

export interface UserCreate {
  name: string;
  email?: string;
  type: 'guest';
}

class ApiService {
  private token: string | null = null;

  constructor() {
    this.loadToken();
  }

  private async loadToken() {
    try {
      const userData = await getUserData();
      if (userData && userData.token) {
        this.token = userData.token.access_token;
      }
    } catch (error) {
      console.error('Failed to load token:', error);
    }
  }

  private async saveUserData(userResponse: UserResponse) {
    try {
      await setUserData({
        user: userResponse.user,
        token: userResponse.token
      });
      this.token = userResponse.token.access_token;
    } catch (error) {
      console.error('Failed to save user data:', error);
    }
  }

  private async clearUserData() {
    try {
      await removeUserData();
      this.token = null;
    } catch (error) {
      console.error('Failed to clear user data:', error);
    }
  }

  private getHeaders(method: string = 'GET'): HeadersInit {
    const headers: HeadersInit = {};

    // Only add Content-Type for requests that need it
    if (method !== 'GET' && method !== 'HEAD') {
      headers['Content-Type'] = 'application/json';
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (e) {
          // Use default error message
        }
      }
      
      throw new Error(errorMessage);
    }

    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    
    return response.text() as any;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    skipRetry: boolean = false
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(options.method || 'GET'),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      if (response.status === 401 && !skipRetry && this.token) {
        console.log('Received 401, attempting token refresh...');
        try {
          await this.refreshToken();
          // Retry the request with new token
          return this.request<T>(endpoint, options, true);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          await this.clearUserData();
          throw new Error('Session expired. Please login again.');
        }
      }
      
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Authentication APIs
  async loginAsGuest(userData: UserCreate): Promise<UserResponse> {
    const response = await this.request<UserResponse>('/api/auth/guest', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    await this.saveUserData(response);
    return response;
  }

  async getGoogleAuthUrl(): Promise<{ auth_url: string }> {
    return this.request<{ auth_url: string }>('/api/auth/google');
  }

  async handleGoogleCallback(code: string): Promise<UserResponse> {
    const response = await this.request<UserResponse>('/api/auth/google/callback', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });

    await this.saveUserData(response);
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      await this.clearUserData();
    }
  }

  async refreshToken(): Promise<Token> {
    const response = await this.request<Token>('/api/auth/refresh', {
      method: 'POST',
    });

    // Update stored token
    try {
      const userData = await getUserData();
      if (userData) {
        userData.token = response;
        await setUserData(userData);
        this.token = response.access_token;
      }
    } catch (error) {
      console.error('Failed to update token:', error);
    }

    return response;
  }

  // User APIs
  async getCurrentUser(): Promise<User> {
    return this.request<User>('/api/users/me');
  }

  async updateUser(updates: Partial<User>): Promise<User> {
    return this.request<User>('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteUser(): Promise<ApiResponse> {
    const response = await this.request<ApiResponse>('/api/users/me', {
      method: 'DELETE',
    });

    await this.clearUserData();
    return response;
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.request<ApiResponse>('/health');
  }

  // Get public configuration
  async getConfig(): Promise<any> {
    return this.request('/api/config');
  }

  // Token management
  setToken(token: string) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken() {
    this.token = null;
  }

  // Items APIs (for authenticated users)
  async getItems(): Promise<Item[]> {
    return this.request<Item[]>('/api/items');
  }

  async createItem(item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Promise<Item> {
    return this.request<Item>('/api/items', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async updateItem(id: string, updates: Partial<Omit<Item, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Item> {
    return this.request<Item>(`/api/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteItem(id: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/api/items/${id}`, {
      method: 'DELETE',
    });
  }

  async reorderItems(items: { id: string; order: number }[]): Promise<ApiResponse> {
    return this.request<ApiResponse>('/api/items/reorder', {
      method: 'PUT',
      body: JSON.stringify({ items }),
    });
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;