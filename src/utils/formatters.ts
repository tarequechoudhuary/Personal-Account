const BENGALI_NUMERALS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export const toBengaliNumber = (num: number | string): string => {
  const str = String(num);
  return str.replace(/[0-9]/g, (digit) => BENGALI_NUMERALS[parseInt(digit, 10)]);
};

export const formatCurrency = (amount: number, useBengali = true): string => {
  const formatted = amount.toLocaleString('en-IN');
  if (useBengali) {
    return `৳ ${toBengaliNumber(formatted)}`;
  }
  return `৳ ${formatted}`;
};

export const BENGALI_MONTHS = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
];

export const formatBengaliDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth() + 1;
  const d = today.getDate();
  
  const pad = (n: number) => String(n).padStart(2, '0');
  const todayStr = `${y}-${pad(m)}-${pad(d)}`;
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${pad(yesterday.getMonth() + 1)}-${pad(yesterday.getDate())}`;

  if (dateStr === todayStr) {
    return `আজ, ${toBengaliNumber(day)} ${BENGALI_MONTHS[month - 1]}`;
  }
  if (dateStr === yesterdayStr) {
    return `গতকাল, ${toBengaliNumber(day)} ${BENGALI_MONTHS[month - 1]}`;
  }

  return `${toBengaliNumber(day)} ${BENGALI_MONTHS[month - 1]} ${toBengaliNumber(year)}`;
};

export const getMonthName = (monthIndex: number): string => {
  return BENGALI_MONTHS[monthIndex] || '';
};

export const getCurrentDateString = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getCurrentTimeString = (): string => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};
