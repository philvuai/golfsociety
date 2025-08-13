import { Event, User, Member, EventParticipant } from '../types';

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

  // Members - Admin only
  async getMembers(): Promise<Member[]> {
    const response = await this.makeRequest('/members');
    return response.members;
  }

  async getMember(memberId: string): Promise<Member> {
    const response = await this.makeRequest(`/members?id=${memberId}`);
    return response.member;
  }

  async createMember(memberData: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>): Promise<Member> {
    const response = await this.makeRequest('/members', {
      method: 'POST',
      body: JSON.stringify(memberData),
    });
    return response.member;
  }

  async updateMember(member: Member): Promise<Member> {
    const response = await this.makeRequest('/members', {
      method: 'PUT',
      body: JSON.stringify(member),
    });
    return response.member;
  }

  async deleteMember(memberId: string): Promise<Member> {
    const response = await this.makeRequest(`/members?id=${memberId}`, {
      method: 'DELETE',
    });
    return response.member;
  }

  // Event Participants - Admin only
  async getEventParticipants(eventId: string): Promise<EventParticipant[]> {
    const response = await this.makeRequest(`/event-participants?eventId=${eventId}`);
    return response.participants;
  }

  async addParticipantToEvent(
    eventId: string, 
    memberId: string, 
    participantData: Partial<Pick<EventParticipant, 'memberGroup' | 'paymentStatus' | 'paymentMethod' | 'playerFee' | 'notes'>>
  ): Promise<EventParticipant> {
    const response = await this.makeRequest('/event-participants', {
      method: 'POST',
      body: JSON.stringify({ eventId, memberId, ...participantData }),
    });
    return response.participant;
  }

  // Alias for backward compatibility and cleaner naming
  async createEventParticipant(
    participantData: Omit<EventParticipant, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<EventParticipant> {
    return this.addParticipantToEvent(
      participantData.eventId,
      participantData.memberId,
      {
        memberGroup: participantData.memberGroup,
        paymentStatus: participantData.paymentStatus,
        paymentMethod: participantData.paymentMethod,
        playerFee: participantData.playerFee,
        notes: participantData.notes
      }
    );
  }

  async updateParticipant(
    participantId: string,
    updates: Partial<Pick<EventParticipant, 'memberGroup' | 'paymentStatus' | 'paymentMethod' | 'playerFee' | 'notes'>>
  ): Promise<EventParticipant> {
    const response = await this.makeRequest('/event-participants', {
      method: 'PUT',
      body: JSON.stringify({ participantId, ...updates }),
    });
    return response.participant;
  }

  // Alias for cleaner naming
  async updateEventParticipant(participant: EventParticipant): Promise<EventParticipant> {
    return this.updateParticipant(participant.id, {
      memberGroup: participant.memberGroup,
      paymentStatus: participant.paymentStatus,
      paymentMethod: participant.paymentMethod,
      playerFee: participant.playerFee,
      notes: participant.notes
    });
  }

  async removeParticipantFromEvent(eventId: string, memberId: string): Promise<EventParticipant> {
    const response = await this.makeRequest(`/event-participants?eventId=${eventId}&memberId=${memberId}`, {
      method: 'DELETE',
    });
    return response.participant;
  }

  // Alias for cleaner naming
  async deleteEventParticipant(participantId: string): Promise<EventParticipant> {
    const response = await this.makeRequest(`/event-participants?id=${participantId}`, {
      method: 'DELETE',
    });
    return response.participant;
  }
}

export const apiService = new ApiService();
export { ApiError };
