import React from 'react';
import { Trash2, Edit3, Landmark, Banknote, Smartphone, ArrowDownLeft } from 'lucide-react';
import { Income, IncomeCategory, PaymentSource } from '../types';
import { formatCurrency, toBengaliNumber } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface IncomeItemProps {
  income: Income;
  category?: IncomeCategory;
  paymentSource?: PaymentSource;
  onEdit: (income: Income) => void;
  onDelete: (id: string) => void;
  showDate?: boolean;
}

export const IncomeItem: React.FC<IncomeItemProps> = ({
  income,
  category,
  paymentSource,
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

  return (
    <div
      id={`income-card-${income.id}`}
      className="group relative bg-white rounded-2xl p-3.5 sm:p-4 border border-emerald-100/80 shadow-[0_2px_8px_-2px_rgba(16,185,129,0.08)] hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Icon & Title info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs relative"
            style={{ backgroundColor: category?.color || '#10b981' }}
          >
            <CategoryIcon name={category?.icon || 'Coins'} className="w-5 h-5" />
            <div className="absolute -bottom-1 -right-1 bg-emerald-600 rounded-full p-0.5 text-white border-2 border-white shadow-2xs">
              <ArrowDownLeft className="w-2.5 h-2.5 stroke-[3]" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-800 text-base truncate">
                {income.title}
              </h4>
              <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200 shrink-0">
                আয় / জমা
              </span>
            </div>

            {/* Badges: Category & Payment Source */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-slate-500">
              {category && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                  {category.name}
                </span>
              )}

              {paymentSource && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                  {getSourceIcon(paymentSource.type)}
                  <span>{paymentSource.name}</span>
                </span>
              )}

              {/* Time or Date */}
              <span className="text-[11px] text-slate-400 ml-0.5">
                {showDate ? `${income.date} • ` : ''}
                {toBengaliNumber(income.time)}
              </span>
            </div>

            {income.note && (
              <p className="text-xs text-slate-400 mt-1 italic line-clamp-1">
                "{income.note}"
              </p>
            )}
          </div>
        </div>

        {/* Right: Amount & Actions */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center gap-0.5">
            <span className="text-lg sm:text-xl font-extrabold text-emerald-600 tracking-tight">
              +{formatCurrency(income.amount)}
            </span>
          </div>

          {/* Action buttons (always accessible) */}
          <div className="flex items-center gap-1 mt-0.5">
            <button
              id={`btn-edit-income-${income.id}`}
              onClick={() => onEdit(income)}
              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              title="সম্পাদনা করুন"
              aria-label="Edit Income"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              id={`btn-delete-income-${income.id}`}
              onClick={() => onDelete(income.id)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="মুছে ফেলুন"
              aria-label="Delete Income"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
