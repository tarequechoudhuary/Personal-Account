import React from 'react';
import {
  Trash2,
  Edit3,
  Landmark,
  Banknote,
  Smartphone,
  ArrowRight,
  ArrowLeftRight,
} from 'lucide-react';
import { AccountTransfer, PaymentSource } from '../types';
import { formatCurrency, toBengaliNumber } from '../utils/formatters';

interface TransferItemProps {
  transfer: AccountTransfer;
  fromSource?: PaymentSource;
  toSource?: PaymentSource;
  onEdit: (transfer: AccountTransfer) => void;
  onDelete: (id: string) => void;
  showDate?: boolean;
}

export const TransferItem: React.FC<TransferItemProps> = ({
  transfer,
  fromSource,
  toSource,
  onEdit,
  onDelete,
  showDate = false,
}) => {
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

  const getTransferBadge = () => {
    switch (transfer.transferType) {
      case 'withdraw_cash':
        return { label: 'ক্যাশ উত্তোলন (খরচ নয়)', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'deposit_cash':
        return { label: 'ব্যাংকে জমা (আয় নয়)', bg: 'bg-sky-50 text-sky-800 border-sky-200' };
      case 'bank_to_bank':
        return { label: 'ব্যাংক স্থানান্তর (খরচ নয়)', bg: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
      case 'mfs_transfer':
        return { label: 'বিকাশ/নগদ স্থানান্তর', bg: 'bg-purple-50 text-purple-800 border-purple-200' };
      default:
        return { label: 'তহবিল স্থানান্তর (খরচ নয়)', bg: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
    }
  };

  const badge = getTransferBadge();

  return (
    <div
      id={`transfer-card-${transfer.id}`}
      className="group relative bg-white rounded-2xl p-3.5 sm:p-4 border border-indigo-100/90 shadow-[0_2px_8px_-2px_rgba(99,102,241,0.08)] hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Icon & Transfer info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-600 flex items-center justify-center text-white shrink-0 shadow-xs relative">
            <ArrowLeftRight className="w-5 h-5 stroke-[2.2]" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-800 text-sm sm:text-base">
                {transfer.transferType === 'withdraw_cash'
                  ? 'ব্যাংক থেকে ক্যাশ উত্তোলন'
                  : transfer.transferType === 'deposit_cash'
                  ? 'ব্যাংকে নগদ জমা'
                  : 'একাউন্ট স্থানান্তর'}
              </span>
              <span
                className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${badge.bg}`}
              >
                {badge.label}
              </span>
            </div>

            {/* Account Movement: From ➔ To */}
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-700 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
                {getSourceIcon(fromSource?.type)}
                <span>{fromSource?.name || 'উৎস একাউন্ট'}</span>
              </span>

              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                {getSourceIcon(toSource?.type)}
                <span>{toSource?.name || 'গন্তব্য একাউন্ট'}</span>
              </span>

              {/* Date / Time */}
              <span className="text-[11px] text-slate-400 ml-1">
                {showDate ? `${transfer.date} • ` : ''}
                {toBengaliNumber(transfer.time)}
              </span>
            </div>

            {transfer.note && (
              <p className="text-xs text-slate-500 mt-1 italic line-clamp-1">
                "{transfer.note}"
              </p>
            )}
          </div>
        </div>

        {/* Right: Amount & Actions */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center gap-0.5">
            <span className="text-lg sm:text-xl font-extrabold text-indigo-700 tracking-tight">
              ⇄ {formatCurrency(transfer.amount)}
            </span>
          </div>

          <span className="text-[10px] font-semibold text-slate-400">
            খরচে অপ্রভাবিত
          </span>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1 mt-1">
            <button
              onClick={() => onEdit(transfer)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              title="সম্পাদনা করুন"
              aria-label="Edit transfer"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(transfer.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="মুছে ফেলুন"
              aria-label="Delete transfer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
