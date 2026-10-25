// Indicação pública: nunca representa autenticação ou autorização.
export const RESOLVER_REFERENCIA = 'https://n8n.saintsolution.com.br/webhook/resolver-referencia-publica';

export function normalizarCodigo(valor: unknown): string {
  const texto = String(valor ?? '').trim();
  return /^\d{1,4}$/.test(texto) ? texto.padStart(4, '0') : '';
}

export function normalizarApelido(valor: string): string {
  return valor.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export interface ArmazenamentoReferencia {
  ler(): string;
  salvar(codigo: string): void;
}

// A geração invalida respostas antigas antes que possam sobrescrever uma nova entrada.
export function criarResolvedorReferencia(armazenamento: ArmazenamentoReferencia, requisitar: typeof fetch = fetch) {
  let geracao = 0;
  let codigoAtual = '';
  return {
    async preparar(referencia: string | null): Promise<string | null> {
      const atual = ++geracao;
      codigoAtual = '';
      let codigo: string;
      if (referencia === null) {
        codigo = normalizarCodigo(armazenamento.ler()) || '0001';
      } else {
        codigo = normalizarCodigo(referencia);
        if (!codigo) {
          const apelido = normalizarApelido(referencia);
          if (!apelido) throw new Error('A referência comercial está incompleta.');
          const response = await requisitar(RESOLVER_REFERENCIA, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ referencia: apelido }),
          });
          const dados = await response.json();
          if (atual !== geracao) return null;
          codigo = normalizarCodigo(dados?.cod_colab);
          if (!response.ok || dados?.encontrado !== true || !codigo) {
            throw new Error('Não foi possível confirmar a indicação deste link. Tente novamente.');
          }
        }
      }
      if (atual !== geracao) return null;
      armazenamento.salvar(codigo);
      codigoAtual = codigo;
      return codigo;
    },
    cancelar() { geracao += 1; codigoAtual = ''; },
    codigoConfirmado() {
      if (!codigoAtual) throw new Error('Confirme a indicação antes de continuar.');
      return codigoAtual;
    },
  };
}

function lerCookie(nome: string): string {
  const item = document.cookie.split(';').map(x => x.trim()).find(x => x.startsWith(`${nome}=`));
  try { return item ? decodeURIComponent(item.slice(nome.length + 1)) : ''; } catch { return ''; }
}

export const armazenamentoReferencia: ArmazenamentoReferencia = {
  ler() {
    return normalizarCodigo(lerCookie('indicador_consultoque')) ||
      normalizarCodigo(localStorage.getItem('indicador_colab')) ||
      normalizarCodigo(localStorage.getItem('referenciador_id')) ||
      normalizarCodigo(lerCookie('referenciador_id'));
  },
  salvar(codigo) {
    if (!normalizarCodigo(codigo)) throw new Error('Código de indicação inválido.');
    localStorage.setItem('indicador_colab', codigo);
    localStorage.setItem('referenciador_id', codigo);
    const compartilhado = window.location.hostname === 'consultoque.com.br' ||
      window.location.hostname.endsWith('.consultoque.com.br');
    for (const nome of ['indicador_consultoque', 'indicador_colab', 'referenciador_id']) {
      document.cookie = `${nome}=${codigo}; Path=/; Max-Age=2592000; SameSite=Lax` +
        (compartilhado && nome === 'indicador_consultoque' ? '; Domain=.consultoque.com.br; Secure' : '');
    }
  },
};

export const referenciaComercial = criarResolvedorReferencia(armazenamentoReferencia);
