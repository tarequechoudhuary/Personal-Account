import React, { useState, useMemo } from 'react';
import {
  Plus,
  Landmark,
  Banknote,
  Smartphone,
  Edit2,
  Trash2,
  TrendingDown,
  TrendingUp,
  ArrowRight,
  ArrowDownLeft,
  Wallet,
  Scale,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { PaymentSource, Expense, ExpenseCategory, PaymentType, Income, IncomeCategory } from '../types';
import { formatCurrency, toBengaliNumber, BENGALI_MONTHS } from '../utils/formatters';
import { ExpenseItem } from './ExpenseItem';
import { IncomeItem } from './IncomeItem';

interface BanksViewProps {
  paymentSources: PaymentSource[];
  expenses: Expense[];
  incomes?: Income[];
  categories: ExpenseCategory[];
  incomeCategories?: IncomeCategory[];
  onAddBank: () => void;
  onEditBank: (source: PaymentSource) => void;
  onDeleteBank: (id: string) => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onAddIncomeForSource?: (sourceId: string) => void;
  onEditIncome?: (income: Income) => void;
  onDeleteIncome?: (id: string) => void;
}

export const BanksView: React.FC<BanksViewProps> = ({
  paymentSources = [],
  expenses = [],
  incomes = [],
  categories = [],
  incomeCategories = [],
  onAddBank,
  onEditBank,
  onDeleteBank,
  onEditExpense,
  onDeleteExpense,
  onAddIncomeForSource,
  onEditIncome,
  onDeleteIncome,
}) => {
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<PaymentType | 'all'>('all');

  const getSourceIcon = (type: PaymentType) => {
    switch (type) {
      case 'bank':
        return <Landmark className="w-5 h-5" />;
      case 'mfs':
        return <Smartphone className="w-5 h-5" />;
      case 'cash':
      default:
        return <Banknote className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: PaymentType) => {
    switch (type) {
      case 'bank':
        return 'ব্যাংক একাউন্ট';
      case 'mfs':
        return 'মোবাইল ব্যাংকিং';
      case 'cash':
      default:
        return 'নগদ ক্যাশ';
    }
  };

  // Filter sources
  const filteredSources = paymentSources.filter((s) => {
    if (typeFilter !== 'all' && s.type !== typeFilter) return false;
    return true;
  });

  // Calculate totals for a source
  const getSourceExpenseTotal = (sourceId: string) => {
    return expenses
      .filter((e) => e.paymentSourceId === sourceId)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const getSourceIncomeTotal = (sourceId: string) => {
    return incomes
      .filter((i) => i.paymentSourceId === sourceId)
      .reduce((sum, i) => sum + i.amount, 0);
  };

  const getSourceBalance = (sourceId: string) => {
    return getSourceIncomeTotal(sourceId) - getSourceExpenseTotal(sourceId);
  };

  const getSourceTxCount = (sourceId: string) => {
    const expCount = expenses.filter((e) => e.paymentSourceId === sourceId).length;
    const incCount = incomes.filter((i) => i.paymentSourceId === sourceId).length;
    return { expCount, incCount, total: expCount + incCount };
  };

  // Current & Previous Month Balance Calculations
  const today = new Date();
  const currYear = today.getFullYear();
  const currMonth = today.getMonth() + 1;

  const prevMonthDate = new Date(currYear, currMonth - 2, 1);
  const prevYear = prevMonthDate.getFullYear();
  const prevMonth = prevMonthDate.getMonth() + 1;
  const prevLastDay = new Date(prevYear, prevMonth, 0).getDate();
  const prevCutoff = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(prevLastDay).padStart(2, '0')}`;

  const currLastDay = new Date(currYear, currMonth, 0).getDate();
  const currCutoff = `${currYear}-${String(currMonth).padStart(2, '0')}-${String(currLastDay).padStart(2, '0')}`;

  const prevMonthLabel = `${BENGALI_MONTHS[prevMonth - 1]} ${toBengaliNumber(prevYear)}`;
  const currMonthLabel = `${BENGALI_MONTHS[currMonth - 1]} ${toBengaliNumber(currYear)}`;

  // Total balance across ALL accounts up to last month end vs this month
  const lastMonthTotalAllBalances = useMemo(() => {
    const inc = incomes.filter((i) => i.date <= prevCutoff).reduce((s, i) => s + i.amount, 0);
    const exp = expenses.filter((e) => e.date <= prevCutoff).reduce((s, e) => s + e.amount, 0);
    return inc - exp;
  }, [incomes, expenses, prevCutoff]);

  const thisMonthTotalAllBalances = useMemo(() => {
    const inc = incomes.filter((i) => i.date <= currCutoff).reduce((s, i) => s + i.amount, 0);
    const exp = expenses.filter((e) => e.date <= currCutoff).reduce((s, e) => s + e.amount, 0);
    return inc - exp;
  }, [incomes, expenses, currCutoff]);

  const totalBalanceDiff = thisMonthTotalAllBalances - lastMonthTotalAllBalances;

  // Function to get balance at previous month end for a single source
  const getSourcePrevMonthBalance = (sourceId: string) => {
    const inc = incomes
      .filter((i) => i.paymentSourceId === sourceId && i.date <= prevCutoff)
      .reduce((s, i) => s + i.amount, 0);
    const exp = expenses
      .filter((e) => e.paymentSourceId === sourceId && e.date <= prevCutoff)
      .reduce((s, e) => s + e.amount, 0);
    return inc - exp;
  };

  // Currently selected source for viewing individual statement
  const selectedSource = paymentSources.find((s) => s.id === selectedSourceId);
  const selectedSourceExpenses = selectedSourceId
    ? expenses.filter((e) => e.paymentSourceId === selectedSourceId)
    : [];
  const selectedSourceIncomes = selectedSourceId
    ? incomes.filter((i) => i.paymentSourceId === selectedSourceId)
    : [];

  // Combined transactions for selected source sorted by date/time
  type CombinedTx =
    | { type: 'expense'; data: Expense; date: string; time: string; timestamp: number }
    | { type: 'income'; data: Income; date: string; time: string; timestamp: number };

  const selectedSourceCombined: CombinedTx[] = [
    ...selectedSourceExpenses.map((e) => ({
      type: 'expense' as const,
      data: e,
      date: e.date,
      time: e.time,
      timestamp: e.createdAt,
    })),
    ...selectedSourceIncomes.map((i) => ({
      type: 'income' as const,
      data: i,
      date: i.date,
      time: i.time,
      timestamp: i.createdAt,
    })),
  ].sort((a, b) => {
    if (a.date === b.date) {
      return (b.time || '00:00').localeCompare(a.time || '00:00');
    }
    return b.date.localeCompare(a.date);
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Top Banner / Intro */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800">
            ব্যাংক ও ক্যাশ একাউন্টস
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            কোন ব্যাংকে কত টাকা জমা হয়েছে ও কত খরচ হয়েছে তার স্থিতি
          </p>
        </div>
        <button
          id="btn-add-new-bank-page"
          onClick={onAddBank}
          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন ব্যাংক যোগ</span>
        </button>
      </div>

      {/* Month-over-Month Combined Balance Banner */}
      <div className="bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-4 shadow-lg space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">
                সব একাউন্ট মিলে মাসিক ব্যালেন্স তুলনা
              </h4>
              <p className="text-[10px] text-slate-400">
                গত মাস বনাম এই মাসের মোট ব্যালেন্সের পরিবর্তন
              </p>
            </div>
          </div>
          <span
            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
              totalBalanceDiff >= 0
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
          >
            {totalBalanceDiff >= 0 ? (
              <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
            ) : (
              <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
            )}
            <span>
              {totalBalanceDiff >= 0 ? '+' : ''}
              {formatCurrency(totalBalanceDiff)}
            </span>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-white/10 rounded-2xl p-2.5 border border-white/10">
            <span className="text-[10px] text-slate-300 block font-medium">
              {prevMonthLabel}-এর শেষ ব্যালেন্স:
            </span>
            <span className="font-extrabold text-white text-sm sm:text-base mt-0.5 block truncate">
              {formatCurrency(lastMonthTotalAllBalances)}
            </span>
          </div>

          <div className="bg-white/15 rounded-2xl p-2.5 border border-emerald-500/30">
            <span className="text-[10px] text-emerald-200 block font-medium">
              {currMonthLabel}-এর বর্তমান ব্যালেন্স:
            </span>
            <span className="font-extrabold text-emerald-300 text-sm sm:text-base mt-0.5 block truncate">
              {formatCurrency(thisMonthTotalAllBalances)}
            </span>
          </div>
        </div>
      </div>

      {/* Type Filter Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setTypeFilter('all')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
            typeFilter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          সকল মাধ্যম ({toBengaliNumber(paymentSources.length)})
        </button>
        <button
          onClick={() => setTypeFilter('bank')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
            typeFilter === 'bank'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          ব্যাংক সমূহ
        </button>
        <button
          onClick={() => setTypeFilter('cash')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
            typeFilter === 'cash'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          নগদ ক্যাশ
        </button>
        <button
          onClick={() => setTypeFilter('mfs')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
            typeFilter === 'mfs'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          মোবাইল ব্যাংকিং
        </button>
      </div>

      {/* Bank & Cash Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredSources.map((source) => {
          const totalIncome = getSourceIncomeTotal(source.id);
          const totalSpent = getSourceExpenseTotal(source.id);
          const balance = totalIncome - totalSpent;
          const { total } = getSourceTxCount(source.id);
          const isSelected = selectedSourceId === source.id;

          return (
            <div
              key={source.id}
              id={`bank-card-${source.id}`}
              className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md'
                  : 'border-slate-100 hover:border-slate-200 shadow-xs'
              }`}
              onClick={() => setSelectedSourceId(isSelected ? null : source.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-2xl text-white flex items-center justify-center shrink-0 shadow-xs"
                    style={{ backgroundColor: source.color }}
                  >
                    {getSourceIcon(source.type)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">
                      {source.name}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                      <span className="font-medium">{getTypeLabel(source.type)}</span>
                      {source.accountNumber && (
                        <>
                          <span>•</span>
                          <span className="text-[11px] truncate max-w-[120px]">
                            {source.accountNumber}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Edit / Delete actions */}
                <div
                  className="flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Quick Add Income to this Account */}
                  {onAddIncomeForSource && (
                    <button
                      id={`btn-add-income-to-${source.id}`}
                      onClick={() => onAddIncomeForSource(source.id)}
                      className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-200/60"
                      title="এই অ্যাকাউন্টে টাকা জমা বা বেতন যোগ করুন"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    id={`btn-edit-bank-${source.id}`}
                    onClick={() => onEditBank(source)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="সম্পাদনা করুন"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {!source.isDefault && (
                    <button
                      id={`btn-delete-bank-${source.id}`}
                      onClick={() => onDeleteBank(source.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Financial Breakdown: Inflow, Outflow, Balance */}
              <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-1.5 text-center">
                <div className="bg-slate-50/70 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-500 block font-semibold flex items-center justify-center gap-0.5">
                    <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                    মোট জমা
                  </span>
                  <span className="text-xs font-bold text-emerald-600 mt-0.5 block truncate">
                    +{formatCurrency(totalIncome)}
                  </span>
                </div>

                <div className="bg-slate-50/70 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-500 block font-semibold flex items-center justify-center gap-0.5">
                    <TrendingDown className="w-3 h-3 text-rose-500" />
                    মোট খরচ
                  </span>
                  <span className="text-xs font-bold text-rose-600 mt-0.5 block truncate">
                    -{formatCurrency(totalSpent)}
                  </span>
                </div>

                <div className="bg-emerald-50/70 p-2 rounded-xl border border-emerald-100/80">
                  <span className="text-[10px] text-emerald-800 block font-semibold flex items-center justify-center gap-0.5">
                    <Wallet className="w-3 h-3 text-emerald-700" />
                    ব্যালেন্স
                  </span>
                  <span
                    className={`text-xs font-extrabold mt-0.5 block truncate ${
                      balance >= 0 ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {balance >= 0 ? '' : '-'}
                    {formatCurrency(Math.abs(balance))}
                  </span>
                </div>
              </div>

              {/* Month-over-Month Comparison row for this account */}
              {(() => {
                const prevBal = getSourcePrevMonthBalance(source.id);
                const diffBal = balance - prevBal;
                const isInc = diffBal >= 0;
                return (
                  <div className="mt-2 bg-slate-50/90 p-2 rounded-xl text-[11px] flex items-center justify-between border border-slate-100">
                    <span className="text-slate-500">
                      গত মাসে ছিল: <strong>{formatCurrency(prevBal)}</strong>
                    </span>
                    <span
                      className={`font-extrabold flex items-center gap-0.5 ${
                        isInc ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {isInc ? (
                        <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
                      )}
                      <span>
                        {isInc ? '+' : ''}
                        {formatCurrency(diffBal)}
                      </span>
                    </span>
                  </div>
                );
              })()}

              {/* Click to filter note */}
              <div className="mt-2.5 text-[10px] text-indigo-600 font-semibold flex items-center justify-between">
                <span className="text-slate-400">
                  মোট {toBengaliNumber(total)} টি লেনদেন
                </span>
                <span className="flex items-center gap-1">
                  <span>{isSelected ? 'স্টেটমেন্ট লুকান' : 'স্টেটমেন্ট দেখুন'}</span>
                  <ArrowRight className={`w-3 h-3 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Bank Details / Transactions List */}
      {selectedSource && (
        <div className="bg-slate-50 rounded-3xl p-4 border border-slate-200 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: selectedSource.color }}
              />
              <h4 className="font-bold text-slate-800 text-sm">
                "{selectedSource.name}" এর লেনদেনের বিবরণ
              </h4>
            </div>
            <div className="flex items-center gap-2">
              {onAddIncomeForSource && (
                <button
                  onClick={() => onAddIncomeForSource(selectedSource.id)}
                  className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>টাকা জমা</span>
                </button>
              )}
              <button
                onClick={() => setSelectedSourceId(null)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2 py-1"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>

          {selectedSourceCombined.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center text-slate-500 text-xs border border-slate-100">
              এই ব্যাংক বা মাধ্যম থেকে এখনো কোনো লেনদেন লিপিবদ্ধ করা হয়নি।
            </div>
          ) : (
            selectedSourceCombined.map((tx) => {
              if (tx.type === 'expense') {
                const cat = categories.find((c) => c.id === tx.data.categoryId);
                return (
                  <ExpenseItem
                    key={`exp-${tx.data.id}`}
                    expense={tx.data}
                    category={cat}
                    categories={categories}
                    paymentSource={selectedSource}
                    onEdit={onEditExpense}
                    onDelete={onDeleteExpense}
                    showDate={true}
                  />
                );
              } else {
                const cat = incomeCategories.find((c) => c.id === tx.data.categoryId);
                return (
                  <IncomeItem
                    key={`inc-${tx.data.id}`}
                    income={tx.data}
                    category={cat}
                    paymentSource={selectedSource}
                    onEdit={(inc) => onEditIncome?.(inc)}
                    onDelete={(id) => onDeleteIncome?.(id)}
                    showDate={true}
                  />
                );
              }
            })
          )}
        </div>
      )}
    </div>
  );
};
