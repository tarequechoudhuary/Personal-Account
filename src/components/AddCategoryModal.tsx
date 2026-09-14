import React, { useState, useEffect } from 'react';
import { X, Check, Layers, FolderPlus, Folder } from 'lucide-react';
import { ExpenseCategory } from '../types';
import { AVAILABLE_ICONS, CategoryIcon } from './CategoryIcon';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Omit<ExpenseCategory, 'id'>, id?: string) => void;
  editingCategory?: ExpenseCategory | null;
  categories: ExpenseCategory[];
  defaultParentId?: string | null;
}

const CATEGORY_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f97316', // Orange
  '#8b5cf6', // Purple
  '#ef4444', // Red
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#eab308', // Amber
  '#6366f1', // Indigo
  '#14b8a6', // Teal
  '#64748b', // Slate
  '#84cc16', // Lime
];

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingCategory,
  categories,
  defaultParentId = null,
}) => {
  // Main categories (where parentId is null or undefined)
  const mainCategories = categories.filter((c) => !c.parentId);

  const [categoryType, setCategoryType] = useState<'sub' | 'main'>('sub');
  const [parentId, setParentId] = useState<string>('');
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Wallet');
  const [color, setColor] = useState(CATEGORY_COLORS[0]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setIcon(editingCategory.icon);
      setColor(editingCategory.color);
      if (editingCategory.parentId) {
        setCategoryType('sub');
        setParentId(editingCategory.parentId);
      } else {
        setCategoryType('main');
        setParentId('');
      }
    } else {
      setName('');
      setIcon(defaultParentId ? 'Smartphone' : 'Wallet');
      
      // If defaultParentId provided or if main categories exist, default to 'sub'
      if (defaultParentId) {
        setCategoryType('sub');
        setParentId(defaultParentId);
        const parent = mainCategories.find((m) => m.id === defaultParentId);
        if (parent) {
          setColor(parent.color);
        } else {
          setColor(CATEGORY_COLORS[0]);
        }
      } else if (mainCategories.length > 0) {
        setCategoryType('sub');
        setParentId(mainCategories[0].id);
        setColor(mainCategories[0].color || CATEGORY_COLORS[0]);
      } else {
        setCategoryType('main');
        setParentId('');
        setColor(CATEGORY_COLORS[0]);
      }
    }
    setError('');
  }, [editingCategory, isOpen, defaultParentId, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('অনুগ্রহ করে খাতের নাম লিখুন');
      return;
    }

    if (categoryType === 'sub' && !parentId) {
      setError('অনুগ্রহ করে একটি প্রধান খাত নির্বাচন করুন');
      return;
    }

    onSave(
      {
        name: name.trim(),
        icon,
        color,
        parentId: categoryType === 'sub' ? parentId : null,
      },
      editingCategory?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="modal-add-category"
        className="w-full max-w-md bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-2xl text-white flex items-center justify-center shadow-xs"
              style={{ backgroundColor: color }}
            >
              <CategoryIcon name={icon} className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                {editingCategory
                  ? 'খাত পরিবর্তন করুন'
                  : categoryType === 'main'
                  ? 'নতুন প্রধান খাত যোগ'
                  : 'নতুন উপ-খাত (ছোট খাত) যোগ'}
              </h3>
              <p className="text-xs text-slate-500">
                {categoryType === 'main'
                  ? 'যেমন: ব্যক্তিগত খরচ, ফ্যামিলির খরচ ইত্যাদি'
                  : 'যেমন: মোবাইল খরচ, খাওয়া-দাওয়া, বাজার ইত্যাদি'}
              </p>
            </div>
          </div>
          <button
            id="btn-close-category-modal"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3.5 overflow-y-auto flex-1 pr-1">
          {/* Category Type Toggle (প্রধান খাত নাকি উপ-খাত) */}
          {!editingCategory && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                খাতের ধরন নির্বাচন করুন
              </label>
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl gap-1">
                <button
                  type="button"
                  id="btn-type-sub-category"
                  onClick={() => {
                    setCategoryType('sub');
                    if (mainCategories.length > 0 && !parentId) {
                      setParentId(mainCategories[0].id);
                    }
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    categoryType === 'sub'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>উপ-খাত (ছোট খাত)</span>
                </button>
                <button
                  type="button"
                  id="btn-type-main-category"
                  onClick={() => {
                    setCategoryType('main');
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    categoryType === 'main'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <Folder className="w-4 h-4" />
                  <span>প্রধান খাত (মূল খাত)</span>
                </button>
              </div>
            </div>
          )}

          {/* If Sub-category: Select Parent Main Category */}
          {categoryType === 'sub' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                কোন প্রধান খাতের আন্ডারে? <span className="text-rose-500">*</span>
              </label>
              {mainCategories.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {mainCategories.map((main) => {
                    const isSelected = parentId === main.id;
                    return (
                      <button
                        key={main.id}
                        type="button"
                        onClick={() => {
                          setParentId(main.id);
                          setColor(main.color);
                          setError('');
                        }}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs transition-all ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/60 font-bold text-slate-900 ring-1 ring-emerald-500/30'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                          style={{ backgroundColor: main.color }}
                        >
                          <CategoryIcon name={main.icon} className="w-4 h-4" />
                        </div>
                        <span className="truncate">{main.name}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                  কোনো প্রধান খাত পাওয়া যায়নি। প্রথমে একটি প্রধান খাত তৈরি করুন (যেমন: ব্যক্তিগত খরচ)।
                </div>
              )}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {categoryType === 'main' ? 'প্রধান খাতের নাম' : 'উপ-খাত / ছোট খাতের নাম'}{' '}
              <span className="text-rose-500">*</span>
            </label>
            <input
              id="input-category-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder={
                categoryType === 'main'
                  ? 'যেমন: ব্যক্তিগত খরচ, ফ্যামিলির খরচ, ব্যবসায়িক খরচ'
                  : 'যেমন: মোবাইল খরচ, খাওয়া-দাওয়া, রিকশা ভাড়া, নাস্তা'
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium text-slate-800 placeholder:text-slate-400"
            />
            {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              আইকন নির্বাচন করুন
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-32 overflow-y-auto p-1.5 bg-slate-50 rounded-xl border border-slate-100">
              {AVAILABLE_ICONS.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setIcon(item.name)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs transition-all ${
                    icon === item.name
                      ? 'bg-emerald-600 text-white shadow-xs font-semibold scale-95'
                      : 'text-slate-600 hover:bg-white hover:text-slate-900'
                  }`}
                >
                  <CategoryIcon name={item.name} className="w-5 h-5 mb-1" />
                  <span className="text-[10px] truncate max-w-full">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              কালার নির্বাচন করুন
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORY_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-xs"
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              বাতিল
            </button>
            <button
              id="btn-save-category"
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all active:scale-[0.98]"
            >
              {editingCategory ? 'সংরক্ষণ করুন' : 'যোগ করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
