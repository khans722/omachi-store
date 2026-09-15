'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer } from '@/types';

interface CustomerContextType {
  customer: Customer | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  login: (phone: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { fullName: string; phone: string; password?: string; address?: string; city?: string; email?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<Customer> & { saveNewAddress?: any; setDefaultAddressId?: string }) => Promise<{ success: boolean; error?: string }>;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

const STORAGE_KEY = 'omachi_customer_session';

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setCustomer(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading customer session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openAuthModal = (tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (phone: string, password?: string) => {
    try {
      const res = await fetch('/api/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCustomer(data.data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.data));
        closeAuthModal();
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Đăng nhập không thành công' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Lỗi kết nối máy chủ' };
    }
  };

  const register = async (regData: { fullName: string; phone: string; password?: string; address?: string; city?: string; email?: string }) => {
    try {
      const res = await fetch('/api/customer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCustomer(data.data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.data));
        closeAuthModal();
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Đăng ký không thành công' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Lỗi kết nối máy chủ' };
    }
  };

  const logout = () => {
    setCustomer(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const updateProfile = async (updateData: Partial<Customer>) => {
    if (!customer?.id) return { success: false, error: 'Chưa đăng nhập' };
    try {
      const res = await fetch('/api/customer/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: customer.id, ...updateData }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCustomer(data.data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.data));
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Cập nhật thất bại' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Lỗi kết nối máy chủ' };
    }
  };

  return (
    <CustomerContext.Provider
      value={{
        customer,
        isLoading,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
}
