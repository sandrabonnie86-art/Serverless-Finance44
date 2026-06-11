import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface Window {
    __pwaPrompt?: BeforeInstallPromptEvent;
  }
}

const DISMISSED_KEY = 'alphavest_pwa_dismissed';

interface PWAInstallPromptProps {
  variant?: 'banner' | 'modal';
  onDismiss?: () => void;
}

export default function PWAInstallPrompt({ variant = 'banner', onDismiss }: PWAInstallPromptProps) {
  const [show, setShow] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed or installed
    try {
      if (localStorage.getItem(DISMISSED_KEY)) { return; }
    } catch { /* */ }

    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) { return; }
    if ((navigator as { standalone?: boolean }).standalone) { return; }

    // Show if prompt is already captured, otherwise wait for the event
    if (window.__pwaPrompt) {
      setShow(true);
      return undefined;
    }
    const handler = () => setShow(true);
    window.addEventListener('__pwaPromptReady', handler);
    return () => window.removeEventListener('__pwaPromptReady', handler);
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(DISMISSED_KEY, '1'); } catch { /* */ }
    setShow(false);
    onDismiss?.();
  };

  const install = async () => {
    if (!window.__pwaPrompt) return;
    setInstalling(true);
    try {
      await window.__pwaPrompt.prompt();
      const choice = await window.__pwaPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstalled(true);
        setTimeout(() => { setShow(false); onDismiss?.(); }, 1500);
      } else {
        dismiss();
      }
    } finally {
      setInstalling(false);
      window.__pwaPrompt = undefined;
    }
  };

  if (!show) return null;

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
        <div className="bg-brand-surface border border-brand-gold/30 rounded-2xl max-w-sm w-full shadow-2xl p-7 text-center slide-up">
          <div className="w-16 h-16 rounded-2xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center mx-auto mb-5">
            <Smartphone className="w-8 h-8 text-brand-gold" />
          </div>
          <h3 className="text-brand-text font-serif font-bold text-xl mb-2">Install the App</h3>
          <p className="text-brand-muted font-sans text-sm leading-relaxed mb-6">
            Get faster access to your investments with the full app experience — works offline too.
          </p>
          {installed ? (
            <div className="text-green-400 font-sans text-sm font-semibold">✓ App installed successfully!</div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={install}
                disabled={installing}
                className="w-full bg-brand-gold text-brand-bg font-sans font-bold text-sm py-3 rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                {installing ? 'Installing…' : 'Install App'}
              </button>
              <button onClick={dismiss} className="w-full text-brand-muted font-sans text-sm py-2 hover:text-brand-text transition-colors">
                Maybe later
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[9997] flex justify-center pointer-events-none">
      <div className="bg-brand-surface border border-brand-gold/30 rounded-xl shadow-2xl p-4 max-w-lg w-full pointer-events-auto slide-up flex items-center gap-3">
        <div className="shrink-0 w-9 h-9 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center">
          <Smartphone className="w-4 h-4 text-brand-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-brand-text font-sans text-xs font-semibold">Install for faster access</p>
          <p className="text-brand-muted font-sans text-[11px]">Add to your home screen — works offline</p>
        </div>
        <button
          onClick={install}
          disabled={installing}
          className="shrink-0 bg-brand-gold text-brand-bg font-sans font-bold text-[11px] px-3 py-1.5 rounded-lg hover:brightness-110 transition-all"
        >
          {installed ? '✓' : installing ? '…' : 'Install'}
        </button>
        <button onClick={dismiss} className="shrink-0 text-brand-muted hover:text-brand-text transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
