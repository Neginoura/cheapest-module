import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Share, PlusSquare, X, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // Check if already in standalone / installed mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Capture Chrome/Edge/Android beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosGuide(true);
    }
  };

  // If already installed or neither prompt nor iOS is available, hide button
  if (isInstalled || (!deferredPrompt && !isIos)) {
    return null;
  }

  return (
    <>
      {/* Install Button in Header */}
      <button
        onClick={handleInstallClick}
        className="btn-tactile flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/25 transition-all cursor-pointer"
        title="نصب اپلیکیشن روی دستگاه شما"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">نصب برنامه</span>
        <span className="sm:hidden">نصب</span>
      </button>

      {/* iOS Safari Guide Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-right animate-fade-in">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  نصب روی آیفون / آیپد (iOS)
                </h3>
              </div>
              <button
                onClick={() => setShowIosGuide(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  ۱
                </span>
                <p>
                  در نوار پایین مرورگر Safari، دکمه اشتراک‌گذاری (<Share className="w-3.5 h-3.5 inline mx-1 text-cyan-600" /> Share) را لمس کنید.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  ۲
                </span>
                <p>
                  منو را کمی پایین بکشید و گزینه (<PlusSquare className="w-3.5 h-3.5 inline mx-1 text-cyan-600" /> <b>Add to Home Screen</b>) را انتخاب کنید.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  ۳
                </span>
                <p>
                  در گوشه بالا سمت راست، دکمه <b>Add</b> را لمس کنید تا آیکون برنامه در صفحه اصلی گوشی شما ذخیره شود.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowIosGuide(false)}
                className="btn-tactile w-full py-2.5 rounded-xl bg-cyan-600 text-white font-bold text-xs shadow-md shadow-cyan-600/20"
              >
                متوجه شدم
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
