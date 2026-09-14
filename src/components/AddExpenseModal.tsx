import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Plus, Landmark, Banknote, Smartphone, Check, FolderPlus } from 'lucide-react';
import { Expense, ExpenseCategory, PaymentSource } from '../types';
import { getCurrentDateString, getCurrentTimeString, toBengaliNumber } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import {
  getMainCategories,
  getSubCategories,
  getCategoryHierarchy,
} from '../utils/categoryHelpers';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id' | 'createdAt'>, id?: string) => void;
  categories: ExpenseCategory[];
  paymentSources: PaymentSource[];
  onOpenAddCategory: (defaultParentId?: string | null) => void;
  onOpenAddBank: () => void;
  editingExpense?: Expense | null;
}

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000, 2000];

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  paymentSources,
  onOpenAddCategory,
  onOpenAddBank,
  editingExpense,
}) => {
  const mainCategories = getMainCategories(categories);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getCurrentDateString());
  const [time, setTime] = useState(getCurrentTimeString());
  const [activeMainId, setActiveMainId] = useState<string>('');
  const [categoryId, setCategoryId] = useState('');
  const [paymentSourceId, setPaymentSourceId] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingExpense) {
      setTitle(editingExpense.title);
      setAmount(String(editingExpense.amount));
      setDate(editingExpense.date);
      setTime(editingExpense.time || getCurrentTimeString());
      setCategoryId(editingExpense.categoryId);
      setPaymentSourceId(editingExpense.paymentSourceId);
      setNote(editingExpense.note || '');

      // Identify which main category this expense belongs to
      const cat = categories.find((c) => c.id === editingExpense.categoryId);
      if (cat?.parentId) {
        setActiveMainId(cat.parentId);
      } else if (cat) {
        setActiveMainId(cat.id);
      } else if (mainCategories.length > 0) {
        setActiveMainId(mainCategories[0].id);
      }
    } else {
      setTitle('');
      setAmount('');
      setDate(getCurrentDateString());
      setTime(getCurrentTimeString());
      setNote('');

      // Default to first main category and its first sub-category
      if (mainCategories.length > 0) {
        const firstMain = mainCategories[0];
        setActiveMainId(firstMain.id);
        const subCats = getSubCategories(firstMain.id, categories);
        if (subCats.length > 0) {
          setCategoryId(subCats[0].id);
        } else {
          setCategoryId(firstMain.id);
        }
      } else if (categories.length > 0) {
        setCategoryId(categories[0].id);
      }

      if (paymentSources.length > 0 && !paymentSourceId) {
        setPaymentSourceId(paymentSources[0].id);
      }
    }
    setError('');
  }, [editingExpense, isOpen, categories, paymentSources]);

  // Ensure default selections if empty
  useEffect(() => {
    if (!paymentSourceId && paymentSources.length > 0) {
      setPaymentSourceId(paymentSources[0].id);
    }
  }, [paymentSources, paymentSourceId]);

  if (!isOpen) return null;

  const handleQuickAdd = (val: number) => {
    const current = Number(amount) || 0;
    setAmount(String(current + val));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('সঠিক খরচের পরিমাণ (টাকা) লিখুন');
      return;
    }
    if (!title.trim()) {
      setError('খরচের বিবরণ বা নাম লিখুন');
      return;
    }
    if (!categoryId) {
      setError('একটি খাত নির্বাচন করুন');
      return;
    }
    if (!paymentSourceId) {
      setError('কোন ব্যাংক বা ক্যাশ থেকে খরচ হয়েছে নির্বাচন করুন');
      return;
    }

    onSave(
      {
        title: title.trim(),
        amount: numAmount,
        date,
        time,
        categoryId,
        paymentSourceId,
        note: note.trim() || undefined,
      },
      editingExpense?.id
    );
    onClose();
  };

  const getSourceIcon = (type?: string) => {
    switch (type) {
      case 'bank':
        return <Landmark className="w-3.5 h-3.5" />;
      case 'mfs':
        return <Smartphone className="w-3.5 h-3.5" />;
      case 'cash':
      default:
        return <Banknote className="w-3.5 h-3.5" />;
    }
  };

  // Sub-categories under the selected Main Category
  const activeSubCategories = activeMainId
    ? getSubCategories(activeMainId, categories)
    : [];

  // Currently selected category info for banner
  const selectedHierarchy = getCategoryHierarchy(categoryId, categories);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="modal-add-expense"
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              {editingExpense ? 'খরচ পরিবর্তন করুন' : 'নতুন খরচ যোগ করুন'}
            </h3>
            <p className="text-xs text-slate-500">আপনার দৈনিক খরচের হিসাব সংরক্ষণ করুন</p>
          </div>
          <button
            id="btn-close-expense-modal"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          {/* Amount Input with Currency */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              খরচের পরিমাণ (টাকা) <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-2xl font-bold text-emerald-600">৳</span>
              <input
                id="input-expense-amount"
                type="number"
                step="any"
                inputMode="decimal"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                placeholder="0.00"
                className="w-full pl-11 pr-4 py-3 text-2xl font-extrabold text-slate-800 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-slate-50/50 placeholder:text-slate-300"
                autoFocus={!editingExpense}
              />
            </div>

            {/* Quick add buttons */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11px] text-slate-400">দ্রুত যোগ:</span>
              {QUICK_AMOUNTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleQuickAdd(q)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 transition-colors"
                >
                  +{toBengaliNumber(q)}৳
                </button>
              ))}
            </div>
          </div>

          {/* Title / Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              বিবরণ / শিরোনাম <span className="text-rose-500">*</span>
            </label>
            <input
              id="input-expense-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError('');
              }}
              placeholder="যেমন: দুপুরের খাবার, শাকসবজি, রিকশা ভাড়া, মোবাইল রিচার্জ"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Category Selector with Main & Sub-categories */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-600">
                খরচের খাত ও উপ-খাত নির্বাচন করুন <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                id="btn-inline-add-category"
                onClick={() => onOpenAddCategory(activeMainId || null)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>নতুন উপ-খাত যোগ</span>
              </button>
            </div>

            {/* Step 1: Main Categories Selector (Tabs) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
              {mainCategories.map((main) => {
                const isActive = activeMainId === main.id;
                return (
                  <button
                    key={main.id}
                    type="button"
                    onClick={() => {
                      setActiveMainId(main.id);
                      // Auto-select first sub-category if current selection is not under this main
                      const subs = getSubCategories(main.id, categories);
                      if (subs.length > 0 && !subs.some((s) => s.id === categoryId)) {
                        setCategoryId(subs[0].id);
                      } else if (subs.length === 0) {
                        setCategoryId(main.id);
                      }
                      setError('');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all border ${
                      isActive
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-100 text-slate-600 border-slate-200/80 hover:bg-slate-200/80'
                    }`}
                  >
                    <CategoryIcon name={main.icon} className="w-3.5 h-3.5" />
                    <span>{main.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Step 2: Sub-categories under the Active Main Category */}
            <div className="mt-2 p-2 bg-slate-50/80 rounded-2xl border border-slate-200/80">
              <div className="flex items-center justify-between px-1 mb-2">
                <span className="text-[11px] font-semibold text-slate-500">
                  {mainCategories.find((m) => m.id === activeMainId)?.name || 'খাত'}-এর উপ-খাতসমূহ:
                </span>
                {selectedHierarchy.category && (
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/70 px-2 py-0.5 rounded-md truncate max-w-[200px]">
                    বাছাই: {selectedHierarchy.fullName}
                  </span>
                )}
              </div>

              {activeSubCategories.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
                  {activeSubCategories.map((sub) => {
                    const isSelected = categoryId === sub.id;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          setCategoryId(sub.id);
                          setError('');
                        }}
                        className={`flex items-center gap-2 p-2 rounded-xl text-left text-xs transition-all border ${
                          isSelected
                            ? 'bg-white border-2 font-bold text-slate-900 shadow-sm ring-1 ring-emerald-500/20'
                            : 'bg-white/60 hover:bg-white text-slate-700 border-slate-200/60'
                        }`}
                        style={{
                          borderColor: isSelected ? sub.color || '#10b981' : undefined,
                        }}
                      >
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs"
                          style={{ backgroundColor: sub.color || '#10b981' }}
                        >
                          <CategoryIcon name={sub.icon} className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate text-[11px] sm:text-xs flex-1">
                          {sub.name}
                        </span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[3]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-3">
                  <p className="text-xs text-slate-400">এই প্রধান খাতে কোনো উপ-খাত নেই</p>
                  <button
                    type="button"
                    onClick={() => onOpenAddCategory(activeMainId)}
                    className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>+ উপ-খাত তৈরি করুন</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Payment Source (ব্যাংক নাকি ক্যাশ) + Add Bank Button */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-600">
                কোন ব্যাংক বা মাধ্যম থেকে খরচ? <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                id="btn-inline-add-bank"
                onClick={onOpenAddBank}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>নতুন ব্যাংক এড করুন</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {paymentSources.map((src) => {
                const isSelected = paymentSourceId === src.id;
                return (
                  <button
                    key={src.id}
                    type="button"
                    onClick={() => {
                      setPaymentSourceId(src.id);
                      setError('');
                    }}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl text-left text-xs transition-all border ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 font-bold text-slate-900 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: src.color }}
                    >
                      {getSourceIcon(src.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold truncate">{src.name}</p>
                      {src.accountNumber && (
                        <p className="text-[10px] text-slate-400 truncate">{src.accountNumber}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                তারিখ
              </label>
              <div className="relative flex items-center">
                <Calendar className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
                <input
                  id="input-expense-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                সময়
              </label>
              <div className="relative flex items-center">
                <Clock className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
                <input
                  id="input-expense-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Note (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              নোট বা অতিরিক্ত মন্তব্য (ঐচ্ছিক)
            </label>
            <input
              id="input-expense-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="যেমন: দোকানের নাম, মেমোর নম্বর বা বিশেষ কিছু"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 placeholder:text-slate-400"
            />
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              id="btn-save-expense"
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>{editingExpense ? 'খরচের তথ্য আপডেট করুন' : 'খরচের হিসাব সংরক্ষণ করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
