import { Expense, ExpenseCategory } from '../types';

export const isMainCategory = (category: ExpenseCategory): boolean => {
  return !category.parentId;
};

export const getMainCategories = (categories: ExpenseCategory[]): ExpenseCategory[] => {
  return categories.filter((c) => !c.parentId);
};

export const getSubCategories = (
  parentId: string,
  categories: ExpenseCategory[]
): ExpenseCategory[] => {
  return categories.filter((c) => c.parentId === parentId);
};

export const getAllSubCategories = (categories: ExpenseCategory[]): ExpenseCategory[] => {
  return categories.filter((c) => Boolean(c.parentId));
};

export const getParentCategory = (
  categoryOrId: ExpenseCategory | string | undefined,
  categories: ExpenseCategory[]
): ExpenseCategory | undefined => {
  if (!categoryOrId) return undefined;
  const cat = typeof categoryOrId === 'string' 
    ? categories.find((c) => c.id === categoryOrId)
    : categoryOrId;
  
  if (!cat || !cat.parentId) return undefined;
  return categories.find((c) => c.id === cat.parentId);
};

export interface CategoryHierarchyInfo {
  category?: ExpenseCategory;
  parent?: ExpenseCategory;
  isSubCategory: boolean;
  displayName: string;
  fullName: string; // e.g. "ব্যক্তিগত খরচ › খাওয়া-দাওয়া"
}

export const getCategoryHierarchy = (
  categoryId: string,
  categories: ExpenseCategory[]
): CategoryHierarchyInfo => {
  const cat = categories.find((c) => c.id === categoryId);
  if (!cat) {
    return {
      isSubCategory: false,
      displayName: 'অনির্দিষ্ট খাত',
      fullName: 'অনির্দিষ্ট খাত',
    };
  }

  if (cat.parentId) {
    const parent = categories.find((c) => c.id === cat.parentId);
    if (parent) {
      return {
        category: cat,
        parent,
        isSubCategory: true,
        displayName: cat.name,
        fullName: `${parent.name} › ${cat.name}`,
      };
    }
  }

  return {
    category: cat,
    isSubCategory: false,
    displayName: cat.name,
    fullName: cat.name,
  };
};

/**
 * Returns all expenses that belong to a category.
 * If categoryId is a main category, it includes all expenses belonging to any of its sub-categories as well.
 */
export const getCategoryExpenses = (
  categoryId: string,
  expenses: Expense[],
  categories: ExpenseCategory[]
): Expense[] => {
  const cat = categories.find((c) => c.id === categoryId);
  if (!cat) {
    return expenses.filter((e) => e.categoryId === categoryId);
  }

  if (!cat.parentId) {
    // It's a main category (প্রধান খাত)
    const childIds = new Set(
      categories.filter((c) => c.parentId === cat.id).map((c) => c.id)
    );
    childIds.add(cat.id);
    return expenses.filter((e) => childIds.has(e.categoryId));
  }

  // It's a sub-category
  return expenses.filter((e) => e.categoryId === categoryId);
};

export const getCategoryTotal = (
  categoryId: string,
  expenses: Expense[],
  categories: ExpenseCategory[]
): number => {
  const matched = getCategoryExpenses(categoryId, expenses, categories);
  return matched.reduce((sum, e) => sum + e.amount, 0);
};
