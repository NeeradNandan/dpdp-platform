/**
 * DPDP Shield Consent Banner Widget
 * Lightweight, embeddable consent management for DPDP Act compliance
 * Vanilla TypeScript - no framework dependencies
 */

const PREFIX = 'dpdp-';
const STORAGE_KEY_PREFIX = 'dpdp_consent_';

export interface Purpose {
  id: string;
  label: string;
  description?: string;
  mandatory?: boolean;
}

export interface PurposeConsent {
  id: string;
  granted: boolean;
}

export interface ConsentArtifact {
  consent_id: string;
  org_id: string;
  purposes: PurposeConsent[];
  timestamp: string;
  session_id: string;
  user_agent: string;
}

export interface DPDPConfig {
  orgId: string;
  apiEndpoint?: string;
  position?: 'bottom' | 'top';
  primaryColor?: string;
  language?: string;
  purposes?: Purpose[];
  onConsent?: (artifact: ConsentArtifact) => void;
}

const DEFAULT_PURPOSES: Purpose[] = [
  { id: 'essential', label: 'Essential Services', description: 'Required for core functionality', mandatory: true },
  { id: 'analytics', label: 'Analytics & Improvement', description: 'Help us improve our services' },
  { id: 'marketing', label: 'Marketing Communications', description: 'Personalized offers and updates' },
  { id: 'sharing', label: 'Third-Party Sharing', description: 'Share data with trusted partners' },
];

const I18N: Record<string, Record<string, string>> = {
  en: {
    title: 'We Value Your Privacy',
    description: 'Under the Digital Personal Data Protection (DPDP) Act, we need your consent to process your data. Choose your preferences below.',
    acceptAll: 'Accept All',
    rejectNonEssential: 'Reject Non-Essential',
    savePreferences: 'Save Preferences',
    close: 'Close',
  },
};

function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getSessionId(): string {
  try {
    let sid = sessionStorage.getItem('dpdp_session_id');
    if (!sid) {
      sid = uuidv4();
      sessionStorage.setItem('dpdp_session_id', sid);
    }
    return sid;
  } catch {
    return uuidv4();
  }
}

function getStorageKey(orgId: string): string {
  return `${STORAGE_KEY_PREFIX}${orgId}`;
}

function loadSavedConsent(orgId: string): PurposeConsent[] | null {
  try {
    const raw = localStorage.getItem(getStorageKey(orgId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.purposes) ? parsed.purposes : null;
  } catch {
    return null;
  }
}

function saveConsentToStorage(orgId: string, purposes: PurposeConsent[]): void {
  try {
    localStorage.setItem(
      getStorageKey(orgId),
      JSON.stringify({ purposes, savedAt: new Date().toISOString() })
    );
  } catch {
    /* ignore */
  }
}

function injectStyles(config: DPDPConfig): void {
  const color = config.primaryColor || '#2563eb';
  const pos = config.position || 'bottom';
  const isTop = pos === 'top';

  const css = `
.${PREFIX}banner {
  position: fixed;
  ${isTop ? 'top: 0' : 'bottom: 0'};
  left: 0;
  right: 0;
  z-index: 2147483647;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  box-sizing: border-box;
}
.${PREFIX}backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 2147483646;
  animation: ${PREFIX}fadeIn 0.2s ease;
}
.${PREFIX}panel {
  max-width: 480px;
  margin: ${isTop ? '16px auto 0' : '0 auto 16px'};
  padding: 20px 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.15);
  animation: ${PREFIX}slideIn 0.3s ease;
}
@media (prefers-color-scheme: dark) {
  .${PREFIX}panel { background: #1e293b; color: #f1f5f9; }
  .${PREFIX}title { color: #f8fafc !important; }
  .${PREFIX}desc { color: #cbd5e1 !important; }
  .${PREFIX}toggle-label { color: #e2e8f0 !important; }
  .${PREFIX}toggle-desc { color: #94a3b8 !important; }
  .${PREFIX}btn-secondary { background: #334155; color: #e2e8f0; border-color: #475569; }
  .${PREFIX}btn-secondary:hover { background: #475569; }
}
@keyframes ${PREFIX}fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes ${PREFIX}slideIn {
  from { transform: translateY(${isTop ? '-20px' : '20px'}); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.${PREFIX}title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}
.${PREFIX}desc {
  margin: 0 0 16px;
  color: #64748b;
  font-size: 13px;
}
.${PREFIX}toggles {
  margin: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.${PREFIX}toggle {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 8px;
}
@media (prefers-color-scheme: dark) {
  .${PREFIX}toggle { background: #0f172a; }
}
.${PREFIX}toggle-mandatory .${PREFIX}switch { opacity: 0.6; cursor: not-allowed; }
.${PREFIX}toggle-label { font-weight: 500; color: #334155; flex: 1; }
.${PREFIX}toggle-desc { font-size: 12px; color: #64748b; margin-top: 2px; }
.${PREFIX}switch {
  flex-shrink: 0;
  width: 40px;
  height: 22px;
  background: #cbd5e1;
  border-radius: 11px;
  position: relative;
  cursor: pointer;
  transition: background 0.2s;
}
.${PREFIX}switch-on { background: ${color}; }
.${PREFIX}switch::after {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  background: #fff;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  transition: transform 0.2s;
}
.${PREFIX}switch-on::after { transform: translateX(18px); }
.${PREFIX}buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}
.${PREFIX}btn {
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background 0.2s, color 0.2s;
}
.${PREFIX}btn-primary {
  background: ${color};
  color: #fff;
}
.${PREFIX}btn-primary:hover { filter: brightness(1.1); }
.${PREFIX}btn-secondary {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}
.${PREFIX}close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 20px;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
.${PREFIX}close:hover { background: #f1f5f9; color: #334155; }
@media (prefers-color-scheme: dark) {
  .${PREFIX}close { color: #94a3b8; }
  .${PREFIX}close:hover { background: #334155; color: #e2e8f0; }
}
.${PREFIX}header { position: relative; padding-right: 32px; }
`;

  const style = document.createElement('style');
  style.id = `${PREFIX}styles`;
  style.textContent = css;
  document.head.appendChild(style);
}

function t(lang: string, key: string): string {
  return I18N[lang]?.[key] ?? I18N.en[key] ?? key;
}

export function createWidget(config: DPDPConfig) {
  const purposes = config.purposes?.length ? config.purposes : DEFAULT_PURPOSES;
  const lang = config.language || 'en';

  let state: Record<string, boolean> = {};
  let bannerEl: HTMLDivElement | null = null;
  let backdropEl: HTMLDivElement | null = null;

  function getInitialState(): Record<string, boolean> {
    const saved = loadSavedConsent(config.orgId);
    if (saved) {
      const map: Record<string, boolean> = {};
      purposes.forEach((p) => {
        const found = saved.find((s) => s.id === p.id);
        map[p.id] = found ? found.granted : (p.mandatory ?? false);
      });
      return map;
    }
    const def: Record<string, boolean> = {};
    purposes.forEach((p) => (def[p.id] = p.mandatory ?? false));
    return def;
  }

  function buildConsentArtifact(purposesState: Record<string, boolean>): ConsentArtifact {
    return {
      consent_id: uuidv4(),
      org_id: config.orgId,
      purposes: purposes.map((p) => ({ id: p.id, granted: purposesState[p.id] ?? false })),
      timestamp: new Date().toISOString(),
      session_id: getSessionId(),
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    };
  }

  function persistAndNotify(purposesState: Record<string, boolean>): void {
    const artifact = buildConsentArtifact(purposesState);
    saveConsentToStorage(config.orgId, artifact.purposes);
    config.onConsent?.(artifact);

    if (config.apiEndpoint) {
      fetch(config.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(artifact),
      }).catch(() => {});
    }
  }

  function hide(): void {
    if (backdropEl) backdropEl.remove();
    if (bannerEl) bannerEl.remove();
    backdropEl = null;
    bannerEl = null;
  }

  function show(): void {
    if (bannerEl && document.body.contains(bannerEl)) return;
    state = getInitialState();
    injectStyles(config);

    const isTop = (config.position || 'bottom') === 'top';

    backdropEl = document.createElement('div');
    backdropEl.className = `${PREFIX}backdrop`;

    bannerEl = document.createElement('div');
    bannerEl.className = `${PREFIX}banner`;

    const panel = document.createElement('div');
    panel.className = `${PREFIX}panel`;

    const header = document.createElement('div');
    header.className = `${PREFIX}header`;

    const title = document.createElement('h2');
    title.className = `${PREFIX}title`;
    title.textContent = t(lang, 'title');

    const desc = document.createElement('p');
    desc.className = `${PREFIX}desc`;
    desc.textContent = t(lang, 'description');

    const closeBtn = document.createElement('button');
    closeBtn.className = `${PREFIX}close`;
    closeBtn.type = 'button';
    closeBtn.innerHTML = '&times;';
    closeBtn.setAttribute('aria-label', t(lang, 'close'));
    closeBtn.onclick = () => hide();

    header.appendChild(title);
    header.appendChild(desc);
    header.appendChild(closeBtn);

    const toggles = document.createElement('div');
    toggles.className = `${PREFIX}toggles`;

    purposes.forEach((p) => {
      const wrap = document.createElement('div');
      wrap.className = `${PREFIX}toggle${p.mandatory ? ` ${PREFIX}toggle-mandatory` : ''}`;

      const labelWrap = document.createElement('div');
      const label = document.createElement('div');
      label.className = `${PREFIX}toggle-label`;
      label.textContent = p.label;
      if (p.description) {
        const sub = document.createElement('div');
        sub.className = `${PREFIX}toggle-desc`;
        sub.textContent = p.description;
        labelWrap.appendChild(label);
        labelWrap.appendChild(sub);
      } else {
        labelWrap.appendChild(label);
      }

      const sw = document.createElement('div');
      sw.className = `${PREFIX}switch${state[p.id] ? ` ${PREFIX}switch-on` : ''}`;
      sw.setAttribute('role', 'switch');
      sw.setAttribute('aria-checked', String(state[p.id]));
      if (!p.mandatory) {
        sw.onclick = () => {
          state[p.id] = !state[p.id];
          sw.classList.toggle(`${PREFIX}switch-on`, state[p.id]);
          sw.setAttribute('aria-checked', String(state[p.id]));
        };
      }

      wrap.appendChild(labelWrap);
      wrap.appendChild(sw);
      toggles.appendChild(wrap);
    });

    const buttons = document.createElement('div');
    buttons.className = `${PREFIX}buttons`;

    const acceptAll = document.createElement('button');
    acceptAll.className = `${PREFIX}btn ${PREFIX}btn-primary`;
    acceptAll.textContent = t(lang, 'acceptAll');
    acceptAll.onclick = () => {
      purposes.forEach((p) => (state[p.id] = true));
      persistAndNotify(state);
      hide();
    };

    const rejectNonEssential = document.createElement('button');
    rejectNonEssential.className = `${PREFIX}btn ${PREFIX}btn-secondary`;
    rejectNonEssential.textContent = t(lang, 'rejectNonEssential');
    rejectNonEssential.onclick = () => {
      purposes.forEach((p) => (state[p.id] = p.mandatory ?? false));
      persistAndNotify(state);
      hide();
    };

    const savePrefs = document.createElement('button');
    savePrefs.className = `${PREFIX}btn ${PREFIX}btn-secondary`;
    savePrefs.textContent = t(lang, 'savePreferences');
    savePrefs.onclick = () => {
      persistAndNotify(state);
      hide();
    };

    buttons.appendChild(acceptAll);
    buttons.appendChild(rejectNonEssential);
    buttons.appendChild(savePrefs);

    panel.appendChild(header);
    panel.appendChild(toggles);
    panel.appendChild(buttons);
    bannerEl.appendChild(panel);

    backdropEl.onclick = (e) => {
      if (e.target === backdropEl) hide();
    };

    document.body.appendChild(backdropEl);
    document.body.appendChild(bannerEl);
  }

  const hasConsented = (): boolean => {
    return loadSavedConsent(config.orgId) !== null;
  };

  if (!hasConsented()) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', show);
    } else {
      show();
    }
  }

  return {
    show,
    hide,
    withdraw(purposeId: string): void {
      const saved = loadSavedConsent(config.orgId);
      if (!saved) return;
      const updated = saved.map((p) =>
        p.id === purposeId ? { ...p, granted: false } : p
      );
      saveConsentToStorage(config.orgId, updated);
      const stateMap: Record<string, boolean> = {};
      updated.forEach((p) => (stateMap[p.id] = p.granted));
      persistAndNotify(stateMap);
    },
    getConsent(): PurposeConsent[] | null {
      return loadSavedConsent(config.orgId);
    },
    hasConsented,
  };
}
