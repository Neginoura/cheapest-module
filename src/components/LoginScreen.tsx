import React, { useState } from 'react';
import { Lock, Eye, EyeOff, KeyRound, Cpu, ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react';
import { getStoredPassword, setAuthenticated, DEFAULT_APP_PASSWORD } from '../config/authConfig';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  darkMode?: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, darkMode = false }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);

    const currentValidPassword = getStoredPassword();

    if (password.trim() === currentValidPassword.trim()) {
      setIsSubmitting(true);
      setAuthenticated(rememberMe);
      setTimeout(() => {
        onLoginSuccess();
      }, 150);
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-slate-100 to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors">
      <div className="w-full max-w-md animate-fade-in">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-600 via-sky-600 to-blue-600 text-white shadow-xl shadow-cyan-600/30 mb-4 transform hover:scale-105 transition-transform">
            <Cpu className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            ارزان‌ترین <span className="text-cyan-600 dark:text-cyan-400">ماژول</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
            موتور استعلام زنده و مقایسه قیمت ۱۰ فروشگاه قطعات الکترونیک
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-200/50 dark:shadow-slate-950/80 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-2xl bg-cyan-100 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shadow-xs">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                ورود به پنل اختصاصی
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                جهت دسترسی به سامانه، لطفاً رمز عبور را وارد کنید.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                رمز عبور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoFocus
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(false);
                  }}
                  placeholder="رمز عبور را وارد نمایید..."
                  className={`w-full pr-10 pl-11 py-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 border font-mono transition-all focus:outline-none focus:ring-2 ${
                    error
                      ? 'border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-200 dark:border-slate-700 focus:border-cyan-500 focus:ring-cyan-500/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="btn-tactile absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  title={showPassword ? 'مخفی‌سازی رمز' : 'نمایش رمز'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-1.5 mt-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>رمز عبور وارد شده نادرست است. لطفاً مجدداً امتحان کنید.</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-300 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 cursor-pointer"
                />
                <span>مرا به خاطر بسپار</span>
              </label>

              <span className="text-[11px] text-slate-400">
                رمز پیش‌فرض: <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-cyan-600 dark:text-cyan-400 font-mono font-bold">{DEFAULT_APP_PASSWORD}</code>
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !password.trim()}
              className="btn-tactile w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-extrabold text-white bg-gradient-to-l from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
            >
              <span>ورود به سامانه</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </form>

          {/* Security footnote */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-[11px] font-medium text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>ورود امن و محافظت‌شده جهت استفاده اختصاصی</span>
          </div>
        </div>

      </div>
    </div>
  );
};
