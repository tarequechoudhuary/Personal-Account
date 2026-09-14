import React, { useState } from 'react';
import {
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Phone,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  Landmark,
  Banknote,
  Smartphone,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { LoanRecord, LoanType, PaymentSource } from '../types';
import { formatCurrency, formatBengaliDate, toBengaliNumber } from '../utils/formatters';

interface LoansViewProps {
  loans: LoanRecord[];
  paymentSources: PaymentSource[];
  onAddLoan: () => void;
  onEditLoan: (loan: LoanRecord) => void;
  onDeleteLoan: (id: string) => void;
  onOpenAddPayment: (loan: LoanRecord) => void;
}

export const LoansView: React.FC<LoansViewProps> = ({
  loans,
  paymentSources,
  onAddLoan,
  onEditLoan,
  onDeleteLoan,
  onOpenAddPayment,
}) => {
  const [filterType, setFilterType] = useState<LoanType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid'>('all');
  const [expandedLoanId, setExpandedLoanId] = useState<string | null>(null);

  // Summary calculations
  const totalGiven = loans
    .filter((l) => l.type === 'given')
    .reduce((sum, l) => sum + l.amount, 0);

  const totalGivenPaid = loans
    .filter((l) => l.type === 'given')
    .reduce((sum, l) => sum + l.payments.reduce((s, p) => s + p.amount, 0), 0);

  const netReceivable = Math.max(0, totalGiven - totalGivenPaid); // এখনো মোট পাবো

  const totalTaken = loans
    .filter((l) => l.type === 'taken')
    .reduce((sum, l) => sum + l.amount, 0);

  const totalTakenPaid = loans
    .filter((l) => l.type === 'taken')
    .reduce((sum, l) => sum + l.payments.reduce((s, p) => s + p.amount, 0), 0);

  const netPayable = Math.max(0, totalTaken - totalTakenPaid); // এখনো মোট দিতে হবে

  // Filtering
  const filteredLoans = loans.filter((loan) => {
    if (filterType !== 'all' && loan.type !== filterType) return false;
    if (statusFilter === 'pending' && loan.status === 'paid') return false;
    if (statusFilter === 'paid' && loan.status !== 'paid') return false;
    return true;
  });

  const getSource = (sourceId: string) => {
    return paymentSources.find((s) => s.id === sourceId);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Banner & Balance Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Total Given / Receivable */}
        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>লোন দিয়েছি (পাবো)</span>
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {formatCurrency(netReceivable)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            মোট দেওয়া: {formatCurrency(totalGiven)} • ফেরত: {formatCurrency(totalGivenPaid)}
          </div>
        </div>

        {/* Total Taken / Payable */}
        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              <ArrowDownLeft className="w-3 h-3" />
              <span>লোন নিয়েছি (দেনা)</span>
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {formatCurrency(netPayable)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            মোট নেওয়া: {formatCurrency(totalTaken)} • পরিশোধ: {formatCurrency(totalTakenPaid)}
          </div>
        </div>
      </div>

      {/* Header action bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">
            লোন ও দেনা-পাওনা হিসাব
          </h3>
          <p className="text-[11px] text-slate-400">
            কার কাছে কত টাকা পাবেন বা কার টাকা দিতে হবে
          </p>
        </div>
        <button
          id="btn-add-loan-top"
          onClick={onAddLoan}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন লোন যোগ</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => {
            setFilterType('all');
            setStatusFilter('all');
          }}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
            filterType === 'all' && statusFilter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          সকল হিসাব ({toBengaliNumber(loans.length)})
        </button>
        <button
          onClick={() => setFilterType('given')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
            filterType === 'given'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          পাওনা (দিয়েছি)
        </button>
        <button
          onClick={() => setFilterType('taken')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
            filterType === 'taken'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          দেনা (নিয়েছি)
        </button>
        <button
          onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
            statusFilter === 'pending'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          বকেয়া বাকি
        </button>
      </div>

      {/* Loans List */}
      <div className="space-y-3">
        {filteredLoans.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center text-slate-500 border border-slate-100 space-y-2">
            <p className="text-sm font-semibold">কোনো লোনের রেকর্ড পাওয়া যায়নি।</p>
            <p className="text-xs text-slate-400">
              কাউকে টাকা ধার দিলে বা কারো কাছ থেকে ধার নিলে "নতুন লোন যোগ" বাটনে চাপ দিয়ে এন্ট্রি করুন।
            </p>
          </div>
        ) : (
          filteredLoans.map((loan) => {
            const isGiven = loan.type === 'given';
            const totalPaid = loan.payments.reduce((sum, p) => sum + p.amount, 0);
            const remaining = Math.max(0, loan.amount - totalPaid);
            const isPaid = remaining <= 0 || loan.status === 'paid';
            const src = getSource(loan.paymentSourceId);
            const isExpanded = expandedLoanId === loan.id;
            const progressPercent = Math.min(100, Math.round((totalPaid / loan.amount) * 100));

            return (
              <div
                key={loan.id}
                id={`loan-card-${loan.id}`}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-3 transition-all"
              >
                {/* Top Row: Person, Type & Actions */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs text-white ${
                        isGiven ? 'bg-emerald-600' : 'bg-rose-600'
                      }`}
                    >
                      {isGiven ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowDownLeft className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">
                          {loan.personName}
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isGiven
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {isGiven ? 'পাওনা (দিয়েছি)' : 'দেনা (নিয়েছি)'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 flex-wrap">
                        {loan.phone && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <Phone className="w-3 h-3" />
                            <span>{loan.phone}</span>
                          </span>
                        )}
                        <span>•</span>
                        <span>{formatBengaliDate(loan.date)}</span>
                        {src && (
                          <>
                            <span>•</span>
                            <span className="text-slate-500 font-medium">
                              {src.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions (Edit / Delete) */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditLoan(loan)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="সম্পাদনা করুন"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteLoan(loan.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Amount & Status Grid */}
                <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      মোট লোনের পরিমাণ
                    </span>
                    <span className="text-base font-extrabold text-slate-800">
                      {formatCurrency(loan.amount)}
                    </span>
                  </div>

                  <div className="text-center">
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      {isGiven ? 'ফেরত প্রাপ্ত' : 'পরিশোধিত'}
                    </span>
                    <span className="text-sm font-bold text-emerald-600">
                      {formatCurrency(totalPaid)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      {isPaid ? 'স্ট্যাটাস' : 'বকেয়া বাকি'}
                    </span>
                    {isPaid ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" />
                        <span>পরিশোধিত</span>
                      </span>
                    ) : (
                      <span className="text-base font-extrabold text-rose-600">
                        {formatCurrency(remaining)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar if partially paid */}
                {!isPaid && totalPaid > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>পরিশোধের অগ্রগতি</span>
                      <span className="font-bold text-emerald-600">
                        {toBengaliNumber(progressPercent)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Note & Due date if any */}
                {(loan.note || loan.dueDate) && (
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    {loan.note && (
                      <span className="italic truncate max-w-[200px]">
                        "{loan.note}"
                      </span>
                    )}
                    {loan.dueDate && (
                      <span className="flex items-center gap-1 text-amber-600 font-medium ml-auto">
                        <Clock className="w-3 h-3" />
                        <span>পরিশোধের মেয়াদ: {formatBengaliDate(loan.dueDate)}</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Bottom Row: Add payment button & payment history toggle */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  {!isPaid ? (
                    <button
                      onClick={() => onOpenAddPayment(loan)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isGiven ? 'ফেরত টাকা জমা নিন' : 'কিস্তি পরিশোধ করুন'}</span>
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>হিসাব সম্পূর্ণ পরিশোধ হয়েছে</span>
                    </span>
                  )}

                  {loan.payments.length > 0 && (
                    <button
                      onClick={() =>
                        setExpandedLoanId(isExpanded ? null : loan.id)
                      }
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <span>
                        {toBengaliNumber(loan.payments.length)} টি লেনদেন
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>

                {/* Expanded Payment History */}
                {isExpanded && loan.payments.length > 0 && (
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-2 text-xs">
                    <span className="font-bold text-slate-700 block text-[11px]">
                      পরিশোধের বিস্তারিত ইতিহাস:
                    </span>
                    {loan.payments.map((p, idx) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between py-1 border-b border-slate-200 last:border-0"
                      >
                        <div>
                          <span className="font-semibold text-slate-800">
                            {formatCurrency(p.amount)}
                          </span>
                          {p.note && (
                            <span className="text-slate-400 block text-[10px]">
                              {p.note}
                            </span>
                          )}
                        </div>
                        <span className="text-slate-400 text-[11px]">
                          {formatBengaliDate(p.date)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
