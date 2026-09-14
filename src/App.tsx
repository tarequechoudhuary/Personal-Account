import React, { useState, useEffect } from 'react';
import {
  ActiveTab,
  Expense,
  ExpenseCategory,
  PaymentSource,
  LoanRecord,
  UserProfile,
} from './types';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_PAYMENT_SOURCES,
  DEFAULT_USER_PROFILE,
  getInitialExpenses,
  getInitialLoans,
} from './data/initialData';
import { AndroidFrame } from './components/AndroidFrame';
import { DailyView } from './components/DailyView';
import { MonthlyView } from './components/MonthlyView';
import { LoansView } from './components/LoansView';
import { BanksView } from './components/BanksView';
import { CategoriesView } from './components/CategoriesView';
import { AddExpenseModal } from './components/AddExpenseModal';
import { AddBankModal } from './components/AddBankModal';
import { AddCategoryModal } from './components/AddCategoryModal';
import { AddLoanModal } from './components/AddLoanModal';
import { AddLoanPaymentModal } from './components/AddLoanPaymentModal';
import { ProfileModal } from './components/ProfileModal';
import { getCurrentDateString } from './utils/formatters';

const STORAGE_KEYS = {
  EXPENSES: 'hishab_expenses_v2',
  CATEGORIES: 'hishab_categories_v2',
  SOURCES: 'hishab_sources_v2',
  LOANS: 'hishab_loans_v2',
  PROFILE: 'hishab_profile_v2',
};

export default function App() {
  // Load expenses
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      if (saved) return JSON.parse(saved);
    } catch (err) {
      console.error('Error loading expenses:', err);
    }
    return getInitialExpenses();
  });

  // Load categories
  const [categories, setCategories] = useState<ExpenseCategory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (saved) return JSON.parse(saved);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
    return DEFAULT_CATEGORIES;
  });

  // Load payment sources (banks & cash)
  const [paymentSources, setPaymentSources] = useState<PaymentSource[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SOURCES);
      if (saved) return JSON.parse(saved);
    } catch (err) {
      console.error('Error loading payment sources:', err);
    }
    return DEFAULT_PAYMENT_SOURCES;
  });

  // Load loans (দেনা ও পাওনা হিসাব)
  const [loans, setLoans] = useState<LoanRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOANS);
      if (saved) return JSON.parse(saved);
    } catch (err) {
      console.error('Error loading loans:', err);
    }
    return getInitialLoans();
  });

  // Load user profile
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (saved) return JSON.parse(saved);
    } catch (err) {
      console.error('Error loading profile:', err);
    }
    return DEFAULT_USER_PROFILE;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('daily');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

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

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    } catch (e) {
      console.error(e);
    }
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error(e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(paymentSources));
    } catch (e) {
      console.error(e);
    }
  }, [paymentSources]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
    } catch (e) {
      console.error(e);
    }
  }, [loans]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error(e);
    }
  }, [profile]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
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
      setExpenses((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...expenseData } : item
        )
      );
      showToast('খরচ সফলভাবে আপডেট করা হয়েছে');
    } else {
      const newExpense: Expense = {
        ...expenseData,
        id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        createdAt: Date.now(),
      };
      setExpenses((prev) => [newExpense, ...prev]);
      showToast('নতুন খরচ যোগ করা হয়েছে');
    }
    setIsExpenseModalOpen(false);
    setEditingExpense(null);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
    showToast('খরচ মুছে ফেলা হয়েছে');
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
      setPaymentSources((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...sourceData } : item))
      );
      showToast('ব্যাংক অ্যাকাউন্ট আপডেট করা হয়েছে');
    } else {
      const newSource: PaymentSource = {
        ...sourceData,
        id: `src-${Date.now()}`,
      };
      setPaymentSources((prev) => [...prev, newSource]);
      showToast('নতুন ব্যাংক বা অ্যাকাউন্ট যুক্ত হয়েছে');
    }
    setIsBankModalOpen(false);
    setEditingBank(null);
  };

  const handleDeleteBank = (id: string) => {
    if (paymentSources.length <= 1) {
      alert('কমপক্ষে একটি ব্যাংক বা নগদ ক্যাশ থাকা আবশ্যক!');
      return;
    }
    setPaymentSources((prev) => prev.filter((item) => item.id !== id));
    showToast('ব্যাংক মুছে ফেলা হয়েছে');
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
      setCategories((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...catData } : item))
      );
      showToast('খরচের খাত আপডেট করা হয়েছে');
    } else {
      const newCat: ExpenseCategory = {
        ...catData,
        id: `cat-${Date.now()}`,
      };
      setCategories((prev) => [...prev, newCat]);
      showToast('নতুন খরচের খাত যুক্ত হয়েছে');
    }
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    setCategoryDefaultParentId(null);
  };

  const handleDeleteCategory = (id: string) => {
    if (categories.length <= 1) {
      alert('কমপক্ষে একটি খরচের খাত থাকা আবশ্যক!');
      return;
    }
    // Delete this category and all sub-categories if it's a main category
    setCategories((prev) => prev.filter((item) => item.id !== id && item.parentId !== id));
    showToast('খাত মুছে ফেলা হয়েছে');
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
      setLoans((prev) =>
        prev.map((loan) => {
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
        })
      );
      showToast('লোনের তথ্য আপডেট করা হয়েছে');
    } else {
      const newLoan: LoanRecord = {
        ...loanData,
        id: `loan-${Date.now()}`,
        payments: [],
        status: 'pending',
        createdAt: Date.now(),
      };
      setLoans((prev) => [newLoan, ...prev]);
      showToast('নতুন লোন রেকর্ড যুক্ত হয়েছে');
    }
    setIsLoanModalOpen(false);
    setEditingLoan(null);
  };

  const handleDeleteLoan = (id: string) => {
    setLoans((prev) => prev.filter((l) => l.id !== id));
    showToast('লোনের হিসাব মুছে ফেলা হয়েছে');
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
    setLoans((prev) =>
      prev.map((loan) => {
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
      })
    );
    showToast('পরিশোধ সফলভাবে সংরক্ষণ করা হয়েছে');
  };

  // Profile Update Handler
  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    showToast('প্রোফাইল তথ্য আপডেট করা হয়েছে');
  };

  // Export Data Handler
  const handleExportData = () => {
    const dataToExport = {
      version: '2.1',
      appName: 'Hishab Khata Expense & Loan Tracker',
      exportedAt: new Date().toISOString(),
      profile,
      expenses,
      categories,
      paymentSources,
      loans,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
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
    categories?: ExpenseCategory[];
    paymentSources?: PaymentSource[];
    loans?: LoanRecord[];
    profile?: UserProfile;
  }) => {
    if (data.expenses && Array.isArray(data.expenses)) {
      setExpenses(data.expenses);
    }
    if (data.categories && Array.isArray(data.categories)) {
      setCategories(data.categories);
    }
    if (data.paymentSources && Array.isArray(data.paymentSources)) {
      setPaymentSources(data.paymentSources);
    }
    if (data.loans && Array.isArray(data.loans)) {
      setLoans(data.loans);
    }
    if (data.profile && typeof data.profile === 'object') {
      setProfile(data.profile);
    }
    showToast('পুরনো ডাটা সফলভাবে রিস্টোর করা হয়েছে!');
  };

  // Reset to initial demo data
  const handleResetData = () => {
    if (
      window.confirm(
        'আপনি কি হিসাব খাতা ডেমো ডাটায় রিসেট করতে চান? আপনার বর্তমান সমস্ত খরচ ও লোনের রেকর্ড মুছে যাবে।'
      )
    ) {
      localStorage.removeItem(STORAGE_KEYS.EXPENSES);
      localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
      localStorage.removeItem(STORAGE_KEYS.SOURCES);
      localStorage.removeItem(STORAGE_KEYS.LOANS);
      localStorage.removeItem(STORAGE_KEYS.PROFILE);
      setExpenses(getInitialExpenses());
      setCategories(DEFAULT_CATEGORIES);
      setPaymentSources(DEFAULT_PAYMENT_SOURCES);
      setLoans(getInitialLoans());
      setProfile(DEFAULT_USER_PROFILE);
      showToast('অ্যাপ প্রাথমিক ডাটায় রিসেট করা হয়েছে');
    }
  };

  return (
    <AndroidFrame
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onOpenAddExpense={handleOpenAddExpense}
      onOpenProfile={() => setIsProfileModalOpen(true)}
      profileName={profile.name}
      onResetData={handleResetData}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
          {toastMessage}
        </div>
      )}

      {/* Main Tab Views */}
      {activeTab === 'daily' && (
        <DailyView
          expenses={expenses}
          categories={categories}
          paymentSources={paymentSources}
          onAddExpense={handleOpenAddExpense}
          onEditExpense={handleEditExpense}
          onDeleteExpense={handleDeleteExpense}
        />
      )}

      {activeTab === 'monthly' && (
        <MonthlyView
          expenses={expenses}
          categories={categories}
          paymentSources={paymentSources}
          onEditExpense={handleEditExpense}
          onDeleteExpense={handleDeleteExpense}
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
          categories={categories}
          onAddBank={handleOpenAddBank}
          onEditBank={handleEditBank}
          onDeleteBank={handleDeleteBank}
          onEditExpense={handleEditExpense}
          onDeleteExpense={handleDeleteExpense}
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
        categories={categories}
        paymentSources={paymentSources}
        loans={loans}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onResetData={handleResetData}
      />
    </AndroidFrame>
  );
}
