import { useState, useEffect } from 'react';
import { X, Cookie, Settings, ChevronDown, ChevronUp, Shield } from 'lucide-react';

const COOKIE_KEY = 'alphavest_cookie_consent';
const PREFS_KEY = 'alphavest_cookie_prefs';

interface CookieCategory {
  id: string;
  name: string;
  description: string;
  required: boolean;
}

const CATEGORIES: CookieCategory[] = [
  {
    id: 'essential',
    name: 'Essential',
    description: 'Required for login, session security, and core app functionality. These cannot be disabled.',
    required: true,
  },
  {
    id: 'preferences',
    name: 'Preferences',
    description: 'Remember your theme, language, and display settings across sessions.',
    required: false,
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Help us understand how the platform is used to improve your experience. No personal data is sold.',
    required: false,
  },
];

type View = 'banner' | 'manage';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [view, setView] = useState<View>('banner');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    essential: true,
    preferences: true,
    analytics: false,
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COOKIE_KEY);
      if (!stored) { setVisible(true); return; }
      const storedPrefs = localStorage.getItem(PREFS_KEY);
      if (storedPrefs) setPrefs(JSON.parse(storedPrefs));
    } catch {
      setVisible(false);
    }
  }, []);

  if (!visible) return null;

  const save = (accepted: boolean, customPrefs?: Record<string, boolean>) => {
    const finalPrefs = accepted
      ? { essential: true, preferences: true, analytics: true }
      : (customPrefs ?? { essential: true, preferences: false, analytics: false });
    try {
      localStorage.setItem(COOKIE_KEY, accepted ? 'accepted' : 'custom');
      localStorage.setItem(PREFS_KEY, JSON.stringify(finalPrefs));
    } catch { /* */ }
    setPrefs(finalPrefs);
    setVisible(false);
  };

  const reject = () => save(false, { essential: true, preferences: false, analytics: false });
  const accept = () => save(true);
  const saveCustom = () => save(false, prefs);

  if (view === 'manage') {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="bg-brand-surface border border-brand-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl sheet-up">
          <div className="flex items-center justify-between p-5 border-b border-brand-border">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-brand-gold" />
              <h3 className="text-brand-text font-sans font-bold text-sm">Cookie Preferences</h3>
            </div>
            <button onClick={() => setView('banner')} className="text-brand-muted hover:text-brand-text transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
            <p className="text-brand-muted font-sans text-xs leading-relaxed">
              Choose which cookies you allow. Essential cookies are always active as they keep the app running securely.
            </p>
            {CATEGORIES.map(cat => (
              <div key={cat.id} className="border border-brand-border rounded-lg overflow-hidden">
                <div
                  className="flex items-center gap-3 p-3 cursor-pointer"
                  onClick={() => setExpanded(expanded === cat.id ? null : cat.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-brand-text font-sans text-xs font-semibold">{cat.name}</span>
                      {cat.required && (
                        <span className="text-[9px] bg-brand-gold/20 text-brand-gold font-sans px-1.5 py-0.5 rounded uppercase tracking-wider">Required</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        if (!cat.required) setPrefs(p => ({ ...p, [cat.id]: !p[cat.id] }));
                      }}
                      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${
                        (prefs[cat.id] ?? !cat.required)
                          ? 'bg-brand-gold'
                          : 'bg-brand-border'
                      } ${cat.required ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform mt-0.5 ${
                        (prefs[cat.id] ?? !cat.required) ? 'translate-x-4' : 'translate-x-0.5'
                      }`} />
                    </button>
                    {expanded === cat.id
                      ? <ChevronUp className="w-3 h-3 text-brand-muted" />
                      : <ChevronDown className="w-3 h-3 text-brand-muted" />
                    }
                  </div>
                </div>
                {expanded === cat.id && (
                  <div className="px-3 pb-3 text-[11px] font-sans text-brand-muted leading-relaxed border-t border-brand-border/60 pt-2">
                    {cat.description}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-brand-border flex gap-2">
            <button onClick={reject} className="flex-1 border border-brand-border text-brand-muted font-sans font-medium text-xs py-2.5 rounded-lg hover:text-brand-text hover:border-brand-gold/30 transition-all">
              Reject All
            </button>
            <button onClick={saveCustom} className="flex-1 bg-brand-surface border border-brand-gold/40 text-brand-gold font-sans font-bold text-xs py-2.5 rounded-lg hover:bg-brand-gold/10 transition-all">
              Save Choices
            </button>
            <button onClick={accept} className="flex-1 bg-brand-gold text-brand-bg font-sans font-bold text-xs py-2.5 rounded-lg hover:brightness-110 transition-all">
              Accept All
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9998] flex justify-center pointer-events-none">
      <div className="bg-brand-surface border border-brand-border/80 rounded-xl shadow-2xl p-4 max-w-lg w-full pointer-events-auto slide-up">
        <div className="flex items-start gap-3 mb-3">
          <div className="shrink-0 w-8 h-8 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center mt-0.5">
            <Cookie className="w-4 h-4 text-brand-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-brand-text font-sans text-xs font-semibold mb-0.5">We use cookies</p>
            <p className="text-brand-muted font-sans text-[11px] leading-relaxed">
              We use essential cookies to keep your session secure and remember your preferences. No tracking or advertising cookies.
            </p>
          </div>
          <button onClick={reject} className="shrink-0 text-brand-muted hover:text-brand-text transition-colors p-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('manage')}
            className="flex items-center gap-1 text-brand-muted hover:text-brand-gold font-sans text-[11px] transition-colors"
          >
            <Shield className="w-3 h-3" />
            Manage
          </button>
          <div className="flex-1" />
          <button
            onClick={reject}
            className="text-brand-muted hover:text-brand-text font-sans text-[11px] px-3 py-1.5 rounded-lg border border-brand-border hover:border-brand-gold/30 transition-all"
          >
            Reject All
          </button>
          <button
            onClick={accept}
            className="bg-brand-gold text-brand-bg font-sans font-bold text-[11px] px-4 py-1.5 rounded-lg hover:brightness-110 transition-all uppercase tracking-wider"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
