import { useState } from 'react';
import axios from 'axios';

const WEBHOOK_LOGIN_CLIENTE = 'https://n8n.saintsolution.com.br/webhook/login-cliente';
const WEBHOOK_EDITA_TITULAR = 'https://n8n.saintsolution.com.br/webhook/edita-titular';

type ClienteItem = {
  num_contrato: number | string;
  cod_plano?: string;
  plano_nome?: string;
  status_venda?: string;
  status_titular?: string;
  tit_nome?: string;
  tit_email?: string;
  tit_tel?: string;
  tit_cpf?: string;
  valor?: number | string;
  vl_total?: number | string;
  dia_vencimento?: string;
  dt_vencimento?: string;
  url_pagamento?: string;
};

export function ClienteDashboard() {
  const [logado, setLogado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const [loginData, setLoginData] = useState({
    assoc_cpf: '',
    assoc_nasc: '',
  });

  const [dados, setDados] = useState<ClienteItem[]>([]);
  const [podeEditar, setPodeEditar] = useState(true);

  const [editando, setEditando] = useState<ClienteItem | null>(null);
  const [editData, setEditData] = useState({
    tit_nome: '',
    tit_email: '',
    tit_tel: '',
  });

  function normalizarResposta(data: any) {
    if (Array.isArray(data)) {
      const itemComData = data.find((item) => item?.data);
      if (itemComData?.data && Array.isArray(itemComData.data)) return itemComData.data;
      return data;
    }

    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.titulares)) return data.titulares;
    if (Array.isArray(data?.contratos)) return data.contratos;
    if (data?.num_contrato) return [data];

    return [];
  }

  function formatarNascimento(data: string) {
    const numeros = data.replace(/\D/g, '');

    if (numeros.length !== 8) return data.trim();

    return `${numeros.substring(0, 2)}-${numeros.substring(2, 4)}-${numeros.substring(4, 8)}`;
  }

  function nomePlano(cod?: string) {
    switch (cod) {
      case 'p1380':
      case '1380':
        return 'Plano Individual';
      case 'p1382':
      case '1382':
        return 'Plano Familiar';
      case 'coletivo':
        return 'Plano Coletivo';
      default:
        return cod || 'Plano ConsulToque';
    }
  }

  function formatarMoeda(valor?: number | string) {
    if (valor === undefined || valor === null || valor === '') return '';

    return Number(valor).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  function statusAtivo(status?: string) {
    return ['ativo', 'pago', 'adimplente'].includes(
      String(status || '').toLowerCase()
    );
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro('');

    try {
      const response = await axios.post(
        WEBHOOK_LOGIN_CLIENTE,
        {
          assoc_cpf: loginData.assoc_cpf.replace(/\D/g, ''),
          assoc_nasc: formatarNascimento(loginData.assoc_nasc),
        },
        { timeout: 20000 }
      );

      console.log('Resposta login cliente:', response.data);

      const resposta = response.data;
      const lista = normalizarResposta(resposta);

      setPodeEditar(resposta?.pode_editar !== false);

      if (lista.length > 0) {
        setDados(lista);
        setLogado(true);
      } else {
        setErro('CPF ou data de nascimento não localizado.');
      }
    } catch (error) {
      console.error(error);
      setErro('Erro de conexão com o sistema.');
    } finally {
      setLoading(false);
    }
  }

  async function salvarTitular() {
    if (!editando) return;

    setLoading(true);

    try {
      await axios.post(WEBHOOK_EDITA_TITULAR, {
        num_contrato: editando.num_contrato,
        tit_cpf: editando.tit_cpf,
        ...editData,
      });

      setDados((prev) =>
        prev.map((item) =>
          item.num_contrato === editando.num_contrato &&
          item.tit_cpf === editando.tit_cpf
            ? { ...item, ...editData }
            : item
        )
      );

      setEditando(null);
      alert('Atualizado com sucesso!');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar.');
    } finally {
      setLoading(false);
    }
  }

  function sair() {
    setLogado(false);
    setDados([]);
    setErro('');
    setLoginData({ assoc_cpf: '', assoc_nasc: '' });
  }

  if (!logado) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <section className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
          <a href="/" className="text-blue-600 font-bold mb-4 block underline">
            ← Voltar ao site
          </a>

          <h1 className="text-2xl font-black text-blue-900 text-center mb-2">
            Área do Associado
          </h1>

          <p className="text-center text-gray-500 text-sm mb-6">
            Acesse com CPF e data de nascimento.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder="CPF"
              value={loginData.assoc_cpf}
              onChange={(e) =>
                setLoginData({ ...loginData, assoc_cpf: e.target.value })
              }
              className="w-full border rounded-xl p-3"
              required
            />

            <input
              type="text"
              placeholder="DD-MM-AAAA"
              value={loginData.assoc_nasc}
              onChange={(e) =>
                setLoginData({ ...loginData, assoc_nasc: e.target.value })
              }
              className="w-full border rounded-xl p-3"
              required
            />

            {erro && <p className="text-red-600 font-bold text-sm">{erro}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-700 disabled:opacity-60 text-white font-black py-3 rounded-xl"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-black">Central do Associado</h1>
            <p className="text-sm text-gray-500">
              Consulte seus contratos, titulares e status do plano.
            </p>
          </div>

          <button onClick={sair} className="text-red-600 underline text-sm">
            Sair
          </button>
        </div>

        <div className="grid gap-4">
          {dados.map((d, i) => {
            const status = d.status_titular || d.status_venda || 'pendente';
            const ativo = statusAtivo(status);
            const valor = d.valor ?? d.vl_total;

            return (
              <div
                key={`${d.num_contrato}-${d.tit_cpf || i}`}
                className="bg-white p-6 rounded-xl border shadow-sm"
              >
                <div className="flex flex-col md:flex-row md:justify-between gap-4">
                  <div>
                    <p className="font-black text-lg">
                      Contrato: {d.num_contrato}
                    </p>

                    <p className="text-sm text-gray-600">
                      Plano: {d.plano_nome || nomePlano(d.cod_plano)}
                    </p>

                    {valor !== undefined && valor !== '' && (
                      <p className="text-sm text-gray-600">
                        Mensalidade: {formatarMoeda(valor)}
                      </p>
                    )}

                    {d.dia_vencimento && (
                      <p className="text-sm text-gray-600">
                        Vencimento mensal: dia {d.dia_vencimento}
                      </p>
                    )}

                    {d.tit_nome && (
                      <p className="mt-3 font-semibold">
                        Titular: {d.tit_nome}
                      </p>
                    )}

                    <p className="text-sm text-gray-500">
                      Email: {d.tit_email || '-'} | Tel: {d.tit_tel || '-'}
                    </p>

                    <p
                      className={`mt-2 font-bold text-xs ${
                        ativo ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      STATUS: {String(status).toUpperCase()}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 md:items-end">
                    {d.url_pagamento && !ativo && (
                      <a
                        href={d.url_pagamento}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-center"
                      >
                        2ª via do boleto
                      </a>
                    )}

                    {podeEditar && (
                      <button
                        onClick={() => {
                          setEditando(d);
                          setEditData({
                            tit_nome: d.tit_nome || '',
                            tit_email: d.tit_email || '',
                            tit_tel: d.tit_tel || '',
                          });
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold"
                      >
                        Editar titular
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {editando && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm space-y-3">
            <h2 className="font-black">Editar Dados do Titular</h2>

            <input
              type="text"
              value={editData.tit_nome}
              onChange={(e) =>
                setEditData({ ...editData, tit_nome: e.target.value })
              }
              className="w-full border p-2 rounded"
              placeholder="Nome do titular"
            />

            <input
              type="email"
              value={editData.tit_email}
              onChange={(e) =>
                setEditData({ ...editData, tit_email: e.target.value })
              }
              className="w-full border p-2 rounded"
              placeholder="E-mail"
            />

            <input
              type="text"
              value={editData.tit_tel}
              onChange={(e) =>
                setEditData({ ...editData, tit_tel: e.target.value })
              }
              className="w-full border p-2 rounded"
              placeholder="Telefone"
            />

            <div className="flex gap-2">
              <button
                onClick={salvarTitular}
                disabled={loading}
                className="flex-1 bg-green-600 disabled:opacity-60 text-white p-2 rounded"
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>

              <button
                onClick={() => setEditando(null)}
                disabled={loading}
                className="flex-1 bg-gray-200 p-2 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}