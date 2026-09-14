import React from 'react';
import {
  CalendarDays,
  PieChart,
  Landmark,
  Layers,
  Plus,
  RotateCcw,
  User,
  ArrowLeftRight,
} from 'lucide-react';
import { ActiveTab } from '../types';

interface AndroidFrameProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenAddExpense: () => void;
  onOpenProfile: () => void;
  profileName?: string;
  onResetData: () => void;
  children: React.ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  activeTab,
  onTabChange,
  onOpenAddExpense,
  onOpenProfile,
  profileName,
  onResetData,
  children,
}) => {
  return (
    <div className="min-h-screen bg-slate-100 flex justify-center font-sans antialiased">
      {/* App Main Container (Edge-to-edge on mobile, sleek centered container on large screens) */}
      <div className="w-full max-w-lg min-h-screen flex flex-col bg-slate-50 shadow-xl relative">
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
            {/* Reset Data Button */}
            <button
              id="btn-app-bar-reset"
              onClick={onResetData}
              title="নমুনা ডাটায় রিসেট করুন"
              className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-emerald-100 hover:text-white transition-all border border-white/15"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* User Profile Button */}
            <button
              id="btn-app-bar-profile"
              onClick={onOpenProfile}
              title="ব্যবহারকারীর প্রোফাইল ও ব্যাকআপ"
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 active:scale-95 text-white pl-1.5 pr-2.5 py-1 rounded-full text-xs font-bold border border-white/20 transition-all shadow-xs"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-extrabold shadow-xs">
                {profileName ? profileName[0] : <User className="w-3 h-3" />}
              </div>
              <span className="max-w-[75px] truncate text-[11px] font-semibold">
                {profileName || 'প্রোফাইল'}
              </span>
            </button>

            {/* Quick Add Expense Button */}
            <button
              id="btn-app-bar-add"
              onClick={onOpenAddExpense}
              className="flex items-center gap-1 bg-white text-emerald-800 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm hover:bg-emerald-50 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="text-[11px]">খরচ যোগ</span>
            </button>
          </div>
        </header>

        {/* Main Content Area (Scrollable Screen) */}
        <main className="flex-1 overflow-y-auto px-4 py-4 relative overscroll-contain">
          {children}
        </main>

        {/* Floating Action Button (FAB) */}
        <div className="fixed sm:absolute right-5 bottom-20 z-40">
          <button
            id="fab-add-expense"
            onClick={onOpenAddExpense}
            className="w-14 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-xl shadow-emerald-700/40 hover:scale-105 active:scale-95 transition-all group"
            title="নতুন খরচ যোগ করুন"
            aria-label="Add New Expense"
          >
            <Plus className="w-7 h-7 stroke-[2.5] group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Bottom Navigation Bar */}
        <nav aria-label="Main Navigation" className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-1 py-1.5 flex items-center justify-around z-30 shrink-0 shadow-lg">
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
