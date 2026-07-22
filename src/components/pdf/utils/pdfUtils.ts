/**
 * Utilitários para resolução e carregamento de PDFs do Plone/UFAC
 * @module pdfUtils
 */

export const PLONE_SITE = 'https://www3.ufac.br';
export const PLONE_PROXY_PREFIX = '/__plone__';

export const isPloneUrl = (url: string): boolean => {
  if (!url) return false;
  return (
    url.includes('ufac.br') ||
    url.startsWith(PLONE_PROXY_PREFIX) ||
    url.includes('/@@download/') ||
    url.includes('/at_download/')
  );
};

export const isPloneJsonResponse = (urlOrObject: string | object): boolean => {
  if (typeof urlOrObject === 'string') {
    try {
      const obj = JSON.parse(urlOrObject);
      return (
        obj &&
        (obj.targetUrl || (obj.file && obj.file.download) || obj['@type'] === 'File')
      );
    } catch {
      return (
        urlOrObject.includes('ufac.br') &&
        (urlOrObject.includes('@id') || urlOrObject.includes('++api++'))
      );
    }
  }
  if (typeof urlOrObject === 'object' && urlOrObject !== null) {
    return (
      'targetUrl' in urlOrObject ||
      ('file' in urlOrObject &&
        typeof (urlOrObject as { file?: unknown }).file === 'object') ||
      '@type' in urlOrObject
    );
  }
  return false;
};

/**
 * Extrai o caminho relativo no site Plone a partir de qualquer URL UFAC
 */
export const toPloneSitePath = (url: string): string => {
  if (!url) return '';
  let path = url.trim();

  path = path
    .replace(/^https?:\/\/www3\.ufac\.br/i, '')
    .replace(/^https?:\/\/[^/]*ufac\.br/i, '')
    .replace(PLONE_PROXY_PREFIX, '')
    .replace(/^\/\+\+api\+\+/, '')
    .replace(/\/@@download\/file\/?$/i, '')
    .replace(/\/@download\/file\/?$/i, '')
    .replace(/\/view\/?$/i, '');

  if (!path.startsWith('/')) path = `/${path}`;
  return path.replace(/\/+/g, '/');
};

/**
 * Converte URL absoluta do Plone em URL same-origin via proxy.
 * Preserva /@@download/file quando presente.
 */
export const toProxyUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('blob:') || url.startsWith('data:')) return url;
  if (url.startsWith(PLONE_PROXY_PREFIX)) return url;

  if (url.startsWith('/') && !url.startsWith('//')) {
    return `${PLONE_PROXY_PREFIX}${url}`;
  }

  if (isPloneUrl(url)) {
    let path = url
      .replace(/^https?:\/\/www3\.ufac\.br/i, '')
      .replace(/^https?:\/\/[^/]*ufac\.br/i, '')
      .replace(/^\/\+\+api\+\+/, '');

    if (!path.startsWith('/')) path = `/${path}`;
    return `${PLONE_PROXY_PREFIX}${path.replace(/\/+/g, '/')}`;
  }

  return url;
};

/**
 * Monta URL de download direto do arquivo no Plone
 */
export const getPloneDownloadUrl = (url: string): string => {
  if (!url) return '';
  if (url.includes('/@@download/') || url.includes('/at_download/')) {
    return url;
  }
  if (url.includes('/view')) {
    return url.replace('/view', '/@@download/file');
  }

  const path = toPloneSitePath(url);
  return `${PLONE_SITE}${path}/@@download/file`;
};

/**
 * URL de metadados via ++api++ (tem CORS; útil fora do proxy)
 */
export const getPloneApiUrl = (url: string): string => {
  const path = toPloneSitePath(url);
  return `${PLONE_SITE}/++api++${path}`;
};

export const getFilenameFromUrl = (url: string): string => {
  try {
    if (!url) return 'document.pdf';

    if (url.includes('/@@download/')) {
      const parts = url.split('/');
      const fileIndex = parts.findIndex((part) => part === '@@download');
      if (fileIndex > 0) return decodeURIComponent(parts[fileIndex - 1]);
    }

    const path = toPloneSitePath(url);
    const segments = path.split('/').filter(Boolean);
    if (segments.length > 0) {
      return decodeURIComponent(segments[segments.length - 1]);
    }

    return 'document.pdf';
  } catch {
    return 'document.pdf';
  }
};

export const extractDownloadUrlFromJson = (json: Record<string, unknown>): string | null => {
  if (!json) return null;

  if (typeof json.targetUrl === 'string') return json.targetUrl;

  const file = json.file as { download?: string } | undefined;
  if (file?.download) return file.download;

  if (typeof json['@id'] === 'string') {
    return `${json['@id']}/@@download/file`;
  }

  return null;
};

export const getPdfUrl = async (urlOrJson: string | object): Promise<string> => {
  let jsonData: Record<string, unknown>;

  if (typeof urlOrJson === 'string') {
    try {
      jsonData = JSON.parse(urlOrJson);
    } catch {
      const apiProxy = `${PLONE_PROXY_PREFIX}/++api++${toPloneSitePath(urlOrJson)}`;
      const res = await fetch(apiProxy, { headers: { Accept: 'application/json' } });
      if (!res.ok) {
        throw new Error(`Falha ao buscar metadados do Plone: ${res.status}`);
      }
      jsonData = await res.json();
    }
  } else {
    jsonData = urlOrJson as Record<string, unknown>;
  }

  const extracted = extractDownloadUrlFromJson(jsonData);
  if (extracted) return extracted;

  throw new Error('Não foi possível extrair URL do PDF da resposta do Plone');
};

export type FitType = 'width' | 'height' | 'page' | 'zoom';

export interface ResolvedPdfSource {
  /** Fonte para o react-pdf (blob URL same-origin) */
  viewerUrl: string;
  /** URL original/absoluta para download e "abrir em nova aba" */
  downloadUrl: string;
  fileName: string;
  revoke?: () => void;
}

/**
 * Resolve e baixa o PDF via proxy (same-origin), retornando blob URL para o react-pdf.
 * Contorna a falta de CORS nos arquivos estáticos do Plone/Varnish.
 */
export const resolvePdfSource = async (rawUrl: string): Promise<ResolvedPdfSource> => {
  if (!rawUrl) {
    throw new Error('URL do PDF não informada');
  }

  if (rawUrl.startsWith('blob:') || rawUrl.startsWith('data:')) {
    return {
      viewerUrl: rawUrl,
      downloadUrl: rawUrl,
      fileName: 'document.pdf',
    };
  }

  let downloadUrl = rawUrl;
  let fileName = getFilenameFromUrl(rawUrl);

  // Metadados via ++api++ no proxy (CORS same-origin)
  if (isPloneUrl(rawUrl)) {
    try {
      const apiPath = `${PLONE_PROXY_PREFIX}/++api++${toPloneSitePath(rawUrl)}`;
      const metaRes = await fetch(apiPath, {
        headers: { Accept: 'application/json' },
      });

      if (metaRes.ok) {
        const contentType = metaRes.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const meta = await metaRes.json();
          const fromMeta = extractDownloadUrlFromJson(meta);
          if (fromMeta) downloadUrl = fromMeta;
          if (meta?.file?.filename) fileName = meta.file.filename;
          else if (meta?.title) fileName = `${meta.title}.pdf`;
        }
      }
    } catch (err) {
      console.warn('Metadados Plone indisponíveis, usando URL direta:', err);
      downloadUrl = getPloneDownloadUrl(rawUrl);
    }

    if (!downloadUrl.includes('/@@download/') && !downloadUrl.includes('/at_download/')) {
      downloadUrl = getPloneDownloadUrl(downloadUrl);
    }
  }

  // Busca o binário via proxy (same-origin) — evita CORS do Varnish
  const fetchUrl = isPloneUrl(downloadUrl) ? toProxyUrl(downloadUrl) : downloadUrl;
  const pdfRes = await fetch(fetchUrl);

  if (!pdfRes.ok) {
    throw new Error(`Falha ao baixar PDF (${pdfRes.status})`);
  }

  const blob = await pdfRes.blob();
  if (!blob || blob.size === 0) {
    throw new Error('Arquivo PDF vazio ou inválido');
  }

  // Garante tipo PDF mesmo se o servidor mandar octet-stream
  const pdfBlob =
    blob.type === 'application/pdf'
      ? blob
      : new Blob([blob], { type: 'application/pdf' });

  const viewerUrl = URL.createObjectURL(pdfBlob);

  return {
    viewerUrl,
    downloadUrl: isPloneUrl(downloadUrl) ? downloadUrl : fetchUrl,
    fileName,
    revoke: () => URL.revokeObjectURL(viewerUrl),
  };
};

export const getMostVisiblePage = (containerRef: HTMLDivElement): number | null => {
  if (!containerRef) return null;

  const containerRect = containerRef.getBoundingClientRect();
  const pageElements = containerRef.querySelectorAll('.react-pdf__Page');

  let mostVisiblePage: number | null = null;
  let maxVisibleHeight = 0;

  pageElements.forEach((page) => {
    const pageRect = page.getBoundingClientRect();
    const intersectionHeight = Math.max(
      0,
      Math.min(containerRect.bottom, pageRect.bottom) -
        Math.max(containerRect.top, pageRect.top)
    );

    if (intersectionHeight > 0 && intersectionHeight > maxVisibleHeight) {
      maxVisibleHeight = intersectionHeight;
      mostVisiblePage = parseInt(page.getAttribute('data-page-number') || '0', 10);
    }
  });

  return mostVisiblePage;
};

export const extractTextContext = (
  text: string,
  searchTerm: string,
  contextLength: number = 50
): string => {
  if (!text || !searchTerm) return '';

  const index = text.toLowerCase().indexOf(searchTerm.toLowerCase());
  if (index === -1) return '';

  const start = Math.max(0, index - contextLength);
  const end = Math.min(text.length, index + searchTerm.length + contextLength);

  return text.substring(start, end);
};

/** Versão do pdfjs-dist alinhada ao react-pdf (sem importar pdfjs no SSR). */
export const PDFJS_VERSION = '5.4.296';

export const getPdfOptions = () => ({
  cMapUrl: `https://unpkg.com/pdfjs-dist@${PDFJS_VERSION}/cmaps/`,
  cMapPacked: true,
  standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${PDFJS_VERSION}/standard_fonts/`,
});
