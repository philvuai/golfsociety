export interface Player {
  id: string;
  name: string;
  email?: string;
  joinedDate: string;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  status: 'upcoming' | 'in-progress' | 'completed';
  players: string[];
  playerCount: number;
  playerFee: number;
  playerGroup1Name?: string;
  playerCount2: number;
  playerFee2: number;
  playerGroup2Name?: string;
  levy1Name?: string;
  levy1Value: number;
  levy2Name?: string;
  levy2Value: number;
  courseFee: number;
  cashInBank: number;
  funds: Funds;
  surplus: number;
  notes: string;
  participants?: EventParticipant[]; // Optional for backward compatibility
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface Funds {
  bankTransfer: number;
  cash: number;
  card: number;
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'viewer';
  isAuthenticated: boolean;
}

export interface Member {
  id: string;
  name: string;
  email?: string;
  handicap?: number;
  phone?: string;
  membershipNumber?: string;
  joinedDate: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventParticipant {
  id: string;
  eventId: string;
  memberId: string;
  memberGroup: 'members' | 'guests';
  paymentStatus: 'paid' | 'unpaid';
  paymentMethod?: 'cash' | 'card' | 'bank_transfer';
  playerFee: number;
  notes?: string;
  member?: Member; // Populated via JOIN
  createdAt?: string;
  updatedAt?: string;
}
