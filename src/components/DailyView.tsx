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
  TrendingUp,
  ArrowDownLeft,
  Wallet,
} from 'lucide-react';
import { Expense, ExpenseCategory, PaymentSource, Income, IncomeCategory } from '../types';
import {
  formatCurrency,
  formatBengaliDate,
  getCurrentDateString,
  toBengaliNumber,
} from '../utils/formatters';
import { ExpenseItem } from './ExpenseItem';
import { IncomeItem } from './IncomeItem';

interface DailyViewProps {
  expenses: Expense[];
  incomes?: Income[];
  categories: ExpenseCategory[];
  incomeCategories?: IncomeCategory[];
  paymentSources: PaymentSource[];
  onAddExpense: () => void;
  onAddIncome?: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onEditIncome?: (income: Income) => void;
  onDeleteIncome?: (id: string) => void;
}

type TxItem =
  | { type: 'expense'; data: Expense; timestamp: number }
  | { type: 'income'; data: Income; timestamp: number };

export const DailyView: React.FC<DailyViewProps> = ({
  expenses = [],
  incomes = [],
  categories = [],
  incomeCategories = [],
  paymentSources = [],
  onAddExpense,
  onAddIncome,
  onEditExpense,
  onDeleteExpense,
  onEditIncome,
  onDeleteIncome,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(getCurrentDateString());
  const [filterCategoryId, setFilterCategoryId] = useState<string>('all');
  const [filterSourceId, setFilterSourceId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTxTab, setActiveTxTab] = useState<'all' | 'expense' | 'income'>('all');

  // Move date by +/- 1 day
  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${day}`);
  };

  // Filter expenses and incomes for selected date
  const dateExpenses = expenses.filter((e) => e.date === selectedDate);
  const dateIncomes = incomes.filter((i) => i.date === selectedDate);

  const mainCategories = categories.filter((c) => !c.parentId);
  const orphanCategories = categories.filter(
    (c) => c.parentId && !categories.some((p) => p.id === c.parentId)
  );

  // Filtered expenses
  const filteredExpenses = dateExpenses.filter((e) => {
    if (filterCategoryId !== 'all') {
      const selectedCat = categories.find((c) => c.id === filterCategoryId);
      if (selectedCat && !selectedCat.parentId) {
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

  // Filtered incomes
  const filteredIncomes = dateIncomes.filter((i) => {
    if (filterSourceId !== 'all' && i.paymentSourceId !== filterSourceId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = i.title.toLowerCase().includes(q);
      const matchNote = i.note?.toLowerCase().includes(q);
      if (!matchTitle && !matchNote) return false;
    }
    return true;
  });

  // Totals for the day
  const totalDayExpense = dateExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalDayIncome = dateIncomes.reduce((sum, i) => sum + i.amount, 0);
  const dayBalance = totalDayIncome - totalDayExpense;

  // Breakdown by cash vs bank vs mfs (for expenses)
  const cashExpense = dateExpenses
    .filter((e) => {
      const src = paymentSources.find((s) => s.id === e.paymentSourceId);
      return src?.type === 'cash';
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const bankExpense = dateExpenses
    .filter((e) => {
      const src = paymentSources.find((s) => s.id === e.paymentSourceId);
      return src?.type === 'bank';
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const mfsExpense = dateExpenses
    .filter((e) => {
      const src = paymentSources.find((s) => s.id === e.paymentSourceId);
      return src?.type === 'mfs';
    })
    .reduce((sum, e) => sum + e.amount, 0);

  // Combine items for the list
  const combinedItems: TxItem[] = [];
  if (activeTxTab === 'all' || activeTxTab === 'expense') {
    filteredExpenses.forEach((e) => {
      combinedItems.push({
        type: 'expense',
        data: e,
        timestamp: e.createdAt || 0,
      });
    });
  }
  if (activeTxTab === 'all' || activeTxTab === 'income') {
    filteredIncomes.forEach((i) => {
      combinedItems.push({
        type: 'income',
        data: i,
        timestamp: i.createdAt || 0,
      });
    });
  }

  // Sort descending by time
  combinedItems.sort((a, b) => {
    const timeA = a.data.time || '00:00';
    const timeB = b.data.time || '00:00';
    if (timeA === timeB) {
      return b.timestamp - a.timestamp;
    }
    return timeB.localeCompare(timeA);
  });

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

      {/* Daily Summary Card with Income & Expense Overview */}
      <div className="bg-linear-to-br from-emerald-600 to-teal-700 rounded-3xl p-5 text-white shadow-lg shadow-emerald-700/20 relative overflow-hidden">
        {/* Subtle decorative background circles */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -left-4 -top-4 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Main header row */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>আজকের হিসাব বিবরণী</span>
            </span>
            <span className="text-xs bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-white font-medium">
              {toBengaliNumber(dateExpenses.length + dateIncomes.length)} টি লেনদেন
            </span>
          </div>

          {/* Income vs Expense vs Balance display */}
          <div className="grid grid-cols-3 gap-2">
            {/* Income */}
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-2.5">
              <div className="flex items-center gap-1 text-emerald-100 text-[11px] font-medium">
                <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>মোট জমা/আয়</span>
              </div>
              <div className="font-extrabold text-base sm:text-lg mt-0.5 text-white truncate">
                +{formatCurrency(totalDayIncome)}
              </div>
            </div>

            {/* Expense */}
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-2.5">
              <div className="flex items-center gap-1 text-emerald-100 text-[11px] font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>মোট খরচ</span>
              </div>
              <div className="font-extrabold text-base sm:text-lg mt-0.5 text-rose-100 truncate">
                -{formatCurrency(totalDayExpense)}
              </div>
            </div>

            {/* Balance */}
            <div className="bg-white/15 backdrop-blur-xs rounded-2xl p-2.5 ring-1 ring-white/20">
              <div className="flex items-center gap-1 text-emerald-100 text-[11px] font-medium">
                <Wallet className="w-3.5 h-3.5" />
                <span>দিনের স্থিতি</span>
              </div>
              <div
                className={`font-extrabold text-base sm:text-lg mt-0.5 truncate ${
                  dayBalance >= 0 ? 'text-white' : 'text-amber-200'
                }`}
              >
                {dayBalance >= 0 ? '+' : ''}
                {formatCurrency(dayBalance)}
              </div>
            </div>
          </div>

          {/* Quick source breakdown pills */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/15 text-xs">
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2">
              <div className="flex items-center gap-1 text-emerald-100 text-[11px]">
                <Banknote className="w-3.5 h-3.5" />
                <span>ক্যাশ খরচ</span>
              </div>
              <div className="font-bold mt-0.5 text-white truncate">
                {formatCurrency(cashExpense)}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2">
              <div className="flex items-center gap-1 text-emerald-100 text-[11px]">
                <Landmark className="w-3.5 h-3.5" />
                <span>ব্যাংক খরচ</span>
              </div>
              <div className="font-bold mt-0.5 text-white truncate">
                {formatCurrency(bankExpense)}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2">
              <div className="flex items-center gap-1 text-emerald-100 text-[11px]">
                <Smartphone className="w-3.5 h-3.5" />
                <span>মোবাইল খরচ</span>
              </div>
              <div className="font-bold mt-0.5 text-white truncate">
                {formatCurrency(mfsExpense)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Quick Add row */}
      <div className="flex items-center justify-between gap-2">
        {/* Transaction Type Filter Tabs */}
        <div className="flex bg-slate-200/80 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTxTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTxTab === 'all'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            সব ({toBengaliNumber(dateExpenses.length + dateIncomes.length)})
          </button>
          <button
            onClick={() => setActiveTxTab('income')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              activeTxTab === 'income'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 hover:text-emerald-800'
            }`}
          >
            <span>আয়</span>
            <span>({toBengaliNumber(dateIncomes.length)})</span>
          </button>
          <button
            onClick={() => setActiveTxTab('expense')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              activeTxTab === 'expense'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-700 hover:text-rose-800'
            }`}
          >
            <span>খরচ</span>
            <span>({toBengaliNumber(dateExpenses.length)})</span>
          </button>
        </div>

        {/* Quick Add Buttons */}
        <div className="flex items-center gap-1.5">
          {onAddIncome && (
            <button
              id="btn-quick-add-income"
              onClick={onAddIncome}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors shadow-2xs"
              title="বেতন বা অন্য কোনো মাধ্যম থেকে টাকা যোগ করুন"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+ আয়</span>
            </button>
          )}
          <button
            id="btn-quick-add-header"
            onClick={onAddExpense}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ খরচ</span>
          </button>
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
            placeholder="আজকের আয় বা খরচের হিসাব খুঁজুন..."
            className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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
            className="bg-white border border-slate-200 text-slate-700 rounded-lg px-2 py-1 text-xs font-medium focus:outline-hidden max-w-[150px] truncate"
          >
            <option value="all">সকল খরচের খাত</option>
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
            className="bg-white border border-slate-200 text-slate-700 rounded-lg px-2 py-1 text-xs font-medium focus:outline-hidden"
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

      {/* Transactions List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-slate-700 text-sm">
            লেনদেনের বিবরণ ({toBengaliNumber(combinedItems.length)})
          </h3>
          <span className="text-[11px] text-slate-400">
            {formatBengaliDate(selectedDate)}
          </span>
        </div>

        {combinedItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <Banknote className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h4 className="font-bold text-slate-800 text-base">
              এই দিনে কোনো হিসাব নেই
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              বেতন বা অন্য মাধ্যম থেকে টাকা আসলে জমা করুন অথবা আজকের খরচের হিসাব লিখে রাখুন।
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              {onAddIncome && (
                <button
                  id="btn-empty-add-income"
                  onClick={onAddIncome}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>+ টাকা জমা / বেতন</span>
                </button>
              )}
              <button
                id="btn-empty-add-expense"
                onClick={onAddExpense}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>+ নতুন খরচ যোগ করুন</span>
              </button>
            </div>
          </div>
        ) : (
          combinedItems.map((item) => {
            if (item.type === 'expense') {
              const expense = item.data;
              const cat = categories.find((c) => c.id === expense.categoryId);
              const src = paymentSources.find((s) => s.id === expense.paymentSourceId);
              return (
                <ExpenseItem
                  key={`exp-${expense.id}`}
                  expense={expense}
                  category={cat}
                  categories={categories}
                  paymentSource={src}
                  onEdit={onEditExpense}
                  onDelete={onDeleteExpense}
                />
              );
            } else {
              const income = item.data;
              const cat = incomeCategories.find((c) => c.id === income.categoryId);
              const src = paymentSources.find((s) => s.id === income.paymentSourceId);
              return (
                <IncomeItem
                  key={`inc-${income.id}`}
                  income={income}
                  category={cat}
                  paymentSource={src}
                  onEdit={(inc) => onEditIncome?.(inc)}
                  onDelete={(id) => onDeleteIncome?.(id)}
                />
              );
            }
          })
        )}
      </div>
    </div>
  );
};
