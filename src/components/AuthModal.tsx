'use client';

import React, { useState } from 'react';
import { useCustomer } from '@/context/CustomerContext';
import { X, Sparkles, Phone, Lock, User, MapPin, CheckCircle2 } from 'lucide-react';

export default function AuthModal() {
  const { isAuthModalOpen, authModalTab, closeAuthModal, openAuthModal, login, register } = useCustomer();

  // Login form state
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    const res = await login(loginPhone, loginPassword);
    setIsLoggingIn(false);
    if (!res.success) {
      setLoginError(res.error || 'Đăng nhập không thành công');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setIsRegistering(true);
    const res = await register({
      fullName: regFullName,
      phone: regPhone,
      password: regPassword,
      address: '',
    });
    setIsRegistering(false);
    if (!res.success) {
      setRegError(res.error || 'Đăng ký không thành công');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-pink-100 space-y-5 relative">
        
        {/* Close button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-400 to-rose-400 text-white flex items-center justify-center mx-auto text-xl shadow-md shadow-pink-200">
            🌸
          </div>
          <h3 className="text-lg font-black text-gray-800">
            Tài Khoản Thành Viên Omachi
          </h3>
          <p className="text-xs text-gray-500">
            Lưu lịch sử đơn hàng &amp; tự động lưu địa chỉ khi đặt đơn ✨
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-2xl bg-pink-50/70 p-1 border border-pink-100">
          <button
            type="button"
            onClick={() => openAuthModal('login')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
              authModalTab === 'login'
                ? 'bg-white text-rose-600 shadow-xs'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => openAuthModal('register')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
              authModalTab === 'register'
                ? 'bg-white text-rose-600 shadow-xs'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Đăng Ký Mới
          </button>
        </div>

        {/* TAB 1: LOGIN FORM */}
        {authModalTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            {loginError && (
              <div className="bg-rose-50 text-rose-600 text-xs font-bold p-2.5 rounded-xl border border-rose-200">
                ⚠️ {loginError}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Số Điện Thoại</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  placeholder="Ví dụ: 0988 888 888"
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-pink-200 rounded-xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-rose-400 focus:outline-none"
                />
                <Phone className="w-4 h-4 text-pink-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700">Mật Khẩu</label>
                <span className="text-[10px] text-gray-400">Tối thiểu 4 ký tự</span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-pink-200 rounded-xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-rose-400 focus:outline-none"
                />
                <Lock className="w-4 h-4 text-pink-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isLoggingIn ? 'Đang đăng nhập...' : 'Đăng Nhập Ngay ✨'}</span>
            </button>

            <div className="text-center pt-2">
              <p className="text-[11px] text-gray-500">
                Chưa có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => openAuthModal('register')}
                  className="text-rose-600 font-bold hover:underline"
                >
                  Đăng ký miễn phí
                </button>
              </p>
            </div>
          </form>
        )}

        {/* TAB 2: REGISTER FORM */}
        {authModalTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            {regError && (
              <div className="bg-rose-50 text-rose-600 text-xs font-bold p-2.5 rounded-xl border border-rose-200">
                ⚠️ {regError}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Họ và Tên *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Phương Linh"
                  className="w-full pl-9 pr-4 py-2 bg-white border border-pink-200 rounded-xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-rose-400 focus:outline-none"
                />
                <User className="w-4 h-4 text-pink-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Số Điện Thoại (Dùng để đăng nhập &amp; Zalo) *</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="Ví dụ: 0988 888 888"
                  className="w-full pl-9 pr-4 py-2 bg-white border border-pink-200 rounded-xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-rose-400 focus:outline-none"
                />
                <Phone className="w-4 h-4 text-pink-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Mật Khẩu *</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Tạo mật khẩu dễ nhớ (tối thiểu 4 ký tự)..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-pink-200 rounded-xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-rose-400 focus:outline-none"
                />
                <Lock className="w-4 h-4 text-pink-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isRegistering}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer disabled:opacity-50 mt-2"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isRegistering ? 'Đang tạo tài khoản...' : 'Hoàn Tất Đăng Ký 🌸'}</span>
            </button>

            <div className="text-center pt-1">
              <p className="text-[11px] text-gray-500">
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="text-rose-600 font-bold hover:underline"
                >
                  Đăng nhập ngay
                </button>
              </p>
            </div>
          </form>
        )}

        {/* Guest reminder note */}
        <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
          <p className="font-bold flex items-center gap-1 text-amber-800">
            <span>💡 Mua hàng không cần tài khoản?</span>
          </p>
          <p className="text-gray-600 leading-relaxed">
            Bạn hoàn toàn có thể mua hàng nhanh dạng Khách (Guest) mà không cần tạo tài khoản. Bất kỳ lúc nào bạn cũng có thể dùng Số Điện Thoại để tra cứu đơn hàng!
          </p>
        </div>

      </div>
    </div>
  );
}
