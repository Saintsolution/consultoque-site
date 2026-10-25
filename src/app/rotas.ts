export const ROTAS_RESERVADAS = new Set([
  'coletivo', 'empresas', 'contratar', 'formcoletivo', 'form-coletivo', 'formpessoal',
  'form-individual', 'form-familiar', 'cliente', 'associado', 'colaborador',
  'entrar', 'dashboard', 'admin', 'admin-asaas', 'seja-afiliado', 'seja-colaborador',
  'inscricao-colaborador', 'material-promocional', 'panfletos-promocionais',
  'montar-folder', 'solicitar-impressos', 'play', 'videoafiliados', 'faq', 'termos',
  'privacidade', 'criar-senha', 'completar-adesao', 'contratos',
]);
export function referenciaDaUrl(pathname: string, search: string) {
  const params = new URLSearchParams(search);
  const partes = pathname.split('/').filter(Boolean).map(parte => { try { return decodeURIComponent(parte); } catch { return parte; } });
  const entrada = partes.length === 1 && !ROTAS_RESERVADAS.has(partes[0]);
  const referencia = params.has('ref') ? params.get('ref')! :
    partes[0] === 'play' && partes.length === 3 ? partes[2] :
    partes[0] === 'seja-colaborador' && partes.length === 2 ? partes[1] :
    entrada ? partes[0] : null;
  return { referencia, entrada };
}
