import React from 'react';
import {
  Utensils,
  ShoppingCart,
  Bus,
  Home,
  HeartPulse,
  Wallet,
  Smartphone,
  CircleDot,
  Landmark,
  CreditCard,
  Banknote,
  Coffee,
  Car,
  Fuel,
  Book,
  ShoppingBag,
  Laptop,
  Briefcase,
  Gift,
  Zap,
  Tag,
  GraduationCap,
  Shirt,
  ShieldAlert,
  Plane,
  User,
  Users,
  TrendingUp,
  Coins,
  Award,
  Store,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Utensils,
  ShoppingCart,
  Bus,
  Home,
  HeartPulse,
  Wallet,
  Smartphone,
  CircleDot,
  Landmark,
  CreditCard,
  Banknote,
  Coffee,
  Car,
  Fuel,
  Book,
  ShoppingBag,
  Laptop,
  Briefcase,
  Gift,
  Zap,
  Tag,
  GraduationCap,
  Shirt,
  ShieldAlert,
  Plane,
  User,
  Users,
  TrendingUp,
  Coins,
  Award,
  Store,
};

export const AVAILABLE_ICONS = [
  { name: 'User', label: 'ব্যক্তিগত' },
  { name: 'Users', label: 'ফ্যামিলি' },
  { name: 'Utensils', label: 'খাবার' },
  { name: 'ShoppingCart', label: 'বাজার' },
  { name: 'Bus', label: 'যাতায়াত' },
  { name: 'Home', label: 'বাসা/ভাড়া' },
  { name: 'HeartPulse', label: 'চিকিৎসা' },
  { name: 'Wallet', label: 'হাতখরচ' },
  { name: 'Smartphone', label: 'মোবাইল' },
  { name: 'Zap', label: 'বিদ্যুৎ/বিল' },
  { name: 'ShoppingBag', label: 'শপিং' },
  { name: 'Book', label: 'বই/শিক্ষা' },
  { name: 'Coffee', label: 'নাস্তা' },
  { name: 'Briefcase', label: 'অফিস/কাজ' },
  { name: 'Gift', label: 'উপহার' },
  { name: 'Car', label: 'গাড়ি' },
  { name: 'Plane', label: 'ভ্রমণ' },
  { name: 'Tag', label: 'অন্যান্য' },
];

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5', size }) => {
  const IconComponent = ICON_MAP[name] || CircleDot;
  return <IconComponent className={className} size={size} />;
};
