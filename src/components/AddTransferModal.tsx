import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowLeftRight,
  ArrowRight,
  Building2,
  Wallet,
  Smartphone,
  Info,
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  Repeat,
} from 'lucide-react';
import { AccountTransfer, PaymentSource, TransferType } from '../types';
import {
  getCurrentDateString,
  getCurrentTimeString,
  formatCurrency,
  toBengaliNumber,
} from '../utils/formatters';

interface AddTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    transferData: Omit<AccountTransfer, 'id' | 'createdAt'>,
    id?: string
  ) => void;
  paymentSources: PaymentSource[];
  getSourceBalance?: (sourceId: string) => number;
  editingTransfer?: AccountTransfer | null;
  defaultFromSourceId?: string | null;
  defaultToSourceId?: string | null;
  onOpenAddBank?: () => void;
}

export const AddTransferModal: React.FC<AddTransferModalProps> = ({
  isOpen,
  onClose,
  onSave,
  paymentSources = [],
  getSourceBalance,
  editingTransfer,
  defaultFromSourceId,
  defaultToSourceId,
  onOpenAddBank,
}) => {
  const [fromSourceId, setFromSourceId] = useState<string>('');
  const [toSourceId, setToSourceId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(getCurrentDateString());
  const [time, setTime] = useState<string>(getCurrentTimeString());
  const [transferType, setTransferType] = useState<TransferType>('transfer');
  const [note, setNote] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize or reset state when opening or editing
  useEffect(() => {
    if (!isOpen) return;

    if (editingTransfer) {
      setFromSourceId(editingTransfer.fromSourceId);
      setToSourceId(editingTransfer.toSourceId);
      setAmount(String(editingTransfer.amount));
      setDate(editingTransfer.date);
      setTime(editingTransfer.time || getCurrentTimeString());
      setTransferType(editingTransfer.transferType || 'transfer');
      setNote(editingTransfer.note || '');
      setErrorMessage(null);
    } else {
      setAmount('');
      setDate(getCurrentDateString());
      setTime(getCurrentTimeString());
      setErrorMessage(null);

      // Smart default source selection
      const bankSource = paymentSources.find((s) => s.type === 'bank');
      const cashSource = paymentSources.find((s) => s.type === 'cash');
      const mfsSource = paymentSources.find((s) => s.type === 'mfs');

      let initialFrom = defaultFromSourceId;
      let initialTo = defaultToSourceId;

      if (!initialFrom) {
        initialFrom = bankSource?.id || paymentSources[0]?.id || '';
      }

      if (!initialTo) {
        // If from is bank, default to cash for ATM withdrawal
        if (cashSource && cashSource.id !== initialFrom) {
          initialTo = cashSource.id;
          setTransferType('withdraw_cash');
          setNote('ATM / ব্যাংক থেকে ক্যাশ উত্তোলন');
        } else {
          // Choose any source that is not from
          const other = paymentSources.find((s) => s.id !== initialFrom);
          initialTo = other?.id || '';
          setTransferType('transfer');
          setNote('একাউন্ট স্থানান্তর');
        }
      }

      setFromSourceId(initialFrom);
      setToSourceId(initialTo);
    }
  }, [isOpen, editingTransfer, defaultFromSourceId, defaultToSourceId, paymentSources]);

  if (!isOpen) return null;

  // Find sources
  const fromSource = paymentSources.find((s) => s.id === fromSourceId);
  const toSource = paymentSources.find((s) => s.id === toSourceId);

  const fromBalance = getSourceBalance && fromSource ? getSourceBalance(fromSource.id) : null;
  const toBalance = getSourceBalance && toSource ? getSourceBalance(toSource.id) : null;

  // Preset action helper
  const handlePresetSelect = (preset: 'withdraw' | 'bank_to_bank' | 'bank_to_mfs' | 'deposit') => {
    setErrorMessage(null);
    const bankSources = paymentSources.filter((s) => s.type === 'bank');
    const cashSource = paymentSources.find((s) => s.type === 'cash');
    const mfsSource = paymentSources.find((s) => s.type === 'mfs');

    if (preset === 'withdraw') {
      // Bank to Cash
      const from = bankSources[0]?.id || paymentSources[0]?.id || '';
      const to = cashSource?.id || paymentSources[1]?.id || '';
      setFromSourceId(from);
      setToSourceId(to);
      setTransferType('withdraw_cash');
      if (!note || note === 'একাউন্ট স্থানান্তর' || note.includes('উত্তোলন')) {
        setNote('ATM / ব্যাংক থেকে নগদ টাকা উত্তোলন');
      }
    } else if (preset === 'bank_to_bank') {
      // Bank 1 to Bank 2
      const from = bankSources[0]?.id || paymentSources[0]?.id || '';
      const to = bankSources[1]?.id || (paymentSources.find((s) => s.id !== from)?.id || '');
      setFromSourceId(from);
      setToSourceId(to);
      setTransferType('bank_to_bank');
      setNote('এক ব্যাংক থেকে অন্য ব্যাংকে স্থানান্তর');
    } else if (preset === 'bank_to_mfs') {
      // Bank to MFS (bKash/Nagad)
      const from = bankSources[0]?.id || paymentSources[0]?.id || '';
      const to = mfsSource?.id || (paymentSources.find((s) => s.id !== from)?.id || '');
      setFromSourceId(from);
      setToSourceId(to);
      setTransferType('mfs_transfer');
      setNote('ব্যাংক টু বিকাশ/নগদে অ্যাড মানি');
    } else if (preset === 'deposit') {
      // Cash to Bank
      const from = cashSource?.id || paymentSources[0]?.id || '';
      const to = bankSources[0]?.id || (paymentSources.find((s) => s.id !== from)?.id || '');
      setFromSourceId(from);
      setToSourceId(to);
      setTransferType('deposit_cash');
      setNote('ব্যাংকে নগদ টাকা জমা');
    }
  };

  // Swap From & To
  const handleSwap = () => {
    const temp = fromSourceId;
    setFromSourceId(toSourceId);
    setToSourceId(temp);
  };

  // Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('অনুগ্রহ করে সঠিক টাকার পরিমাণ লিখুন (০ এর বেশি হতে হবে)');
      return;
    }

    if (!fromSourceId || !toSourceId) {
      setErrorMessage('উৎস এবং গন্তব্য উভয় একাউন্ট নির্বাচন করতে হবে');
      return;
    }

    if (fromSourceId === toSourceId) {
      setErrorMessage('একই একাউন্ট থেকে সেই একাউন্টেই স্থানান্তর করা যাবে না। ভিন্ন একাউন্ট বেছে নিন।');
      return;
    }

    // Determine smart transfer type if generic
    let finalTransferType = transferType;
    if (fromSource?.type === 'bank' && toSource?.type === 'cash') {
      finalTransferType = 'withdraw_cash';
    } else if (fromSource?.type === 'cash' && toSource?.type === 'bank') {
      finalTransferType = 'deposit_cash';
    } else if (fromSource?.type === 'bank' && toSource?.type === 'bank') {
      finalTransferType = 'bank_to_bank';
    } else if (toSource?.type === 'mfs') {
      finalTransferType = 'mfs_transfer';
    }

    onSave(
      {
        fromSourceId,
        toSourceId,
        amount: numAmount,
        date,
        time,
        transferType: finalTransferType,
        note: note.trim() || undefined,
      },
      editingTransfer?.id
    );
  };

  const getSourceTypeIcon = (type?: string) => {
    switch (type) {
      case 'bank':
        return <Building2 className="w-4 h-4 text-sky-600" />;
      case 'mfs':
        return <Smartphone className="w-4 h-4 text-pink-600" />;
      case 'cash':
      default:
        return <Wallet className="w-4 h-4 text-emerald-600" />;
    }
  };

  const quickAmounts = [500, 1000, 2000, 5000, 10000];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh] animate-in slide-in-from-bottom duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-sky-700 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20 shadow-inner">
              <ArrowLeftRight className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                {editingTransfer ? 'স্থানান্তর হিসাব পরিবর্তন' : 'টাকা স্থানান্তর / ক্যাশ উত্তোলন'}
              </h2>
              <p className="text-[11px] text-indigo-100 font-medium">
                খরচের মধ্যে পড়বে না • শুধুমাত্র একাউন্ট সমন্বয়
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {/* Reassurance Info Banner */}
          <div className="bg-indigo-50/80 border border-indigo-200/90 rounded-2xl p-3 flex items-start gap-2.5 shadow-2xs">
            <Info className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
            <div className="text-[11px] text-indigo-900 leading-relaxed">
              <span className="font-bold">গুরুত্বপূর্ণ তথ্য:</span> এটি কোনো{' '}
              <span className="font-bold underline decoration-indigo-400">খরচ বা আয় নয়</span>।
              ব্যাংক থেকে উত্তোলন বা এক ব্যাংক থেকে অন্য ব্যাংকে পাঠালে শুধু সংশ্লিষ্ট দুটি একাউন্টের ব্যালেন্স সমন্বয় হবে, আপনার মোট সম্পত্তি একই থাকবে।
            </div>
          </div>

          {/* Quick Presets for 1-tap setup */}
          {!editingTransfer && (
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                দ্রুত স্থানান্তর বাছুন:
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePresetSelect('withdraw')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-start gap-2 border transition-all text-left ${
                    transferType === 'withdraw_cash'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50/50'
                  }`}
                >
                  <Wallet className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span className="truncate">ব্যাংক থেকে ক্যাশ উত্তোলন</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePresetSelect('bank_to_bank')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-start gap-2 border transition-all text-left ${
                    transferType === 'bank_to_bank'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50/50'
                  }`}
                >
                  <Building2 className="w-4 h-4 shrink-0 text-sky-500" />
                  <span className="truncate">এক ব্যাংক থেকে অন্য ব্যাংক</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePresetSelect('bank_to_mfs')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-start gap-2 border transition-all text-left ${
                    transferType === 'mfs_transfer'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50/50'
                  }`}
                >
                  <Smartphone className="w-4 h-4 shrink-0 text-pink-500" />
                  <span className="truncate">ব্যাংক টু বিকাশ/নগদ</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePresetSelect('deposit')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-start gap-2 border transition-all text-left ${
                    transferType === 'deposit_cash'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50/50'
                  }`}
                >
                  <Repeat className="w-4 h-4 shrink-0 text-amber-500" />
                  <span className="truncate">ক্যাশ ব্যাংকে জমা</span>
                </button>
              </div>
            </div>
          )}

          {/* From Account & To Account Selector with Swap Button */}
          <div className="bg-slate-50/90 rounded-2xl p-3.5 border border-slate-200/90 space-y-3 relative">
            {/* From Account */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  উৎস একাউন্ট (টাকা কাটা যাবে):
                </label>
                {fromBalance !== null && (
                  <span className="text-[11px] font-semibold text-slate-500">
                    বর্তমান ব্যালেন্স: {formatCurrency(fromBalance)}
                  </span>
                )}
              </div>
              <div className="relative">
                <select
                  id="select-transfer-from-source"
                  value={fromSourceId}
                  onChange={(e) => setFromSourceId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-2xs"
                  required
                >
                  {paymentSources.map((source) => {
                    const bal = getSourceBalance ? getSourceBalance(source.id) : null;
                    return (
                      <option key={`from-${source.id}`} value={source.id}>
                        {source.name} {bal !== null ? `(${formatCurrency(bal)})` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Swap Button In Between */}
            <div className="flex items-center justify-center -my-1">
              <button
                type="button"
                onClick={handleSwap}
                title="উৎস ও গন্তব্য অদল-বদল করুন"
                className="w-7 h-7 rounded-full bg-white border border-slate-300 shadow-xs hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-indigo-600 active:scale-95 transition-all"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* To Account */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  গন্তব্য একাউন্ট (টাকা জমা হবে):
                </label>
                {toBalance !== null && (
                  <span className="text-[11px] font-semibold text-slate-500">
                    বর্তমান ব্যালেন্স: {formatCurrency(toBalance)}
                  </span>
                )}
              </div>
              <div className="relative">
                <select
                  id="select-transfer-to-source"
                  value={toSourceId}
                  onChange={(e) => setToSourceId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-2xs"
                  required
                >
                  {paymentSources.map((source) => {
                    const bal = getSourceBalance ? getSourceBalance(source.id) : null;
                    return (
                      <option
                        key={`to-${source.id}`}
                        value={source.id}
                        disabled={source.id === fromSourceId}
                      >
                        {source.name} {bal !== null ? `(${formatCurrency(bal)})` : ''}{' '}
                        {source.id === fromSourceId ? '(উৎস একাউন্ট)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* Amount Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              স্থানান্তরিত টাকার পরিমাণ (৳):
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-indigo-700">
                ৳
              </span>
              <input
                id="input-transfer-amount"
                type="number"
                inputMode="decimal"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="যেমন: ৫০০০"
                className="w-full bg-slate-50/70 border border-slate-200 rounded-2xl pl-9 pr-4 py-3 text-lg font-extrabold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-2xs"
                required
                autoFocus={!editingTransfer}
              />
            </div>

            {/* Quick Amount Suggestion Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(String(q))}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-800 transition-colors border border-slate-200"
                >
                  +{formatCurrency(q)}
                </button>
              ))}
              {fromBalance !== null && fromBalance > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(String(fromBalance))}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 transition-colors border border-amber-200"
                >
                  সব টাকা ({formatCurrency(fromBalance)})
                </button>
              )}
            </div>
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                তারিখ:
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                সময়:
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Note Field */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              মন্তব্য বা বিবরণ (ঐচ্ছিক):
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="যেমন: ATM বুথ থেকে হাত খরচের জন্য নগদ উত্তোলন"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              id="btn-submit-transfer"
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white py-3.5 px-4 rounded-2xl font-bold text-sm shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ArrowLeftRight className="w-4 h-4 stroke-[2.5]" />
              <span>{editingTransfer ? 'আপডেট সংরক্ষণ করুন' : 'স্থানান্তর সম্পন্ন করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
