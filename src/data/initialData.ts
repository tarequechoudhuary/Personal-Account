import { ExpenseCategory, PaymentSource, Expense, LoanRecord, UserProfile } from '../types';
import { getCurrentDateString } from '../utils/formatters';

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'তারেক চৌধুরী',
  phone: '০১৭১২৩৪৫৬৭৮',
  email: 'tareque@example.com',
  avatarText: 'তা',
  notes: 'ব্যক্তিগত ও পরিবারের খরচের হিসাব খাতা',
};

export const DEFAULT_CATEGORIES: ExpenseCategory[] = [
  // --- প্রধান খাত ১: ব্যক্তিগত খরচ ---
  {
    id: 'cat-main-personal',
    name: 'ব্যক্তিগত খরচ',
    icon: 'User',
    color: '#3b82f6', // Blue
    parentId: null,
    isDefault: true,
  },
  {
    id: 'cat-sub-mobile',
    name: 'মোবাইল রিচার্জ ও ইন্টারনেট',
    icon: 'Smartphone',
    color: '#06b6d4', // Cyan
    parentId: 'cat-main-personal',
    isDefault: true,
  },
  {
    id: 'cat-sub-food',
    name: 'খাওয়া-দাওয়া ও নাস্তা',
    icon: 'Utensils',
    color: '#f97316', // Orange
    parentId: 'cat-main-personal',
    isDefault: true,
  },
  {
    id: 'cat-sub-transport',
    name: 'যাতায়াত ও ভাড়া',
    icon: 'Bus',
    color: '#3b82f6', // Blue
    parentId: 'cat-main-personal',
    isDefault: true,
  },
  {
    id: 'cat-sub-pocket',
    name: 'ব্যক্তিগত হাতখরচ ও শপিং',
    icon: 'ShoppingBag',
    color: '#ec4899', // Pink
    parentId: 'cat-main-personal',
    isDefault: true,
  },
  {
    id: 'cat-sub-leisure',
    name: 'বিনোদন ও আড্ডা',
    icon: 'Coffee',
    color: '#f59e0b', // Amber
    parentId: 'cat-main-personal',
    isDefault: true,
  },

  // --- প্রধান খাত ২: ফ্যামিলির খরচ ---
  {
    id: 'cat-main-family',
    name: 'ফ্যামিলির খরচ',
    icon: 'Users',
    color: '#10b981', // Emerald
    parentId: null,
    isDefault: true,
  },
  {
    id: 'cat-sub-grocery',
    name: 'কাঁচাবাজার ও সদাই',
    icon: 'ShoppingCart',
    color: '#10b981', // Emerald
    parentId: 'cat-main-family',
    isDefault: true,
  },
  {
    id: 'cat-sub-rent',
    name: 'বাসা ভাড়া',
    icon: 'Home',
    color: '#8b5cf6', // Purple
    parentId: 'cat-main-family',
    isDefault: true,
  },
  {
    id: 'cat-sub-utility',
    name: 'বিদ্যুৎ, গ্যাস ও ইউটিলিটি',
    icon: 'Zap',
    color: '#eab308', // Yellow
    parentId: 'cat-main-family',
    isDefault: true,
  },
  {
    id: 'cat-sub-health',
    name: 'চিকিৎসা ও ওষুধ',
    icon: 'HeartPulse',
    color: '#ef4444', // Red
    parentId: 'cat-main-family',
    isDefault: true,
  },
  {
    id: 'cat-sub-education',
    name: 'সন্তানদের পড়াশোনা ও ফি',
    icon: 'GraduationCap',
    color: '#6366f1', // Indigo
    parentId: 'cat-main-family',
    isDefault: true,
  },

  // --- প্রধান খাত ৩: অন্যান্য খরচ ---
  {
    id: 'cat-main-others',
    name: 'অন্যান্য আনুষঙ্গিক খরচ',
    icon: 'CircleDot',
    color: '#64748b', // Slate
    parentId: null,
    isDefault: true,
  },
  {
    id: 'cat-sub-gift',
    name: 'উপহার ও দান-সদকা',
    icon: 'Gift',
    color: '#ec4899', // Pink
    parentId: 'cat-main-others',
    isDefault: true,
  },
  {
    id: 'cat-sub-other',
    name: 'বিবিধ অপ্রত্যাশিত খরচ',
    icon: 'CircleDot',
    color: '#64748b', // Slate
    parentId: 'cat-main-others',
    isDefault: true,
  },
];

export const DEFAULT_PAYMENT_SOURCES: PaymentSource[] = [
  {
    id: 'src-cash',
    name: 'নগদ ক্যাশ (Cash)',
    type: 'cash',
    accountNumber: 'পকেটের নগদ টাকা',
    color: '#16a34a', // Green
    isDefault: true,
  },
  {
    id: 'src-bkash',
    name: 'বিকাশ (bKash)',
    type: 'mfs',
    accountNumber: '০১৭১***',
    color: '#e11d48', // Crimson Pink
    isDefault: true,
  },
  {
    id: 'src-dbbl',
    name: 'ডাচ-বাংলা ব্যাংক (DBBL)',
    type: 'bank',
    accountNumber: 'A/C: ****5678',
    color: '#0284c7', // Sky blue
    isDefault: true,
  },
  {
    id: 'src-brac',
    name: 'ব্র্যাক ব্যাংক (BRAC Bank)',
    type: 'bank',
    accountNumber: 'A/C: ****1234',
    color: '#4338ca', // Indigo
    isDefault: true,
  },
];

export const getInitialExpenses = (): Expense[] => {
  const today = getCurrentDateString();
  const [yearStr, monthStr] = today.split('-');
  const y = yearStr;
  const m = monthStr;
  
  return [
    {
      id: 'exp-1',
      title: 'সকালের নাস্তা ও চা',
      amount: 120,
      date: today,
      time: '08:45',
      categoryId: 'cat-sub-food',
      paymentSourceId: 'src-cash',
      note: 'পরোটা, ডিম ও চা',
      createdAt: Date.now() - 3600000 * 5,
    },
    {
      id: 'exp-2',
      title: 'সিএনজি ও বাস ভাড়া',
      amount: 250,
      date: today,
      time: '10:15',
      categoryId: 'cat-sub-transport',
      paymentSourceId: 'src-cash',
      note: 'অফিসে যাওয়ার ভাড়া',
      createdAt: Date.now() - 3600000 * 3,
    },
    {
      id: 'exp-3',
      title: 'দৈনিক কাঁচাবাজার সদাই',
      amount: 850,
      date: today,
      time: '18:30',
      categoryId: 'cat-sub-grocery',
      paymentSourceId: 'src-bkash',
      note: 'মাছ, শাকসবজি ও ডিম',
      createdAt: Date.now() - 3600000,
    },
    {
      id: 'exp-4',
      title: 'মোবাইল রিচার্জ ও ইন্টারনেট প্যাক',
      amount: 499,
      date: `${y}-${m}-05`,
      time: '11:20',
      categoryId: 'cat-sub-mobile',
      paymentSourceId: 'src-bkash',
      note: 'মাসিক ডাটা ও টকটাইম প্যাক',
      createdAt: Date.now() - 86400000 * 5,
    },
    {
      id: 'exp-5',
      title: 'ওষুধ কেনা',
      amount: 650,
      date: `${y}-${m}-08`,
      time: '19:40',
      categoryId: 'cat-sub-health',
      paymentSourceId: 'src-cash',
      note: 'প্রেসার ও গ্যাস্ট্রিকের ওষুধ',
      createdAt: Date.now() - 86400000 * 4,
    },
    {
      id: 'exp-6',
      title: 'সুপারশপ গ্রোসারি কেনাকাটা',
      amount: 3450,
      date: `${y}-${m}-10`,
      time: '17:15',
      categoryId: 'cat-sub-grocery',
      paymentSourceId: 'src-dbbl',
      note: 'তেল, চাল, মসলা ইত্যাদি কার্ডে পেমেন্ট',
      createdAt: Date.now() - 86400000 * 3,
    },
    {
      id: 'exp-7',
      title: 'বাড়ি ভাড়া প্রদান',
      amount: 16000,
      date: `${y}-${m}-02`,
      time: '14:00',
      categoryId: 'cat-sub-rent',
      paymentSourceId: 'src-brac',
      note: 'ব্যাংক ট্রান্সফারের মাধ্যমে বাড়ি ভাড়া',
      createdAt: Date.now() - 86400000 * 8,
    },
    {
      id: 'exp-8',
      title: 'বিদ্যুৎ বিল পরিশোধ',
      amount: 1850,
      date: `${y}-${m}-06`,
      time: '16:20',
      categoryId: 'cat-sub-utility',
      paymentSourceId: 'src-bkash',
      note: 'ডেসকো পোস্টপেইড বিদ্যুৎ বিল',
      createdAt: Date.now() - 86400000 * 7,
    },
  ];
};

export const getInitialLoans = (): LoanRecord[] => {
  const today = getCurrentDateString();
  const [y, m] = today.split('-');
  return [
    {
      id: 'loan-1',
      personName: 'রহিম সাহেব (বন্ধু)',
      phone: '০১৭২২৩৩৪৪৫৫',
      type: 'given', // কাউকে ধার দিয়েছি (পাবো)
      amount: 5000,
      date: `${y}-${m}-05`,
      dueDate: `${y}-${m}-28`,
      paymentSourceId: 'src-bkash',
      note: 'জরুরি প্রয়োজনে ধার দেওয়া হয়েছিল',
      payments: [
        {
          id: 'pay-1',
          amount: 2000,
          date: `${y}-${m}-12`,
          note: 'বিকাশে ২০০০ টাকা ফেরত দিয়েছে',
        },
      ],
      status: 'partially_paid',
      createdAt: Date.now() - 86400000 * 7,
    },
    {
      id: 'loan-2',
      personName: 'বড় ভাই (ধার নেওয়া)',
      phone: '০১৮১১২৩৪৫৬৭',
      type: 'taken', // কারো কাছ থেকে ধার নিয়েছি (দিতে হবে)
      amount: 10000,
      date: `${y}-${m}-01`,
      dueDate: `${y}-${m}-30`,
      paymentSourceId: 'src-dbbl',
      note: 'ব্যবসায়িক প্রয়োজনে ধার নেওয়া',
      payments: [],
      status: 'pending',
      createdAt: Date.now() - 86400000 * 10,
    },
  ];
};
