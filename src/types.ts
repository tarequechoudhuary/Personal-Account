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

export interface IncomeCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Income {
  id: string;
  title: string; // যেমন: "মার্চের বেতন", "দোকানের বিক্রি", "ফ্রিল্যান্সিং"
  amount: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  categoryId: string; // e.g. inc-cat-salary
  paymentSourceId: string; // কোন অ্যাকাউন্টে টাকা জমা হয়েছে (ক্যাশ / ব্যাংক / বিকাশ)
  note?: string;
  createdAt: number;
}

export type LoanType = 'given' | 'taken'; // given = কাউকে ধার দিয়েছি (পাওনা), taken = কারো কাছ থেকে ধার নিয়েছি (দেনা)

export interface LoanPayment {
  id: string;
  amount: number;
  date: string;
  paymentSourceId?: string; // কোন ব্যাংক বা ক্যাশে পরিশোধ/জমা হয়েছে
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

export type TransferType =
  | 'bank_to_bank' // এক ব্যাংক থেকে অন্য ব্যাংক
  | 'withdraw_cash' // ব্যাংক থেকে ক্যাশ উত্তোলন
  | 'deposit_cash' // ক্যাশ থেকে ব্যাংকে জমা
  | 'mfs_transfer' // ব্যাংক টু বিকাশ/নগদ
  | 'transfer'; // সাধারণ স্থানান্তর

export interface AccountTransfer {
  id: string;
  fromSourceId: string; // যে একাউন্ট থেকে টাকা কাটা হবে (e.g. ব্যাংক)
  toSourceId: string; // যে একাউন্টে টাকা যোগ হবে (e.g. ক্যাশ / অন্য ব্যাংক)
  amount: number; // স্থানান্তরিত পরিমাণ (টাকা)
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  transferType?: TransferType;
  note?: string; // নোট (যেমন: "ATM বুথ থেকে ক্যাশ উত্তোলন")
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
