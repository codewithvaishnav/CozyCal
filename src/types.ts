export interface HistoryItem {
  action: string;
  timestamp: string;
  oldValue: string | null;
  newValue: string | null;
}

export interface Booking {
  id: string;
  customerName: string;
  phone: string;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  totalAmount: number;
  advanceAmount: number;
  remainingAmount: number;
  receivedBy: string;
  status: 'Inquiry' | 'Confirmed' | 'Completed' | 'Cancelled';
  notes: string;
  bookingSource?: string;
  checkInTime?: string;
  checkOutTime?: string;
  numberOfPeople?: number;
  stayType?: 'Day outing' | 'Night stay';
  history: HistoryItem[];
  createdAt: string;
  updatedAt: string;
  isDeletedByClient?: boolean;
}

export interface Member {
  uid: string;
  fullName: string;
  email: string;
  createdAt: string;
  isManager?:boolean;
}
