import React from 'react';
import { Trash2, Edit3, Landmark, Banknote, Smartphone } from 'lucide-react';
import { Expense, ExpenseCategory, PaymentSource } from '../types';
import { formatCurrency, toBengaliNumber } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface ExpenseItemProps {
  expense: Expense;
  category?: ExpenseCategory;
  categories?: ExpenseCategory[];
  paymentSource?: PaymentSource;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  showDate?: boolean;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({
  expense,
  category,
  categories = [],
  paymentSource,
  onEdit,
  onDelete,
  showDate = false,
}) => {
  const parentCategory = category?.parentId
    ? categories.find((c) => c.id === category.parentId)
    : undefined;

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
      id={`expense-card-${expense.id}`}
      className="group relative bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Icon & Title info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
            style={{ backgroundColor: category?.color || '#64748b' }}
          >
            <CategoryIcon name={category?.icon || 'CircleDot'} className="w-5 h-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-slate-800 text-base truncate">
                {expense.title}
              </h4>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              {/* Category tag */}
              {parentCategory ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                  <span className="text-slate-400 font-normal mr-1">{parentCategory.name} ›</span>
                  <span className="font-semibold text-slate-800">{category?.name}</span>
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  {category?.name || 'অনির্দিষ্ট খাত'}
                </span>
              )}

              {/* Payment Source tag */}
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white shadow-xs"
                style={{ backgroundColor: paymentSource?.color || '#475569' }}
              >
                {getSourceIcon(paymentSource?.type)}
                <span>{paymentSource?.name || 'ক্যাশ'}</span>
              </span>

              {/* Time / Date */}
              <span className="text-[11px] text-slate-400 font-medium">
                {showDate ? expense.date : toBengaliNumber(expense.time || '12:00')}
              </span>
            </div>

            {expense.note && (
              <p className="text-xs text-slate-500 mt-1 line-clamp-1 italic">
                "{expense.note}"
              </p>
            )}
          </div>
        </div>

        {/* Right: Amount & Actions */}
        <div className="flex flex-col items-end shrink-0 pl-2">
          <span className="text-base sm:text-lg font-bold text-rose-600 tracking-tight">
            -{formatCurrency(expense.amount)}
          </span>

          <div className="flex items-center gap-1 mt-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button
              id={`btn-edit-expense-${expense.id}`}
              onClick={() => onEdit(expense)}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="সম্পাদনা করুন"
              aria-label="Edit Expense"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              id={`btn-delete-expense-${expense.id}`}
              onClick={() => onDelete(expense.id)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="মুছে ফেলুন"
              aria-label="Delete Expense"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
