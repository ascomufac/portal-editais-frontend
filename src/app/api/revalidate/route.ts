import { revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';
import { editalCacheTag, normalizeEditalPath } from '@/lib/edital-content';
import { RECENT_UPDATES_TAG } from '@/services/editalService';
import { BASE_URL } from '@/services/ploneConfig';

const MAX_PATHS = 20;

/** Usuário do JWT (sem validar assinatura: quem valida é o Plone). */
const tokenUser = (token: string): string => {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1] || '', 'base64url').toString('utf8')
    );
    return String(payload?.sub || payload?.username || '');
  } catch {
    return '';
  }
};

/** O token só vale se o Plone aceitar (o cookie __ac faz o Varnish não usar cache). */
const isValidPloneToken = async (token: string): Promise<boolean> => {
  const user = tokenUser(token);
  if (!user) return false;
  try {
    const response = await fetch(`${BASE_URL}/@users/${encodeURIComponent(user)}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        Cookie: '__ac=ufac-editais',
      },
      cache: 'no-store',
    });
    return response.ok;
  } catch {
    return false;
  }
};

/** A pasta alterada e todas as acima dela (a listagem do pai mostra datas e totais). */
const withAncestors = (path: string): string[] => {
  const segments = normalizeEditalPath(path).split('/').filter(Boolean);
  return segments.map((_, i) => segments.slice(0, i + 1).join('/'));
};

/**
 * Invalida o cache das páginas de edital e das últimas atualizações depois que
 * o admin altera conteúdo. Corpo: { paths: string[] } (caminhos Plone alterados).
 */
export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token || !(await isValidPloneToken(token))) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const paths: unknown[] = Array.isArray(body?.paths) ? body.paths : [];
  const valid = paths
    .filter((p): p is string => typeof p === 'string' && p.length > 0 && p.length <= 1000)
    .slice(0, MAX_PATHS);

  const tags = new Set<string>([RECENT_UPDATES_TAG]);
  valid.flatMap(withAncestors).forEach((p) => tags.add(editalCacheTag(p)));
  tags.forEach((tag) => revalidateTag(tag, { expire: 0 }));

  return NextResponse.json({ revalidated: tags.size });
}
