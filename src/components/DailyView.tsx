import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Filter,
  Plus,
  Landmark,
  Banknote,
  Smartphone,
  Search,
} from 'lucide-react';
import { Expense, ExpenseCategory, PaymentSource } from '../types';
import {
  formatCurrency,
  formatBengaliDate,
  getCurrentDateString,
  toBengaliNumber,
} from '../utils/formatters';
import { ExpenseItem } from './ExpenseItem';

interface DailyViewProps {
  expenses: Expense[];
  categories: ExpenseCategory[];
  paymentSources: PaymentSource[];
  onAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

export const DailyView: React.FC<DailyViewProps> = ({
  expenses,
  categories,
  paymentSources,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(getCurrentDateString());
  const [filterCategoryId, setFilterCategoryId] = useState<string>('all');
  const [filterSourceId, setFilterSourceId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Move date by +/- 1 day
  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${day}`);
  };

  // Filter expenses for selected date
  const dateExpenses = expenses.filter((e) => e.date === selectedDate);

  const mainCategories = categories.filter((c) => !c.parentId);
  const orphanCategories = categories.filter(
    (c) => c.parentId && !categories.some((p) => p.id === c.parentId)
  );

  // Apply category, source, and search filters
  const filteredExpenses = dateExpenses.filter((e) => {
    if (filterCategoryId !== 'all') {
      const selectedCat = categories.find((c) => c.id === filterCategoryId);
      if (selectedCat && !selectedCat.parentId) {
        // Main category: match if expense is directly in it OR any of its sub-categories
        const subCatIds = categories.filter((c) => c.parentId === selectedCat.id).map((c) => c.id);
        if (e.categoryId !== selectedCat.id && !subCatIds.includes(e.categoryId)) {
          return false;
        }
      } else if (e.categoryId !== filterCategoryId) {
        return false;
      }
    }
    if (filterSourceId !== 'all' && e.paymentSourceId !== filterSourceId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = e.title.toLowerCase().includes(q);
      const matchNote = e.note?.toLowerCase().includes(q);
      if (!matchTitle && !matchNote) return false;
    }
    return true;
  });

  // Calculate totals for the day
  const totalDayExpense = dateExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Breakdown by cash vs bank vs mfs
  const cashTotal = dateExpenses
    .filter((e) => {
      const src = paymentSources.find((s) => s.id === e.paymentSourceId);
      return src?.type === 'cash';
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const bankTotal = dateExpenses
    .filter((e) => {
      const src = paymentSources.find((s) => s.id === e.paymentSourceId);
      return src?.type === 'bank';
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const mfsTotal = dateExpenses
    .filter((e) => {
      const src = paymentSources.find((s) => s.id === e.paymentSourceId);
      return src?.type === 'mfs';
    })
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-4 pb-20">
      {/* Date Navigation Bar */}
      <div className="bg-white rounded-2xl p-2.5 border border-slate-100 shadow-xs flex items-center justify-between">
        <button
          id="btn-prev-day"
          onClick={() => changeDate(-1)}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
          title="পূর্ববর্তী দিন"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <label
            htmlFor="date-picker-input"
            className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 text-sm hover:text-emerald-600 transition-colors"
          >
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>{formatBengaliDate(selectedDate)}</span>
          </label>
          <input
            id="date-picker-input"
            type="date"
            value={selectedDate}
            onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
            className="sr-only"
          />
          {selectedDate !== getCurrentDateString() && (
            <button
              onClick={() => setSelectedDate(getCurrentDateString())}
              className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200"
            >
              আজ
            </button>
          )}
        </div>

        <button
          id="btn-next-day"
          onClick={() => changeDate(1)}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
          title="পরবর্তী দিন"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Daily Summary Card */}
      <div className="bg-linear-to-br from-emerald-600 to-teal-700 rounded-3xl p-5 text-white shadow-lg shadow-emerald-700/20 relative overflow-hidden">
        {/* Subtle decorative background circles */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -left-4 -top-4 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
              দিনের মোট খরচ
            </span>
            <span className="text-xs bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-white font-medium">
              {toBengaliNumber(dateExpenses.length)} টি এন্ট্রি
            </span>
          </div>

          <div className="text-3xl sm:text-4xl font-extrabold mt-1 tracking-tight">
            {formatCurrency(totalDayExpense)}
          </div>

          {/* Quick source breakdown pills */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/15 text-xs">
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2">
              <div className="flex items-center gap-1 text-emerald-100 text-[11px]">
                <Banknote className="w-3.5 h-3.5" />
                <span>ক্যাশ</span>
              </div>
              <div className="font-bold mt-0.5 text-white truncate">
                {formatCurrency(cashTotal)}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2">
              <div className="flex items-center gap-1 text-emerald-100 text-[11px]">
                <Landmark className="w-3.5 h-3.5" />
                <span>ব্যাংক</span>
              </div>
              <div className="font-bold mt-0.5 text-white truncate">
                {formatCurrency(bankTotal)}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2">
              <div className="flex items-center gap-1 text-emerald-100 text-[11px]">
                <Smartphone className="w-3.5 h-3.5" />
                <span>মোবাইল</span>
              </div>
              <div className="font-bold mt-0.5 text-white truncate">
                {formatCurrency(mfsTotal)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter / Search Row */}
      <div className="space-y-2">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400" />
          <input
            id="input-search-daily-expense"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="আজকের খরচের তালিকা খুঁজুন..."
            className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-xs text-slate-400 hover:text-slate-600 font-semibold"
            >
              মুছুন
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <div className="flex items-center gap-1 text-slate-400 shrink-0 text-[11px]">
            <Filter className="w-3.5 h-3.5" />
            <span>ফিল্টার:</span>
          </div>

          <select
            id="select-category-filter"
            value={filterCategoryId}
            onChange={(e) => setFilterCategoryId(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 rounded-lg px-2 py-1 text-xs font-medium focus:outline-none max-w-[150px] truncate"
          >
            <option value="all">সকল খাত / হাত</option>
            {mainCategories.map((main) => {
              const subs = categories.filter((c) => c.parentId === main.id);
              return (
                <optgroup key={main.id} label={`📁 ${main.name}`}>
                  <option value={main.id}>📌 {main.name} (পুরো খাত)</option>
                  {subs.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      &nbsp;&nbsp;↳ {sub.name}
                    </option>
                  ))}
                </optgroup>
              );
            })}
            {orphanCategories.length > 0 && (
              <optgroup label="অন্যান্য">
                {orphanCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>

          <select
            id="select-source-filter"
            value={filterSourceId}
            onChange={(e) => setFilterSourceId(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 rounded-lg px-2 py-1 text-xs font-medium focus:outline-none"
          >
            <option value="all">ক্যাশ ও সকল ব্যাংক</option>
            {paymentSources.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-slate-700 text-sm">
            খরচের তালিকা ({toBengaliNumber(filteredExpenses.length)})
          </h3>
          <button
            id="btn-quick-add-header"
            onClick={onAddExpense}
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
          >
            <Plus className="w-4 h-4" />
            <span>খরচ যোগ করুন</span>
          </button>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <Banknote className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h4 className="font-bold text-slate-800 text-base">
              এই দিনে কোনো খরচের হিসাব নেই
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              আজকের বাজারের সদাই, নাস্তা, ভাড়া বা ব্যাংকের পেমেন্ট সংরক্ষণ করতে নিচের প্লাস বোতাম চাপুন।
            </p>
            <button
              id="btn-empty-add-expense"
              onClick={onAddExpense}
              className="mt-4 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95"
            >
              + নতুন খরচ যোগ করুন
            </button>
          </div>
        ) : (
          filteredExpenses.map((expense) => {
            const cat = categories.find((c) => c.id === expense.categoryId);
            const src = paymentSources.find((s) => s.id === expense.paymentSourceId);
            return (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                category={cat}
                categories={categories}
                paymentSource={src}
                onEdit={onEditExpense}
                onDelete={onDeleteExpense}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
