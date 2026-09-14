import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Layers,
  FolderPlus,
  Folder,
  ChevronDown,
  ChevronRight,
  PieChart,
  ArrowRight,
} from 'lucide-react';
import { ExpenseCategory, Expense, PaymentSource } from '../types';
import { formatCurrency, toBengaliNumber } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { ExpenseItem } from './ExpenseItem';
import {
  getMainCategories,
  getSubCategories,
  getCategoryExpenses,
  getCategoryTotal,
} from '../utils/categoryHelpers';

interface CategoriesViewProps {
  categories: ExpenseCategory[];
  expenses: Expense[];
  paymentSources: PaymentSource[];
  onAddCategory: (defaultParentId?: string | null) => void;
  onEditCategory: (category: ExpenseCategory) => void;
  onDeleteCategory: (id: string) => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  expenses,
  paymentSources,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onEditExpense,
  onDeleteExpense,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [collapsedParents, setCollapsedParents] = useState<Record<string, boolean>>({});

  const mainCategories = getMainCategories(categories);
  // Standalone categories that are neither main nor have a valid parent
  const orphanCategories = categories.filter(
    (c) => c.parentId && !categories.some((p) => p.id === c.parentId)
  );

  const toggleCollapse = (parentId: string) => {
    setCollapsedParents((prev) => ({
      ...prev,
      [parentId]: !prev[parentId],
    }));
  };

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const selectedCategoryExpenses = selectedCategoryId
    ? getCategoryExpenses(selectedCategoryId, expenses, categories)
    : [];

  return (
    <div className="space-y-4 pb-24">
      {/* Top Banner & Actions */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <Layers className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-800">
                খরচের খাত ও উপ-খাত ব্যবস্থাপনা
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              ব্যক্তিগত খরচ, ফ্যামিলির খরচ ইত্যাদির অধীনে ছোট ছোট উপ-খাত তৈরি ও নিয়ন্ত্রণ করুন
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Add Sub-Category */}
            <button
              id="btn-add-subcategory"
              onClick={() => onAddCategory(mainCategories[0]?.id || null)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200/60 transition-all active:scale-95"
            >
              <FolderPlus className="w-4 h-4" />
              <span>+ নতুন উপ-খাত</span>
            </button>

            {/* Add Main Category */}
            <button
              id="btn-add-main-category"
              onClick={() => onAddCategory(null)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95"
            >
              <Folder className="w-4 h-4" />
              <span>+ প্রধান খাত</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-4 pt-3.5 border-t border-slate-100">
          <div className="bg-slate-50/80 p-2.5 rounded-xl">
            <span className="text-[11px] text-slate-400 font-medium block">প্রধান খাত সংখ্যা</span>
            <span className="text-base font-bold text-slate-800">
              {toBengaliNumber(mainCategories.length)} টি
            </span>
          </div>
          <div className="bg-slate-50/80 p-2.5 rounded-xl">
            <span className="text-[11px] text-slate-400 font-medium block">মোট উপ-খাত (ছোট খাত)</span>
            <span className="text-base font-bold text-emerald-600">
              {toBengaliNumber(categories.filter((c) => Boolean(c.parentId)).length)} টি
            </span>
          </div>
          <div className="col-span-2 sm:col-span-1 bg-slate-50/80 p-2.5 rounded-xl">
            <span className="text-[11px] text-slate-400 font-medium block">সর্বমোট ব্যয়</span>
            <span className="text-base font-bold text-slate-900">
              {formatCurrency(expenses.reduce((s, e) => s + e.amount, 0))}
            </span>
          </div>
        </div>
      </div>

      {/* Main Categories and their Sub-categories list */}
      <div className="space-y-3.5">
        {mainCategories.map((main) => {
          const subCats = getSubCategories(main.id, categories);
          const totalSpent = getCategoryTotal(main.id, expenses, categories);
          const mainExpenses = getCategoryExpenses(main.id, expenses, categories);
          const isCollapsed = collapsedParents[main.id] || false;
          const isMainSelected = selectedCategoryId === main.id;

          return (
            <div
              key={main.id}
              id={`main-category-group-${main.id}`}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all"
            >
              {/* Main Category Header Bar */}
              <div
                className={`p-4 flex items-center justify-between gap-3 border-b transition-colors cursor-pointer ${
                  isMainSelected
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-slate-50/60 hover:bg-slate-50 border-slate-100'
                }`}
                onClick={() => toggleCollapse(main.id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-11 h-11 rounded-2xl text-white flex items-center justify-center shrink-0 shadow-xs"
                    style={{ backgroundColor: main.color }}
                  >
                    <CategoryIcon name={main.icon} className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                        {main.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        প্রধান খাত
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                      <span>{toBengaliNumber(subCats.length)} টি উপ-খাত</span>
                      <span>•</span>
                      <span>{toBengaliNumber(mainExpenses.length)} টি খরচ</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <div className="text-right mr-1">
                    <span className="text-xs text-slate-400 block">মোট খরচ</span>
                    <span className="text-sm sm:text-base font-bold text-slate-900">
                      {formatCurrency(totalSpent)}
                    </span>
                  </div>

                  {/* Add Sub-category inside this Main Category */}
                  <button
                    id={`btn-add-sub-for-${main.id}`}
                    onClick={() => onAddCategory(main.id)}
                    className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-xs font-semibold flex items-center gap-1 border border-emerald-200"
                    title="এই খাতের আন্ডারে নতুন উপ-খাত যোগ করুন"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">উপ-খাত</span>
                  </button>

                  {/* Edit Main Category */}
                  <button
                    id={`btn-edit-main-${main.id}`}
                    onClick={() => onEditCategory(main)}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-white rounded-lg transition-colors"
                    title="প্রধান খাত পরিবর্তন"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* Delete Main Category */}
                  <button
                    id={`btn-delete-main-${main.id}`}
                    onClick={() => {
                      if (
                        confirm(
                          `"${main.name}" প্রধান খাতটি মুছে ফেলতে চান? এর অধীনে থাকা উপ-খাতগুলোও মুছে যাবে।`
                        )
                      ) {
                        onDeleteCategory(main.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Toggle Arrow */}
                  <button
                    type="button"
                    onClick={() => toggleCollapse(main.id)}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Sub-categories List */}
              {!isCollapsed && (
                <div className="p-3 sm:p-4 bg-white">
                  {subCats.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {subCats.map((sub) => {
                        const subTotal = getCategoryTotal(sub.id, expenses, categories);
                        const subCount = expenses.filter((e) => e.categoryId === sub.id).length;
                        const isSubSelected = selectedCategoryId === sub.id;

                        return (
                          <div
                            key={sub.id}
                            id={`subcategory-card-${sub.id}`}
                            onClick={() =>
                              setSelectedCategoryId(isSubSelected ? null : sub.id)
                            }
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                              isSubSelected
                                ? 'border-emerald-600 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-500/30'
                                : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className="w-8 h-8 rounded-xl text-white flex items-center justify-center shrink-0 shadow-xs"
                                style={{ backgroundColor: sub.color || main.color }}
                              >
                                <CategoryIcon name={sub.icon} className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <h5 className="font-semibold text-slate-800 text-xs sm:text-sm truncate">
                                  {sub.name}
                                </h5>
                                <span className="text-[11px] text-slate-400">
                                  {toBengaliNumber(subCount)} টি খরচ
                                </span>
                              </div>
                            </div>

                            <div
                              className="flex items-center gap-2 shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="text-xs font-bold text-slate-800">
                                {formatCurrency(subTotal)}
                              </span>
                              <button
                                id={`btn-edit-sub-${sub.id}`}
                                onClick={() => onEditCategory(sub)}
                                className="p-1 text-slate-400 hover:text-emerald-600 rounded-md transition-colors"
                                title="সম্পাদনা"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                id={`btn-delete-sub-${sub.id}`}
                                onClick={() => {
                                  if (
                                    confirm(`"${sub.name}" উপ-খাতটি মুছে ফেলতে চান?`)
                                  ) {
                                    onDeleteCategory(sub.id);
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                                title="মুছে ফেলুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-5 px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                      <p className="text-xs text-slate-500">
                        "{main.name}" এর আন্ডারে এখনও কোনো উপ-খাত নেই
                      </p>
                      <button
                        onClick={() => onAddCategory(main.id)}
                        className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>প্রথম উপ-খাত যোগ করুন</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Orphan categories if any */}
        {orphanCategories.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <h4 className="text-xs font-bold text-slate-600 mb-2">অন্যান্য অসংযুক্ত খাত</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {orphanCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg text-white flex items-center justify-center shrink-0"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-800">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditCategory(cat)}
                      className="p-1 text-slate-400 hover:text-emerald-600"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteCategory(cat.id)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected Category Expenses List */}
      {selectedCategoryId && selectedCategory && (
        <div className="bg-white rounded-3xl p-5 border border-emerald-200 shadow-sm mt-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl text-white flex items-center justify-center shrink-0"
                style={{ backgroundColor: selectedCategory.color }}
              >
                <CategoryIcon name={selectedCategory.icon} className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">
                  {selectedCategory.name} - এর খরচের তালিকা
                </h4>
                <span className="text-xs text-slate-500">
                  {toBengaliNumber(selectedCategoryExpenses.length)} টি খরচ • মোট{' '}
                  <strong className="text-slate-800">
                    {formatCurrency(getCategoryTotal(selectedCategoryId, expenses, categories))}
                  </strong>
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedCategoryId(null)}
              className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded-md hover:bg-slate-100"
            >
              বন্ধ করুন
            </button>
          </div>

          {selectedCategoryExpenses.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {selectedCategoryExpenses.map((expense) => {
                const expCategory = categories.find((c) => c.id === expense.categoryId);
                const paymentSource = paymentSources.find(
                  (s) => s.id === expense.paymentSourceId
                );
                return (
                  <ExpenseItem
                    key={expense.id}
                    expense={expense}
                    category={expCategory}
                    categories={categories}
                    paymentSource={paymentSource}
                    onEdit={onEditExpense}
                    onDelete={onDeleteExpense}
                    showDate={true}
                  />
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-center text-slate-400 py-6">
              এই খাতে এখনও কোনো খরচ এন্ট্রি করা হয়নি
            </p>
          )}
        </div>
      )}
    </div>
  );
};
