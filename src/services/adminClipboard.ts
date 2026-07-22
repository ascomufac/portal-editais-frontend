/**
 * Área de transferência local (estilo Drive) para recortar/copiar/colar entre pastas.
 */
const CLIPBOARD_KEY = 'ufac_editais_clipboard';

export type ClipboardPayload = {
  mode: 'cut' | 'copy';
  /** Paths Plone relativos (ex.: centros/ccbn) */
  paths: string[];
  sourceFolder: string;
};

export const readClipboard = (): ClipboardPayload | null => {
  try {
    const raw = sessionStorage.getItem(CLIPBOARD_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ClipboardPayload;
  } catch {
    return null;
  }
};

export const writeClipboard = (payload: ClipboardPayload) => {
  sessionStorage.setItem(CLIPBOARD_KEY, JSON.stringify(payload));
};

export const clearClipboard = () => {
  sessionStorage.removeItem(CLIPBOARD_KEY);
};
