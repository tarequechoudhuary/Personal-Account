import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  PieChart,
  Landmark,
  Layers,
  Plus,
  Wifi,
  BatteryMedium,
  Signal,
  Smartphone,
  Maximize2,
  Minimize2,
  RotateCcw,
  User,
  ArrowLeftRight,
} from 'lucide-react';
import { ActiveTab } from '../types';
import { getCurrentTimeString, toBengaliNumber } from '../utils/formatters';

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
  const [currentTime, setCurrentTime] = useState(getCurrentTimeString());
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTimeString());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-start sm:py-6 sm:px-4 font-sans select-none antialiased">
      {/* Top Desktop Controls Bar */}
      <header className="w-full max-w-md hidden sm:flex items-center justify-between mb-3 px-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-300">অ্যান্ড্রয়েড খরচ ট্র্যাকার অ্যাপ</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenProfile}
            title="ব্যবহারকারীর প্রোফাইল ও ডাটা ব্যাকআপ"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span>{profileName || 'প্রোফাইল ও ব্যাকআপ'}</span>
          </button>

          <button
            onClick={onResetData}
            title="নমুনা ডাটায় রিসেট করুন"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>রিসেট</span>
          </button>

          <button
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            title={isPhoneFrame ? 'ফুলস্ক্রিন মোড' : 'মোবাইল ফ্রেম মোড'}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            {isPhoneFrame ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* Android Device Shell */}
      <div
        className={`w-full transition-all duration-300 flex flex-col ${
          isPhoneFrame
            ? 'sm:max-w-[430px] sm:h-[880px] sm:max-h-[92vh] sm:rounded-[44px] sm:border-[10px] sm:border-slate-800 sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] sm:ring-1 sm:ring-slate-700'
            : 'max-w-3xl min-h-screen sm:rounded-3xl sm:border border-slate-800'
        } bg-slate-100 relative overflow-hidden`}
      >
        {/* Android Punch-hole Camera (Simulated) */}
        {isPhoneFrame && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-black z-40 hidden sm:block pointer-events-none ring-2 ring-slate-800/60" />
        )}

        {/* Android Status Bar */}
        <div className="bg-emerald-700 text-emerald-100 px-5 pt-3 pb-2 flex items-center justify-between text-xs font-semibold z-30 shrink-0">
          <span className="tracking-wide text-white text-xs font-bold">
            {toBengaliNumber(currentTime)}
          </span>

          <div className="flex items-center gap-2 text-white">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px]">৮৫%</span>
              <BatteryMedium className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Android App Top Header */}
        <div className="bg-emerald-600 text-white px-4 py-3 shadow-md flex items-center justify-between z-30 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20">
              <Landmark className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight leading-tight">
                হিসাব খাতা
              </h1>
              <p className="text-[10px] text-emerald-100 leading-none">
                দৈনিক ও মাসিক খরচের হিসাব
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* User Profile Button with Icon & Name */}
            <button
              id="btn-app-bar-profile"
              onClick={onOpenProfile}
              title="ব্যবহারকারীর প্রোফাইল ও ব্যাকআপ"
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 active:scale-95 text-white pl-1.5 pr-2.5 py-1 rounded-full text-xs font-bold border border-white/20 transition-all shadow-xs"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-extrabold shadow-xs">
                {profileName ? profileName[0] : <User className="w-3 h-3" />}
              </div>
              <span className="max-w-[70px] truncate text-[11px] font-semibold">
                {profileName || 'প্রোফাইল'}
              </span>
            </button>

            <button
              id="btn-app-bar-add"
              onClick={onOpenAddExpense}
              className="flex items-center gap-1 bg-white text-emerald-800 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm hover:bg-emerald-50 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="text-[11px]">খরচ যোগ</span>
            </button>
          </div>
        </div>

        {/* Main Content Area (Scrollable Screen) */}
        <main className="flex-1 overflow-y-auto px-4 py-4 relative overscroll-contain">
          {children}
        </main>

        {/* Floating Action Button (FAB) */}
        <div className="absolute right-5 bottom-20 z-40">
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

        {/* Material 3 Bottom Navigation Bar */}
        <nav aria-label="Main Navigation" className="bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-1 py-1.5 flex items-center justify-around z-30 shrink-0 shadow-lg">
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
              <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[10px] sm:text-[11px] mt-0.5 whitespace-nowrap">দৈনিক</span>
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
              <PieChart className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[10px] sm:text-[11px] mt-0.5 whitespace-nowrap">মাসিক</span>
          </button>

          {/* Tab 3: Loans (কাউকে লোন দিলে বা কারো থেকে লোন নিলে) */}
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
              <ArrowLeftRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[10px] sm:text-[11px] mt-0.5 whitespace-nowrap">লোন/ধার</span>
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
              <Landmark className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[10px] sm:text-[11px] mt-0.5 whitespace-nowrap">ব্যাংক</span>
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
              <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[10px] sm:text-[11px] mt-0.5 whitespace-nowrap">খাত/হাত</span>
          </button>
        </nav>

        {/* Android Gesture Bar (Bottom indicator) */}
        {isPhoneFrame && (
          <div className="w-full bg-white pb-1.5 flex justify-center shrink-0">
            <div className="w-32 h-1 bg-slate-300 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
};
