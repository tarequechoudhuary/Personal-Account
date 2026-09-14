import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Calendar,
  User,
  Phone,
  Landmark,
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { LoanRecord, LoanType, PaymentSource } from '../types';
import { getCurrentDateString } from '../utils/formatters';

interface AddLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    loanData: Omit<LoanRecord, 'id' | 'payments' | 'status' | 'createdAt'>,
    id?: string
  ) => void;
  paymentSources: PaymentSource[];
  editingLoan: LoanRecord | null;
}

export const AddLoanModal: React.FC<AddLoanModalProps> = ({
  isOpen,
  onClose,
  onSave,
  paymentSources,
  editingLoan,
}) => {
  const [personName, setPersonName] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<LoanType>('given');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getCurrentDateString());
  const [dueDate, setDueDate] = useState('');
  const [paymentSourceId, setPaymentSourceId] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingLoan) {
      setPersonName(editingLoan.personName);
      setPhone(editingLoan.phone || '');
      setType(editingLoan.type);
      setAmount(String(editingLoan.amount));
      setDate(editingLoan.date);
      setDueDate(editingLoan.dueDate || '');
      setPaymentSourceId(editingLoan.paymentSourceId);
      setNote(editingLoan.note || '');
    } else {
      setPersonName('');
      setPhone('');
      setType('given');
      setAmount('');
      setDate(getCurrentDateString());
      setDueDate('');
      setPaymentSourceId(paymentSources[0]?.id || 'src-cash');
      setNote('');
    }
    setError('');
  }, [editingLoan, isOpen, paymentSources]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim()) {
      setError('অনুগ্রহ করে ব্যক্তির নাম লিখুন');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('অনুগ্রহ করে সঠিক টাকার পরিমাণ লিখুন');
      return;
    }

    if (!paymentSourceId) {
      setError('লেনদেনের মাধ্যম (ব্যাংক/ক্যাশ) সিলেক্ট করুন');
      return;
    }

    onSave(
      {
        personName: personName.trim(),
        phone: phone.trim() || undefined,
        type,
        amount: numAmount,
        date,
        dueDate: dueDate || undefined,
        paymentSourceId,
        note: note.trim() || undefined,
      },
      editingLoan?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="modal-add-loan"
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto space-y-4 animate-in slide-in-from-bottom-4 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              {editingLoan ? 'লোন তথ্য সম্পাদনা' : 'নতুন লোন বা দেনা-পাওনা যোগ'}
            </h3>
            <p className="text-xs text-slate-500">
              কাউকে দেওয়া বা কারো কাছ থেকে নেওয়া টাকার হিসাব
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
          {/* Loan Type Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              লোনের ধরন নির্বাচন করুন
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="btn-loan-type-given"
                onClick={() => setType('given')}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border transition-all text-xs font-bold ${
                  type === 'given'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="block">কাউকে দিয়েছি</span>
                  <span className="text-[10px] text-emerald-600 font-normal">
                    (আমি টাকা পাবো)
                  </span>
                </div>
              </button>

              <button
                type="button"
                id="btn-loan-type-taken"
                onClick={() => setType('taken')}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border transition-all text-xs font-bold ${
                  type === 'taken'
                    ? 'border-rose-600 bg-rose-50 text-rose-800 ring-2 ring-rose-500/20 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center">
                  <ArrowDownLeft className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="block">কারো থেকে নিয়েছি</span>
                  <span className="text-[10px] text-rose-600 font-normal">
                    (আমাকে দিতে হবে)
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Amount input */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              টাকার পরিমাণ (৳)
            </label>
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
                autoFocus={!editingLoan}
              />
            </div>
          </div>

          {/* Person Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                ব্যক্তির নাম *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder="যেমন: রহিম সাহেব, বড় ভাই"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-semibold text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                মোবাইল নম্বর (ঐচ্ছিক)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="০১৭১..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Payment Source */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              লেনদেনের মাধ্যম (কোন ব্যাংক/ক্যাশ থেকে)
            </label>
            <div className="relative">
              <Landmark className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={paymentSourceId}
                onChange={(e) => setPaymentSourceId(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-semibold text-slate-800 bg-white"
              >
                {paymentSources.map((src) => (
                  <option key={src.id} value={src.id}>
                    {src.name} {src.accountNumber ? `(${src.accountNumber})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates (Loan Date & Due Date) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                লোনের তারিখ
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-2 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                পরিশোধের তারিখ (ঐচ্ছিক)
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-9 pr-2 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              নোট বা বিবরণ (ঐচ্ছিক)
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="যেমন: ১ মাসের জন্য ধার দেওয়া হলো"
                rows={2}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-slate-800 resize-none"
              />
            </div>
          </div>

          {/* Action buttons */}
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
              <span>{editingLoan ? 'আপডেট করুন' : 'লোন সংরক্ষণ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
