import { Event, User } from '../types';

const API_BASE = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8888/.netlify/functions' 
  : '/.netlify/functions';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiService {
  private user: User | null = null;

  setUser(user: User | null) {
    this.user = user;
  }

  private getAuthHeaders(): Record<string, string> {
    if (!this.user) {
      return {};
    }
    
    return {
      'Authorization': `Bearer ${JSON.stringify({
        id: this.user.id,
        username: this.user.username,
        role: this.user.role
      })}`
    };
  }

  private async makeRequest(url: string, options: RequestInit = {}) {
    const authHeaders = this.getAuthHeaders();
    const baseHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...authHeaders,
    };
    
    const finalHeaders = {
      ...baseHeaders,
      ...(options.headers as Record<string, string> || {}),
    };

    const response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: finalHeaders,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(response.status, errorData.error || 'Network error');
    }

    return response.json();
  }

  // Authentication
  async login(username: string, password: string): Promise<User> {
    const response = await this.makeRequest('/auth', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (response.success) {
      this.setUser(response.user);
      return response.user;
    }

    throw new Error('Login failed');
  }

  // Events
  async getEvents(): Promise<Event[]> {
    const response = await this.makeRequest('/events');
    return response.events;
  }

  async createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Event> {
    const response = await this.makeRequest('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
    return response.event;
  }

  async updateEvent(event: Event): Promise<Event> {
    const response = await this.makeRequest('/events', {
      method: 'PUT',
      body: JSON.stringify(event),
    });
    return response.event;
  }

  async deleteEvent(eventId: string): Promise<Event> {
    const response = await this.makeRequest(`/events?id=${eventId}`, {
      method: 'DELETE',
    });
    return response.event;
  }
}

export const apiService = new ApiService();
export { ApiError };
