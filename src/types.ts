import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  bio?: string;
  gender: 'male' | 'female' | 'non-binary' | 'other';
  interestedIn: ('male' | 'female' | 'non-binary' | 'other')[];
  birthDate: string;
  interests?: string[];
  location?: { latitude: number; longitude: number };
  createdAt: Timestamp;
}

export interface Swipe {
  fromUid: string;
  toUid: string;
  type: 'like' | 'pass';
  createdAt: Timestamp;
}

export interface Match {
  id: string;
  users: string[];
  createdAt: Timestamp;
  lastMessage?: string;
  lastMessageAt?: Timestamp;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: Timestamp;
}
