import React, { useState, useEffect } from 'react';
import { X, Landmark, Banknote, Smartphone, Check } from 'lucide-react';
import { PaymentSource, PaymentType } from '../types';

interface AddBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (source: Omit<PaymentSource, 'id'>, id?: string) => void;
  editingSource?: PaymentSource | null;
}

const COLOR_OPTIONS = [
  '#16a34a', // Emerald Green (Cash)
  '#0284c7', // Sky Blue
  '#2563eb', // Royal Blue
  '#4338ca', // Indigo
  '#7c3aed', // Purple
  '#e11d48', // Crimson/Pink (bKash)
  '#ea580c', // Orange (Nagad)
  '#0d9488', // Teal
  '#475569', // Slate
];

const POPULAR_BANKS = [
  'ডাচ-বাংলা ব্যাংক (DBBL)',
  'ব্র্যাক ব্যাংক (BRAC Bank)',
  'ইসলামী ব্যাংক (IBBL)',
  'সিটি ব্যাংক (City Bank)',
  'সোনালী ব্যাংক (Sonali Bank)',
  'ইস্টার্ন ব্যাংক (EBL)',
  'বিকাশ (bKash)',
  'নগদ (Nagad)',
  'রকেট (Rocket)',
];

export const AddBankModal: React.FC<AddBankModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingSource,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<PaymentType>('bank');
  const [accountNumber, setAccountNumber] = useState('');
  const [color, setColor] = useState(COLOR_OPTIONS[1]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingSource) {
      setName(editingSource.name);
      setType(editingSource.type);
      setAccountNumber(editingSource.accountNumber || '');
      setColor(editingSource.color || COLOR_OPTIONS[1]);
    } else {
      setName('');
      setType('bank');
      setAccountNumber('');
      setColor(COLOR_OPTIONS[1]);
    }
    setError('');
  }, [editingSource, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('অনুগ্রহ করে ব্যাংক বা মাধ্যমের নাম লিখুন');
      return;
    }

    onSave(
      {
        name: name.trim(),
        type,
        accountNumber: accountNumber.trim() || undefined,
        color,
      },
      editingSource?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="modal-add-bank"
        className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                {editingSource ? 'ব্যাংক/মাধ্যম পরিবর্তন' : 'নতুন ব্যাংক/ক্যাশ যোগ করুন'}
              </h3>
              <p className="text-xs text-slate-500">যেখান থেকে আপনি খরচ করেন</p>
            </div>
          </div>
          <button
            id="btn-close-bank-modal"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Type Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              মাধ্যমের ধরণ
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setType('bank');
                  if (!color || color === '#16a34a') setColor('#0284c7');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-medium flex flex-col items-center gap-1 border transition-all ${
                  type === 'bank'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-800 font-semibold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Landmark className="w-4 h-4" />
                <span>ব্যাংক একাউন্ট</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('cash');
                  setColor('#16a34a');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-medium flex flex-col items-center gap-1 border transition-all ${
                  type === 'cash'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-800 font-semibold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>নগদ ক্যাশ</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('mfs');
                  if (color === '#16a34a') setColor('#e11d48');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-medium flex flex-col items-center gap-1 border transition-all ${
                  type === 'mfs'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-800 font-semibold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>মোবাইল ব্যাংকিং</span>
              </button>
            </div>
          </div>

          {/* Name input */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              ব্যাংক বা মাধ্যমের নাম <span className="text-rose-500">*</span>
            </label>
            <input
              id="input-bank-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="যেমন: ডাচ-বাংলা ব্যাংক, নগদ ক্যাশ, বিকাশ"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium text-slate-800 placeholder:text-slate-400"
            />
            {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}

            {/* Quick Bank suggestions */}
            {!editingSource && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="text-[11px] text-slate-400 py-0.5">দ্রুত পছন্দ:</span>
                {POPULAR_BANKS.slice(0, 4).map((pBank) => (
                  <button
                    key={pBank}
                    type="button"
                    onClick={() => {
                      setName(pBank);
                      if (pBank.includes('বিকাশ')) {
                        setType('mfs');
                        setColor('#e11d48');
                      } else if (pBank.includes('নগদ')) {
                        setType('mfs');
                        setColor('#ea580c');
                      } else {
                        setType('bank');
                      }
                    }}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    {pBank.split(' ')[0]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Account / Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              একাউন্ট বা কার্ড নম্বর (ঐচ্ছিক)
            </label>
            <input
              id="input-bank-account-number"
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="যেমন: A/C: ****1234 বা ০১৭১..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              কালার থিম নির্ধারণ
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-xs"
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="w-4 h-4 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              বাতিল
            </button>
            <button
              id="btn-save-bank"
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all active:scale-[0.98]"
            >
              {editingSource ? 'সংরক্ষণ করুন' : 'যোগ করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
