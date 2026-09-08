export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role?: string;
  createdAt: string;
}

export interface DailyMessage {
  id: string;
  message: string;
  category: string;
  active: boolean;
  usedDate?: string;
  createdAt: string;
}

export interface Draw {
  id: string;
  title: string;
  description: string;
  type: 'WEEKLY' | 'MONTHLY' | 'SPECIAL';
  startDate: string;
  endDate: string;
  drawDate: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CLOSED';
  prizeTitle: string;
  prizeDescription: string;
  prizeImage: string;
  entryPriceINR: number;
  participantsCount?: number;
  userHasEntered?: boolean;
  userEntry?: Entry;
  winner?: Winner;
  createdAt: string;
}

export interface Entry {
  id: string;
  userId: string;
  drawId: string;
  referenceCode: string;
  status: string;
  paymentMode: string;
  createdAt: string;
  draw?: Draw;
  user?: User;
}

export interface Winner {
  id: string;
  drawId: string;
  entryId: string;
  userId: string;
  selectedAt: string;
  announcementNote?: string;
  user?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  draw?: Draw;
}

export interface Memory {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  drawId?: string;
  winnerName?: string;
  draw?: {
    id: string;
    title: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}
