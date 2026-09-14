import React, { useState, useRef } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  Edit2,
  Check,
  Download,
  Upload,
  ShieldCheck,
  FileJson,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { UserProfile, Expense, PaymentSource, ExpenseCategory, LoanRecord } from '../types';
import { formatCurrency, toBengaliNumber } from '../utils/formatters';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  expenses: Expense[];
  categories: ExpenseCategory[];
  paymentSources: PaymentSource[];
  loans: LoanRecord[];
  onExportData: () => void;
  onImportData: (data: {
    expenses?: Expense[];
    categories?: ExpenseCategory[];
    paymentSources?: PaymentSource[];
    loans?: LoanRecord[];
    profile?: UserProfile;
  }) => void;
  onResetData: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  expenses,
  categories,
  paymentSources,
  loans,
  onExportData,
  onImportData,
  onResetData,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone || '');
  const [email, setEmail] = useState(profile.email || '');
  const [notes, setNotes] = useState(profile.notes || '');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      name: name.trim() || 'আমার হিসাব',
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      notes: notes.trim() || undefined,
      avatarText: (name.trim() || 'আ')[0],
    });
    setIsEditing(false);
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.json')) {
      setImportStatus({
        type: 'error',
        message: 'অনুগ্রহ করে একটি বৈধ .json ব্যাকআপ ফাইল নির্বাচন করুন।',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);

        if (
          !parsed ||
          (!parsed.expenses &&
            !parsed.categories &&
            !parsed.paymentSources &&
            !parsed.loans)
        ) {
          throw new Error('Invalid file format');
        }

        onImportData(parsed);
        setImportStatus({
          type: 'success',
          message: 'আপনার ব্যাকআপ সফলভাবে রিস্টোর করা হয়েছে!',
        });
        setTimeout(() => {
          setImportStatus(null);
          onClose();
        }, 1200);
      } catch (err) {
        setImportStatus({
          type: 'error',
          message: 'ফাইলটি পড়া সম্ভব হয়নি। ব্যাকআপ ফাইলটি সঠিক কিনা যাচাই করুন।',
        });
      }
    };
    reader.readAsText(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="modal-user-profile"
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto space-y-5 animate-in slide-in-from-bottom-4 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-base">
              ব্যবহারকারীর প্রোফাইল ও সেটিংস
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-linear-to-br from-slate-900 to-slate-800 rounded-3xl p-5 text-white shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-extrabold text-2xl shadow-lg border-2 border-white/20">
                {profile.avatarText || profile.name[0] || 'ইউ'}
              </div>
              <div>
                <h4 className="text-lg font-bold tracking-tight">
                  {profile.name}
                </h4>
                {profile.phone && (
                  <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-emerald-400" />
                    <span>{profile.phone}</span>
                  </p>
                )}
                {profile.email && (
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3 text-indigo-400" />
                    <span>{profile.email}</span>
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all text-xs flex items-center gap-1 font-semibold"
              title="তথ্য সম্পাদনা"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'বাতিল' : 'সম্পাদনা'}</span>
            </button>
          </div>

          {profile.notes && (
            <div className="mt-3 pt-3 border-t border-white/10 text-xs text-slate-300 italic">
              "{profile.notes}"
            </div>
          )}

          {/* Mini Stats Banner */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 text-center">
            <div className="bg-white/5 rounded-xl p-1.5">
              <span className="text-[10px] text-slate-400 block">মোট খরচ</span>
              <span className="text-xs font-bold text-emerald-400 truncate block">
                {formatCurrency(totalSpent)}
              </span>
            </div>
            <div className="bg-white/5 rounded-xl p-1.5">
              <span className="text-[10px] text-slate-400 block">ব্যাংক/ক্যাশ</span>
              <span className="text-xs font-bold text-white block">
                {toBengaliNumber(paymentSources.length)} টি
              </span>
            </div>
            <div className="bg-white/5 rounded-xl p-1.5">
              <span className="text-[10px] text-slate-400 block">লোন হিসাব</span>
              <span className="text-xs font-bold text-white block">
                {toBengaliNumber(loans.length)} টি
              </span>
            </div>
          </div>
        </div>

        {/* Profile Edit Form (Accordion) */}
        {isEditing && (
          <form
            onSubmit={handleSaveProfile}
            className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3 animate-in fade-in duration-150"
          >
            <h5 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
              প্রোফাইল তথ্য আপডেট
            </h5>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                আপনার নাম
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="আপনার পুরো নাম লিখুন"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-semibold text-slate-800 bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                মোবাইল নম্বর
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="০১৭১..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-slate-800 bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                ইমেইল এড্রেস
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-slate-800 bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                বিবরণ বা পরিচয়
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="যেমন: ব্যক্তিগত হিসাব খাতা"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-slate-800 bg-white"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>সংরক্ষণ করুন</span>
              </button>
            </div>
          </form>
        )}

        {/* Status Message */}
        {importStatus && (
          <div
            className={`p-3 rounded-2xl flex items-center gap-2.5 text-xs font-semibold ${
              importStatus.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {importStatus.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span>{importStatus.message}</span>
          </div>
        )}

        {/* Dedicated Data Backup & Restore Section inside Profile */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              ডাটা ব্যাকআপ ও অন্য মোবাইলে রিস্টোর
            </h4>
          </div>

          {/* Export / Download Backup Button */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-bold text-slate-800 text-xs">
                  ১. বর্তমান তথ্যের ব্যাকআপ নিন
                </h5>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  খরচ, লোন, ব্যাংক ও খাতের সমস্ত তথ্য একটি ফাইলে সংরক্ষণ করুন
                </p>
              </div>
            </div>

            <button
              id="btn-profile-download-backup"
              onClick={onExportData}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>ব্যাকআপ ফাইল ডাউনলোড করুন (.json)</span>
            </button>
          </div>

          {/* Import / Restore Backup Box */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2.5">
            <div>
              <h5 className="font-bold text-slate-800 text-xs">
                ২. অন্য মোবাইলে পুরনো ডাটা রিস্টোর
              </h5>
              <p className="text-[11px] text-slate-500 mt-0.5">
                নতুন মোবাইলে অ্যাপ ইন্সটল করে আগের ডাউনলোডকৃত ফাইলটি সিলেক্ট করুন
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileInputChange}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleFile(file);
              }}
              className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-indigo-500 bg-indigo-50/50'
                  : 'border-slate-200 hover:border-indigo-400 bg-white'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-700">
                  ব্যাকআপ ফাইল বেছে নিন
                </span>
                <span className="text-[10px] text-slate-400">
                  hishab-khata-backup-*.json ফাইলটি সিলেক্ট করুন
                </span>
              </div>
            </div>
          </div>

          {/* Quick Tip */}
          <div className="bg-emerald-50/60 rounded-2xl p-2.5 border border-emerald-100/80 flex items-start gap-2 text-[11px] text-emerald-900">
            <Smartphone className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              ব্যাকআপ ফাইলটি WhatsApp বা ইমেইল দিয়ে যেকোনো ডিভাইসে পাঠিয়ে সহজেই আপনার পুরো হিসাব ফিরিয়ে আনা সম্ভব।
            </span>
          </div>
        </div>

        {/* Reset App Option */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onResetData}
            className="text-[11px] text-rose-600 hover:underline flex items-center gap-1 font-semibold"
          >
            <RotateCcw className="w-3 h-3" />
            <span>অ্যাপ ডাটায় রিসেট করুন</span>
          </button>

          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
