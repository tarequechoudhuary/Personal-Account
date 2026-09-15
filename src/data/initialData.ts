import {
  ExpenseCategory,
  PaymentSource,
  Expense,
  LoanRecord,
  UserProfile,
  IncomeCategory,
  Income,
} from '../types';
import { getCurrentDateString } from '../utils/formatters';

export const DEFAULT_INCOME_CATEGORIES: IncomeCategory[] = [
  {
    id: 'inc-cat-salary',
    name: 'চাকরির বেতন (Salary)',
    icon: 'Briefcase',
    color: '#10b981', // Emerald
  },
  {
    id: 'inc-cat-business',
    name: 'ব্যবসা ও বিক্রয় (Business)',
    icon: 'Store',
    color: '#0ea5e9', // Sky blue
  },
  {
    id: 'inc-cat-freelance',
    name: 'ফ্রিল্যান্সিং ও চুক্তিভিত্তিক আয়',
    icon: 'Laptop',
    color: '#8b5cf6', // Purple
  },
  {
    id: 'inc-cat-bonus',
    name: 'বোনাস ও ইনসেন্টিভ',
    icon: 'Award',
    color: '#f59e0b', // Amber
  },
  {
    id: 'inc-cat-rental',
    name: 'বাড়ি/দোকান ভাড়া বাবদ আয়',
    icon: 'Home',
    color: '#06b6d4', // Cyan
  },
  {
    id: 'inc-cat-investment',
    name: 'বিনিয়োগ ও মুনাফা/লভ্যাংশ',
    icon: 'TrendingUp',
    color: '#14b8a6', // Teal
  },
  {
    id: 'inc-cat-gift',
    name: 'উপহার বা হাদিয়া',
    icon: 'Gift',
    color: '#ec4899', // Pink
  },
  {
    id: 'inc-cat-other',
    name: 'অন্যান্য মাধ্যম থেকে আয়',
    icon: 'Coins',
    color: '#64748b', // Slate
  },
];

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
  const prevDate = new Date(Number(y), Number(m) - 2, 1);
  const py = prevDate.getFullYear();
  const pm = String(prevDate.getMonth() + 1).padStart(2, '0');
  
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
    // --- বিগত মাসের কিছু নমুনা খরচ (খাতভিত্তিক তুলনার জন্য) ---
    {
      id: 'exp-prev-1',
      title: 'বিগত মাসের বাড়ি ভাড়া',
      amount: 16000,
      date: `${py}-${pm}-02`,
      time: '11:00',
      categoryId: 'cat-sub-rent',
      paymentSourceId: 'src-brac',
      note: 'বিগত মাসের বাসা ভাড়া',
      createdAt: Date.now() - 86400000 * 35,
    },
    {
      id: 'exp-prev-2',
      title: 'বিগত মাসের কাঁচাবাজার ও সদাই',
      amount: 6200,
      date: `${py}-${pm}-08`,
      time: '17:30',
      categoryId: 'cat-sub-grocery',
      paymentSourceId: 'src-cash',
      note: 'মাসের চাল, ডাল ও তেল কেনা',
      createdAt: Date.now() - 86400000 * 32,
    },
    {
      id: 'exp-prev-3',
      title: 'বিগত মাসের বিদ্যুৎ ও গ্যাস বিল',
      amount: 2400,
      date: `${py}-${pm}-12`,
      time: '15:10',
      categoryId: 'cat-sub-utility',
      paymentSourceId: 'src-bkash',
      note: 'বিদ্যুৎ ও প্রিপেইড গ্যাস বিল',
      createdAt: Date.now() - 86400000 * 30,
    },
    {
      id: 'exp-prev-4',
      title: 'বিগত মাসের যাতায়াত ও জ্বালানি',
      amount: 1800,
      date: `${py}-${pm}-15`,
      time: '12:00',
      categoryId: 'cat-sub-transport',
      paymentSourceId: 'src-cash',
      note: 'অফিস যাতায়াতের খরচ',
      createdAt: Date.now() - 86400000 * 27,
    },
    {
      id: 'exp-prev-5',
      title: 'ডাক্তারের ফি ও ওষুধ',
      amount: 1200,
      date: `${py}-${pm}-18`,
      time: '19:00',
      categoryId: 'cat-sub-health',
      paymentSourceId: 'src-dbbl',
      note: 'ডাক্তার দেখানো ও টেস্ট',
      createdAt: Date.now() - 86400000 * 25,
    },
    {
      id: 'exp-prev-6',
      title: 'মোবাইল রিচার্জ ও ওয়াইফাই',
      amount: 800,
      date: `${py}-${pm}-20`,
      time: '14:30',
      categoryId: 'cat-sub-mobile',
      paymentSourceId: 'src-bkash',
      note: 'ইন্টারনেট বিল',
      createdAt: Date.now() - 86400000 * 22,
    },
  ];
};

export const getInitialIncomes = (): Income[] => {
  const today = getCurrentDateString();
  const [y, m] = today.split('-');
  const prevDate = new Date(Number(y), Number(m) - 2, 1);
  const py = prevDate.getFullYear();
  const pm = String(prevDate.getMonth() + 1).padStart(2, '0');

  return [
    // বিগত মাসের আয়
    {
      id: 'inc-prev-1',
      title: 'গত মাসের বেতন (Salary)',
      amount: 45000,
      date: `${py}-${pm}-01`,
      time: '10:00',
      categoryId: 'inc-cat-salary',
      paymentSourceId: 'src-brac',
      note: 'অফিস বেতন ব্র্যাক ব্যাংকে ক্রেডিট',
      createdAt: Date.now() - 86400000 * 36,
    },
    {
      id: 'inc-prev-2',
      title: 'ফ্রিল্যান্সিং পেমেন্ট',
      amount: 12000,
      date: `${py}-${pm}-14`,
      time: '16:00',
      categoryId: 'inc-cat-freelance',
      paymentSourceId: 'src-dbbl',
      note: 'ওয়েব ডেভেলপমেন্ট প্রজেক্টের টাকা',
      createdAt: Date.now() - 86400000 * 26,
    },
    {
      id: 'inc-prev-3',
      title: 'ক্যাশ জমা ও অন্যান্য',
      amount: 5000,
      date: `${py}-${pm}-22`,
      time: '18:00',
      categoryId: 'inc-cat-other',
      paymentSourceId: 'src-cash',
      note: 'ক্যাশ হাতখরচ জমা',
      createdAt: Date.now() - 86400000 * 20,
    },
    // চলতি মাসের আয়
    {
      id: 'inc-curr-1',
      title: 'চলতি মাসের বেতন (Salary)',
      amount: 50000,
      date: `${y}-${m}-01`,
      time: '10:30',
      categoryId: 'inc-cat-salary',
      paymentSourceId: 'src-brac',
      note: 'ইনক্রিমেন্ট সহ মূল বেতন জমা',
      createdAt: Date.now() - 86400000 * 9,
    },
    {
      id: 'inc-curr-2',
      title: 'দোকান বা ব্যবসা থেকে আয়',
      amount: 15000,
      date: `${y}-${m}-07`,
      time: '19:00',
      categoryId: 'inc-cat-business',
      paymentSourceId: 'src-bkash',
      note: 'বিকাশ মারচেন্টে বিক্রির টাকা',
      createdAt: Date.now() - 86400000 * 4,
    },
    {
      id: 'inc-curr-3',
      title: 'উপহার / বোনাস',
      amount: 5000,
      date: `${y}-${m}-11`,
      time: '14:00',
      categoryId: 'inc-cat-bonus',
      paymentSourceId: 'src-dbbl',
      note: 'উৎসব বোনাস',
      createdAt: Date.now() - 86400000 * 1,
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
