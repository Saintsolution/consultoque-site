import { useEffect, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { referenciaComercial } from '../services/referencia';
import { referenciaDaUrl } from './rotas';

export function ReferenciaComercial({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const chave = location.pathname + location.search;
  const [estado, setEstado] = useState({ chave: '', erro: '', pronto: false });
  const [tentativa, setTentativa] = useState(0);
  useEffect(() => {
    let ativo = true;
    const { referencia, entrada } = referenciaDaUrl(location.pathname, location.search);
    void referenciaComercial.preparar(referencia).then(codigo => {
      if (!ativo || !codigo) return;
      if (entrada) {
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
        {estado.chave === chave && estado.erro && <button className="mt-6 rounded-xl bg-blue-700 px-6 py-3 text-white" onClick={() => setTentativa(x => x + 1)}>Tentar novamente</button>}
      </div>
    </main>;
  }
  return children;
}
