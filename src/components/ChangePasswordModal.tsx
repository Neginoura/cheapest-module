import React, { useState } from 'react';
import { X, KeyRound, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { getStoredPassword, setStoredPassword } from '../config/authConfig';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const actualCurrentPass = getStoredPassword();

    if (currentPasswordInput.trim() !== actualCurrentPass.trim()) {
      setErrorMsg('رمز عبور فعلی اشتباه است.');
      return;
    }

    if (!newPassword.trim()) {
      setErrorMsg('رمز عبور جدید نمی‌تواند خالی باشد.');
      return;
    }

    if (newPassword.trim().length < 4) {
      setErrorMsg('رمز عبور جدید باید حداقل ۴ کاراکتر باشد.');
      return;
    }

    if (newPassword.trim() !== confirmPassword.trim()) {
      setErrorMsg('تکرار رمز عبور جدید با رمز وارد شده همخوانی ندارد.');
      return;
    }

    const success = setStoredPassword(newPassword.trim());
    if (success) {
      onSuccess('رمز عبور با موفقیت تغییر یافت.');
      onClose();
    } else {
      setErrorMsg('خطا در ذخیره رمز عبور جدید.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                تغییر رمز عبور ورود
              </h3>
              <p className="text-[11px] text-slate-500">
                تنظیم رمز عبور دلخواه برای دسترسی به سامانه
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              رمز عبور فعلی
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              required
              value={currentPasswordInput}
              onChange={(e) => setCurrentPasswordInput(e.target.value)}
              placeholder="رمز عبور فعلی را وارد کنید..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              رمز عبور جدید
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="رمز عبور جدید..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              تکرار رمز عبور جدید
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="تکرار رمز عبور جدید..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
            >
              {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPass ? 'مخفی‌سازی رمزها' : 'نمایش متنی رمزها'}</span>
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 font-semibold"
            >
              انصراف
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-md shadow-cyan-600/20 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>ذخیره رمز جدید</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
