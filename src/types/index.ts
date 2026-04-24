export interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  status: 'upcoming' | 'in-progress' | 'completed';
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
  participants?: EventParticipant[];
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
  member?: Member;
  createdAt?: string;
  updatedAt?: string;
}

export interface Scorecard {
  id: string;
  eventId: string;
  memberId: string;
  score?: number;
  stablefordPoints?: number;
  handicapAtTime?: number;
  nearestPin: boolean;
  longestDrive: boolean;
  position?: number;
  notes?: string;
  member?: Member;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeaderboardEntry {
  memberId: string;
  memberName: string;
  eventsPlayed: number;
  totalPoints: number;
  avgScore: number | null;
  bestPosition: number | null;
  ntpCount: number;
  ldCount: number;
}
