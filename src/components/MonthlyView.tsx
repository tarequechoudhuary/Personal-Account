import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  PieChart,
  Landmark,
  Banknote,
  Smartphone,
  Calendar,
  Layers,
  ArrowDownLeft,
  Wallet,
  TrendingDown,
} from 'lucide-react';
import { Expense, ExpenseCategory, PaymentSource, Income, IncomeCategory } from '../types';
import {
  formatCurrency,
  BENGALI_MONTHS,
  toBengaliNumber,
} from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { ExpenseItem } from './ExpenseItem';
import { IncomeItem } from './IncomeItem';

interface MonthlyViewProps {
  expenses: Expense[];
  incomes?: Income[];
  categories: ExpenseCategory[];
  incomeCategories?: IncomeCategory[];
  paymentSources: PaymentSource[];
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onEditIncome?: (income: Income) => void;
  onDeleteIncome?: (id: string) => void;
}

export const MonthlyView: React.FC<MonthlyViewProps> = ({
  expenses,
  incomes = [],
  categories,
  incomeCategories = [],
  paymentSources,
  onEditExpense,
  onDeleteExpense,
  onEditIncome,
  onDeleteIncome,
}) => {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1); // 1-12
  const [activeTab, setActiveTab] = useState<
    'categories' | 'incomes' | 'sources' | 'daily' | 'list'
  >('categories');
  const [listFilter, setListFilter] = useState<'all' | 'expense' | 'income'>('all');

  // Navigate months
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  // Filter expenses and incomes for this month
  const monthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
  const monthExpenses = useMemo(() => {
    return expenses.filter((e) => e.date.startsWith(monthPrefix));
  }, [expenses, monthPrefix]);

  const monthIncomes = useMemo(() => {
    return incomes.filter((i) => i.date.startsWith(monthPrefix));
  }, [incomes, monthPrefix]);

  // Total amounts
  const totalMonthExpense = useMemo(() => {
    return monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [monthExpenses]);

  const totalMonthIncome = useMemo(() => {
    return monthIncomes.reduce((sum, i) => sum + i.amount, 0);
  }, [monthIncomes]);

  const netSavings = totalMonthIncome - totalMonthExpense;

  // Hierarchical category breakdown for expenses
  const hierarchicalBreakdown = useMemo(() => {
    const mainCats = categories.filter((c) => !c.parentId);
    const orphanCats = categories.filter(
      (c) => c.parentId && !categories.some((p) => p.id === c.parentId)
    );

    const mainGroups = mainCats
      .map((main) => {
        const subs = categories.filter((c) => c.parentId === main.id);
        const subBreakdowns = subs
          .map((sub) => {
            const subExp = monthExpenses.filter((e) => e.categoryId === sub.id);
            const subTotal = subExp.reduce((sum, e) => sum + e.amount, 0);
            return {
              category: sub,
              total: subTotal,
              count: subExp.length,
            };
          })
          .filter((s) => s.total > 0)
          .sort((a, b) => b.total - a.total);

        const mainDirectExp = monthExpenses.filter((e) => e.categoryId === main.id);
        const mainDirectTotal = mainDirectExp.reduce((sum, e) => sum + e.amount, 0);

        const total = subBreakdowns.reduce((sum, s) => sum + s.total, 0) + mainDirectTotal;
        const count = subBreakdowns.reduce((sum, s) => sum + s.count, 0) + mainDirectExp.length;

        return {
          mainCategory: main,
          total,
          count,
          directTotal: mainDirectTotal,
          directCount: mainDirectExp.length,
          subCategories: subBreakdowns,
        };
      })
      .filter((g) => g.total > 0)
      .sort((a, b) => b.total - a.total);

    const orphanBreakdowns = orphanCats
      .map((cat) => {
        const catExp = monthExpenses.filter((e) => e.categoryId === cat.id);
        const catTotal = catExp.reduce((sum, e) => sum + e.amount, 0);
        return {
          mainCategory: cat,
          total: catTotal,
          count: catExp.length,
          directTotal: catTotal,
          directCount: catExp.length,
          subCategories: [],
        };
      })
      .filter((g) => g.total > 0);

    return [...mainGroups, ...orphanBreakdowns];
  }, [categories, monthExpenses]);

  // Income category breakdown
  const incomeCategoryBreakdown = useMemo(() => {
    const map = new Map<string, { category: IncomeCategory; total: number; count: number }>();
    incomeCategories.forEach((cat) => {
      map.set(cat.id, { category: cat, total: 0, count: 0 });
    });

    monthIncomes.forEach((i) => {
      const entry = map.get(i.categoryId);
      if (entry) {
        entry.total += i.amount;
        entry.count += 1;
      } else {
        const fallbackCat: IncomeCategory = {
          id: i.categoryId,
          name: 'অন্যান্য উৎস',
          icon: 'Coins',
          color: '#10b981',
        };
        map.set(i.categoryId, { category: fallbackCat, total: i.amount, count: 1 });
      }
    });

    return Array.from(map.values())
      .filter((item) => item.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [incomeCategories, monthIncomes]);

  // Payment Source breakdown for expenses and incomes
  const sourceBreakdown = useMemo(() => {
    return paymentSources.map((source) => {
      const srcExp = monthExpenses.filter((e) => e.paymentSourceId === source.id);
      const spent = srcExp.reduce((sum, e) => sum + e.amount, 0);

      const srcInc = monthIncomes.filter((i) => i.paymentSourceId === source.id);
      const received = srcInc.reduce((sum, i) => sum + i.amount, 0);

      return {
        source,
        spent,
        spentCount: srcExp.length,
        received,
        receivedCount: srcInc.length,
        balance: received - spent,
      };
    });
  }, [paymentSources, monthExpenses, monthIncomes]);

  // Type totals for expenses
  const typeTotals = useMemo(() => {
    let cash = 0;
    let bank = 0;
    let mfs = 0;

    monthExpenses.forEach((e) => {
      const src = paymentSources.find((s) => s.id === e.paymentSourceId);
      if (src) {
        if (src.type === 'cash') cash += e.amount;
        else if (src.type === 'bank') bank += e.amount;
        else if (src.type === 'mfs') mfs += e.amount;
      }
    });
    return { cash, bank, mfs };
  }, [paymentSources, monthExpenses]);

  // Daily distribution
  const dailyDistribution = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const days: { day: number; dateStr: string; amount: number; income: number }[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const padDay = String(d).padStart(2, '0');
      const dateStr = `${monthPrefix}-${padDay}`;
      const dayTotal = monthExpenses
        .filter((e) => e.date === dateStr)
        .reduce((sum, e) => sum + e.amount, 0);
      const dayIncome = monthIncomes
        .filter((i) => i.date === dateStr)
        .reduce((sum, i) => sum + i.amount, 0);
      days.push({ day: d, dateStr, amount: dayTotal, income: dayIncome });
    }
    return days;
  }, [selectedYear, selectedMonth, monthPrefix, monthExpenses, monthIncomes]);

  const maxDailyAmount = useMemo(() => {
    const max = Math.max(...dailyDistribution.map((d) => d.amount), 0);
    return max > 0 ? max : 1;
  }, [dailyDistribution]);

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

  // Combined transactions for List tab
  type CombinedItem =
    | { type: 'expense'; data: Expense; timestamp: number }
    | { type: 'income'; data: Income; timestamp: number };

  const combinedMonthItems: CombinedItem[] = [];
  if (listFilter === 'all' || listFilter === 'expense') {
    monthExpenses.forEach((e) => combinedMonthItems.push({ type: 'expense', data: e, timestamp: e.createdAt }));
  }
  if (listFilter === 'all' || listFilter === 'income') {
    monthIncomes.forEach((i) => combinedMonthItems.push({ type: 'income', data: i, timestamp: i.createdAt }));
  }

  combinedMonthItems.sort((a, b) => {
    if (a.data.date === b.data.date) {
      return (b.data.time || '00:00').localeCompare(a.data.time || '00:00');
    }
    return b.data.date.localeCompare(a.data.date);
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Month Selector Bar */}
      <div className="bg-white rounded-2xl p-2.5 border border-slate-100 shadow-xs flex items-center justify-between">
        <button
          id="btn-prev-month"
          onClick={handlePrevMonth}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
          title="পূর্ববর্তী মাস"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span className="font-bold text-slate-800 text-sm">
            {BENGALI_MONTHS[selectedMonth - 1]} {toBengaliNumber(selectedYear)}
          </span>
        </div>

        <button
          id="btn-next-month"
          onClick={handleNextMonth}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
          title="পরবর্তী মাস"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Main Monthly Total Banner with Incomes, Expenses, and Savings */}
      <div className="bg-linear-to-br from-indigo-700 via-indigo-600 to-violet-700 rounded-3xl p-5 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {BENGALI_MONTHS[selectedMonth - 1]} মাসের বিবরণী
              </span>
            </span>
            <span className="text-xs bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-white font-medium">
              {toBengaliNumber(monthExpenses.length + monthIncomes.length)} টি লেনদেন
            </span>
          </div>

          {/* Income vs Expense vs Net Savings */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-2.5">
              <div className="flex items-center gap-1 text-emerald-200 text-[11px] font-medium">
                <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>মোট আয়/জমা</span>
              </div>
              <div className="font-extrabold text-base sm:text-lg mt-0.5 text-white truncate">
                +{formatCurrency(totalMonthIncome)}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-2.5">
              <div className="flex items-center gap-1 text-rose-200 text-[11px] font-medium">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>মোট খরচ</span>
              </div>
              <div className="font-extrabold text-base sm:text-lg mt-0.5 text-rose-100 truncate">
                -{formatCurrency(totalMonthExpense)}
              </div>
            </div>

            <div className="bg-white/15 backdrop-blur-xs rounded-2xl p-2.5 ring-1 ring-white/20">
              <div className="flex items-center gap-1 text-indigo-200 text-[11px] font-medium">
                <Wallet className="w-3.5 h-3.5" />
                <span>মাসিক স্থিতি</span>
              </div>
              <div
                className={`font-extrabold text-base sm:text-lg mt-0.5 truncate ${
                  netSavings >= 0 ? 'text-white' : 'text-amber-300'
                }`}
              >
                {netSavings >= 0 ? '+' : ''}
                {formatCurrency(netSavings)}
              </div>
            </div>
          </div>

          {/* Expense Breakdown Pills: Cash vs Bank vs MFS */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/15 text-xs">
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2">
              <div className="flex items-center gap-1 text-indigo-200 text-[11px]">
                <Banknote className="w-3.5 h-3.5" />
                <span>ক্যাশ খরচ</span>
              </div>
              <div className="font-bold mt-0.5 text-white truncate">
                {formatCurrency(typeTotals.cash)}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2">
              <div className="flex items-center gap-1 text-indigo-200 text-[11px]">
                <Landmark className="w-3.5 h-3.5" />
                <span>ব্যাংক খরচ</span>
              </div>
              <div className="font-bold mt-0.5 text-white truncate">
                {formatCurrency(typeTotals.bank)}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2">
              <div className="flex items-center gap-1 text-indigo-200 text-[11px]">
                <Smartphone className="w-3.5 h-3.5" />
                <span>মোবাইল খরচ</span>
              </div>
              <div className="font-bold mt-0.5 text-white truncate">
                {formatCurrency(typeTotals.mfs)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Sub-tabs */}
      <div className="flex items-center bg-slate-200/70 p-1 rounded-2xl text-xs font-bold text-slate-600 overflow-x-auto">
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex-1 min-w-[75px] py-2 rounded-xl flex items-center justify-center gap-1 transition-all ${
            activeTab === 'categories'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>খরচের খাত</span>
        </button>

        <button
          onClick={() => setActiveTab('incomes')}
          className={`flex-1 min-w-[75px] py-2 rounded-xl flex items-center justify-center gap-1 transition-all ${
            activeTab === 'incomes'
              ? 'bg-white text-emerald-700 shadow-xs'
              : 'hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>আয়ের উৎস</span>
        </button>

        <button
          onClick={() => setActiveTab('sources')}
          className={`flex-1 min-w-[75px] py-2 rounded-xl flex items-center justify-center gap-1 transition-all ${
            activeTab === 'sources'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'hover:text-slate-900'
          }`}
        >
          <Landmark className="w-3.5 h-3.5" />
          <span>ব্যাংক স্থিতি</span>
        </button>

        <button
          onClick={() => setActiveTab('daily')}
          className={`flex-1 min-w-[75px] py-2 rounded-xl flex items-center justify-center gap-1 transition-all ${
            activeTab === 'daily'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'hover:text-slate-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>দিনভিত্তিক</span>
        </button>

        <button
          onClick={() => setActiveTab('list')}
          className={`flex-1 min-w-[75px] py-2 rounded-xl flex items-center justify-center gap-1 transition-all ${
            activeTab === 'list'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'hover:text-slate-900'
          }`}
        >
          <PieChart className="w-3.5 h-3.5" />
          <span>লেনদেন</span>
        </button>
      </div>

      {/* Tab 1: Category Breakdown (খরচ) */}
      {activeTab === 'categories' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              প্রধান ও উপ-খাতভিত্তিক খরচের বিশ্লেষণ
            </h4>
            <span className="text-xs text-slate-400">শতাংশ হারে সাজানো</span>
          </div>

          {hierarchicalBreakdown.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center text-slate-500 border border-slate-100">
              এই মাসে কোনো খরচের রেকর্ড পাওয়া যায়নি।
            </div>
          ) : (
            hierarchicalBreakdown.map(
              ({ mainCategory, total, count, directTotal, directCount, subCategories }) => {
                const percentage =
                  totalMonthExpense > 0
                    ? Math.round((total / totalMonthExpense) * 100)
                    : 0;

                return (
                  <div
                    key={mainCategory.id}
                    className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl text-white flex items-center justify-center shrink-0 shadow-xs"
                          style={{ backgroundColor: mainCategory.color }}
                        >
                          <CategoryIcon iconName={mainCategory.icon} className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-800 text-sm">
                            {mainCategory.name}
                          </h5>
                          <span className="text-xs text-slate-400">
                            মোট {toBengaliNumber(count)} টি খরচ ({toBengaliNumber(percentage)}%)
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-extrabold text-slate-900 text-base">
                          {formatCurrency(total)}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: mainCategory.color,
                        }}
                      />
                    </div>

                    {/* Sub-categories */}
                    {subCategories.length > 0 && (
                      <div className="pt-2 border-t border-slate-50 space-y-1.5">
                        <div className="text-[11px] font-semibold text-slate-400">
                          উপ-খাতসমূহ:
                        </div>
                        {subCategories.map(({ category: sub, total: subTotal, count: subCount }) => {
                          const subPercentage =
                            total > 0 ? Math.round((subTotal / total) * 100) : 0;
                          return (
                            <div
                              key={sub.id}
                              className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50/70"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: sub.color }}
                                />
                                <span className="font-medium text-slate-700">{sub.name}</span>
                                <span className="text-[10px] text-slate-400">
                                  ({toBengaliNumber(subCount)})
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-400">
                                  {toBengaliNumber(subPercentage)}%
                                </span>
                                <span className="font-bold text-slate-800">
                                  {formatCurrency(subTotal)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
            )
          )}
        </div>
      )}

      {/* Tab 2: Income Sources Breakdown (আয়ের উৎস: বেতন, ব্যবসা ইত্যাদি) */}
      {activeTab === 'incomes' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              আয়ের উৎস ও মাধ্যমভিত্তিক বিশ্লেষণ
            </h4>
            <span className="text-xs text-emerald-600 font-bold">
              মোট আয়: {formatCurrency(totalMonthIncome)}
            </span>
          </div>

          {incomeCategoryBreakdown.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center text-slate-500 border border-slate-100">
              এই মাসে কোনো আয়ের হিসাব লিপিবদ্ধ করা হয়নি। বেতন বা টাকা যোগ করতে উপরে বা দৈনিক পাতায় যান।
            </div>
          ) : (
            incomeCategoryBreakdown.map(({ category, total, count }) => {
              const percentage =
                totalMonthIncome > 0 ? Math.round((total / totalMonthIncome) * 100) : 0;
              return (
                <div
                  key={category.id}
                  className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl text-white flex items-center justify-center shrink-0 shadow-xs"
                        style={{ backgroundColor: category.color }}
                      >
                        <CategoryIcon iconName={category.icon} className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800 text-sm">{category.name}</h5>
                        <span className="text-xs text-slate-400">
                          {toBengaliNumber(count)} টি জমা ({toBengaliNumber(percentage)}%)
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-extrabold text-emerald-600 text-base">
                        +{formatCurrency(total)}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 bg-emerald-500"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 3: Bank & Cash Breakdown */}
      {activeTab === 'sources' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              ব্যাংক ও ক্যাশের মাসিক জমা-খরচ
            </h4>
            <span className="text-xs text-slate-400">মাধ্যমভিত্তিক হিসাব</span>
          </div>

          {sourceBreakdown.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center text-slate-500 border border-slate-100">
              কোনো ব্যাংক বা মাধ্যম পাওয়া যায়নি।
            </div>
          ) : (
            sourceBreakdown.map(({ source, spent, spentCount, received, receivedCount, balance }) => {
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
                        <h5 className="font-bold text-slate-800 text-sm">{source.name}</h5>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span>{toBengaliNumber(spentCount + receivedCount)} টি লেনদেন</span>
                          {source.accountNumber && (
                            <>
                              <span>•</span>
                              <span>{source.accountNumber}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`font-extrabold text-sm ${
                          balance >= 0 ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        স্থিতি: {balance >= 0 ? '+' : ''}
                        {formatCurrency(balance)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="bg-emerald-50/60 p-2 rounded-xl">
                      <span className="text-[10px] text-emerald-700 font-semibold block">
                        এই মাসে জমা
                      </span>
                      <span className="font-bold text-emerald-700 mt-0.5 block truncate">
                        +{formatCurrency(received)}
                      </span>
                    </div>
                    <div className="bg-rose-50/60 p-2 rounded-xl">
                      <span className="text-[10px] text-rose-700 font-semibold block">
                        এই মাসে খরচ
                      </span>
                      <span className="font-bold text-rose-700 mt-0.5 block truncate">
                        -{formatCurrency(spent)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 4: Daily spend bar chart */}
      {activeTab === 'daily' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              দিনভিত্তিক খরচের চিত্র
            </h4>
            <span className="text-[11px] text-slate-400">
              সর্বোচ্চ: {formatCurrency(maxDailyAmount)}
            </span>
          </div>

          {/* Bar Chart Container */}
          <div className="h-44 flex items-end gap-1.5 pt-4 pb-2 px-1 border-b border-slate-100 overflow-x-auto">
            {dailyDistribution.map((item) => {
              const heightPercent =
                item.amount > 0 ? Math.max((item.amount / maxDailyAmount) * 100, 6) : 2;
              const hasSpend = item.amount > 0;
              return (
                <div
                  key={item.day}
                  className="flex-1 min-w-[14px] flex flex-col items-center group relative cursor-pointer"
                  title={`${toBengaliNumber(item.day)} তারিখ: ${formatCurrency(item.amount)}`}
                >
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                    <div className="bg-slate-900 text-white text-[10px] py-1 px-2 rounded shadow-lg whitespace-nowrap">
                      {toBengaliNumber(item.day)} {BENGALI_MONTHS[selectedMonth - 1]}:{' '}
                      {formatCurrency(item.amount)}
                      {item.income > 0 && ` (আয়: +${formatCurrency(item.income)})`}
                    </div>
                  </div>

                  <div
                    className={`w-full rounded-t-xs transition-all duration-300 ${
                      hasSpend
                        ? 'bg-linear-to-t from-indigo-600 to-emerald-500 group-hover:opacity-80'
                        : 'bg-slate-100'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-[9px] text-slate-400 mt-1">
                    {toBengaliNumber(item.day)}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-slate-400 text-center">
            যেকোনো বারের ওপর কার্সর বা আঙুল রাখলে ওই দিনের মোট খরচের পরিমাণ দেখতে পাবেন।
          </p>
        </div>
      )}

      {/* Tab 5: All Monthly Transactions */}
      {activeTab === 'list' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              এই মাসের লেনদেন ({toBengaliNumber(combinedMonthItems.length)})
            </h4>

            {/* Sub-filter for transactions */}
            <div className="flex bg-slate-100 p-0.5 rounded-xl text-[11px] font-semibold">
              <button
                onClick={() => setListFilter('all')}
                className={`px-2 py-1 rounded-lg ${
                  listFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                সব
              </button>
              <button
                onClick={() => setListFilter('income')}
                className={`px-2 py-1 rounded-lg ${
                  listFilter === 'income' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700'
                }`}
              >
                আয়
              </button>
              <button
                onClick={() => setListFilter('expense')}
                className={`px-2 py-1 rounded-lg ${
                  listFilter === 'expense' ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-700'
                }`}
              >
                খরচ
              </button>
            </div>
          </div>

          {combinedMonthItems.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center text-slate-500 border border-slate-100">
              এই মাসে কোনো লেনদেনের হিসাব নেই।
            </div>
          ) : (
            combinedMonthItems.map((item) => {
              if (item.type === 'expense') {
                const cat = categories.find((c) => c.id === item.data.categoryId);
                const src = paymentSources.find((s) => s.id === item.data.paymentSourceId);
                return (
                  <ExpenseItem
                    key={`exp-${item.data.id}`}
                    expense={item.data}
                    category={cat}
                    categories={categories}
                    paymentSource={src}
                    onEdit={onEditExpense}
                    onDelete={onDeleteExpense}
                    showDate={true}
                  />
                );
              } else {
                const cat = incomeCategories.find((c) => c.id === item.data.categoryId);
                const src = paymentSources.find((s) => s.id === item.data.paymentSourceId);
                return (
                  <IncomeItem
                    key={`inc-${item.data.id}`}
                    income={item.data}
                    category={cat}
                    paymentSource={src}
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
