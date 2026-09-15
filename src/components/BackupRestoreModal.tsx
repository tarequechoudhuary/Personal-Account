import React, { useRef, useState } from 'react';
import {
  X,
  Download,
  Upload,
  ShieldCheck,
  FileJson,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  ArrowRight,
} from 'lucide-react';
import { Expense, ExpenseCategory, PaymentSource } from '../types';
import { toBengaliNumber } from '../utils/formatters';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  categories: ExpenseCategory[];
  paymentSources: PaymentSource[];
  onImportData: (data: {
    expenses?: Expense[];
    categories?: ExpenseCategory[];
    paymentSources?: PaymentSource[];
  }) => void;
  onExportData: () => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
  expenses = [],
  categories = [],
  paymentSources = [],
  onImportData,
  onExportData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  if (!isOpen) return null;

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

        if (!parsed || (!parsed.expenses && !parsed.categories && !parsed.paymentSources)) {
          throw new Error('Invalid file format');
        }

        onImportData(parsed);
        setImportStatus({
          type: 'success',
          message: 'আপনার ব্যাকআপ ফাইল সফলভাবে রিস্টোর করা হয়েছে!',
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="backup-restore-modal"
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-5 animate-in slide-in-from-bottom-4 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                ডাটা ব্যাকআপ ও রিস্টোর
              </h3>
              <p className="text-xs text-slate-500">
                অন্য মোবাইলে সহজে পুরনো ডাটা স্থানান্তর করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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

        {/* Step 1: Export / Download */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">
                  ১
                </span>
                <h4 className="font-bold text-slate-800 text-sm">
                  বর্তমান মোবাইলের ব্যাকআপ ডাউনলোড
                </h4>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                আপনার বর্তমান {toBengaliNumber(expenses.length)} টি খরচ,{' '}
                {toBengaliNumber(paymentSources.length)} টি ব্যাংক/ক্যাশ এবং{' '}
                {toBengaliNumber(categories.length)} টি খাতের তথ্য একটি নিরাপদ ফাইলে সংরক্ষণ করুন।
              </p>
            </div>
          </div>

          <button
            id="btn-modal-export-backup"
            onClick={onExportData}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-98 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>ব্যাকআপ ফাইল ডাউনলোড করুন (.json)</span>
          </button>
        </div>

        {/* Step 2: Import / Restore */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">
              ২
            </span>
            <h4 className="font-bold text-slate-800 text-sm">
              অন্য মোবাইলে পুরনো ডাটা রিস্টোর
            </h4>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            নতুন মোবাইলে ডাউনলোড করা ব্যাকআপ ফাইলটি সিলেক্ট করলে পুরনো সমস্ত খরচের হিসাব অক্ষতভাবে ফিরে আসবে।
          </p>

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
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
              isDragOver
                ? 'border-indigo-500 bg-indigo-50/50'
                : 'border-slate-200 hover:border-indigo-400 bg-white'
            }`}
          >
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-700">
                ব্যাকআপ ফাইল সিলেক্ট করুন বা টেনে আনুন
              </span>
              <span className="text-[11px] text-slate-400">
                hishab-khata-backup-*.json ফাইলটি বেছে নিন
              </span>
            </div>
          </div>
        </div>

        {/* How to transfer instruction tip */}
        <div className="bg-emerald-50/60 rounded-2xl p-3 border border-emerald-100/80 flex items-start gap-2.5 text-xs text-emerald-900">
          <Smartphone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">সহজে ট্রান্সফার করার উপায়:</span>
            <span className="text-[11px] text-emerald-800/90 leading-tight block">
              ডাউনলোড করা ফাইলটি আপনার WhatsApp, ইমেইল বা ব্লুটুথ দিয়ে নতুন মোবাইলে পাঠিয়ে সেখান থেকে অ্যাপে সিলেক্ট করুন।
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
        >
          বন্ধ করুন
        </button>
      </div>
    </div>
  );
};
