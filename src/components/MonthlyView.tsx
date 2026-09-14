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
  ArrowUpRight,
} from 'lucide-react';
import { Expense, ExpenseCategory, PaymentSource } from '../types';
import {
  formatCurrency,
  BENGALI_MONTHS,
  toBengaliNumber,
} from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { ExpenseItem } from './ExpenseItem';

interface MonthlyViewProps {
  expenses: Expense[];
  categories: ExpenseCategory[];
  paymentSources: PaymentSource[];
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

export const MonthlyView: React.FC<MonthlyViewProps> = ({
  expenses,
  categories,
  paymentSources,
  onEditExpense,
  onDeleteExpense,
}) => {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1); // 1-12
  const [activeTab, setActiveTab] = useState<'categories' | 'sources' | 'daily' | 'list'>('categories');

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

  // Filter expenses for this month
  const monthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
  const monthExpenses = useMemo(() => {
    return expenses.filter((e) => e.date.startsWith(monthPrefix));
  }, [expenses, monthPrefix]);

  // Total amount spent this month
  const totalMonthExpense = useMemo(() => {
    return monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [monthExpenses]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, { category: ExpenseCategory; total: number; count: number }>();
    categories.forEach((cat) => {
      map.set(cat.id, { category: cat, total: 0, count: 0 });
    });

    monthExpenses.forEach((e) => {
      const entry = map.get(e.categoryId);
      if (entry) {
        entry.total += e.amount;
        entry.count += 1;
      } else {
        const fallbackCat: ExpenseCategory = {
          id: e.categoryId,
          name: 'অনির্দিষ্ট খাত',
          icon: 'CircleDot',
          color: '#64748b',
        };
        map.set(e.categoryId, { category: fallbackCat, total: e.amount, count: 1 });
      }
    });

    return Array.from(map.values())
      .filter((item) => item.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [categories, monthExpenses]);

  // Hierarchical category breakdown (Main Categories + Sub-categories)
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
          main,
          total,
          count,
          subBreakdowns,
          directTotal: mainDirectTotal,
          directCount: mainDirectExp.length,
        };
      })
      .filter((g) => g.total > 0)
      .sort((a, b) => b.total - a.total);

    const orphanBreakdowns = orphanCats
      .map((orphan) => {
        const exp = monthExpenses.filter((e) => e.categoryId === orphan.id);
        return {
          category: orphan,
          total: exp.reduce((sum, e) => sum + e.amount, 0),
          count: exp.length,
        };
      })
      .filter((o) => o.total > 0);

    return { mainGroups, orphanBreakdowns };
  }, [categories, monthExpenses]);

  // Source breakdown (Banks vs Cash vs MFS)
  const sourceBreakdown = useMemo(() => {
    const map = new Map<string, { source: PaymentSource; total: number; count: number }>();
    paymentSources.forEach((src) => {
      map.set(src.id, { source: src, total: 0, count: 0 });
    });

    monthExpenses.forEach((e) => {
      const entry = map.get(e.paymentSourceId);
      if (entry) {
        entry.total += e.amount;
        entry.count += 1;
      } else {
        const fallbackSrc: PaymentSource = {
          id: e.paymentSourceId,
          name: 'ক্যাশ / অন্যান্য',
          type: 'cash',
          color: '#64748b',
        };
        map.set(e.paymentSourceId, { source: fallbackSrc, total: e.amount, count: 1 });
      }
    });

    return Array.from(map.values())
      .filter((item) => item.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [paymentSources, monthExpenses]);

  // Group by Bank Type totals (Bank vs Cash vs MFS)
  const typeTotals = useMemo(() => {
    let cash = 0;
    let bank = 0;
    let mfs = 0;
    sourceBreakdown.forEach((item) => {
      if (item.source.type === 'cash') cash += item.total;
      else if (item.source.type === 'bank') bank += item.total;
      else if (item.source.type === 'mfs') mfs += item.total;
    });
    return { cash, bank, mfs };
  }, [sourceBreakdown]);

  // Daily spend distribution (days 1 to 31)
  const dailyDistribution = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const days: { day: number; dateStr: string; amount: number }[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const padDay = String(d).padStart(2, '0');
      const dateStr = `${monthPrefix}-${padDay}`;
      const dayTotal = monthExpenses
        .filter((e) => e.date === dateStr)
        .reduce((sum, e) => sum + e.amount, 0);
      days.push({ day: d, dateStr, amount: dayTotal });
    }
    return days;
  }, [selectedYear, selectedMonth, monthPrefix, monthExpenses]);

  const maxDailyAmount = useMemo(() => {
    const max = Math.max(...dailyDistribution.map((d) => d.amount), 0);
    return max > 0 ? max : 1;
  }, [dailyDistribution]);

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

      {/* Main Monthly Total Banner */}
      <div className="bg-linear-to-br from-indigo-700 via-indigo-600 to-violet-700 rounded-3xl p-5 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200">
              মাসের মোট খরচের হিসাব
            </span>
            <span className="text-xs bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-white font-medium">
              {toBengaliNumber(monthExpenses.length)} টি লেনদেন
            </span>
          </div>

          <div className="text-3xl sm:text-4xl font-extrabold mt-1 tracking-tight">
            {formatCurrency(totalMonthExpense)}
          </div>

          {/* Cash vs Bank vs MFS Breakdown Header */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/15 text-xs">
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2">
              <div className="flex items-center gap-1 text-indigo-200 text-[11px]">
                <Banknote className="w-3.5 h-3.5" />
                <span>ক্যাশ থেকে</span>
              </div>
              <div className="font-bold mt-0.5 text-white truncate">
                {formatCurrency(typeTotals.cash)}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2">
              <div className="flex items-center gap-1 text-indigo-200 text-[11px]">
                <Landmark className="w-3.5 h-3.5" />
                <span>ব্যাংক থেকে</span>
              </div>
              <div className="font-bold mt-0.5 text-white truncate">
                {formatCurrency(typeTotals.bank)}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2">
              <div className="flex items-center gap-1 text-indigo-200 text-[11px]">
                <Smartphone className="w-3.5 h-3.5" />
                <span>মোবাইল ব্যাংকিং</span>
              </div>
              <div className="font-bold mt-0.5 text-white truncate">
                {formatCurrency(typeTotals.mfs)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Sub-tabs */}
      <div className="flex items-center bg-slate-200/70 p-1 rounded-2xl text-xs font-bold text-slate-600">
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'categories'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>খাতভিত্তিক</span>
        </button>

        <button
          onClick={() => setActiveTab('sources')}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'sources'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'hover:text-slate-900'
          }`}
        >
          <Landmark className="w-3.5 h-3.5" />
          <span>ব্যাংক ও ক্যাশ</span>
        </button>

        <button
          onClick={() => setActiveTab('daily')}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'daily'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>দিনভিত্তিক</span>
        </button>

        <button
          onClick={() => setActiveTab('list')}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'list'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'hover:text-slate-900'
          }`}
        >
          <PieChart className="w-3.5 h-3.5" />
          <span>সকল খরচ</span>
        </button>
      </div>

      {/* Tab 1: Category Breakdown (কোন প্রধান ও উপ-খাতে কত টাকা খরচ) */}
      {activeTab === 'categories' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              প্রধান ও উপ-খাতভিত্তিক খরচের বিশ্লেষণ
            </h4>
            <span className="text-xs text-slate-400">শতাংশ হারে সাজানো</span>
          </div>

          {hierarchicalBreakdown.mainGroups.length === 0 && hierarchicalBreakdown.orphanBreakdowns.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center text-slate-500 border border-slate-100">
              এই মাসে কোনো খরচের রেকর্ড পাওয়া যায়নি।
            </div>
          ) : (
            <>
              {hierarchicalBreakdown.mainGroups.map(({ main, total, count, subBreakdowns, directTotal, directCount }) => {
                const mainPercent = totalMonthExpense > 0 ? (total / totalMonthExpense) * 100 : 0;
                return (
                  <div
                    key={main.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3"
                  >
                    {/* Main Category Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-2xl text-white flex items-center justify-center shrink-0 shadow-xs"
                          style={{ backgroundColor: main.color }}
                        >
                          <CategoryIcon name={main.icon} className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h5 className="font-bold text-slate-900 text-sm sm:text-base">
                              {main.name}
                            </h5>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              প্রধান খাত
                            </span>
                          </div>
                          <span className="text-xs text-slate-400">
                            {toBengaliNumber(count)} টি খরচ • {toBengaliNumber(subBreakdowns.length)} টি উপ-খাতে
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-extrabold text-slate-900 text-base">
                          {formatCurrency(total)}
                        </div>
                        <div className="text-xs font-bold text-emerald-600">
                          {toBengaliNumber(mainPercent.toFixed(1))}%
                        </div>
                      </div>
                    </div>

                    {/* Progress bar for main category */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${mainPercent}%`,
                          backgroundColor: main.color,
                        }}
                      />
                    </div>

                    {/* Sub-categories under this main category */}
                    {subBreakdowns.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 space-y-2">
                        <div className="text-[11px] font-bold text-slate-500 flex items-center justify-between">
                          <span>উপ-খাতসমূহের হিসাব:</span>
                          <span>পরিমাণ</span>
                        </div>
                        <div className="space-y-1.5">
                          {subBreakdowns.map(({ category: sub, total: subTotal, count: subCount }) => {
                            const subPercentOfMain = total > 0 ? (subTotal / total) * 100 : 0;
                            return (
                              <div
                                key={sub.id}
                                className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 border border-slate-100 text-xs"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div
                                    className="w-6 h-6 rounded-lg text-white flex items-center justify-center shrink-0 text-xs shadow-2xs"
                                    style={{ backgroundColor: sub.color || main.color }}
                                  >
                                    <CategoryIcon name={sub.icon} className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="font-medium text-slate-800 truncate block">
                                      {sub.name}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                      {toBengaliNumber(subCount)} টি খরচ ({toBengaliNumber(subPercentOfMain.toFixed(0))}%)
                                    </span>
                                  </div>
                                </div>
                                <span className="font-bold text-slate-800 shrink-0">
                                  {formatCurrency(subTotal)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Orphan categories */}
              {hierarchicalBreakdown.orphanBreakdowns.map(({ category: orphan, total: orphanTotal, count: orphanCount }) => (
                <div
                  key={orphan.id}
                  className="bg-white rounded-2xl p-3.5 border border-slate-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-xl text-white flex items-center justify-center shrink-0"
                      style={{ backgroundColor: orphan.color }}
                    >
                      <CategoryIcon name={orphan.icon} className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 text-xs">{orphan.name}</span>
                      <span className="text-[10px] text-slate-400 block">{toBengaliNumber(orphanCount)} টি খরচ</span>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 text-sm">{formatCurrency(orphanTotal)}</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Tab 2: Bank & Cash Breakdown (কোন ব্যাংক বা ক্যাশ থেকে খরচ) */}
      {activeTab === 'sources' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              ব্যাংক ও ক্যাশ থেকে খরচের হিসাব
            </h4>
            <span className="text-xs text-slate-400">মাধ্যমভিত্তিক ভাগ</span>
          </div>

          {sourceBreakdown.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center text-slate-500 border border-slate-100">
              এই মাসে কোনো খরচের রেকর্ড পাওয়া যায়নি।
            </div>
          ) : (
            sourceBreakdown.map(({ source, total, count }) => {
              return (
                <div
                  key={source.id}
                  className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs"
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
                        <h5 className="font-bold text-slate-800 text-sm">
                          {source.name}
                        </h5>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span>{toBengaliNumber(count)} টি খরচ</span>
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
                      <div className="font-extrabold text-slate-900 text-base">
                        {formatCurrency(total)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 3: Daily spend bar chart */}
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
              const heightPercent = item.amount > 0 ? Math.max((item.amount / maxDailyAmount) * 100, 6) : 2;
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
                      {toBengaliNumber(item.day)} {BENGALI_MONTHS[selectedMonth - 1]}: {formatCurrency(item.amount)}
                    </div>
                  </div>

                  <div
                    className={`w-full rounded-t-sm transition-all duration-300 ${
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

      {/* Tab 4: All Monthly Transactions */}
      {activeTab === 'list' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              এই মাসের সমস্ত খরচ ({toBengaliNumber(monthExpenses.length)})
            </h4>
          </div>

          {monthExpenses.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center text-slate-500 border border-slate-100">
              এই মাসে কোনো খরচের হিসাব নেই।
            </div>
          ) : (
            monthExpenses.map((expense) => {
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
                  showDate={true}
                />
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
