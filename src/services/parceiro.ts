import { normalizarApelido, normalizarCodigo, RESOLVER_REFERENCIA } from './referencia';

export interface OfertaParceiro { codigo: string; apelido: string }

// O cadastro visual não concede autorização: a resposta do servidor é obrigatória.
export async function consultarParceiro(_referenciaPublica: string, codigo: string, requisitar: typeof fetch = fetch): Promise<OfertaParceiro | null> {
  codigo = normalizarCodigo(codigo);
  if (!codigo) throw new Error('Código de indicação inválido.');
  const res = await requisitar(RESOLVER_REFERENCIA, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cod_colab: codigo }),
  });
  const dados = await res.json();
  if (!res.ok || dados?.sucesso === false) throw new Error('Não foi possível consultar a página do parceiro.');
  if (dados?.encontrado !== true) throw new Error('Colaborador não localizado ou inativo.');
  if (normalizarCodigo(dados.cod_colab) !== codigo) throw new Error('A resposta da indicação não corresponde ao link.');
  if (dados.status_colab !== undefined && String(dados.status_colab).trim().toUpperCase() !== 'ATIVO') {
    throw new Error('Colaborador não localizado ou inativo.');
  }
  const apelidoCadastro = normalizarApelido(String(dados.apelido_referencia ?? ''));
  if (String(dados.parceiro ?? '').trim().toUpperCase() !== 'PARCEIRO') return null;
  return { codigo, apelido: apelidoCadastro || codigo };
}

export const CHAVE_OFERTA_PARCEIRO = 'consultoque_oferta_parceiro_dev';
export const VALIDADE_OFERTA_PARCEIRO = 30 * 24 * 60 * 60 * 1000;
export interface ContextoOferta extends OfertaParceiro { iniciadoEm: number; expiraEm: number }

// Apenas identidade pública e prazo. Nunca armazena autorização ou dados do cliente.
export function criarPersistenciaOferta(storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>) {
  return {
    ler(): ContextoOferta | null {
      try {
        const valor = JSON.parse(storage.getItem(CHAVE_OFERTA_PARCEIRO) || 'null');
        if (!valor) return null;
        if (normalizarCodigo(valor.codigo) !== valor.codigo || typeof valor.apelido !== 'string' || !valor.apelido || normalizarApelido(valor.apelido) !== valor.apelido ||
            !Number.isFinite(valor.iniciadoEm) || !Number.isFinite(valor.expiraEm) ||
            valor.expiraEm - valor.iniciadoEm !== VALIDADE_OFERTA_PARCEIRO) {
          storage.removeItem(CHAVE_OFERTA_PARCEIRO); return null;
        }
        return { codigo: valor.codigo, apelido: valor.apelido, iniciadoEm: valor.iniciadoEm, expiraEm: valor.expiraEm };
      } catch { return null; }
    },
    salvar(oferta: OfertaParceiro, agora = Date.now()): ContextoOferta {
      const contexto = { codigo: oferta.codigo, apelido: oferta.apelido, iniciadoEm: agora, expiraEm: agora + VALIDADE_OFERTA_PARCEIRO };
      try { storage.setItem(CHAVE_OFERTA_PARCEIRO, JSON.stringify(contexto)); }
      catch { throw new Error('Não foi possível preservar a oferta neste navegador.'); }
      return contexto;
    },
    limpar() { try { storage.removeItem(CHAVE_OFERTA_PARCEIRO); } catch { /* Sem preço autorizado por storage. */ } },
  };
}

export function ofertaNoPrazo(contexto: ContextoOferta, agora = Date.now()) {
  return contexto.iniciadoEm <= agora && agora < contexto.expiraEm;
}

export function linkComercial(destino: string, oferta: OfertaParceiro | null, codigo: string) {
  const params = new URLSearchParams({ ref: codigo });
  if (oferta) params.set('oferta', oferta.apelido);
  return `${destino}?${params.toString()}`;
}
