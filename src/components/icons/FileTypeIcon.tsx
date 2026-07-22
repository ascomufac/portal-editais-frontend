import { cn } from '@/lib/utils';
import React from 'react';

export type FileKind = 'pdf' | 'doc' | 'xls' | 'ppt' | 'zip' | 'img' | 'file';

export const FILE_KIND_STYLES: Record<
  FileKind,
  { label: string; color: string; bg: string; bgSoft: string }
> = {
  pdf: { label: 'PDF', color: '#E83458', bg: 'bg-red-100', bgSoft: 'bg-red-50' },
  doc: { label: 'DOC', color: '#2B579A', bg: 'bg-blue-100', bgSoft: 'bg-blue-50' },
  xls: { label: 'XLS', color: '#217346', bg: 'bg-green-100', bgSoft: 'bg-green-50' },
  ppt: { label: 'PPT', color: '#C43E1C', bg: 'bg-orange-100', bgSoft: 'bg-orange-50' },
  zip: { label: 'ZIP', color: '#7C3AED', bg: 'bg-purple-100', bgSoft: 'bg-purple-50' },
  img: { label: 'IMG', color: '#0891B2', bg: 'bg-cyan-100', bgSoft: 'bg-cyan-50' },
  file: { label: 'ARQ', color: '#64748B', bg: 'bg-slate-100', bgSoft: 'bg-slate-50' },
};

const EXT_TO_KIND: Record<string, FileKind> = {
  pdf: 'pdf',
  doc: 'doc',
  docx: 'doc',
  odt: 'doc',
  rtf: 'doc',
  txt: 'doc',
  xls: 'xls',
  xlsx: 'xls',
  ods: 'xls',
  csv: 'xls',
  ppt: 'ppt',
  pptx: 'ppt',
  odp: 'ppt',
  zip: 'zip',
  rar: 'zip',
  '7z': 'zip',
  tar: 'zip',
  gz: 'zip',
  png: 'img',
  jpg: 'img',
  jpeg: 'img',
  gif: 'img',
  webp: 'img',
  svg: 'img',
  bmp: 'img',
};

/** Extrai extensão de URL, path ou nome de arquivo (ex.: "ANEXO II.doc"). */
export const getFileExtension = (source?: string | null): string => {
  if (!source) return '';

  const cleaned = source.trim().split('?')[0].split('#')[0];
  // Prefere o último segmento do path
  const segment = cleaned.includes('/')
    ? cleaned.split('/').filter(Boolean).pop() || cleaned
    : cleaned;

  const match = segment.match(/\.([a-z0-9]{1,5})$/i);
  if (match) return match[1].toLowerCase();

  // Plone: .../arquivo.doc/@@download/file
  const ploneMatch = cleaned.match(/\.([a-z0-9]{1,5})(?:\/@@|$)/i);
  return ploneMatch ? ploneMatch[1].toLowerCase() : '';
};

export const getFileKind = (...sources: Array<string | null | undefined>): FileKind => {
  for (const source of sources) {
    const ext = getFileExtension(source);
    if (ext && EXT_TO_KIND[ext]) return EXT_TO_KIND[ext];

    const lower = (source || '').toLowerCase();
    if (lower.includes('file_pdf') || lower.includes('/view/pdf')) return 'pdf';
  }
  return 'file';
};

interface FileTypeIconProps {
  /** URL, path ou nome do arquivo (ex.: "ANEXO II.doc") */
  source?: string | null;
  /** Fontes extras para detectar o tipo (título, @id, etc.) */
  sources?: Array<string | null | undefined>;
  kind?: FileKind;
  className?: string;
  size?: number;
  strokeWidth?: number;
  /** Se false, não aplica o fundo circular colorido */
  withBackground?: boolean;
}

/**
 * Ícone de tipo de arquivo no mesmo modelo do PDF (documento + sigla).
 */
const FileTypeIcon: React.FC<FileTypeIconProps> = ({
  source,
  sources = [],
  kind: kindProp,
  className,
  size = 16,
  strokeWidth = 2,
  withBackground = true,
}) => {
  const kind = kindProp || getFileKind(source, ...sources);
  const style = FILE_KIND_STYLES[kind];

  return (
    <svg
      className={cn(
        withBackground &&
          `${style.bg} flex items-center justify-center w-8 h-8 rounded-full min-w-8 p-1.5`,
        className
      )}
      width={size}
      height={size}
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M2 10V3C2 2.46957 2.21071 1.96086 2.58579 1.58579C2.96086 1.21071 3.46957 1 4 1H13L18 6V10M12 1V5C12 5.53043 12.2107 6.03914 12.5858 6.41421C12.9609 6.78929 13.4696 7 14 7H18"
        stroke={style.color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="10.5"
        y="17.5"
        textAnchor="middle"
        fill={style.color}
        fontSize="6.5"
        fontWeight="700"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="0.2"
      >
        {style.label}
      </text>
    </svg>
  );
};

export default FileTypeIcon;
