import { ROTAS_RESERVADAS } from './rotas';

// Somente navegação visual. Não resolve indicação, oferta ou autorização.
function destinoIdentificador(origem: string): string | null {
  if (origem === 'home') return '/';
  if (origem === 'coletivo') return '/coletivo';
  const apelido = /^parceiro:([a-z0-9]+(?:-[a-z0-9]+)*)$/.exec(origem)?.[1];
  return apelido && !ROTAS_RESERVADAS.has(apelido) ? `/${apelido}` : null;
}

export function destinoOrigemVisual(search: string): string {
  const valores = new URLSearchParams(search).getAll('origem_visual');
  return valores.length === 1 ? destinoIdentificador(valores[0]) ?? '/' : '/';
}

export function comOrigemVisual(link: string, origem: string): string {
  const [caminho, query = ''] = link.split('?');
  const params = new URLSearchParams(query);
  params.set('origem_visual', origem);
  return `${caminho}?${params.toString()}`;
}

// Propagação explícita entre páginas. Não consulta indicação, cookie ou storage.
export function linkOrigemVisual(link: string, origem?: string): string {
  if (!link.startsWith('/') || link.startsWith('//')) return link;
  const atual = new URLSearchParams(window.location.search);
  const valores = atual.getAll('origem_visual');
  const identificador = origem ?? (valores.length === 1 ? valores[0] : undefined);
  if (!identificador || destinoIdentificador(identificador) === null) return link;
  const destino = new URL(link, window.location.origin);
  destino.searchParams.set('origem_visual', identificador);
  return destino.pathname + destino.search + destino.hash;
}

export function retornoVisual(): string {
  return destinoOrigemVisual(window.location.search);
}
