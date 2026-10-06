import { CurrencyMode } from '../types';

export function toPersianDigits(str: string | number): string {
  if (str === null || str === undefined) return '';
  const faDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(str).replace(/[0-9]/g, (w) => faDigits[+w]);
}

export function formatPrice(amountToman: number, mode: CurrencyMode = 'toman'): { amount: string; unit: string } {
  if (mode === 'rial') {
    const rialAmount = amountToman * 10;
    return {
      amount: toPersianDigits(rialAmount.toLocaleString('en-US')),
      unit: 'ریال',
    };
  }
  return {
    amount: toPersianDigits(amountToman.toLocaleString('en-US')),
    unit: 'تومان',
  };
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      textArea.remove();
      return successful;
    }
  } catch {
    return false;
  }
}
