import { ContextoParceiro } from './ContextoParceiro';
import { useEffect, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { armazenamentoReferencia, normalizarCodigo, normalizarApelido, referenciaComercial } from '../services/referencia';
import { referenciaDaUrl } from './rotas';
import { CHAVE_OFERTA_PARCEIRO, criarPersistenciaOferta, ofertaNoPrazo, consultarParceiro, type OfertaParceiro } from '../services/parceiro';
import { PaginaParceiro } from '../previews/PaginaParceiro';

export function ReferenciaComercial({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const rota = location.pathname + location.search;
  const [estado, setEstado] = useState({ chave: '', erro: '', pronto: false });
  const [oferta, setOferta] = useState<OfertaParceiro | null>(null);
  const [tentativa, setTentativa] = useState(0);
  const chave = rota + ':' + tentativa;
  useEffect(() => {
    const atualizar = (event: StorageEvent) => {
      if (event.storageArea === localStorage && (event.key === null || [CHAVE_OFERTA_PARCEIRO, 'indicador_colab', 'referenciador_id'].includes(event.key))) {
        if (event.key === 'indicador_colab' || event.key === 'referenciador_id') {
          const codigo = normalizarCodigo(localStorage.getItem('indicador_colab')) || normalizarCodigo(localStorage.getItem('referenciador_id'));
          if (codigo) armazenamentoReferencia.salvar(codigo);
          const salvo = criarPersistenciaOferta(localStorage).ler();
          if (salvo && codigo !== salvo.codigo) criarPersistenciaOferta(localStorage).limpar();
          // O link antigo desta aba não pode desfazer uma troca explícita em outra aba.
          const params = new URLSearchParams(location.search); params.delete('ref'); params.delete('oferta');
          navigate({ pathname: referenciaDaUrl(location.pathname, location.search).entrada ? '/' : location.pathname, search: params.toString() }, { replace: true });
        }
        setOferta(null);
        setTentativa(x => x + 1);
      }
    };
    window.addEventListener('storage', atualizar);
    return () => window.removeEventListener('storage', atualizar);
  }, [location.pathname, location.search, navigate]);
  useEffect(() => {
    let ativo = true;
    const { referencia, entrada } = referenciaDaUrl(location.pathname, location.search);
    setOferta(null);
    const persistencia = criarPersistenciaOferta(localStorage);
    let salvo = persistencia.ler();
    // O prazo local limita apenas a lembrança visual. A autorização vem do cadastro.
    if (salvo && !ofertaNoPrazo(salvo)) {
      persistencia.limpar();
      salvo = null;
    }
    if (salvo && referencia !== null && normalizarCodigo(referencia) !== salvo.codigo && normalizarApelido(referencia) !== salvo.apelido) {
      persistencia.limpar(); salvo = null;
    }
    const parametros = new URLSearchParams(location.search);
    const consulta = (parametros.getAll('ref').length > 1 || parametros.getAll('oferta').length > 1)
      ? Promise.reject(new Error('Referência ou oferta duplicada. Reabra o link comercial.'))
      : referenciaComercial.preparar(referencia);
    void consulta.then(async codigo => {
      if (!ativo || !codigo) return;
      const paramsOferta = new URLSearchParams(location.search);
      const checkoutParceiro = location.pathname === '/contratar' && paramsOferta.has('oferta');
      // Recuperação de contrato, complemento e dashboard usam a modalidade da venda.
      const rotaComercial = ['/', '/contratar', '/coletivo', '/empresas', '/formcoletivo', '/form-coletivo', '/formpessoal', '/form-individual', '/form-familiar'].includes(location.pathname);
      let parceiro: OfertaParceiro | null = null;
      if (entrada || rotaComercial) {
        if (salvo && salvo.codigo !== codigo) { persistencia.limpar(); throw new Error('A indicação mudou. Confirme novamente a oferta ou continue na tabela padrão.'); }
        // A modalidade é consultada pelo mesmo código já resolvido. Oferta/identidade visual não autorizam desconto.
        parceiro = await consultarParceiro(codigo, codigo);
        if (!ativo) return;
        if ((checkoutParceiro || (salvo && !entrada)) && (!parceiro || (checkoutParceiro && paramsOferta.get('oferta') !== parceiro.apelido && paramsOferta.get('oferta') !== parceiro.codigo))) {
          throw new Error('Oferta de parceiro não confirmada. Retorne ao link do parceiro ou continue na tabela padrão.');
        }
        if (parceiro) {
          if (salvo && salvo.apelido !== parceiro.apelido) throw new Error('A oferta foi alterada. Reconfirme a condição comercial.');
          // A memória não autoriza preço; se falhar, a resposta atual do cadastro basta.
          if (!salvo) {
            try { persistencia.salvar(parceiro); } catch { /* contexto visual opcional */ }
          }
        }
      }
      setOferta(parceiro);
      if (entrada && !parceiro) {
        // Remove apenas o slug de entrada; mantém os demais parâmetros e hash.
        const params = new URLSearchParams(location.search);
        params.delete('ref');
        navigate({ pathname: '/', search: params.toString(), hash: location.hash }, { replace: true });
      } else setEstado({ chave, erro: '', pronto: true });
    }).catch((erro: unknown) => {
      if (ativo) setEstado({ chave, erro: erro instanceof Error ? erro.message : 'Não foi possível confirmar a indicação.', pronto: false });
    });
    return () => { ativo = false; referenciaComercial.cancelar(); };
  }, [chave, location.pathname, location.search, location.hash, navigate, tentativa]);

  if (estado.chave !== chave || !estado.pronto) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="max-w-lg rounded-2xl bg-white p-8 text-center shadow" role={estado.erro ? 'alert' : 'status'}>
        <p>{estado.chave === chave && estado.erro ? estado.erro : 'Confirmando indicação comercial…'}</p>
        {estado.chave === chave && estado.erro && <button className="mt-6 mr-4 rounded-xl border px-6 py-3" onClick={() => {
          criarPersistenciaOferta(localStorage).limpar();
          const params = new URLSearchParams(location.search); params.delete('oferta');
          if (referenciaDaUrl(location.pathname, location.search).entrada) { params.delete('ref'); navigate({ pathname: '/', search: params.toString() }, { replace: true }); }
          else navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
          setTentativa(x => x + 1);
        }}>Reconfirmar condição comercial</button>}
        {estado.chave === chave && estado.erro && <button className="mt-6 rounded-xl bg-blue-700 px-6 py-3 text-white" onClick={() => setTentativa(x => x + 1)}>Tentar novamente</button>}
      </div>
    </main>;
  }
  return <ContextoParceiro.Provider value={oferta}>
    {oferta && referenciaDaUrl(location.pathname, location.search).entrada
      ? <PaginaParceiro key={oferta.codigo} oferta={oferta} /> : children}
  </ContextoParceiro.Provider>;
}
