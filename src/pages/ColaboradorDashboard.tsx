import { useState, useEffect } from 'react';
import axios from 'axios';

const WEBHOOK_UPDATE_COLAB =
  'https://n8n.saintsolution.com.br/webhook/edita-colab';

const WEBHOOK_DADOS_COLAB =
  'https://n8n.saintsolution.com.br/webhook/get-dados-colaborador';

const WEBHOOK_LOGIN_COLAB =
  'https://n8n.saintsolution.com.br/webhook/login_dash_colab';


function formatCod(value: any) {
  if (value === null || value === undefined || value === '') return '';

  return String(value).replace(/\D/g, '').padStart(4, '0');
}

function somenteNumeros(value: any) {
  return String(value ?? '').replace(/\D/g, '');
}

function normalizarCpf(value: any) {
  return somenteNumeros(value).slice(0, 11);
}

function dinheiro(valor: any) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function asArray(value: any) {
  return Array.isArray(value) ? value : [];
}

function normalizarPayload(data: any) {
  let payload = data;

  if (Array.isArray(payload)) payload = payload[0];
  if (payload?.json) payload = payload.json;
  if (payload?.body) payload = payload.body;

  return {
    status: payload?.status || 'sucesso',
    cod_colab: formatCod(payload?.cod_colab),
    colaborador: payload?.colaborador || {},
    vendas: asArray(payload?.vendas),
    clientes: asArray(payload?.clientes),
    titulares: asArray(payload?.titulares),
    colaboradores: asArray(payload?.colaboradores),
    comissoes: asArray(payload?.comissoes),
    dashboard: payload?.dashboard || {},
    resumo: payload?.resumo || {},
  };
}

export function ColaboradorDashboard() {
  const [logado, setLogado] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    cpf_colab: '',
    senha_login: '',
  });

  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [dados, setDados] = useState<any>(null);
  const [aberto, setAberto] = useState<string | null>('vendas');

  const [editandoDados, setEditandoDados] = useState(false);
  const [salvandoDados, setSalvandoDados] = useState(false);

  const [editData, setEditData] = useState({
    email_colab: '',
    tel_colab: '',
    pix_colab: '',
  });

  useEffect(() => {
    const cod = localStorage.getItem('cod_colab');

    if (cod) {
      setLogado(true);
      buscarDados(cod);
    }
  }, []);

  const buscarDados = async (cod: string) => {
    setLoading(true);

    try {
      const response = await axios.post(
        WEBHOOK_DADOS_COLAB,
        {
          cod_colab: formatCod(cod),
        },
        {
          timeout: 15000,
        }
      );

      setDados(normalizarPayload(response.data));
    } catch (e) {
      console.error(e);
      alert('Erro ao buscar dados do dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (loading) return;

    const cpfNormalizado = normalizarCpf(formData.cpf_colab);
    const senha = formData.senha_login;

    if (cpfNormalizado.length !== 11) {
      alert('Digite um CPF válido com 11 números.');
      return;
    }

    if (!senha.trim()) {
      alert('Digite sua senha.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        WEBHOOK_LOGIN_COLAB,
        {
          cpf_colab: cpfNormalizado,
          senha_login: senha,
        },
        {
          timeout: 15000,
        }
      );

      const login = Array.isArray(response.data)
        ? response.data[0]
        : response.data;

      if (login?.status === 'sucesso') {
        const codFormatado = formatCod(login.cod_colab);

        localStorage.setItem('cod_colab', codFormatado);
        localStorage.setItem('nome_colab', login.nome_colab || '');

        setLogado(true);

        await buscarDados(codFormatado);
      } else {
        alert('CPF ou senha incorretos.');
      }
    } catch (e) {
      console.error(e);
      alert('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleLogin();
    }
  };

  if (!logado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="p-8 bg-white rounded-2xl shadow-xl w-full max-w-sm">
          <a
            href="/"
            className="text-blue-600 font-bold mb-4 block underline"
          >
            ← Voltar ao site
          </a>

          <h2 className="text-xl font-bold mb-6 text-center">
            Acesso Colaborador
          </h2>

          <input
            className="w-full p-3 mb-4 border rounded-lg"
            type="text"
            inputMode="numeric"
            autoComplete="username"
            placeholder="CPF"
            maxLength={14}
            value={formData.cpf_colab}
            onChange={(e) =>
              setFormData({
                ...formData,
                cpf_colab: e.target.value,
              })
            }
            onKeyDown={handleLoginKeyDown}
          />

          <div className="relative mb-6">
            <input
              className="w-full p-3 pr-24 border rounded-lg"
              type={mostrarSenha ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Senha"
              value={formData.senha_login}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  senha_login: e.target.value,
                })
              }
              onKeyDown={handleLoginKeyDown}
            />

            <button
              type="button"
              onClick={() => setMostrarSenha((valorAtual) => !valorAtual)}
              className="absolute inset-y-0 right-0 px-3 text-sm font-bold text-blue-700 hover:text-blue-900"
              aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
              title={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {mostrarSenha ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>

          <button
            type="button"
            className={`w-full p-3 font-bold rounded-lg text-white ${
              loading ? 'bg-gray-400' : 'bg-blue-700 hover:bg-blue-800'
            }`}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Validando...' : 'Entrar'}
          </button>
        </div>
      </div>
    );
  }

  if (!dados) {
    return (
      <div className="p-20 text-center font-bold">
        {loading ? 'Carregando seus dados...' : 'Nenhum dado carregado.'}
      </div>
    );
  }

  const codLogado = formatCod(
    dados.cod_colab || localStorage.getItem('cod_colab')
  );

  const colaboradorLogado = dados.colaborador || {};
  const codPai = formatCod(colaboradorLogado.cod_pai || '');

  const vendas = asArray(dados.vendas);
  const clientes = asArray(dados.clientes);
  const titulares = asArray(dados.titulares);
  const colaboradores = asArray(dados.colaboradores);
  const comissoes = asArray(dados.comissoes);
  const resumo = dados.resumo || {};

  const totalVendas =
    resumo.total_vendas ??
    resumo.total_vendido ??
    vendas.reduce(
      (acc: number, v: any) => acc + Number(v.vl_total || 0),
      0
    );

  const totalAReceber =
    resumo.total_a_receber ??
    comissoes
      .filter(
        (c: any) =>
          String(c.status_comissao || '')
            .trim()
            .toLowerCase() === 'pendente'
      )
      .reduce(
        (acc: number, c: any) =>
          acc + Number(c.valor_dashboard ?? c.vl_comissao ?? 0),
        0
      );

  const totalRecebido =
    resumo.total_recebido ??
    comissoes
      .filter((c: any) => {
        const status = String(c.status_comissao || '')
          .trim()
          .toLowerCase();

        return (
          status === 'paga' ||
          status === 'pago' ||
          status === 'recebida' ||
          status === 'recebido'
        );
      })
      .reduce(
        (acc: number, c: any) =>
          acc + Number(c.valor_dashboard ?? c.vl_comissao ?? 0),
        0
      );

  function abrirEdicaoDados() {
    setEditData({
      email_colab: colaboradorLogado.email_colab || '',
      tel_colab: colaboradorLogado.tel_colab || '',
      pix_colab: colaboradorLogado.pix_colab || '',
    });

    setEditandoDados(true);
  }

  async function salvarDadosColab() {
    setSalvandoDados(true);

    try {
      await axios.post(
        WEBHOOK_UPDATE_COLAB,
        {
          cod_colab: codLogado,
          email_colab: editData.email_colab,
          tel_colab: editData.tel_colab,
          pix_colab: editData.pix_colab,
        },
        {
          timeout: 15000,
        }
      );

      setDados((prev: any) => ({
        ...prev,
        colaborador: {
          ...prev.colaborador,
          email_colab: editData.email_colab,
          tel_colab: editData.tel_colab,
          pix_colab: editData.pix_colab,
        },
      }));

      setEditandoDados(false);
      alert('Dados atualizados com sucesso!');
    } catch (e) {
      console.error(e);
      alert('Erro ao atualizar seus dados.');
    } finally {
      setSalvandoDados(false);
    }
  }

  const Toggle = ({ id, titulo, children }: any) => (
    <div className="bg-white rounded-xl shadow border border-slate-200 mb-6 overflow-hidden">
      <button
        type="button"
        onClick={() => setAberto(aberto === id ? null : id)}
        className="w-full flex justify-between items-center p-6 text-left"
      >
        <h2 className="text-xl font-bold">{titulo}</h2>

        <span className="text-2xl">
          {aberto === id ? '−' : '+'}
        </span>
      </button>

      {aberto === id && (
        <div className="px-6 pb-6">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen p-8 bg-slate-50">
      <div className="flex justify-between items-start mb-8 gap-6">
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">
            Que bom te ver por aqui!
          </p>

          <h1 className="text-2xl font-black">
            Olá,{' '}
            {localStorage.getItem('nome_colab') ||
              colaboradorLogado.nome_colab ||
              'colaborador'}
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Seu código de colaborador: <strong>{codLogado}</strong>
          </p>

          <p className="text-sm text-slate-500 mt-1">
            Você pertence à célula: <strong>{codPai || '0001'}</strong>
          </p>

          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={abrirEdicaoDados}
              className="text-sm bg-blue-700 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-800"
            >
                         Editar meus dados
            </button>

            <a
              href="/material-promocional"
              className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700"
            >
              Material promocional
            </a>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs font-semibold text-blue-800 uppercase mb-1">
              Seu link de vendas:
            </p>

            <a
              href={`https://consultoque.com.br/${codLogado}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 font-bold hover:underline break-all"
            >
              https://consultoque.com.br/{codLogado}
            </a>
          </div>

          {editandoDados && (
            <div className="mt-4 p-4 bg-white border border-slate-300 rounded-xl shadow-sm max-w-xl">
              <h3 className="font-black text-gray-900 mb-3">
                Editar meus dados
              </h3>

              <div className="space-y-3">
                <InputEdit
                  label="E-mail"
                  type="email"
                  value={editData.email_colab}
                  onChange={(value: string) =>
                    setEditData({
                      ...editData,
                      email_colab: value,
                    })
                  }
                />

                <InputEdit
                  label="Telefone / WhatsApp"
                  type="tel"
                  value={editData.tel_colab}
                  onChange={(value: string) =>
                    setEditData({
                      ...editData,
                      tel_colab: value,
                    })
                  }
                />

                <InputEdit
                  label="Chave Pix"
                  type="text"
                  value={editData.pix_colab}
                  onChange={(value: string) =>
                    setEditData({
                      ...editData,
                      pix_colab: value,
                    })
                  }
                />

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={salvarDadosColab}
                    disabled={salvandoDados}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold disabled:opacity-60"
                  >
                    {salvandoDados ? 'Salvando...' : 'Salvar'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditandoDados(false)}
                    className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <a
            href="/"
            className="text-sm text-blue-700 underline font-semibold"
          >
            Início do Site
          </a>

          <button
            type="button"
            className="text-sm text-red-600 underline"
            onClick={() => {
              localStorage.removeItem('cod_colab');
              localStorage.removeItem('nome_colab');
              window.location.href = '/';
            }}
          >
            Sair
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-10">
        <Card
          titulo="Vendas"
          valor={resumo.qtd_vendas ?? vendas.length}
        />

        <Card
          titulo="Planos Pagos"
          valor={resumo.qtd_planos_pagos ?? 0}
        />

        <Card
          titulo="Não Pagos"
          valor={resumo.qtd_planos_nao_pagos ?? 0}
        />

        <Card
          titulo="A Receber"
          valor={dinheiro(totalAReceber)}
          destaque
        />

        <Card
          titulo="Recebido"
          valor={dinheiro(totalRecebido)}
        />

        <Card
          titulo="Filhos"
          valor={resumo.qtd_filhos ?? colaboradores.length}
        />
      </div>

      <Toggle id="vendas" titulo="Vendas realizadas">
        <Tabela
          colunas={[
            'Contrato',
            'Data',
            'Associado',
            'CPF Pagador',
            'Tipo Plano',
            'Tit. Ind',
            'Tit. Fam',
            'Valor',
            'Status',
          ]}
          linhas={vendas.map((v: any) => [
            v.num_contrato,
            v.dt_venda,
            v.assoc_nome,
            v.assoc_cpf,
            v.tipo_plano,
            v.tit_ind,
            v.tit_fam,
            dinheiro(v.vl_total),
            v.status_venda,
          ])}
        />
      </Toggle>

      <Toggle id="clientes" titulo="Clientes e cobranças">
        <Tabela
          colunas={[
            'Contrato',
            'Cliente',
            'CPF',
            'E-mail',
            'Telefone',
            'Plano',
            'Valor',
            'Status',
            'Vencimento',
            'Cobrança',
          ]}
          linhas={clientes.map((cliente: any) => [
            cliente.num_contrato,
            cliente.assoc_nome,
            cliente.assoc_cpf,
            cliente.assoc_email,
            cliente.assoc_tel,
            cliente.tipo_plano,
            dinheiro(cliente.vl_total),
            cliente.status_venda,
            cliente.dia_vencimento,
            cliente.url_pagamento ? (
              <a
                href={cliente.url_pagamento}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 font-bold underline"
              >
                Abrir
              </a>
            ) : (
              '-'
            ),
          ])}
        />
      </Toggle>

      <Toggle id="titulares" titulo="Titulares vinculados">
        <Tabela
          colunas={[
            'Contrato',
            'Titular',
            'CPF',
            'Nascimento',
            'E-mail',
            'Telefone',
            'Código Plano',
            'Status',
          ]}
          linhas={titulares.map((t: any) => [
            t.num_contrato,
            t.tit_nome,
            t.tit_cpf,
            t.tit_nasc,
            t.tit_email,
            t.tit_tel,
            t.cod_plano,
            t.status_titular,
          ])}
        />
      </Toggle>

      <Toggle id="rede" titulo="Filhos diretos">
        <Tabela
          colunas={[
            'Código',
            'Nome',
            'E-mail',
            'Telefone',
            'Código Pai',
            'CPF',
          ]}
          linhas={colaboradores.map((c: any) => [
            formatCod(c.cod_colab),
            c.nome_colab,
            c.email_colab,
            c.tel_colab,
            formatCod(c.cod_pai),
            c.cpf_colab,
          ])}
        />
      </Toggle>

      <Toggle id="comissoes" titulo="Comissões e valores">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <Card
            titulo="Total vendido"
            valor={dinheiro(totalVendas)}
          />

          <Card
            titulo="Comissão direta"
            valor={dinheiro(resumo.total_comissao_direta || 0)}
          />

          <Card
            titulo="Comissão da equipe"
            valor={dinheiro(resumo.total_comissao_pai || 0)}
          />

          <Card
            titulo="Total de comissões"
            valor={dinheiro(resumo.total_comissoes || 0)}
          />

          <Card
            titulo="Recebido"
            valor={dinheiro(totalRecebido)}
          />

          <Card
            titulo="A receber"
            valor={dinheiro(totalAReceber)}
            destaque
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-slate-50 border rounded-xl p-4">
            <h3 className="font-bold mb-3">
              Comissões por tipo
            </h3>

            <Tabela
              colunas={['Tipo', 'Valor']}
              linhas={Object.entries(
                resumo.comissoes_por_tipo || {}
              ).map(([tipo, valor]: any) => [
                tipo,
                dinheiro(valor),
              ])}
            />
          </div>

          <div className="bg-slate-50 border rounded-xl p-4">
            <h3 className="font-bold mb-3">
              Comissões por pagamento
            </h3>

            <Tabela
              colunas={['Data', 'Valor']}
              linhas={(resumo.comissoes_por_pagamento || []).map(
                (item: any) => [
                  item.data,
                  dinheiro(item.valor),
                ]
              )}
            />
          </div>
        </div>

        <Tabela
          colunas={[
            'Data',
            'Contrato',
            'Origem',
            'Tipo Plano',
            'Tipo Comissão',
            'Base',
            '%',
            'Valor recebido',
            'Status',
            'Pagamento',
          ]}
          linhas={comissoes.map((c: any) => [
            c.dt_comissao,
            c.num_contrato,
            c.origem_comissao === 'FILHO'
              ? 'Comissão da equipe'
              : 'Comissão direta',
            c.tipo_plano,
            c.tipo_comissao,
            dinheiro(c.vl_total || c.vl_base),
            c.origem_comissao === 'FILHO'
              ? '10%'
              : `${c.perc_comissao || 0}%`,
            dinheiro(
              c.valor_dashboard ??
              c.vl_comissao ??
              0
            ),
            c.status_comissao,
            c.dt_prev_pagamento ||
              c.dt_prev__pagamento ||
              c.dt_pagamento ||
              '-',
          ])}
        />
      </Toggle>
    </div>
  );
}

function InputEdit({ label, type, value, onChange }: any) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-1">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-lg p-3"
      />
    </div>
  );
}

function Card({ titulo, valor, destaque = false }: any) {
  return (
    <div className="p-6 bg-white rounded-xl shadow border border-slate-200">
      <p className="text-slate-500 text-sm">
        {titulo}
      </p>

      <p
        className={`text-3xl font-bold mt-2 ${
          destaque ? 'text-blue-700' : ''
        }`}
      >
        {valor}
      </p>
    </div>
  );
}

function Tabela({ colunas, linhas }: any) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-100 text-left">
            {colunas.map((c: string, i: number) => (
              <th
                key={i}
                className="p-3 border"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {linhas.length > 0 ? (
            linhas.map((linha: any[], i: number) => (
              <tr key={i}>
                {linha.map((celula: any, j: number) => (
                  <td
                    key={j}
                    className="p-3 border"
                  >
                    {celula || '-'}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                className="p-3 border text-center"
                colSpan={colunas.length}
              >
                Nenhum registro encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}