/**
 * DPDP Shield Consent Widget - Entry Point
 * Auto-initializes from window.__DPDP_CONFIG__ or script tag data attributes
 */

import { createWidget, type DPDPConfig } from './widget';

declare global {
  interface Window {
    __DPDP_CONFIG__?: Partial<DPDPConfig>;
    DPDPShield?: ReturnType<typeof createWidget>;
  }
}

function getConfigFromScript(): Partial<DPDPConfig> {
  const scripts = document.getElementsByTagName('script');
  for (let i = 0; i < scripts.length; i++) {
    const s = scripts[i];
    const src = s.getAttribute('src') || '';
    if (src.includes('widget.js') || src.includes('consent-widget')) {
      return {
        orgId: s.getAttribute('data-org-id') || '',
        apiEndpoint: s.getAttribute('data-api-endpoint') || undefined,
        position: (s.getAttribute('data-position') as 'bottom' | 'top') || undefined,
        primaryColor: s.getAttribute('data-primary-color') || undefined,
        language: s.getAttribute('data-language') || undefined,
      };
    }
  }
  return {};
}

function mergeConfig(): DPDPConfig | null {
  const scriptConfig = getConfigFromScript();
  const globalConfig = typeof window !== 'undefined' ? window.__DPDP_CONFIG__ : undefined;

  const orgId = globalConfig?.orgId ?? scriptConfig.orgId ?? '';
  if (!orgId) {
    console.warn('[DPDP Shield] orgId is required. Set data-org-id on the script tag or window.__DPDP_CONFIG__.orgId');
    return null;
  }

  return {
    orgId,
    apiEndpoint: globalConfig?.apiEndpoint ?? scriptConfig.apiEndpoint,
    position: globalConfig?.position ?? scriptConfig.position,
    primaryColor: globalConfig?.primaryColor ?? scriptConfig.primaryColor,
    language: globalConfig?.language ?? scriptConfig.language,
    purposes: globalConfig?.purposes,
    onConsent: globalConfig?.onConsent,
  };
}

function init(): void {
  const config = mergeConfig();
  if (!config) return;

  const widget = createWidget(config);
  if (typeof window !== 'undefined') {
    window.DPDPShield = widget;
  }
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}
