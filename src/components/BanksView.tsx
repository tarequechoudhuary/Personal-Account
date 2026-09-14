import React, { useState } from 'react';
import {
  Plus,
  Landmark,
  Banknote,
  Smartphone,
  Edit2,
  Trash2,
  CreditCard,
  TrendingDown,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { PaymentSource, Expense, ExpenseCategory, PaymentType } from '../types';
import { formatCurrency, toBengaliNumber } from '../utils/formatters';
import { ExpenseItem } from './ExpenseItem';

interface BanksViewProps {
  paymentSources: PaymentSource[];
  expenses: Expense[];
  categories: ExpenseCategory[];
  onAddBank: () => void;
  onEditBank: (source: PaymentSource) => void;
  onDeleteBank: (id: string) => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

export const BanksView: React.FC<BanksViewProps> = ({
  paymentSources,
  expenses,
  categories,
  onAddBank,
  onEditBank,
  onDeleteBank,
  onEditExpense,
  onDeleteExpense,
}) => {
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<PaymentType | 'all'>('all');

  const getSourceIcon = (type: PaymentType) => {
    switch (type) {
      case 'bank':
        return <Landmark className="w-5 h-5" />;
      case 'mfs':
        return <Smartphone className="w-5 h-5" />;
      case 'cash':
      default:
        return <Banknote className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: PaymentType) => {
    switch (type) {
      case 'bank':
        return 'ব্যাংক একাউন্ট';
      case 'mfs':
        return 'মোবাইল ব্যাংকিং';
      case 'cash':
      default:
        return 'নগদ ক্যাশ';
    }
  };

  // Filter sources
  const filteredSources = paymentSources.filter((s) => {
    if (typeFilter !== 'all' && s.type !== typeFilter) return false;
    return true;
  });

  // Calculate total spent for a source
  const getSourceTotal = (sourceId: string) => {
    return expenses
      .filter((e) => e.paymentSourceId === sourceId)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const getSourceExpenseCount = (sourceId: string) => {
    return expenses.filter((e) => e.paymentSourceId === sourceId).length;
  };

  // Currently selected source for viewing individual statement
  const selectedSource = paymentSources.find((s) => s.id === selectedSourceId);
  const selectedSourceExpenses = selectedSourceId
    ? expenses.filter((e) => e.paymentSourceId === selectedSourceId)
    : [];

  return (
    <div className="space-y-4 pb-20">
      {/* Top Banner / Intro */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800">
            ব্যাংক ও ক্যাশ ব্যবস্থাপনা
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            কোন ব্যাংক বা মাধ্যম থেকে কত খরচ হয়েছে তা পর্যবেক্ষণ করুন
          </p>
        </div>
        <button
          id="btn-add-new-bank-page"
          onClick={onAddBank}
          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন ব্যাংক যোগ</span>
        </button>
      </div>

      {/* Type Filter Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setTypeFilter('all')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
            typeFilter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          সকল মাধ্যম ({toBengaliNumber(paymentSources.length)})
        </button>
        <button
          onClick={() => setTypeFilter('bank')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
            typeFilter === 'bank'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          ব্যাংক সমূহ
        </button>
        <button
          onClick={() => setTypeFilter('cash')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
            typeFilter === 'cash'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          নগদ ক্যাশ
        </button>
        <button
          onClick={() => setTypeFilter('mfs')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
            typeFilter === 'mfs'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          মোবাইল ব্যাংকিং
        </button>
      </div>

      {/* Bank & Cash Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredSources.map((source) => {
          const totalSpent = getSourceTotal(source.id);
          const count = getSourceExpenseCount(source.id);
          const isSelected = selectedSourceId === source.id;

          return (
            <div
              key={source.id}
              id={`bank-card-${source.id}`}
              className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md'
                  : 'border-slate-100 hover:border-slate-200 shadow-xs'
              }`}
              onClick={() => setSelectedSourceId(isSelected ? null : source.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-2xl text-white flex items-center justify-center shrink-0 shadow-xs"
                    style={{ backgroundColor: source.color }}
                  >
                    {getSourceIcon(source.type)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">
                      {source.name}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                      <span className="font-medium">{getTypeLabel(source.type)}</span>
                      {source.accountNumber && (
                        <>
                          <span>•</span>
                          <span className="text-[11px] truncate max-w-[120px]">
                            {source.accountNumber}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Edit / Delete actions */}
                <div
                  className="flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    id={`btn-edit-bank-${source.id}`}
                    onClick={() => onEditBank(source)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="সম্পাদনা করুন"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {!source.isDefault && (
                    <button
                      id={`btn-delete-bank-${source.id}`}
                      onClick={() => {
                        if (
                          window.confirm(
                            `আপনি কি "${source.name}" মুছে ফেলতে চান? এর সাথে সম্পর্কিত খরচগুলো ক্যাশে স্থানান্তরিত হবে।`
                          )
                        ) {
                          onDeleteBank(source.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Total spent summary footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">
                    মোট খরচ হয়েছে
                  </span>
                  <span className="text-base font-extrabold text-slate-800">
                    {formatCurrency(totalSpent)}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block font-medium">
                    লেনদেনের সংখ্যা
                  </span>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full inline-block">
                    {toBengaliNumber(count)} টি
                  </span>
                </div>
              </div>

              {/* Click to filter note */}
              <div className="mt-2 text-[10px] text-indigo-600 font-semibold flex items-center gap-1">
                <span>{isSelected ? 'বিস্তারিত লুকান' : 'বিস্তারিত তালিকা দেখুন'}</span>
                <ArrowRight className={`w-3 h-3 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Bank Details / Transactions List */}
      {selectedSource && (
        <div className="bg-slate-50 rounded-3xl p-4 border border-slate-200 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: selectedSource.color }}
              />
              <h4 className="font-bold text-slate-800 text-sm">
                "{selectedSource.name}" থেকে খরচের তালিকা
              </h4>
            </div>
            <button
              onClick={() => setSelectedSourceId(null)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              বন্ধ করুন
            </button>
          </div>

          {selectedSourceExpenses.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center text-slate-500 text-xs border border-slate-100">
              এই ব্যাংক বা মাধ্যম থেকে এখনো কোনো খরচ লিপিবদ্ধ করা হয়নি।
            </div>
          ) : (
            selectedSourceExpenses.map((expense) => {
              const cat = categories.find((c) => c.id === expense.categoryId);
              return (
                <ExpenseItem
                  key={expense.id}
                  expense={expense}
                  category={cat}
                  categories={categories}
                  paymentSource={selectedSource}
                  onEdit={onEditExpense}
                  onDelete={onDeleteExpense}
                  showDate={true}
                />
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
