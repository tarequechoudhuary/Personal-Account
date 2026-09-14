import React, { useState } from 'react';
import {
  CalendarDays,
  PieChart,
  Landmark,
  Layers,
  Plus,
  RotateCcw,
  User,
  ArrowLeftRight,
  TrendingUp,
  ArrowDownLeft,
} from 'lucide-react';
import { ActiveTab } from '../types';

interface AndroidFrameProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenAddExpense: () => void;
  onOpenAddIncome?: () => void;
  onOpenProfile: () => void;
  profileName?: string;
  onResetData: () => void;
  children: React.ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  activeTab,
  onTabChange,
  onOpenAddExpense,
  onOpenAddIncome,
  onOpenProfile,
  profileName,
  onResetData,
  children,
}) => {
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  return (
    <div className="h-full h-[100dvh] w-full bg-slate-100 flex justify-center font-sans antialiased overflow-hidden">
      {/* App Main Container (Edge-to-edge on mobile, sleek centered container on large screens) */}
      <div className="w-full max-w-lg h-full h-[100dvh] flex flex-col bg-slate-50 shadow-xl relative overflow-hidden">
        {/* Real App Header - Starts immediately at the top without any fake status bar or camera notch */}
        <header className="bg-emerald-600 text-white px-4 py-3 shadow-md flex items-center justify-between z-30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20 shadow-xs">
              <Landmark className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight leading-tight">
                হিসাব খাতা
              </h1>
              <p className="text-[11px] text-emerald-100 leading-none mt-0.5">
                দৈনিক ও মাসিক খরচের হিসাব
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Add Income Button */}
            {onOpenAddIncome && (
              <button
                id="btn-app-bar-add-income"
                onClick={onOpenAddIncome}
                title="বেতন বা অন্য মাধ্যম থেকে টাকা জমা করুন"
                className="flex items-center gap-1 bg-emerald-700/80 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-full text-xs font-bold shadow-xs active:scale-95 transition-all border border-emerald-400/30"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold">+ আয়</span>
              </button>
            )}

            {/* Quick Add Expense Button */}
            <button
              id="btn-app-bar-add"
              onClick={onOpenAddExpense}
              className="flex items-center gap-1 bg-white text-emerald-800 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold shadow-sm hover:bg-emerald-50 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="text-[11px]">+ খরচ</span>
            </button>

            {/* User Profile Button */}
            <button
              id="btn-app-bar-profile"
              onClick={onOpenProfile}
              title="ব্যবহারকারীর প্রোফাইল ও ব্যাকআপ"
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 active:scale-95 text-white pl-1.5 pr-2 py-1 rounded-full text-xs font-bold border border-white/20 transition-all shadow-xs"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-extrabold shadow-xs">
                {profileName ? profileName[0] : <User className="w-3 h-3" />}
              </div>
            </button>
          </div>
        </header>

        {/* Main Content Area (Scrollable Screen with smooth inertia scrolling and generous padding) */}
        <main className="flex-1 overflow-y-auto px-4 pt-3 pb-24 relative overscroll-y-contain -webkit-overflow-scrolling-touch">
          {children}
        </main>

        {/* Floating Action Button (FAB) with Speed Dial for Income & Expense */}
        <div className="absolute right-5 bottom-20 z-40 flex flex-col items-end gap-2">
          {isFabMenuOpen && (
            <>
              {/* Overlay to close menu on tap outside */}
              <div
                className="fixed inset-0 z-30 bg-slate-950/20 backdrop-blur-2xs"
                onClick={() => setIsFabMenuOpen(false)}
              />

              {/* Add Income Option */}
              <div className="relative z-40 flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-150">
                <span className="bg-slate-900 text-white text-xs font-bold px-2.5 py-1 rounded-xl shadow-md">
                  টাকা জমা / আয়
                </span>
                <button
                  id="fab-action-income"
                  onClick={() => {
                    setIsFabMenuOpen(false);
                    onOpenAddIncome?.();
                  }}
                  className="w-12 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
                  title="বেতন বা টাকা জমা করুন"
                >
                  <TrendingUp className="w-6 h-6 stroke-[2.5]" />
                </button>
              </div>

              {/* Add Expense Option */}
              <div className="relative z-40 flex items-center gap-2 animate-in slide-in-from-bottom-1 duration-150">
                <span className="bg-slate-900 text-white text-xs font-bold px-2.5 py-1 rounded-xl shadow-md">
                  খরচ যোগ করুন
                </span>
                <button
                  id="fab-action-expense"
                  onClick={() => {
                    setIsFabMenuOpen(false);
                    onOpenAddExpense();
                  }}
                  className="w-12 h-12 rounded-xl bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
                  title="খরচ যোগ করুন"
                >
                  <Plus className="w-6 h-6 stroke-[2.5]" />
                </button>
              </div>
            </>
          )}

          <button
            id="fab-add-expense"
            onClick={() => setIsFabMenuOpen((prev) => !prev)}
            className={`w-14 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-xl shadow-emerald-700/40 hover:scale-105 active:scale-95 transition-all relative z-40 ${
              isFabMenuOpen ? 'rotate-45 bg-slate-800 hover:bg-slate-900' : ''
            }`}
            title="নতুন হিসাব যোগ করুন"
            aria-label="Add New Entry"
          >
            <Plus className="w-7 h-7 stroke-[2.5] transition-transform duration-200" />
          </button>
        </div>

        {/* Bottom Navigation Bar */}
        <nav aria-label="Main Navigation" className="shrink-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-1 py-1.5 flex items-center justify-around z-30 shadow-lg pb-[max(0.375rem,env(safe-area-inset-bottom))]">
          {/* Tab 1: Daily */}
          <button
            id="nav-tab-daily"
            onClick={() => onTabChange('daily')}
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
              activeTab === 'daily'
                ? 'text-emerald-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition-all ${
                activeTab === 'daily' ? 'bg-emerald-100 text-emerald-700' : ''
              }`}
            >
              <CalendarDays className="w-5 h-5" />
            </div>
            <span className="text-[11px] mt-0.5 whitespace-nowrap">দৈনিক</span>
          </button>

          {/* Tab 2: Monthly */}
          <button
            id="nav-tab-monthly"
            onClick={() => onTabChange('monthly')}
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
              activeTab === 'monthly'
                ? 'text-emerald-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition-all ${
                activeTab === 'monthly' ? 'bg-emerald-100 text-emerald-700' : ''
              }`}
            >
              <PieChart className="w-5 h-5" />
            </div>
            <span className="text-[11px] mt-0.5 whitespace-nowrap">মাসিক</span>
          </button>

          {/* Tab 3: Loans */}
          <button
            id="nav-tab-loans"
            onClick={() => onTabChange('loans')}
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
              activeTab === 'loans'
                ? 'text-emerald-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition-all ${
                activeTab === 'loans' ? 'bg-emerald-100 text-emerald-700' : ''
              }`}
            >
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <span className="text-[11px] mt-0.5 whitespace-nowrap">লোন/ধার</span>
          </button>

          {/* Tab 4: Banks & Cash */}
          <button
            id="nav-tab-banks"
            onClick={() => onTabChange('banks')}
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
              activeTab === 'banks'
                ? 'text-emerald-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition-all ${
                activeTab === 'banks' ? 'bg-emerald-100 text-emerald-700' : ''
              }`}
            >
              <Landmark className="w-5 h-5" />
            </div>
            <span className="text-[11px] mt-0.5 whitespace-nowrap">ব্যাংক</span>
          </button>

          {/* Tab 5: Categories */}
          <button
            id="nav-tab-categories"
            onClick={() => onTabChange('categories')}
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
              activeTab === 'categories'
                ? 'text-emerald-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition-all ${
                activeTab === 'categories' ? 'bg-emerald-100 text-emerald-700' : ''
              }`}
            >
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[11px] mt-0.5 whitespace-nowrap">খাত/হাত</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
