import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface PlatformSettings {
  platformName: string;
  supportEmail: string;
  socialLinkedin: string;
  socialTwitter: string;
  socialFacebook: string;
  socialInstagram: string;
  gatewayPaystackEnabled: boolean;
  gatewayFlutterwaveEnabled: boolean;
  gatewayMonnifyEnabled: boolean;
  gatewayCryptoEnabled: boolean;
  withdrawBankEnabled: boolean;
  withdrawPaystackEnabled: boolean;
  withdrawCryptoEnabled: boolean;
  maintenanceMode: boolean;
  allowNewSignups: boolean;
  loaded: boolean;
  raw: Record<string, string>;
}

const DEFAULTS: PlatformSettings = {
  platformName: 'AlphaVest',
  supportEmail: 'support@alphavest.space',
  socialLinkedin: '',
  socialTwitter: '',
  socialFacebook: '',
  socialInstagram: '',
  gatewayPaystackEnabled: true,
  gatewayFlutterwaveEnabled: true,
  gatewayMonnifyEnabled: true,
  gatewayCryptoEnabled: true,
  withdrawBankEnabled: true,
  withdrawPaystackEnabled: true,
  withdrawCryptoEnabled: true,
  maintenanceMode: false,
  allowNewSignups: true,
  loaded: false,
  raw: {},
};

const PlatformContext = createContext<PlatformSettings>(DEFAULTS);

export function PlatformProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULTS);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then((d: Record<string, string>) => {
        const name = d.platform_name || 'AlphaVest';
        document.title = name;
        // Update og meta tags dynamically
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', name);
        setSettings({
          platformName: name,
          supportEmail: d.support_email || 'support@alphavest.space',
          socialLinkedin: d.social_linkedin || '',
          socialTwitter: d.social_twitter || '',
          socialFacebook: d.social_facebook || '',
          socialInstagram: d.social_instagram || '',
          gatewayPaystackEnabled: d.gateway_paystack_enabled !== 'false',
          gatewayFlutterwaveEnabled: d.gateway_flutterwave_enabled !== 'false',
          gatewayMonnifyEnabled: d.gateway_monnify_enabled !== 'false',
          gatewayCryptoEnabled: d.gateway_crypto_enabled !== 'false',
          withdrawBankEnabled: d.withdraw_bank_enabled !== 'false',
          withdrawPaystackEnabled: d.withdraw_paystack_enabled !== 'false',
          withdrawCryptoEnabled: d.withdraw_crypto_enabled !== 'false',
          maintenanceMode: d.maintenance_mode === 'true',
          allowNewSignups: d.allow_new_signups !== 'false',
          loaded: true,
          raw: d,
        });
      })
      .catch(() => setSettings(prev => ({ ...prev, loaded: true })));
  }, []);

  return (
    <PlatformContext.Provider value={settings}>
      {children}
    </PlatformContext.Provider>
  );
}

export const usePlatform = () => useContext(PlatformContext);
