import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Landmark,
  Banknote,
  Smartphone,
  Layers,
  Scale,
  Calendar,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Wallet,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { Expense, ExpenseCategory, PaymentSource, Income } from '../types';
import {
  formatCurrency,
  toBengaliNumber,
  BENGALI_MONTHS,
} from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface MonthlyComparisonViewProps {
  expenses: Expense[];
  incomes: Income[];
  categories: ExpenseCategory[];
  paymentSources: PaymentSource[];
  currentYear: number;
  currentMonth: number; // 1-12
  onClose?: () => void;
}

export const MonthlyComparisonView: React.FC<MonthlyComparisonViewProps> = ({
  expenses = [],
  incomes = [],
  categories = [],
  paymentSources = [],
  currentYear,
  currentMonth,
}) => {
  // Month A: Primary/Target Month (Default: currentMonth)
  const [targetYear, setTargetYear] = useState<number>(currentYear);
  const [targetMonth, setTargetMonth] = useState<number>(currentMonth);

  // Month B: Base/Comparison Month (Default: targetMonth - 1)
  const defaultBaseDate = new Date(currentYear, currentMonth - 2, 1);
  const [baseYear, setBaseYear] = useState<number>(defaultBaseDate.getFullYear());
  const [baseMonth, setBaseMonth] = useState<number>(defaultBaseDate.getMonth() + 1);

  // Active view tab: 'balances' (সব একাউন্টের ব্যালেন্স তুলনা) vs 'categories' (খাতভিত্তিক খরচের তুলনা)
  const [comparisonTab, setComparisonTab] = useState<'balances' | 'categories'>('balances');

  // Filter for category list
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'increased' | 'decreased' | 'new'>('all');
  const [sortBy, setSortBy] = useState<'difference' | 'amount' | 'name'>('difference');

  // Prefix strings
  const targetPrefix = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;
  const basePrefix = `${baseYear}-${String(baseMonth).padStart(2, '0')}`;

  // Month Labels in Bengali
  const targetLabel = `${BENGALI_MONTHS[targetMonth - 1]} ${toBengaliNumber(targetYear)}`;
  const baseLabel = `${BENGALI_MONTHS[baseMonth - 1]} ${toBengaliNumber(baseYear)}`;

  // Filter transactions for both months
  const targetExpenses = useMemo(
    () => expenses.filter((e) => e.date.startsWith(targetPrefix)),
    [expenses, targetPrefix]
  );
  const baseExpenses = useMemo(
    () => expenses.filter((e) => e.date.startsWith(basePrefix)),
    [expenses, basePrefix]
  );

  const targetIncomes = useMemo(
    () => incomes.filter((i) => i.date.startsWith(targetPrefix)),
    [incomes, targetPrefix]
  );
  const baseIncomes = useMemo(
    () => incomes.filter((i) => i.date.startsWith(basePrefix)),
    [incomes, basePrefix]
  );

  // Totals for Target Month
  const targetTotalExpense = useMemo(
    () => targetExpenses.reduce((s, e) => s + e.amount, 0),
    [targetExpenses]
  );
  const targetTotalIncome = useMemo(
    () => targetIncomes.reduce((s, i) => s + i.amount, 0),
    [targetIncomes]
  );
  const targetNetSavings = targetTotalIncome - targetTotalExpense;

  // Totals for Base Month
  const baseTotalExpense = useMemo(
    () => baseExpenses.reduce((s, e) => s + e.amount, 0),
    [baseExpenses]
  );
  const baseTotalIncome = useMemo(
    () => baseIncomes.reduce((s, i) => s + i.amount, 0),
    [baseIncomes]
  );
  const baseNetSavings = baseTotalIncome - baseTotalExpense;

  // Total Cumulative Balance Calculation up to end of each month
  // Cumulative balance up to end of month = (All incomes up to that month end) - (All expenses up to that month end)
  const calculateAccountBalancesAtMonthEnd = (year: number, month: number) => {
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    const cutOffDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`;

    const cumulativeIncomes = incomes.filter((i) => i.date <= cutOffDate);
    const cumulativeExpenses = expenses.filter((e) => e.date <= cutOffDate);

    const sourceBalances = paymentSources.map((source) => {
      const srcIncomes = cumulativeIncomes
        .filter((i) => i.paymentSourceId === source.id)
        .reduce((sum, i) => sum + i.amount, 0);
      const srcExpenses = cumulativeExpenses
        .filter((e) => e.paymentSourceId === source.id)
        .reduce((sum, e) => sum + e.amount, 0);
      const balance = srcIncomes - srcExpenses;
      return {
        source,
        balance,
        incomeTotal: srcIncomes,
        expenseTotal: srcExpenses,
      };
    });

    const totalBalance = sourceBalances.reduce((sum, s) => sum + s.balance, 0);
    return { sourceBalances, totalBalance };
  };

  const baseBalanceData = useMemo(
    () => calculateAccountBalancesAtMonthEnd(baseYear, baseMonth),
    [baseYear, baseMonth, incomes, expenses, paymentSources]
  );

  const targetBalanceData = useMemo(
    () => calculateAccountBalancesAtMonthEnd(targetYear, targetMonth),
    [targetYear, targetMonth, incomes, expenses, paymentSources]
  );

  const totalBalanceDiff = targetBalanceData.totalBalance - baseBalanceData.totalBalance;
  const totalBalancePercentDiff =
    baseBalanceData.totalBalance !== 0
      ? (totalBalanceDiff / Math.abs(baseBalanceData.totalBalance)) * 100
      : 0;

  // Account comparison items
  const accountComparisons = useMemo(() => {
    return paymentSources.map((source) => {
      const baseObj = baseBalanceData.sourceBalances.find((s) => s.source.id === source.id);
      const targetObj = targetBalanceData.sourceBalances.find((s) => s.source.id === source.id);

      const baseBal = baseObj ? baseObj.balance : 0;
      const targetBal = targetObj ? targetObj.balance : 0;
      const diff = targetBal - baseBal;
      const percentChange = baseBal !== 0 ? (diff / Math.abs(baseBal)) * 100 : 0;

      // In-month flows
      const monthIncome = targetIncomes
        .filter((i) => i.paymentSourceId === source.id)
        .reduce((s, i) => s + i.amount, 0);
      const monthExpense = targetExpenses
        .filter((e) => e.paymentSourceId === source.id)
        .reduce((s, e) => s + e.amount, 0);

      return {
        source,
        baseBal,
        targetBal,
        diff,
        percentChange,
        monthIncome,
        monthExpense,
      };
    });
  }, [paymentSources, baseBalanceData, targetBalanceData, targetIncomes, targetExpenses]);

  // Category Expense Comparison
  interface CategoryComparisonItem {
    category: ExpenseCategory;
    baseAmount: number;
    targetAmount: number;
    difference: number; // targetAmount - baseAmount (+ means more expense, - means less)
    percentChange: number;
    status: 'increased' | 'decreased' | 'same' | 'new' | 'zero';
  }

  const categoryComparisons: CategoryComparisonItem[] = useMemo(() => {
    // Only compare main categories and distinct subcategories
    const list: CategoryComparisonItem[] = [];

    categories.forEach((cat) => {
      const baseSum = baseExpenses
        .filter((e) => e.categoryId === cat.id)
        .reduce((s, e) => s + e.amount, 0);
      const targetSum = targetExpenses
        .filter((e) => e.categoryId === cat.id)
        .reduce((s, e) => s + e.amount, 0);

      // Skip if category has 0 in both months
      if (baseSum === 0 && targetSum === 0) return;

      const diff = targetSum - baseSum;
      let percent = 0;
      if (baseSum > 0) {
        percent = (diff / baseSum) * 100;
      } else if (targetSum > 0) {
        percent = 100;
      }

      let status: 'increased' | 'decreased' | 'same' | 'new' | 'zero' = 'same';
      if (baseSum === 0 && targetSum > 0) {
        status = 'new';
      } else if (diff > 0) {
        status = 'increased';
      } else if (diff < 0) {
        status = 'decreased';
      }

      list.push({
        category: cat,
        baseAmount: baseSum,
        targetAmount: targetSum,
        difference: diff,
        percentChange: percent,
        status,
      });
    });

    // Filter
    let filtered = list;
    if (categoryFilter === 'increased') {
      filtered = list.filter((item) => item.status === 'increased' || item.status === 'new');
    } else if (categoryFilter === 'decreased') {
      filtered = list.filter((item) => item.status === 'decreased');
    } else if (categoryFilter === 'new') {
      filtered = list.filter((item) => item.status === 'new');
    }

    // Sort
    return filtered.sort((a, b) => {
      if (sortBy === 'difference') {
        return Math.abs(b.difference) - Math.abs(a.difference);
      }
      if (sortBy === 'amount') {
        return b.targetAmount - a.targetAmount;
      }
      return a.category.name.localeCompare(b.category.name, 'bn');
    });
  }, [categories, baseExpenses, targetExpenses, categoryFilter, sortBy]);

  // Metrics for category comparison
  const increasedCount = useMemo(
    () => categoryComparisons.filter((c) => c.status === 'increased' || c.status === 'new').length,
    [categoryComparisons]
  );
  const decreasedCount = useMemo(
    () => categoryComparisons.filter((c) => c.status === 'decreased').length,
    [categoryComparisons]
  );
  const totalExpenseDiff = targetTotalExpense - baseTotalExpense;
  const totalExpensePercentDiff =
    baseTotalExpense > 0 ? (totalExpenseDiff / baseTotalExpense) * 100 : 0;

  // Max expense amount among categories for bar chart width
  const maxCategoryAmount = useMemo(() => {
    let max = 1;
    categoryComparisons.forEach((item) => {
      if (item.baseAmount > max) max = item.baseAmount;
      if (item.targetAmount > max) max = item.targetAmount;
    });
    return max;
  }, [categoryComparisons]);

  const getSourceIcon = (type?: string) => {
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
    <div className="space-y-4">
      {/* Header Month Selectors */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">
                মাসভিত্তিক তুলনামূলক বিশ্লেষণ
              </h3>
              <p className="text-[11px] text-slate-500">
                ব্যালেন্স ও খাতভিত্তিক খরচ বেশি না কম তার বিস্তারিত পর্যালোচনা
              </p>
            </div>
          </div>
        </div>

        {/* Dual Month Selector Row */}
        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 items-center">
          {/* Base Month (বিগত মাস) */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              ১. বিগত / তুলনা করার মাস
            </label>
            <div className="flex items-center gap-1">
              <select
                value={baseMonth}
                onChange={(e) => setBaseMonth(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {BENGALI_MONTHS.map((name, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                value={baseYear}
                onChange={(e) => setBaseYear(Number(e.target.value))}
                className="bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                  <option key={y} value={y}>
                    {toBengaliNumber(y)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Month (এই মাস) */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
              ২. চলতি / নির্বাচিত মাস
            </label>
            <div className="flex items-center gap-1">
              <select
                value={targetMonth}
                onChange={(e) => setTargetMonth(Number(e.target.value))}
                className="w-full bg-indigo-50/60 border border-indigo-200 rounded-xl px-2 py-1.5 text-xs font-bold text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {BENGALI_MONTHS.map((name, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                value={targetYear}
                onChange={(e) => setTargetYear(Number(e.target.value))}
                className="bg-indigo-50/60 border border-indigo-200 rounded-xl px-2 py-1.5 text-xs font-bold text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                  <option key={y} value={y}>
                    {toBengaliNumber(y)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* View Switcher: Accounts Balance vs Category Expenses */}
        <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setComparisonTab('balances')}
            className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              comparisonTab === 'balances'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>সব একাউন্টের ব্যালেন্স তুলনা</span>
          </button>

          <button
            onClick={() => setComparisonTab('categories')}
            className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              comparisonTab === 'categories'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>খাতভিত্তিক খরচের তুলনা</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: ALL ACCOUNTS BALANCE COMPARISON (গত মাসের ব্যালেন্স বনাম এই মাসের ব্যালেন্স) */}
      {/* ========================================================================= */}
      {comparisonTab === 'balances' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Grand Balance Banner */}
          <div className="bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 shadow-xl relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-indigo-500/10 pointer-events-none" />
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200 flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  <span>সব একাউন্ট মিলে মোট ব্যালেন্সের পরিবর্তন</span>
                </span>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                    totalBalanceDiff >= 0
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {totalBalanceDiff >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>
                    {totalBalanceDiff >= 0 ? '+' : ''}
                    {toBengaliNumber(totalBalancePercentDiff.toFixed(1))}%
                  </span>
                </span>
              </div>

              {/* Side-by-side total balances */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* Last Month Balance */}
                <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
                  <div className="text-[11px] text-slate-300 font-medium">
                    {baseLabel}-এর শেষে মোট ব্যালেন্স
                  </div>
                  <div className="text-lg sm:text-xl font-extrabold text-white mt-1">
                    {formatCurrency(baseBalanceData.totalBalance)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    সমস্ত ব্যাংক ও ক্যাশ একাউন্ট মিলে
                  </div>
                </div>

                {/* This Month Balance */}
                <div className="bg-white/15 backdrop-blur-xs rounded-2xl p-3 border border-emerald-500/30 ring-1 ring-emerald-500/20">
                  <div className="text-[11px] text-emerald-200 font-medium">
                    {targetLabel}-এর শেষে মোট ব্যালেন্স
                  </div>
                  <div className="text-lg sm:text-xl font-extrabold text-emerald-300 mt-1">
                    {formatCurrency(targetBalanceData.totalBalance)}
                  </div>
                  <div className="text-[10px] text-emerald-200/80 mt-0.5">
                    {totalBalanceDiff >= 0 ? 'বৃদ্ধি পেয়েছে: +' : 'কমেছে: '}
                    {formatCurrency(totalBalanceDiff)}
                  </div>
                </div>
              </div>

              {/* Monthly Net Savings Comparison */}
              <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center justify-between bg-white/5 p-2 rounded-xl">
                  <span className="text-slate-300 text-[11px]">বিগত মাসে নীট জমা:</span>
                  <span
                    className={`font-bold ${
                      baseNetSavings >= 0 ? 'text-emerald-300' : 'text-rose-300'
                    }`}
                  >
                    {baseNetSavings >= 0 ? '+' : ''}
                    {formatCurrency(baseNetSavings)}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-white/5 p-2 rounded-xl">
                  <span className="text-slate-300 text-[11px]">চলতি মাসে নীট জমা:</span>
                  <span
                    className={`font-bold ${
                      targetNetSavings >= 0 ? 'text-emerald-300' : 'text-rose-300'
                    }`}
                  >
                    {targetNetSavings >= 0 ? '+' : ''}
                    {formatCurrency(targetNetSavings)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Account by Account Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-indigo-600" />
                <span>প্রতিটি একাউন্টের ব্যালেন্সের পরিবর্তন</span>
              </h4>
              <span className="text-xs text-slate-400">
                {toBengaliNumber(paymentSources.length)} টি একাউন্ট
              </span>
            </div>

            {accountComparisons.map(
              ({ source, baseBal, targetBal, diff, percentChange, monthIncome, monthExpense }) => {
                const isIncreased = diff >= 0;
                return (
                  <div
                    key={source.id}
                    className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl text-white flex items-center justify-center shrink-0 shadow-xs"
                          style={{ backgroundColor: source.color }}
                        >
                          {getSourceIcon(source.type)}
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                            <span>{source.name}</span>
                            {source.accountNumber && (
                              <span className="text-[10px] font-normal text-slate-400">
                                ({source.accountNumber})
                              </span>
                            )}
                          </h5>
                          <span className="text-xs text-slate-400">
                            {source.type === 'bank'
                              ? 'ব্যাংক একাউন্ট'
                              : source.type === 'mfs'
                              ? 'মোবাইল ব্যাংকিং'
                              : 'নগদ ক্যাশ'}
                          </span>
                        </div>
                      </div>

                      {/* Diff Badge */}
                      <div className="text-right">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-xl ${
                            isIncreased
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                          }`}
                        >
                          {isIncreased ? (
                            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                          )}
                          <span>
                            {isIncreased ? '+' : ''}
                            {formatCurrency(diff)}
                          </span>
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {isIncreased ? 'ব্যালেন্স বৃদ্ধি' : 'ব্যালেন্স হ্রাস'}
                        </div>
                      </div>
                    </div>

                    {/* Compare Cards for this account */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">
                          {baseLabel}-এ ছিল:
                        </span>
                        <span className="font-extrabold text-slate-700 text-sm mt-0.5 block">
                          {formatCurrency(baseBal)}
                        </span>
                      </div>

                      <div className="border-l border-slate-200 pl-3">
                        <span className="text-[10px] text-indigo-600 block font-medium">
                          {targetLabel}-এ হয়েছে:
                        </span>
                        <span className="font-extrabold text-indigo-900 text-sm mt-0.5 block">
                          {formatCurrency(targetBal)}
                        </span>
                      </div>
                    </div>

                    {/* In-month activity */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <span className="text-emerald-700 font-medium">
                        এই মাসে জমা: +{formatCurrency(monthIncome)}
                      </span>
                      <span className="text-rose-700 font-medium">
                        এই মাসে খরচ: -{formatCurrency(monthExpense)}
                      </span>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: CATEGORY EXPENSE COMPARISON (কোন খাতে খরচ বেশি না কম) */}
      {/* ========================================================================= */}
      {comparisonTab === 'categories' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Overall Expense Difference Card */}
          <div className="bg-linear-to-br from-indigo-800 to-indigo-950 text-white rounded-3xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-indigo-200 font-semibold uppercase tracking-wider">
                খাতভিত্তিক মোট খরচের পার্থক্য
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                  totalExpenseDiff > 0
                    ? 'bg-rose-500/30 text-rose-200 border border-rose-400/30'
                    : 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/30'
                }`}
              >
                {totalExpenseDiff > 0 ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                <span>
                  {totalExpenseDiff > 0
                    ? `খরচ বৃদ্ধি (+${toBengaliNumber(totalExpensePercentDiff.toFixed(1))}%)`
                    : `খরচ সাশ্রয় (${toBengaliNumber(totalExpensePercentDiff.toFixed(1))}%)`}
                </span>
              </span>
            </div>

            {/* Side-by-side total expense */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-white/10 rounded-2xl p-3">
                <span className="text-[11px] text-slate-300 block">
                  {baseLabel} মোট খরচ
                </span>
                <span className="text-lg font-extrabold text-white mt-0.5 block">
                  {formatCurrency(baseTotalExpense)}
                </span>
              </div>

              <div className="bg-white/15 rounded-2xl p-3 border border-white/20">
                <span className="text-[11px] text-indigo-200 block">
                  {targetLabel} মোট খরচ
                </span>
                <span className="text-lg font-extrabold text-white mt-0.5 block">
                  {formatCurrency(targetTotalExpense)}
                </span>
              </div>
            </div>

            {/* Quick summary badges */}
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="bg-rose-500/20 rounded-xl p-2 flex items-center gap-2 text-rose-200">
                <ArrowUpRight className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  <strong>{toBengaliNumber(increasedCount)}</strong> টি খাতে খরচ বেশি হয়েছে
                </span>
              </div>
              <div className="bg-emerald-500/20 rounded-xl p-2 flex items-center gap-2 text-emerald-200">
                <ArrowDownRight className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>{toBengaliNumber(decreasedCount)}</strong> টি খাতে খরচ কমেছে (সাশ্রয়)
                </span>
              </div>
            </div>
          </div>

          {/* Filter and Sorting Bar */}
          <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-indigo-600" />
                <span>ফিল্টার করুন:</span>
              </span>

              {/* Sort selector */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none"
              >
                <option value="difference">পার্থক্য অনুযায়ী</option>
                <option value="amount">খরচের পরিমাণ অনুযায়ী</option>
                <option value="name">নাম অনুযায়ী</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold pb-1">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  categoryFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                সব খাত ({toBengaliNumber(categoryComparisons.length)})
              </button>

              <button
                onClick={() => setCategoryFilter('increased')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1 ${
                  categoryFilter === 'increased'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>খরচ বেড়েছে ({toBengaliNumber(increasedCount)})</span>
              </button>

              <button
                onClick={() => setCategoryFilter('decreased')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1 ${
                  categoryFilter === 'decreased'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>খরচ কমেছে ({toBengaliNumber(decreasedCount)})</span>
              </button>

              <button
                onClick={() => setCategoryFilter('new')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  categoryFilter === 'new'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                নতুন খরচ
              </button>
            </div>
          </div>

          {/* Category List with Visual Comparison Bars */}
          <div className="space-y-3">
            {categoryComparisons.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center text-slate-500 border border-slate-100">
                এই ফিল্টারে কোনো খাতের তথ্য পাওয়া যায়নি।
              </div>
            ) : (
              categoryComparisons.map(
                ({ category, baseAmount, targetAmount, difference, percentChange, status }) => {
                  const isMore = difference > 0;
                  const isLess = difference < 0;
                  const isNew = status === 'new';

                  // Width percentages for comparative bars
                  const targetWidth = Math.max((targetAmount / maxCategoryAmount) * 100, targetAmount > 0 ? 4 : 0);
                  const baseWidth = Math.max((baseAmount / maxCategoryAmount) * 100, baseAmount > 0 ? 4 : 0);

                  return (
                    <div
                      key={category.id}
                      className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-3"
                    >
                      {/* Top Header: Category & Comparison Badge */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl text-white flex items-center justify-center shrink-0 shadow-xs"
                            style={{ backgroundColor: category.color }}
                          >
                            <CategoryIcon iconName={category.icon} className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="font-bold text-slate-800 text-sm">
                              {category.name}
                            </h5>
                            <span className="text-[11px] text-slate-400">
                              {category.parentId ? 'উপ-খাত' : 'প্রধান খাত'}
                            </span>
                          </div>
                        </div>

                        {/* Status / Verdict Badge */}
                        <div className="text-right">
                          {isNew ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
                              <span>নতুন খরচ</span>
                            </span>
                          ) : isMore ? (
                            <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
                              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>
                                বেশি: +{formatCurrency(difference)} (+
                                {toBengaliNumber(percentChange.toFixed(0))}%)
                              </span>
                            </span>
                          ) : isLess ? (
                            <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>
                                সাশ্রয়: {formatCurrency(difference)} (
                                {toBengaliNumber(percentChange.toFixed(0))}%)
                              </span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600">
                              <span>অপরিবর্তিত</span>
                            </span>
                          )}
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {isMore
                              ? 'গত মাসের চেয়ে বেশি ব্যয়'
                              : isLess
                              ? 'গত মাসের চেয়ে কম ব্যয়'
                              : isNew
                              ? 'এই মাসে প্রথম খরচ'
                              : 'সমান খরচ'}
                          </div>
                        </div>
                      </div>

                      {/* Side-by-side Numerical Boxes */}
                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/80 p-2.5 rounded-xl">
                        <div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {baseLabel}-এ ছিল:
                          </div>
                          <div className="font-extrabold text-slate-700 text-sm mt-0.5">
                            {formatCurrency(baseAmount)}
                          </div>
                        </div>

                        <div className="border-l border-slate-200 pl-3">
                          <div className="text-[10px] text-indigo-600 font-medium">
                            {targetLabel}-এ হয়েছে:
                          </div>
                          <div
                            className={`font-extrabold text-sm mt-0.5 ${
                              isMore
                                ? 'text-rose-600'
                                : isLess
                                ? 'text-emerald-700'
                                : 'text-slate-800'
                            }`}
                          >
                            {formatCurrency(targetAmount)}
                          </div>
                        </div>
                      </div>

                      {/* Visual Dual Comparison Bar */}
                      <div className="space-y-1.5 pt-1">
                        {/* Base month bar */}
                        <div className="space-y-0.5">
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>{baseLabel}</span>
                            <span>{formatCurrency(baseAmount)}</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-slate-400 rounded-full transition-all duration-300"
                              style={{ width: `${baseWidth}%` }}
                            />
                          </div>
                        </div>

                        {/* Target month bar */}
                        <div className="space-y-0.5">
                          <div className="flex justify-between text-[10px] text-slate-600 font-medium">
                            <span>{targetLabel}</span>
                            <span>{formatCurrency(targetAmount)}</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isMore
                                  ? 'bg-rose-500'
                                  : isLess
                                  ? 'bg-emerald-500'
                                  : 'bg-indigo-600'
                              }`}
                              style={{ width: `${targetWidth}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};
