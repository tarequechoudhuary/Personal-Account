import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Landmark,
  Banknote,
  Smartphone,
  Check,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { Income, IncomeCategory, PaymentSource } from '../types';
import { getCurrentDateString, getCurrentTimeString, toBengaliNumber } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface AddIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (income: Omit<Income, 'id' | 'createdAt'>, id?: string) => void;
  categories?: IncomeCategory[];
  incomeCategories?: IncomeCategory[];
  paymentSources?: PaymentSource[];
  editingIncome?: Income | null;
  defaultSourceId?: string | null;
  defaultPaymentSourceId?: string | null;
  onOpenAddBank?: () => void;
  onSwitchToExpense?: () => void;
}

const QUICK_AMOUNTS = [1000, 5000, 10000, 20000, 50000, 100000];

const SUGGESTIONS = [
  'মাসিক বেতন',
  'দোকানের বিক্রি',
  'ফ্রিল্যান্সিং পেমেন্ট',
  'বোনাস বা ইনসেন্টিভ',
  'বাড়ি ভাড়া বাবদ আয়',
  'উপহার বা হাদিয়া',
  'অন্যান্য আয়',
];

export const AddIncomeModal: React.FC<AddIncomeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories: categoriesProp,
  incomeCategories,
  paymentSources = [],
  editingIncome,
  defaultSourceId,
  defaultPaymentSourceId,
  onOpenAddBank,
  onSwitchToExpense,
}) => {
  const categories = incomeCategories || categoriesProp || [];
  const effectiveDefaultSourceId = defaultSourceId || defaultPaymentSourceId;

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getCurrentDateString());
  const [time, setTime] = useState(getCurrentTimeString());
  const [categoryId, setCategoryId] = useState('');
  const [paymentSourceId, setPaymentSourceId] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingIncome) {
      setTitle(editingIncome.title);
      setAmount(String(editingIncome.amount));
      setDate(editingIncome.date);
      setTime(editingIncome.time || getCurrentTimeString());
      setCategoryId(editingIncome.categoryId);
      setPaymentSourceId(editingIncome.paymentSourceId);
      setNote(editingIncome.note || '');
    } else {
      setTitle('');
      setAmount('');
      setDate(getCurrentDateString());
      setTime(getCurrentTimeString());
      setNote('');

      // Default category (Salary)
      if (categories && categories.length > 0) {
        setCategoryId(categories[0].id);
      }

      // Default payment source
      if (effectiveDefaultSourceId) {
        setPaymentSourceId(effectiveDefaultSourceId);
      } else if (paymentSources && paymentSources.length > 0) {
        setPaymentSourceId(paymentSources[0].id);
      }
    }
    setError('');
  }, [editingIncome, isOpen, categories, paymentSources, effectiveDefaultSourceId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (!title.trim()) {
      setError('অনুগ্রহ করে আয়ের বিবরণ লিখুন');
      return;
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('সঠিক টাকার পরিমাণ দিন');
      return;
    }

    if (!categoryId && categories.length > 0) {
      setError('অনুগ্রহ করে আয়ের খাত নির্বাচন করুন');
      return;
    }

    if (!paymentSourceId && paymentSources.length > 0) {
      setError('টাকা কোন একাউন্টে জমা হয়েছে তা নির্বাচন করুন');
      return;
    }

    onSave(
      {
        title: title.trim(),
        amount: parsedAmount,
        date,
        time,
        categoryId: categoryId || (categories[0]?.id ?? 'inc-cat-salary'),
        paymentSourceId: paymentSourceId || (paymentSources[0]?.id ?? 'src-cash'),
        note: note.trim() || undefined,
      },
      editingIncome ? editingIncome.id : undefined
    );

    onClose();
  };

  const handleQuickAddAmount = (addVal: number) => {
    const current = parseFloat(amount) || 0;
    setAmount(String(current + addVal));
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'bank':
        return <Landmark className="w-4 h-4" />;
      case 'mfs':
        return <Smartphone className="w-4 h-4" />;
      case 'cash':
      default:
        return <Banknote className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="modal-add-income"
        className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto space-y-4 animate-in slide-in-from-bottom-4 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {editingIncome ? 'আয়ের হিসাব সম্পাদনা' : 'টাকা জমা / নতুন আয় যোগ'}
              </h3>
              <p className="text-xs text-slate-500">
                বেতন, ব্যবসা বা অন্য যেকোনো মাধ্যমে টাকা আসলে জমা করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toggle between Expense and Income if creating new */}
        {!editingIncome && onSwitchToExpense && (
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/60">
            <button
              type="button"
              id="btn-switch-to-expense-from-income"
              onClick={onSwitchToExpense}
              className="flex-1 py-2 rounded-xl text-slate-600 hover:text-rose-700 hover:bg-white/50 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>খরচ (Expense)</span>
            </button>
            <button
              type="button"
              className="flex-1 py-2 rounded-xl bg-white text-emerald-700 font-bold text-xs shadow-xs flex items-center justify-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>টাকা জমা / আয় (Income)</span>
            </button>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 text-rose-600 text-xs font-semibold px-3 py-2 rounded-xl border border-rose-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title & Quick suggestions */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              আয়ের বিবরণ বা উৎস *
            </label>
            <input
              id="input-income-title"
              type="text"
              required
              placeholder="যেমন: চলতি মাসের বেতন, ফ্রিল্যান্সিং আয়, দোকানের লাভ..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
            />

            {/* Suggestions Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {SUGGESTIONS.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setTitle(sug)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60 font-medium transition-colors"
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Field & Quick Buttons */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              টাকার পরিমাণ (৳) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-emerald-600">
                ৳
              </span>
              <input
                id="input-income-amount"
                type="number"
                step="any"
                min="0"
                required
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xl font-extrabold text-emerald-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Quick Add Amounts */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {QUICK_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAddAmount(val)}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200/80 hover:border-emerald-200 transition-colors"
                >
                  +{toBengaliNumber(val)}৳
                </button>
              ))}
            </div>
          </div>

          {/* Account / Payment Source (Where money was deposited) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              টাকা কোথায় জমা হয়েছে? (অ্যাকাউন্ট) *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {paymentSources.map((source) => {
                const isSelected = paymentSourceId === source.id;
                return (
                  <button
                    key={source.id}
                    type="button"
                    onClick={() => setPaymentSourceId(source.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs"
                      style={{ backgroundColor: source.color }}
                    >
                      {getSourceIcon(source.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {source.name}
                      </p>
                      {source.accountNumber && (
                        <p className="text-[10px] text-slate-400 truncate">
                          {source.accountNumber}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Income Category */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              আয়ের খাত / ক্যাটাগরি *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/80 shadow-xs ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 truncate flex-1">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600">
                তারিখ
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600">
                সময়
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-600">
              নোট বা মন্তব্য (ঐচ্ছিক)
            </label>
            <input
              type="text"
              placeholder="যেমন: মার্চ মাসের বোনাস সহ পেমেন্ট..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
            >
              বাতিল
            </button>
            <button
              id="btn-submit-income"
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{editingIncome ? 'আপডেট করুন' : 'টাকা জমা সেভ করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
