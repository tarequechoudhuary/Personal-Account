import React, { useState, useEffect } from 'react';
import {
  ActiveTab,
  Expense,
  ExpenseCategory,
  PaymentSource,
  LoanRecord,
  UserProfile,
  Income,
  IncomeCategory,
} from './types';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_PAYMENT_SOURCES,
  DEFAULT_USER_PROFILE,
  getInitialExpenses,
  getInitialLoans,
  getInitialIncomes,
} from './data/initialData';
import { AndroidFrame } from './components/AndroidFrame';
import { DailyView } from './components/DailyView';
import { MonthlyView } from './components/MonthlyView';
import { LoansView } from './components/LoansView';
import { BanksView } from './components/BanksView';
import { CategoriesView } from './components/CategoriesView';
import { AddExpenseModal } from './components/AddExpenseModal';
import { AddIncomeModal } from './components/AddIncomeModal';
import { AddBankModal } from './components/AddBankModal';
import { AddCategoryModal } from './components/AddCategoryModal';
import { AddLoanModal } from './components/AddLoanModal';
import { AddLoanPaymentModal } from './components/AddLoanPaymentModal';
import { ProfileModal } from './components/ProfileModal';
import { ConfirmModal } from './components/ConfirmModal';
import { getCurrentDateString } from './utils/formatters';
import {
  STORAGE_KEYS,
  getStoredItem,
  setStoredItem,
} from './utils/storage';

export default function App() {
  // Load expenses with migration and zero-ghost-data guarantee
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    // 1. Try v3 storage
    const v3Saved = getStoredItem<Expense[] | null>(STORAGE_KEYS.EXPENSES, null);
    if (v3Saved !== null && Array.isArray(v3Saved)) {
      return v3Saved;
    }
    // 2. Try migration from v2 if user had previously entered expenses
    try {
      const v2Saved = localStorage.getItem('hishab_expenses_v2');
      if (v2Saved) {
        const parsed = JSON.parse(v2Saved);
        if (Array.isArray(parsed)) {
          setStoredItem(STORAGE_KEYS.EXPENSES, parsed);
          return parsed;
        }
      }
    } catch (e) {}
    // 3. If fresh install, start with clean slate (no fake transactions)
    setStoredItem(STORAGE_KEYS.INITIALIZED, true);
    setStoredItem(STORAGE_KEYS.EXPENSES, []);
    return [];
  });

  // Load categories
  const [categories, setCategories] = useState<ExpenseCategory[]>(() => {
    const v3Saved = getStoredItem<ExpenseCategory[] | null>(STORAGE_KEYS.CATEGORIES, null);
    if (v3Saved !== null && Array.isArray(v3Saved) && v3Saved.length > 0) {
      return v3Saved;
    }
    try {
      const v2Saved = localStorage.getItem('hishab_categories_v2');
      if (v2Saved) {
        const parsed = JSON.parse(v2Saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setStoredItem(STORAGE_KEYS.CATEGORIES, parsed);
          return parsed;
        }
      }
    } catch (e) {}
    setStoredItem(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  });

  // Load payment sources (banks & cash)
  const [paymentSources, setPaymentSources] = useState<PaymentSource[]>(() => {
    const v3Saved = getStoredItem<PaymentSource[] | null>(STORAGE_KEYS.SOURCES, null);
    if (v3Saved !== null && Array.isArray(v3Saved) && v3Saved.length > 0) {
      return v3Saved;
    }
    try {
      const v2Saved = localStorage.getItem('hishab_sources_v2');
      if (v2Saved) {
        const parsed = JSON.parse(v2Saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setStoredItem(STORAGE_KEYS.SOURCES, parsed);
          return parsed;
        }
      }
    } catch (e) {}
    setStoredItem(STORAGE_KEYS.SOURCES, DEFAULT_PAYMENT_SOURCES);
    return DEFAULT_PAYMENT_SOURCES;
  });

  // Load loans (দেনা ও পাওনা হিসাব) with zero-ghost-data guarantee
  const [loans, setLoans] = useState<LoanRecord[]>(() => {
    const v3Saved = getStoredItem<LoanRecord[] | null>(STORAGE_KEYS.LOANS, null);
    if (v3Saved !== null && Array.isArray(v3Saved)) {
      return v3Saved;
    }
    try {
      const v2Saved = localStorage.getItem('hishab_loans_v2');
      if (v2Saved) {
        const parsed = JSON.parse(v2Saved);
        if (Array.isArray(parsed)) {
          setStoredItem(STORAGE_KEYS.LOANS, parsed);
          return parsed;
        }
      }
    } catch (e) {}
    setStoredItem(STORAGE_KEYS.LOANS, []);
    return [];
  });

  // Load user profile
  const [profile, setProfile] = useState<UserProfile>(() => {
    const v3Saved = getStoredItem<UserProfile | null>(STORAGE_KEYS.PROFILE, null);
    if (v3Saved !== null && typeof v3Saved === 'object') {
      return v3Saved;
    }
    try {
      const v2Saved = localStorage.getItem('hishab_profile_v2');
      if (v2Saved) {
        const parsed = JSON.parse(v2Saved);
        if (parsed && typeof parsed === 'object') {
          setStoredItem(STORAGE_KEYS.PROFILE, parsed);
          return parsed;
        }
      }
    } catch (e) {}
    setStoredItem(STORAGE_KEYS.PROFILE, DEFAULT_USER_PROFILE);
    return DEFAULT_USER_PROFILE;
  });

  // Load incomes (টাকা জমা / আয়) with initial demonstration data
  const [incomes, setIncomes] = useState<Income[]>(() => {
    const v3Saved = getStoredItem<Income[] | null>(STORAGE_KEYS.INCOMES, null);
    if (v3Saved !== null && Array.isArray(v3Saved)) {
      return v3Saved;
    }
    const initials = getInitialIncomes();
    setStoredItem(STORAGE_KEYS.INCOMES, initials);
    return initials;
  });

  // Load income categories
  const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[]>(() => {
    const v3Saved = getStoredItem<IncomeCategory[] | null>(STORAGE_KEYS.INCOME_CATEGORIES, null);
    if (v3Saved !== null && Array.isArray(v3Saved)) {
      return v3Saved;
    }
    setStoredItem(STORAGE_KEYS.INCOME_CATEGORIES, DEFAULT_INCOME_CATEGORIES);
    return DEFAULT_INCOME_CATEGORIES;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('daily');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // In-app Confirmation Modal State (Reliable across all devices & PWAs)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDangerous?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [incomeDefaultSourceId, setIncomeDefaultSourceId] = useState<string | null>(null);

  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<PaymentSource | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [categoryDefaultParentId, setCategoryDefaultParentId] = useState<string | null>(null);

  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<LoanRecord | null>(null);

  const [isLoanPaymentModalOpen, setIsLoanPaymentModalOpen] = useState(false);
  const [selectedLoanForPayment, setSelectedLoanForPayment] = useState<LoanRecord | null>(null);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Persistent auto-sync safeguards
  useEffect(() => {
    setStoredItem(STORAGE_KEYS.EXPENSES, expenses);
  }, [expenses]);

  useEffect(() => {
    setStoredItem(STORAGE_KEYS.INCOMES, incomes);
  }, [incomes]);

  useEffect(() => {
    setStoredItem(STORAGE_KEYS.INCOME_CATEGORIES, incomeCategories);
  }, [incomeCategories]);

  useEffect(() => {
    setStoredItem(STORAGE_KEYS.CATEGORIES, categories);
  }, [categories]);

  useEffect(() => {
    setStoredItem(STORAGE_KEYS.SOURCES, paymentSources);
  }, [paymentSources]);

  useEffect(() => {
    setStoredItem(STORAGE_KEYS.LOANS, loans);
  }, [loans]);

  useEffect(() => {
    setStoredItem(STORAGE_KEYS.PROFILE, profile);
  }, [profile]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Income Handlers
  const handleOpenAddIncome = (defaultSourceId?: string) => {
    setEditingIncome(null);
    setIncomeDefaultSourceId(defaultSourceId || null);
    setIsIncomeModalOpen(true);
  };

  const handleEditIncome = (income: Income) => {
    setEditingIncome(income);
    setIncomeDefaultSourceId(income.paymentSourceId);
    setIsIncomeModalOpen(true);
  };

  const handleSaveIncome = (
    incomeData: Omit<Income, 'id' | 'createdAt'>,
    id?: string
  ) => {
    if (id) {
      setIncomes((prev) => {
        const next = prev.map((item) =>
          item.id === id ? { ...item, ...incomeData } : item
        );
        setStoredItem(STORAGE_KEYS.INCOMES, next);
        return next;
      });
      showToast('টাকা জমা/আয় সফলভাবে আপডেট করা হয়েছে');
    } else {
      const newIncome: Income = {
        ...incomeData,
        id: `inc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: Date.now(),
      };
      setIncomes((prev) => {
        const next = [newIncome, ...prev];
        setStoredItem(STORAGE_KEYS.INCOMES, next);
        return next;
      });
      showToast('টাকা জমা/আয় যোগ করা হয়েছে');
    }
    setIsIncomeModalOpen(false);
    setEditingIncome(null);
    setIncomeDefaultSourceId(null);
  };

  const executeDeleteIncome = (id: string) => {
    setIncomes((prev) => {
      const next = prev.filter((item) => item.id !== id);
      setStoredItem(STORAGE_KEYS.INCOMES, next);
      return next;
    });
    showToast('জমা হিসাবটি মুছে ফেলা হয়েছে');
  };

  const handleDeleteIncome = (id: string) => {
    const item = incomes.find((i) => i.id === id);
    const title = item ? item.title : 'এই হিসাবটি';
    setConfirmModal({
      isOpen: true,
      title: 'জমা হিসাব মুছে ফেলতে চান?',
      message: `আপনি কি "${title}" জমার হিসাবটি মুছে ফেলতে চান?`,
      confirmText: 'হ্যাঁ, মুছুন',
      cancelText: 'বাতিল',
      isDangerous: true,
      onConfirm: () => {
        executeDeleteIncome(id);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Expense Handlers
  const handleOpenAddExpense = () => {
    setEditingExpense(null);
    setIsExpenseModalOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };

  const handleSaveExpense = (
    expenseData: Omit<Expense, 'id' | 'createdAt'>,
    id?: string
  ) => {
    if (id) {
      setExpenses((prev) => {
        const next = prev.map((item) =>
          item.id === id ? { ...item, ...expenseData } : item
        );
        setStoredItem(STORAGE_KEYS.EXPENSES, next);
        return next;
      });
      showToast('খরচ সফলভাবে আপডেট করা হয়েছে');
    } else {
      const newExpense: Expense = {
        ...expenseData,
        id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: Date.now(),
      };
      setExpenses((prev) => {
        const next = [newExpense, ...prev];
        setStoredItem(STORAGE_KEYS.EXPENSES, next);
        return next;
      });
      showToast('নতুন খরচ যোগ করা হয়েছে');
    }
    setIsExpenseModalOpen(false);
    setEditingExpense(null);
  };

  const executeDeleteExpense = (id: string) => {
    setExpenses((prev) => {
      const next = prev.filter((item) => item.id !== id);
      setStoredItem(STORAGE_KEYS.EXPENSES, next);
      return next;
    });
    showToast('খরচ মুছে ফেলা হয়েছে');
  };

  const handleDeleteExpense = (id: string) => {
    const item = expenses.find((e) => e.id === id);
    const title = item ? item.title : 'এই হিসাবটি';
    setConfirmModal({
      isOpen: true,
      title: 'খরচ মুছে ফেলতে চান?',
      message: `আপনি কি "${title}" খরচের হিসাবটি স্থায়ীভাবে মুছে ফেলতে চান?`,
      confirmText: 'হ্যাঁ, মুছুন',
      cancelText: 'বাতিল',
      isDangerous: true,
      onConfirm: () => {
        executeDeleteExpense(id);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Bank Handlers
  const handleOpenAddBank = () => {
    setEditingBank(null);
    setIsBankModalOpen(true);
  };

  const handleEditBank = (source: PaymentSource) => {
    setEditingBank(source);
    setIsBankModalOpen(true);
  };

  const handleSaveBank = (
    sourceData: Omit<PaymentSource, 'id'>,
    id?: string
  ) => {
    if (id) {
      setPaymentSources((prev) => {
        const next = prev.map((item) =>
          item.id === id ? { ...item, ...sourceData } : item
        );
        setStoredItem(STORAGE_KEYS.SOURCES, next);
        return next;
      });
      showToast('ব্যাংক অ্যাকাউন্ট আপডেট করা হয়েছে');
    } else {
      const newSource: PaymentSource = {
        ...sourceData,
        id: `src-${Date.now()}`,
      };
      setPaymentSources((prev) => {
        const next = [...prev, newSource];
        setStoredItem(STORAGE_KEYS.SOURCES, next);
        return next;
      });
      showToast('নতুন ব্যাংক বা অ্যাকাউন্ট যুক্ত হয়েছে');
    }
    setIsBankModalOpen(false);
    setEditingBank(null);
  };

  const executeDeleteBank = (id: string) => {
    setPaymentSources((prev) => {
      const next = prev.filter((item) => item.id !== id);
      setStoredItem(STORAGE_KEYS.SOURCES, next);
      return next;
    });
    // Remap any expenses using this bank to the first available source
    const fallbackId = paymentSources.find((s) => s.id !== id)?.id || 'src-cash';
    setExpenses((prev) => {
      const next = prev.map((e) =>
        e.paymentSourceId === id ? { ...e, paymentSourceId: fallbackId } : e
      );
      setStoredItem(STORAGE_KEYS.EXPENSES, next);
      return next;
    });
    showToast('ব্যাংক অ্যাকাউন্ট মুছে ফেলা হয়েছে');
  };

  const handleDeleteBank = (id: string) => {
    if (paymentSources.length <= 1) {
      showToast('⚠️ কমপক্ষে একটি মাধ্যম (ক্যাশ বা ব্যাংক) থাকতে হবে!');
      return;
    }
    const source = paymentSources.find((s) => s.id === id);
    setConfirmModal({
      isOpen: true,
      title: 'অ্যাকাউন্ট মুছে ফেলবেন?',
      message: `আপনি কি "${source?.name || 'অ্যাকাউন্টটি'}" মুছে ফেলতে চান? এর সাথে সম্পর্কিত খরচগুলো ক্যাশ মাধ্যমে স্থানান্তরিত হবে।`,
      confirmText: 'মুছে ফেলুন',
      cancelText: 'বাতিল',
      isDangerous: true,
      onConfirm: () => {
        executeDeleteBank(id);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Category Handlers
  const handleOpenAddCategory = (defaultParentId?: string | null) => {
    setEditingCategory(null);
    setCategoryDefaultParentId(defaultParentId || null);
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (cat: ExpenseCategory) => {
    setEditingCategory(cat);
    setCategoryDefaultParentId(cat.parentId || null);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (
    catData: Omit<ExpenseCategory, 'id'>,
    id?: string
  ) => {
    if (id) {
      setCategories((prev) => {
        const next = prev.map((item) =>
          item.id === id ? { ...item, ...catData } : item
        );
        setStoredItem(STORAGE_KEYS.CATEGORIES, next);
        return next;
      });
      showToast('খরচের খাত আপডেট করা হয়েছে');
    } else {
      const newCat: ExpenseCategory = {
        ...catData,
        id: `cat-${Date.now()}`,
      };
      setCategories((prev) => {
        const next = [...prev, newCat];
        setStoredItem(STORAGE_KEYS.CATEGORIES, next);
        return next;
      });
      showToast('নতুন খরচের খাত যুক্ত হয়েছে');
    }
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    setCategoryDefaultParentId(null);
  };

  const executeDeleteCategory = (id: string) => {
    setCategories((prev) => {
      const next = prev.filter((item) => item.id !== id && item.parentId !== id);
      setStoredItem(STORAGE_KEYS.CATEGORIES, next);
      return next;
    });
    showToast('খাত মুছে ফেলা হয়েছে');
  };

  const handleDeleteCategory = (id: string) => {
    if (categories.length <= 1) {
      showToast('⚠️ কমপক্ষে একটি খরচের খাত থাকা আবশ্যক!');
      return;
    }
    const cat = categories.find((c) => c.id === id);
    setConfirmModal({
      isOpen: true,
      title: 'খাত মুছে ফেলতে চান?',
      message: `আপনি কি "${cat?.name || 'খাতটি'}" মুছে ফেলতে চান? এর অধীনে থাকা উপ-খাতগুলোও মুছে যাবে।`,
      confirmText: 'মুছে ফেলুন',
      cancelText: 'বাতিল',
      isDangerous: true,
      onConfirm: () => {
        executeDeleteCategory(id);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Loan Handlers (কাউকে লোন দিলে বা কারো থেকে লোন নিলে)
  const handleOpenAddLoan = () => {
    setEditingLoan(null);
    setIsLoanModalOpen(true);
  };

  const handleEditLoan = (loan: LoanRecord) => {
    setEditingLoan(loan);
    setIsLoanModalOpen(true);
  };

  const handleSaveLoan = (
    loanData: Omit<LoanRecord, 'id' | 'payments' | 'status' | 'createdAt'>,
    id?: string
  ) => {
    if (id) {
      setLoans((prev) => {
        const next = prev.map((loan) => {
          if (loan.id === id) {
            const totalPaid = loan.payments.reduce((sum, p) => sum + p.amount, 0);
            const status =
              totalPaid >= loanData.amount
                ? 'paid'
                : totalPaid > 0
                ? 'partially_paid'
                : 'pending';
            return {
              ...loan,
              ...loanData,
              status,
            };
          }
          return loan;
        });
        setStoredItem(STORAGE_KEYS.LOANS, next);
        return next;
      });
      showToast('লোনের তথ্য আপডেট করা হয়েছে');
    } else {
      const newLoan: LoanRecord = {
        ...loanData,
        id: `loan-${Date.now()}`,
        payments: [],
        status: 'pending',
        createdAt: Date.now(),
      };
      setLoans((prev) => {
        const next = [newLoan, ...prev];
        setStoredItem(STORAGE_KEYS.LOANS, next);
        return next;
      });
      showToast('নতুন লোন রেকর্ড যুক্ত হয়েছে');
    }
    setIsLoanModalOpen(false);
    setEditingLoan(null);
  };

  const executeDeleteLoan = (id: string) => {
    setLoans((prev) => {
      const next = prev.filter((l) => l.id !== id);
      setStoredItem(STORAGE_KEYS.LOANS, next);
      return next;
    });
    showToast('লোনের হিসাব মুছে ফেলা হয়েছে');
  };

  const handleDeleteLoan = (id: string) => {
    const loan = loans.find((l) => l.id === id);
    setConfirmModal({
      isOpen: true,
      title: 'লোনের হিসাব মুছে ফেলবেন?',
      message: `আপনি কি "${loan?.personName || 'এই'}" এর দেনা/পাওনার হিসাবটি মুছে ফেলতে চান?`,
      confirmText: 'হ্যাঁ, মুছুন',
      cancelText: 'বাতিল',
      isDangerous: true,
      onConfirm: () => {
        executeDeleteLoan(id);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleOpenAddPayment = (loan: LoanRecord) => {
    setSelectedLoanForPayment(loan);
    setIsLoanPaymentModalOpen(true);
  };

  const handleSaveLoanPayment = (
    loanId: string,
    amount: number,
    date: string,
    note?: string
  ) => {
    setLoans((prev) => {
      const next = prev.map((loan) => {
        if (loan.id === loanId) {
          const newPayments = [
            ...loan.payments,
            {
              id: `pay-${Date.now()}`,
              amount,
              date,
              note,
            },
          ];
          const totalPaid = newPayments.reduce((s, p) => s + p.amount, 0);
          const status =
            totalPaid >= loan.amount
              ? 'paid'
              : totalPaid > 0
              ? 'partially_paid'
              : 'pending';

          return {
            ...loan,
            payments: newPayments,
            status,
          };
        }
        return loan;
      });
      setStoredItem(STORAGE_KEYS.LOANS, next);
      return next;
    });
    showToast('পরিশোধ সফলভাবে সংরক্ষণ করা হয়েছে');
  };

  // Profile Update Handler
  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    setStoredItem(STORAGE_KEYS.PROFILE, updatedProfile);
    showToast('প্রোফাইল তথ্য আপডেট করা হয়েছে');
  };

  // Export Data Handler
  const handleExportData = () => {
    const dataToExport = {
      version: '3.0',
      appName: 'Hishab Khata Expense & Loan Tracker',
      exportedAt: new Date().toISOString(),
      profile,
      expenses,
      incomes,
      categories,
      incomeCategories,
      paymentSources,
      loans,
    };

    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(dataToExport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `hishab-khata-backup-${getCurrentDateString()}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast('ব্যাকআপ ফাইল সফলভাবে ডাউনলোড হয়েছে');
  };

  // Import Data Handler
  const handleImportData = (data: {
    expenses?: Expense[];
    incomes?: Income[];
    categories?: ExpenseCategory[];
    incomeCategories?: IncomeCategory[];
    paymentSources?: PaymentSource[];
    loans?: LoanRecord[];
    profile?: UserProfile;
  }) => {
    if (data.expenses && Array.isArray(data.expenses)) {
      setExpenses(data.expenses);
      setStoredItem(STORAGE_KEYS.EXPENSES, data.expenses);
    }
    if (data.incomes && Array.isArray(data.incomes)) {
      setIncomes(data.incomes);
      setStoredItem(STORAGE_KEYS.INCOMES, data.incomes);
    }
    if (data.categories && Array.isArray(data.categories)) {
      setCategories(data.categories);
      setStoredItem(STORAGE_KEYS.CATEGORIES, data.categories);
    }
    if (data.incomeCategories && Array.isArray(data.incomeCategories)) {
      setIncomeCategories(data.incomeCategories);
      setStoredItem(STORAGE_KEYS.INCOME_CATEGORIES, data.incomeCategories);
    }
    if (data.paymentSources && Array.isArray(data.paymentSources)) {
      setPaymentSources(data.paymentSources);
      setStoredItem(STORAGE_KEYS.SOURCES, data.paymentSources);
    }
    if (data.loans && Array.isArray(data.loans)) {
      setLoans(data.loans);
      setStoredItem(STORAGE_KEYS.LOANS, data.loans);
    }
    if (data.profile && typeof data.profile === 'object') {
      setProfile(data.profile);
      setStoredItem(STORAGE_KEYS.PROFILE, data.profile);
    }
    showToast('পুরনো ডাটা সফলভাবে রিস্টোর করা হয়েছে!');
  };

  // Clear all data (Start completely fresh with clean account)
  const handleClearAllData = () => {
    setConfirmModal({
      isOpen: true,
      title: 'সমস্ত হিসাব সাফ করবেন?',
      message:
        'আপনার বর্তমান সমস্ত খরচ ও লোনের রেকর্ড মুছে যাবে। আপনি কি সম্পূর্ণ নতুন ও পরিষ্কার হিসাব খাতা তৈরি করতে চান?',
      confirmText: 'হ্যাঁ, সব সাফ করুন',
      cancelText: 'বাতিল',
      isDangerous: true,
      onConfirm: () => {
        setExpenses([]);
        setIncomes([]);
        setLoans([]);
        setStoredItem(STORAGE_KEYS.EXPENSES, []);
        setStoredItem(STORAGE_KEYS.INCOMES, []);
        setStoredItem(STORAGE_KEYS.LOANS, []);
        setStoredItem(STORAGE_KEYS.INITIALIZED, true);
        showToast('সমস্ত হিসাব সাফ করা হয়েছে! খাতা এখন সম্পূর্ণ পরিষ্কার।');
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setIsProfileModalOpen(false);
      },
    });
  };

  // Load sample demo data if explicitly requested
  const handleLoadDemoData = () => {
    setConfirmModal({
      isOpen: true,
      title: 'নমুনা ডাটা যোগ করবেন?',
      message:
        'হিসাব খাতা বোঝার সুবিধার্থে কিছু নমুনা খরচ, জমা ও লোনের তথ্য যোগ করা হবে।',
      confirmText: 'নমুনা ডাটা যোগ করুন',
      cancelText: 'বাতিল',
      isDangerous: false,
      onConfirm: () => {
        const demoExp = getInitialExpenses();
        const demoLoans = getInitialLoans();
        const demoIncomes = getInitialIncomes();
        setExpenses(demoExp);
        setIncomes(demoIncomes);
        setLoans(demoLoans);
        setStoredItem(STORAGE_KEYS.EXPENSES, demoExp);
        setStoredItem(STORAGE_KEYS.INCOMES, demoIncomes);
        setStoredItem(STORAGE_KEYS.LOANS, demoLoans);
        setStoredItem(STORAGE_KEYS.INITIALIZED, true);
        showToast('নমুনা ডাটা সফলভাবে যোগ করা হয়েছে!');
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setIsProfileModalOpen(false);
      },
    });
  };

  return (
    <AndroidFrame
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onOpenAddExpense={handleOpenAddExpense}
      onOpenAddIncome={handleOpenAddIncome}
      onOpenProfile={() => setIsProfileModalOpen(true)}
      profileName={profile.name}
      onResetData={handleClearAllData}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-none">
          {toastMessage}
        </div>
      )}

      {/* Main Tab Views */}
      {activeTab === 'daily' && (
        <DailyView
          expenses={expenses}
          incomes={incomes}
          categories={categories}
          incomeCategories={incomeCategories}
          paymentSources={paymentSources}
          onAddExpense={handleOpenAddExpense}
          onAddIncome={handleOpenAddIncome}
          onEditExpense={handleEditExpense}
          onDeleteExpense={handleDeleteExpense}
          onEditIncome={handleEditIncome}
          onDeleteIncome={handleDeleteIncome}
        />
      )}

      {activeTab === 'monthly' && (
        <MonthlyView
          expenses={expenses}
          incomes={incomes}
          categories={categories}
          incomeCategories={incomeCategories}
          paymentSources={paymentSources}
          onEditExpense={handleEditExpense}
          onDeleteExpense={handleDeleteExpense}
          onEditIncome={handleEditIncome}
          onDeleteIncome={handleDeleteIncome}
        />
      )}

      {activeTab === 'loans' && (
        <LoansView
          loans={loans}
          paymentSources={paymentSources}
          onAddLoan={handleOpenAddLoan}
          onEditLoan={handleEditLoan}
          onDeleteLoan={handleDeleteLoan}
          onOpenAddPayment={handleOpenAddPayment}
        />
      )}

      {activeTab === 'banks' && (
        <BanksView
          paymentSources={paymentSources}
          expenses={expenses}
          incomes={incomes}
          categories={categories}
          incomeCategories={incomeCategories}
          onAddBank={handleOpenAddBank}
          onEditBank={handleEditBank}
          onDeleteBank={handleDeleteBank}
          onEditExpense={handleEditExpense}
          onDeleteExpense={handleDeleteExpense}
          onAddIncomeForSource={(sourceId) => handleOpenAddIncome(sourceId)}
          onEditIncome={handleEditIncome}
          onDeleteIncome={handleDeleteIncome}
        />
      )}

      {activeTab === 'categories' && (
        <CategoriesView
          categories={categories}
          expenses={expenses}
          paymentSources={paymentSources}
          onAddCategory={handleOpenAddCategory}
          onEditCategory={handleEditCategory}
          onDeleteCategory={handleDeleteCategory}
          onEditExpense={handleEditExpense}
          onDeleteExpense={handleDeleteExpense}
        />
      )}

      {/* Modals */}
      <AddExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        categories={categories}
        paymentSources={paymentSources}
        onOpenAddCategory={(defaultParentId) => handleOpenAddCategory(defaultParentId)}
        onOpenAddBank={() => setIsBankModalOpen(true)}
        editingExpense={editingExpense}
        onSwitchToIncome={() => {
          setIsExpenseModalOpen(false);
          handleOpenAddIncome();
        }}
      />

      <AddIncomeModal
        isOpen={isIncomeModalOpen}
        onClose={() => {
          setIsIncomeModalOpen(false);
          setEditingIncome(null);
          setIncomeDefaultSourceId(null);
        }}
        onSave={handleSaveIncome}
        paymentSources={paymentSources}
        incomeCategories={incomeCategories}
        onOpenAddBank={() => setIsBankModalOpen(true)}
        editingIncome={editingIncome}
        defaultSourceId={incomeDefaultSourceId || undefined}
        onSwitchToExpense={() => {
          setIsIncomeModalOpen(false);
          handleOpenAddExpense();
        }}
      />

      <AddBankModal
        isOpen={isBankModalOpen}
        onClose={() => {
          setIsBankModalOpen(false);
          setEditingBank(null);
        }}
        onSave={handleSaveBank}
        editingSource={editingBank}
      />

      <AddCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
          setCategoryDefaultParentId(null);
        }}
        onSave={handleSaveCategory}
        editingCategory={editingCategory}
        categories={categories}
        defaultParentId={categoryDefaultParentId}
      />

      {/* Loan Modals */}
      <AddLoanModal
        isOpen={isLoanModalOpen}
        onClose={() => {
          setIsLoanModalOpen(false);
          setEditingLoan(null);
        }}
        onSave={handleSaveLoan}
        paymentSources={paymentSources}
        editingLoan={editingLoan}
      />

      {/* Loan Payment Modal */}
      <AddLoanPaymentModal
        isOpen={isLoanPaymentModalOpen}
        onClose={() => {
          setIsLoanPaymentModalOpen(false);
          setSelectedLoanForPayment(null);
        }}
        loan={selectedLoanForPayment}
        onSavePayment={handleSaveLoanPayment}
      />

      {/* Profile & Backup Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
        expenses={expenses}
        incomes={incomes}
        categories={categories}
        paymentSources={paymentSources}
        loans={loans}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onResetData={handleClearAllData}
        onClearAllData={handleClearAllData}
        onLoadDemoData={handleLoadDemoData}
      />

      {/* In-app Confirmation Dialog (Never blocked by browser) */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        isDangerous={confirmModal.isDangerous}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </AndroidFrame>
  );
}
