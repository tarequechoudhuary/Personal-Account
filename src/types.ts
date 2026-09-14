export type PaymentType = 'cash' | 'bank' | 'mfs' | 'other';

export interface PaymentSource {
  id: string;
  name: string; // e.g., "নগদ ক্যাশ", "ডাচ-বাংলা ব্যাংক", "বিকাশ"
  type: PaymentType;
  accountNumber?: string; // e.g. "A/C: *4829" or "017XXXXXXXX"
  color: string;
  isDefault?: boolean;
}

export interface ExpenseCategory {
  id: string;
  name: string; // e.g., "ব্যক্তিগত খরচ" (Main) or "মোবাইল রিচার্জ" (Sub)
  icon: string; // lucide icon identifier
  color: string; // badge color hex or tailwind class
  parentId?: string | null; // null/undefined for Main Category (প্রধান খাত); set to parent id for Sub Category (উপ-খাত)
  isDefault?: boolean;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  categoryId: string;
  paymentSourceId: string;
  note?: string;
  createdAt: number;
}

export type LoanType = 'given' | 'taken'; // given = কাউকে ধার দিয়েছি (পাওনা), taken = কারো কাছ থেকে ধার নিয়েছি (দেনা)

export interface LoanPayment {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface LoanRecord {
  id: string;
  personName: string;
  phone?: string;
  type: LoanType;
  amount: number;
  date: string; // YYYY-MM-DD
  dueDate?: string; // YYYY-MM-DD
  paymentSourceId: string;
  note?: string;
  payments: LoanPayment[]; // কিস্তি বা আংশিক পরিশোধের তালিকা
  status: 'pending' | 'partially_paid' | 'paid';
  createdAt: number;
}

export interface UserProfile {
  name: string;
  phone?: string;
  email?: string;
  avatarText?: string;
  notes?: string;
}

export type ActiveTab = 'daily' | 'monthly' | 'loans' | 'banks' | 'categories';
