import React, { useState } from 'react';
import { X, Check, DollarSign, Calendar, FileText } from 'lucide-react';
import { LoanRecord } from '../types';
import { getCurrentDateString, formatCurrency, toBengaliNumber } from '../utils/formatters';

interface AddLoanPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: LoanRecord | null;
  onSavePayment: (loanId: string, amount: number, date: string, note?: string) => void;
}

export const AddLoanPaymentModal: React.FC<AddLoanPaymentModalProps> = ({
  isOpen,
  onClose,
  loan,
  onSavePayment,
}) => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getCurrentDateString());
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !loan) return null;

  const totalPaid = loan.payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(0, loan.amount - totalPaid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('সঠিক টাকার পরিমাণ লিখুন');
      return;
    }

    if (numAmount > remaining) {
      setError(`বকেয়া টাকার চেয়ে বেশি দেওয়া যাবে না (বাকি: ${formatCurrency(remaining)})`);
      return;
    }

    onSavePayment(loan.id, numAmount, date, note.trim() || undefined);
    setAmount('');
    setNote('');
    setError('');
    onClose();
  };

  const isGiven = loan.type === 'given';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="modal-add-loan-payment"
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-4 animate-in slide-in-from-bottom-4 duration-200"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              {isGiven ? 'ফেরত টাকা জমা নিন' : 'ধার পরিশোধ করুন'}
            </h3>
            <p className="text-xs text-slate-500">
              {loan.personName} • বকেয়া বাকি: {formatCurrency(remaining)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                {isGiven ? 'ফেরত প্রাপ্ত টাকা (৳)' : 'পরিশোধের টাকা (৳)'}
              </label>
              <button
                type="button"
                onClick={() => setAmount(String(remaining))}
                className="text-[11px] font-bold text-emerald-600 hover:underline"
              >
                পুরো বকেয়া পরিশোধ ({toBengaliNumber(remaining)}৳)
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                ৳
              </span>
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                placeholder="0"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 text-lg"
                autoFocus
              />
            </div>
          </div>

          {/* Date input */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              পরিশোধের তারিখ
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-800"
              />
            </div>
          </div>

          {/* Note input */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              নোট বা বিবরণ (ঐচ্ছিক)
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="যেমন: বিকাশে পাঠানো হয়েছে / ক্যাশ বুঝিয়ে পেয়েছি"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-slate-800"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>জমা সংরক্ষণ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
