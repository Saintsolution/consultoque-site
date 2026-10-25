import { enviarIntegracao } from '@/services/http';
import { AssociadoDashboard_ASSOCIADO_DASHBOARD_URL as ASSOCIADO_DASHBOARD_URL, AssociadoDashboard_ASSOCIADO_EDITAR_DADOS_URL as ASSOCIADO_EDITAR_DADOS_URL, AssociadoDashboard_ASSOCIADO_INCLUIR_TITULAR_URL as ASSOCIADO_INCLUIR_TITULAR_URL, AssociadoDashboard_ASSOCIADO_EXCLUIR_TITULAR_URL as ASSOCIADO_EXCLUIR_TITULAR_URL } from '@/services/endpoints';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  FileText,
  LogOut,
  Mail,
  Phone,
  Printer,
  RefreshCw,
  ShieldCheck,
  UserRound,
  UsersRound,
  WalletCards,
  Loader2,
  Pencil,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react';

import { somenteNumerosCpf, validarCpf } from '@/lib/cpf';
import { consultarCpfTitular } from '@/lib/consultaCpf';


  






const CHAVE_SESSAO = 'associado_sessao';
const CHAVE_TOKEN = 'associado_token_sessao';

type SessaoAssociado = {
  token_sessao: string;
  token_expira?: string;
  tipo_usuario?: string;
  cpf_assoc?: string;
  nome_assoc?: string;
  email_assoc?: string;
};

type DadosAssociado = {
  nome_assoc?: string;
  cpf_assoc?: string;
  nasc_assoc?: string;
  email_assoc?: string;
  tel_assoc?: string;
  empresa?: string;
  cnpj?: string;
};

type DadosContrato = {
  num_contrato?: string;
  qtd_individual?: number | string;
  qtd_familiar?: number | string;
  vl_individual?: number | string;
  vl_familiar?: number | string;
  vl_total?: number | string;
  dia_vencimento?: number | string;
  inicio_contrato?: string;
  status_pagamento?: string;
};

type DadosCobranca = {
  vl_cobranca?: number | string;
  vencimento?: string;
  dt_cliente_pagou?: string;
  url_pagamento?: string;
  status_pagamento?: string;
};

type ProximoPagamento = {
  vencimento?: string;
  valor?: number | string;
};

type ProximaCobranca = {
  id_asaas_cobranca?: string;
  id_asaas_assinatura?: string;
  valor?: number | string;
  vencimento?: string;
  status?: string;
  url_pagamento?: string;
};

type Titular = {
  cpf_titular?: string;
  nome_titular?: string;
  nasc_titular?: string;
  email_titular?: string;
  tel_titular?: string;
  cod_plano?: string | number;
  tipo_plano?: string;
  status_titular?: string;
  inicio_vigencia?: string;
  exclusao_programada?: boolean;
  dt_inativacao_programada?: string;
  status_exclusao?: string;
  id_exclusao?: string;
};

type EdicaoDados = {
  alvo_edicao: 'ASSOCIADO' | 'TITULAR';
  titulo: string;
  cpf_titular?: string;
  email: string;
  telefone: string;
};

type EditarDadosResponse = {
  sucesso?: boolean;
  codigo?: string;
  mensagem?: string;
};

type InclusaoTitular = {
  nome_titular: string;
  cpf_titular: string;
  nasc_titular: string;
  email_titular: string;
  tel_titular: string;
  cod_plano: '2878' | '2880';
};

type InclusaoResponse = {
  sucesso?: boolean;
  codigo?: string;
  mensagem?: string;
  id_extra?: string;
  valor?: number | string;
  val_cobranca?: number | string;
  vencimento?: string;
  url_pagamento?: string;
  email?: string;
  dias_prorata?: number | string;
  proximo_vencimento?: string;
  pode_incluir_titular?: boolean;
  pode_criar_boleto_inclusao?: boolean;
};

type ExclusaoResponse = {
  sucesso?: boolean;
  codigo?: string;
  mensagem?: string;
};

type DashboardResponse = {
  sucesso?: boolean;
  autenticado?: boolean;
  tipo_usuario?: string;
  status?: string;
  codigo?: string;
  mensagem?: string;
  associado?: DadosAssociado;
  contrato?: DadosContrato;
  cobranca?: DadosCobranca;
  proximo_pagamento?: ProximoPagamento;
  proximas_cobrancas?: ProximaCobranca[];
  titulares?: Titular[];
  quantidade_titulares?: number | string;
  quantidade_exclusoes_programadas?: number | string;
  gerado_em?: string;

  // Compatibilidade com respostas anteriores.
  venda?: DadosAssociado;
  dados_associado?: DadosAssociado;
  beneficiarios?: Titular[];
};

function texto(valor: unknown) {
  return String(valor ?? '').trim();
}

function numero(valor: unknown) {
  if (typeof valor === 'number') return valor;

  const normalizado = texto(valor)
    .replace(/R\$/gi, '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.');

  const convertido = Number(normalizado);
  return Number.isFinite(convertido) ? convertido : 0;
}

function formatarCpf(valor?: string) {
  const cpf = texto(valor).replace(/\D/g, '').slice(0, 11);
  if (cpf.length !== 11) return valor || 'Não informado';

  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatarCnpj(valor?: string) {
  const cnpj = texto(valor).replace(/\D/g, '').slice(0, 14);
  if (cnpj.length !== 14) return valor || 'Não informado';

  return cnpj.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    '$1.$2.$3/$4-$5'
  );
}

function formatarTelefone(valor?: string) {
  const telefone = texto(valor).replace(/\D/g, '');

  if (telefone.length === 11) {
    return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }

  if (telefone.length === 10) {
    return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  return valor || 'Não informado';
}

function formatarMoeda(valor: unknown) {
  return numero(valor).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatarData(valor?: string) {
  if (!valor) return 'Não informado';

  const dataTexto = String(valor).trim();

  // O n8n já entrega estas datas em formato brasileiro.
  // Não usar new Date() nesses casos: o navegador pode interpretar
  // DD/MM/AAAA como MM/DD/AAAA.
  const brasileira = dataTexto.match(
    /^(\d{2})\/(\d{2})\/(\d{4})/
  );

  if (brasileira) {
    return `${brasileira[1]}/${brasileira[2]}/${brasileira[3]}`;
  }

  // Datas ISO, com ou sem horário.
  const iso = dataTexto.match(
    /^(\d{4})-(\d{2})-(\d{2})/
  );

  if (iso) {
    return `${iso[3]}/${iso[2]}/${iso[1]}`;
  }

  return dataTexto;
}

function dataInputParaBr(valor: string) {
  const partes = valor.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return partes ? `${partes[3]}/${partes[2]}/${partes[1]}` : valor;
}

function dataOrdenavelBr(valor?: string) {
  const dataTexto = texto(valor);
  if (!dataTexto) return 0;

  const brasileira = dataTexto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (brasileira) {
    return new Date(
      Number(brasileira[3]),
      Number(brasileira[2]) - 1,
      Number(brasileira[1])
    ).getTime();
  }

  const iso = dataTexto.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    return new Date(
      Number(iso[1]),
      Number(iso[2]) - 1,
      Number(iso[3])
    ).getTime();
  }

  return 0;
}

function formatarDataHora(valor?: string) {
  if (!valor) return 'Não informado';

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return valor;

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(data);
}

function primeiroNome(nome?: string) {
  return texto(nome).split(/\s+/)[0] || 'Associado';
}

function statusPagamentoExibicao(status?: string) {
  const normalizado = texto(status).toUpperCase();

  if (!normalizado) return 'Não informado';
  return normalizado === 'PAGO' ? 'PAGO' : 'NÃO PAGO';
}

function statusPositivo(status?: string) {
  return ['PAGO', 'ATIVO', 'ATIVA'].includes(texto(status).toUpperCase());
}

function nomePlano(titular: Titular) {
  const recebido = texto(titular.tipo_plano).toUpperCase();
  if (recebido) return recebido;

  const codigo = texto(titular.cod_plano);
  if (codigo === '2878') return 'INDIVIDUAL';
  if (codigo === '2880') return 'FAMILIAR';

  return codigo || 'Não informado';
}

function lerSessao(): SessaoAssociado | null {
  try {
    const salva = sessionStorage.getItem(CHAVE_SESSAO);
    const tokenSeparado = sessionStorage.getItem(CHAVE_TOKEN);

    if (!salva && !tokenSeparado) return null;

    const dados = salva ? (JSON.parse(salva) as SessaoAssociado) : null;
    const token = texto(dados?.token_sessao || tokenSeparado);

    if (!token) return null;

    return {
      ...dados,
      token_sessao: token,
    };
  } catch {
    return null;
  }
}

function limparSessao() {
  sessionStorage.removeItem(CHAVE_SESSAO);
  sessionStorage.removeItem(CHAVE_TOKEN);
}

export default function AssociadoDashboard() {
  const navigate = useNavigate();
  const [sessao, setSessao] = useState<SessaoAssociado | null>(() =>
    lerSessao()
  );
  const [resposta, setResposta] = useState<DashboardResponse | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const [edicao, setEdicao] =
  useState<EdicaoDados | null>(null);

  const [salvandoEdicao, setSalvandoEdicao] =
  useState(false);

  const [erroEdicao, setErroEdicao] =
  useState<string | null>(null);

  const [inclusaoAberta, setInclusaoAberta] = useState(false);
  const [inclusao, setInclusao] = useState<InclusaoTitular>({
    nome_titular: '',
    cpf_titular: '',
    nasc_titular: '',
    email_titular: '',
    tel_titular: '',
    cod_plano: '2878',
  });
  const [cpfInclusaoValidado, setCpfInclusaoValidado] = useState<string | null>(null);
  const [consultandoCpfInclusao, setConsultandoCpfInclusao] = useState(false);
  const consultaCpfVersao = useRef(0);
  const [salvandoInclusao, setSalvandoInclusao] = useState(false);
  const [erroInclusao, setErroInclusao] = useState<string | null>(null);
  const [resultadoInclusao, setResultadoInclusao] =
    useState<InclusaoResponse | null>(null);

  const [titularExclusao, setTitularExclusao] = useState<Titular | null>(null);
  const [excluindoTitular, setExcluindoTitular] = useState(false);
  const [erroExclusao, setErroExclusao] = useState<string | null>(null);

  const [ordenacaoTitulares, setOrdenacaoTitulares] = useState<
    'nome-asc' | 'nome-desc' | 'inclusao-desc' | 'inclusao-asc'
  >('nome-asc');
  const [titularesAbertos, setTitularesAbertos] = useState<Set<string>>(
    () => new Set()
  );


  const sair = useCallback(() => {
    limparSessao();
    navigate('/associado', { replace: true });
  }, [navigate]);

  const carregarDashboard = useCallback(async () => {
    const sessaoAtual = lerSessao();

    if (!sessaoAtual?.token_sessao) {
      setSessao(null);
      return;
    }

    setSessao(sessaoAtual);
    setCarregando(true);
    setAviso(null);

    try {
      const response = await enviarIntegracao(ASSOCIADO_DASHBOARD_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Associado-Token': sessaoAtual.token_sessao,
        },
        body: JSON.stringify({
          cpf_assoc: sessaoAtual.cpf_assoc,
          token_sessao: sessaoAtual.token_sessao,
        }),
      });

      if (response.status === 401 || response.status === 403) {
        limparSessao();
        navigate('/associado', { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error('O serviço do painel ainda não respondeu.');
      }

      const json: unknown = await response.json();
      const primeiro = Array.isArray(json) ? json[0] : json;
      const dados =
        primeiro && typeof primeiro === 'object' && 'json' in primeiro
          ? (primeiro as { json: DashboardResponse }).json
          : (primeiro as DashboardResponse);

      if (dados?.sucesso === false || dados?.autenticado === false) {
        throw new Error(dados.mensagem || 'Não foi possível carregar o painel.');
      }

      setResposta(dados || {});
    } catch (erro) {
      console.error('Erro ao carregar dashboard do associado:', erro);
      setAviso(
        erro instanceof Error
          ? erro.message
          : 'Não foi possível atualizar os dados agora.'
      );
    } finally {
      setCarregando(false);
    }
  }, [navigate]);

  useEffect(() => {
    void carregarDashboard();
  }, [carregarDashboard]);

  const associado = useMemo<DadosAssociado>(() => {
    const recebido =
      resposta?.associado || resposta?.venda || resposta?.dados_associado || {};

    return {
      cpf_assoc: sessao?.cpf_assoc,
      nome_assoc: sessao?.nome_assoc,
      email_assoc: sessao?.email_assoc,
      ...recebido,
    };
  }, [resposta, sessao]);

  const contrato = resposta?.contrato || {};
  const cobranca = resposta?.cobranca || {};
  const proximaCobranca = [...(resposta?.proximas_cobrancas || [])]
    .filter((item) =>
      ['', 'PENDING', 'OVERDUE', 'PENDENTE', 'VENCIDO', 'VENCIDA', 'NÃO PAGO', 'NAO PAGO'].includes(
        texto(item.status).toUpperCase()
      )
    )
    .sort((a, b) => {
      // Datas ausentes ficam por último; cobranças vencidas continuam prioritárias.
      const vencimentoA = dataOrdenavelBr(a.vencimento) || Infinity;
      const vencimentoB = dataOrdenavelBr(b.vencimento) || Infinity;
      return vencimentoA - vencimentoB;
    })[0];
  const proximoPagamento = proximaCobranca || resposta?.proximo_pagamento || {};
  const proximasCobrancas = proximaCobranca ? [proximaCobranca] : [];
  const titulares = resposta?.titulares || resposta?.beneficiarios || [];

  const titularesOrdenados = useMemo(() => {
    const lista = [...titulares];

    lista.sort((a, b) => {
      if (ordenacaoTitulares === 'nome-asc') {
        return texto(a.nome_titular).localeCompare(texto(b.nome_titular), 'pt-BR');
      }

      if (ordenacaoTitulares === 'nome-desc') {
        return texto(b.nome_titular).localeCompare(texto(a.nome_titular), 'pt-BR');
      }

      const dataA = dataOrdenavelBr(a.inicio_vigencia);
      const dataB = dataOrdenavelBr(b.inicio_vigencia);

      if (ordenacaoTitulares === 'inclusao-desc') {
        return dataB - dataA;
      }

      return dataA - dataB;
    });

    return lista;
  }, [titulares, ordenacaoTitulares]);

  function chaveTitular(titular: Titular) {
    return texto(titular.cpf_titular) || texto(titular.nome_titular);
  }

  function alternarTitular(titular: Titular) {
    const chave = chaveTitular(titular);
    if (!chave) return;

    setTitularesAbertos((atuais) => {
      const proximos = new Set(atuais);
      if (proximos.has(chave)) proximos.delete(chave);
      else proximos.add(chave);
      return proximos;
    });
  }

  function abrirEdicaoAssociado() {
  setErroEdicao(null);

  setEdicao({
    alvo_edicao: 'ASSOCIADO',
    titulo: 'Editar meus dados',
    email: texto(associado.email_assoc),
    telefone: texto(associado.tel_assoc).replace(/\D/g, ''),
  });
}

function abrirEdicaoTitular(titular: Titular) {
  setErroEdicao(null);

  setEdicao({
    alvo_edicao: 'TITULAR',
    titulo: `Editar dados de ${
      titular.nome_titular || 'titular'
    }`,
    cpf_titular: texto(titular.cpf_titular),
    email: texto(titular.email_titular),
    telefone: texto(titular.tel_titular).replace(/\D/g, ''),
  });
}

function fecharEdicao() {
  if (salvandoEdicao) return;

  setEdicao(null);
  setErroEdicao(null);
}
async function salvarEdicao() {
  if (
    !edicao ||
    !sessao?.token_sessao
  ) {
    return;
  }

  setErroEdicao(null);

  const email =
    edicao.email.trim().toLowerCase();

  const telefone =
    edicao.telefone.replace(/\D/g, '');

  const emailValido =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!emailValido) {
    setErroEdicao(
      'Informe um endereço de e-mail válido.'
    );
    return;
  }

  if (
    telefone.length !== 10 &&
    telefone.length !== 11
  ) {
    setErroEdicao(
      'Informe um telefone com DDD.'
    );
    return;
  }

  if (
    edicao.alvo_edicao === 'TITULAR' &&
    !edicao.cpf_titular
  ) {
    setErroEdicao(
      'Não foi possível identificar o titular.'
    );
    return;
  }

  setSalvandoEdicao(true);

  try {
    const response = await enviarIntegracao(
      ASSOCIADO_EDITAR_DADOS_URL,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          'X-Associado-Token':
            sessao.token_sessao,
        },

        body: JSON.stringify({
          alvo_edicao:
            edicao.alvo_edicao,

          cpf_titular:
            edicao.alvo_edicao ===
            'TITULAR'
              ? edicao.cpf_titular
              : undefined,

          email,
          telefone,
        }),
      }
    );

    let data: EditarDadosResponse = {};

    try {
      data = await response.json();
    } catch {
      // Durante o Respond Immediately,
      // o n8n pode não devolver nosso JSON final.
    }

    if (
      !response.ok ||
      data.sucesso === false
    ) {
      throw new Error(
        data.mensagem ||
          'Não foi possível atualizar os dados.'
      );
    }

    setEdicao(null);
    setErroEdicao(null);

    await carregarDashboard();
  } catch (erro) {
    console.error(
      'Erro ao editar dados:',
      erro
    );

    setErroEdicao(
      erro instanceof Error
        ? erro.message
        : 'Não foi possível atualizar os dados.'
    );
  } finally {
    setSalvandoEdicao(false);
  }
}

function invalidarCpfInclusao() {
  consultaCpfVersao.current += 1;
  setCpfInclusaoValidado(null);
  setConsultandoCpfInclusao(false);
}

async function validarCpfInclusao() {
  if (consultandoCpfInclusao || salvandoInclusao) return;
  const cpf = somenteNumerosCpf(inclusao.cpf_titular);
  const versao = ++consultaCpfVersao.current;
  setCpfInclusaoValidado(null);
  setErroInclusao(null);
  setConsultandoCpfInclusao(true);
  try {
    const result = await consultarCpfTitular(cpf);
    if (versao !== consultaCpfVersao.current) return;
    setCpfInclusaoValidado(cpf);
    setInclusao((atual) => ({
      ...atual,
      nome_titular: result.nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase(),
      nasc_titular: String(result.nascimento ?? '').replace(/^(\d{2})\/(\d{2})\/(\d{4})$/, '$3-$2-$1'),
    }));
  } catch (erro) {
    if (versao !== consultaCpfVersao.current) return;
    setErroInclusao(erro instanceof Error ? erro.message : 'Não foi possível validar o CPF.');
  } finally {
    if (versao === consultaCpfVersao.current) setConsultandoCpfInclusao(false);
  }
}

function abrirInclusao() {
  invalidarCpfInclusao();
  setInclusao({
    nome_titular: '',
    cpf_titular: '',
    nasc_titular: '',
    email_titular: '',
    tel_titular: '',
    cod_plano: '2878',
  });
  setErroInclusao(null);
  setResultadoInclusao(null);
  setInclusaoAberta(true);
}

function fecharInclusao() {
  if (salvandoInclusao) return;
  invalidarCpfInclusao();
  setInclusaoAberta(false);
  setErroInclusao(null);
  setResultadoInclusao(null);
}

async function solicitarInclusao() {
  if (!sessao?.token_sessao || salvandoInclusao) return;

  const nome = inclusao.nome_titular.trim();
  const cpf = inclusao.cpf_titular.replace(/\D/g, '');
  const nascimento = inclusao.nasc_titular;
  const email = inclusao.email_titular.trim().toLowerCase();
  const telefone = inclusao.tel_titular.replace(/\D/g, '');

  setErroInclusao(null);

  if (!nome) {
    setErroInclusao('Informe o nome completo do titular.');
    return;
  }
  if (!validarCpf(cpf)) {
    setErroInclusao('Informe um CPF válido.');
    return;
  }
  if (consultandoCpfInclusao || cpfInclusaoValidado !== cpf) {
    setErroInclusao('Valide o CPF do titular antes de solicitar a inclusão.');
    return;
  }
  if (!nascimento) {
    setErroInclusao('Informe a data de nascimento.');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setErroInclusao('Informe um endereço de e-mail válido.');
    return;
  }
  if (telefone.length !== 10 && telefone.length !== 11) {
    setErroInclusao('Informe um telefone com DDD.');
    return;
  }

  setSalvandoInclusao(true);

  try {
    const response = await enviarIntegracao(ASSOCIADO_INCLUIR_TITULAR_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Associado-Token': sessao.token_sessao,
      },
      body: JSON.stringify({
        nome_titular: nome,
        cpf_titular: cpf,
        nasc_titular: dataInputParaBr(nascimento),
        email_titular: email,
        tel_titular: telefone,
        cod_plano: inclusao.cod_plano,
      }),
    });

    if (response.status === 401 || response.status === 403) {
      limparSessao();
      navigate('/associado', { replace: true });
      return;
    }

    const bruto: unknown = await response.json().catch(() => ({}));
    const primeiro = Array.isArray(bruto) ? bruto[0] : bruto;
    const data = (primeiro && typeof primeiro === 'object' && 'json' in primeiro
      ? (primeiro as { json: InclusaoResponse }).json
      : primeiro) as InclusaoResponse;

    if (!response.ok) {
      throw new Error(data?.mensagem || 'Não foi possível gerar o boleto de inclusão.');
    }

    if (data?.sucesso === false) {
      throw new Error(data?.mensagem || 'Não foi possível gerar o boleto de inclusão.');
    }

    setResultadoInclusao(data || {});
  } catch (erro) {
    console.error('Erro ao incluir titular:', erro);
    setErroInclusao(
      erro instanceof Error
        ? erro.message
        : 'Não foi possível solicitar a inclusão.'
    );
  } finally {
    setSalvandoInclusao(false);
  }
}

function abrirExclusao(titular: Titular) {
  setErroExclusao(null);
  setTitularExclusao(titular);
}

function fecharExclusao() {
  if (excluindoTitular) return;
  setTitularExclusao(null);
  setErroExclusao(null);
}

async function confirmarExclusao() {
  if (!sessao?.token_sessao || !titularExclusao?.cpf_titular) return;

  setErroExclusao(null);
  setExcluindoTitular(true);

  try {
    const response = await enviarIntegracao(ASSOCIADO_EXCLUIR_TITULAR_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Associado-Token': sessao.token_sessao,
      },
      body: JSON.stringify({
        cpf_titular: texto(titularExclusao.cpf_titular).replace(/\D/g, ''),
      }),
    });

    if (response.status === 401 || response.status === 403) {
      limparSessao();
      navigate('/associado', { replace: true });
      return;
    }

    const bruto: unknown = await response.json().catch(() => ({}));
    const primeiro = Array.isArray(bruto) ? bruto[0] : bruto;
    const data = (primeiro && typeof primeiro === 'object' && 'json' in primeiro
      ? (primeiro as { json: ExclusaoResponse }).json
      : primeiro) as ExclusaoResponse;

    if (!response.ok || data?.sucesso === false) {
      throw new Error(data?.mensagem || 'Não foi possível excluir o titular.');
    }

    setTitularExclusao(null);
    await carregarDashboard();
  } catch (erro) {
    console.error('Erro ao excluir titular:', erro);
    setErroExclusao(
      erro instanceof Error
        ? erro.message
        : 'Não foi possível excluir o titular.'
    );
  } finally {
    setExcluindoTitular(false);
  }
}

  const quantidadeContratada =
    numero(contrato.qtd_individual) + numero(contrato.qtd_familiar);

  const totalPessoas =
    numero(resposta?.quantidade_titulares) ||
    titulares.length ||
    quantidadeContratada;

  const totalAtivos = titulares.filter((titular) =>
    statusPositivo(titular.status_titular)
  ).length;

  const totalInativos = Math.max(titulares.length - totalAtivos, 0);

  const totalExclusoesProgramadas =
    numero(resposta?.quantidade_exclusoes_programadas) ||
    titulares.filter((titular) => titular.exclusao_programada).length;

  const statusPagamento = statusPagamentoExibicao(
    contrato.status_pagamento || cobranca.status_pagamento
  );

  const pagamentoConfirmado = statusPagamento === 'PAGO';
  const valorUltimaCobranca = cobranca.vl_cobranca || contrato.vl_total;
  const valorMensalAtual = contrato.vl_total || proximoPagamento.valor || valorUltimaCobranca;
  const valorProximoPagamento = proximoPagamento.valor ?? valorMensalAtual;
  const dataUltimoPagamento = cobranca.dt_cliente_pagou
    ? formatarData(cobranca.dt_cliente_pagou)
    : 'Ainda não confirmado';
  const dataProximoPagamento = proximoPagamento.vencimento
    ? formatarData(proximoPagamento.vencimento)
    : 'Não informado';
  const linkPagamento = proximaCobranca
    ? texto(proximaCobranca.url_pagamento)
    : texto(cobranca.url_pagamento);
  
  const diaVencimentoExibicao = contrato.dia_vencimento
    ? `Dia ${String(contrato.dia_vencimento).padStart(2, '0')}`
    : 'Não informado';

  const imprimirRelatorio = useCallback(() => {
    if (!resposta) return;

    const tituloAnterior = document.title;
    const contratoArquivo = texto(contrato.num_contrato) || 'Associado';

    document.title = `Relatorio_ConsulToque_${contratoArquivo}`;
    window.print();
    document.title = tituloAnterior;
  }, [contrato.num_contrato, resposta]);

  if (!sessao) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-16">
        <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            Sessão não encontrada
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Entre novamente para acessar a Área do Associado.
          </p>
          <Link
            to="/associado"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao login
          </Link>
        </div>
      </main>
    );
  }

  if (carregando && !resposta) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="text-center">
          <RefreshCw className="mx-auto h-10 w-10 animate-spin text-emerald-600" />
          <p className="mt-4 font-semibold text-slate-700">
            Carregando sua área do associado...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <style>{`
        .dashboard-print {
          display: none;
        }

        @media print {
          @page {
            size: A4;
            margin: 14mm;
          }

          body {
            background: #ffffff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .dashboard-screen {
            display: none !important;
          }

          .dashboard-print {
            display: block !important;
          }

          .print-avoid-break {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      <div className="dashboard-screen">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
                SIA ConsulToque
              </p>
              <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">
                Olá, {primeiroNome(associado.nome_assoc)}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Voltar ao site</span>
              </a>

              <button
                type="button"
                onClick={() => void carregarDashboard()}
                disabled={carregando}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${carregando ? 'animate-spin' : ''}`}
                />
                <span className="hidden sm:inline">Atualizar</span>
              </button>

              <button
                type="button"
                onClick={sair}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-6 px-5 py-8 sm:px-8">
          {aviso && (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">Não foi possível atualizar agora</p>
                <p className="mt-1">{aviso}</p>
              </div>
            </div>
          )}

          <section
            className={`flex items-start gap-4 rounded-3xl border p-5 shadow-sm sm:items-center sm:p-6 ${
              pagamentoConfirmado
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                : 'border-amber-200 bg-amber-50 text-amber-900'
            }`}
          >
            {pagamentoConfirmado ? (
              <CheckCircle2 className="h-8 w-8 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-8 w-8 shrink-0 text-amber-600" />
            )}
            <div>
              <h2 className="text-lg font-extrabold">
                {pagamentoConfirmado
                  ? 'Pagamento confirmado'
                  : 'Pagamento não confirmado'}
              </h2>
              <p className="mt-1 text-sm leading-relaxed opacity-80">
                {pagamentoConfirmado
                  ? 'Seu contrato está pago. Consulte abaixo as pessoas vinculadas e a situação de cada titular.'
                  : 'Seu cadastro existe, mas o pagamento ainda não foi confirmado. Por isso, os titulares podem aparecer como inativos.'}
              </p>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ResumoCard
              icone={<CreditCard className="h-5 w-5" />}
              titulo="Pagamento"
              valor={statusPagamento}
              detalhe={pagamentoConfirmado ? `Confirmado em ${dataUltimoPagamento}` : dataUltimoPagamento}
              tom={pagamentoConfirmado ? 'positivo' : 'atencao'}
            />
            <ResumoCard
              icone={<WalletCards className="h-5 w-5" />}
              titulo="Total mensal atual"
              valor={formatarMoeda(valorMensalAtual)}
            />
            <ResumoCard
              icone={<CalendarDays className="h-5 w-5" />}
              titulo="Próximo pagamento"
              valor={dataProximoPagamento}
              detalhe={formatarMoeda(valorProximoPagamento)}
              acao={
                linkPagamento ? (
                  <a
                    href={linkPagamento}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Abrir pagamento
                  </a>
                ) : null
              }
            />
            <ResumoCard
              icone={<UsersRound className="h-5 w-5" />}
              titulo="Próximo ciclo"
              valor={`${numero(contrato.qtd_individual)} individuais`}
              detalhe={`${numero(contrato.qtd_familiar)} familiares`}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-3">
            <Painel
              titulo="Contrato e planos"
              icone={<FileText className="h-5 w-5" />}
            >
              <Linha label="Contrato" valor={contrato.num_contrato} />
              <Linha label="Empresa" valor={associado.empresa} />
              {texto(associado.cnpj) && (
                <Linha label="CNPJ" valor={formatarCnpj(associado.cnpj)} />
              )}
              <Linha
                label="Planos individuais"
                valor={`${numero(contrato.qtd_individual)} × ${formatarMoeda(
                  contrato.vl_individual
                )}`}
              />
              <Linha
                label="Planos familiares"
                valor={`${numero(contrato.qtd_familiar)} × ${formatarMoeda(
                  contrato.vl_familiar
                )}`}
              />
              <Linha
                label="Total mensal"
                valor={formatarMoeda(valorMensalAtual)}
                forte
              />
              <Linha
                label="Início do contrato"
                valor={
                  contrato.inicio_contrato
                    ? contrato.inicio_contrato
                    : undefined
                }
              />
            </Painel>

            <Painel
              titulo="Cobrança e próximo pagamento"
              icone={<CreditCard className="h-5 w-5" />}
            >
              <Linha
                label="Situação"
                valor={
                  <StatusBadge
                    status={statusPagamento}
                    positivo={pagamentoConfirmado}
                  />
                }
              />
              <Linha
                label="Última cobrança"
                valor={formatarMoeda(valorUltimaCobranca)}
              />
              <Linha
                label="Pagamento confirmado em"
                valor={dataUltimoPagamento}
              />
              <Linha
                label="Total mensal atual"
                valor={formatarMoeda(valorMensalAtual)}
                forte
              />
              <Linha
                label="Próximo vencimento"
                valor={dataProximoPagamento}
              />
              <Linha
                label="Próximo valor previsto"
                valor={formatarMoeda(valorProximoPagamento)}
                forte
              />
              <Linha
                label="Dia mensal"
                valor={
                  contrato.dia_vencimento
                    ? `Dia ${String(contrato.dia_vencimento).padStart(2, '0')}`
                    : undefined
                }
              />
              <Linha
                label="Início do contrato"
                valor={
                  contrato.inicio_contrato
                    ? contrato.inicio_contrato
                    : undefined
                }
              />

              {linkPagamento && (
                <a
                  href={linkPagamento}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
                >
                  <ExternalLink className="h-4 w-4" />
                  Abrir link de pagamento
                </a>
              )}

              {proximasCobrancas.length > 0 && (
                <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                      Próxima cobrança
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Cobrança aberta com o vencimento mais próximo.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {proximasCobrancas.map((item, indice) => {
                      const link = texto(item.url_pagamento);
                      const chave =
                        texto(item.id_asaas_cobranca) ||
                        `${texto(item.vencimento)}-${indice}`;

                      return (
                        <div
                          key={chave}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="font-bold text-slate-900">
                                {formatarData(item.vencimento) ||
                                  'Vencimento não informado'}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                {formatarMoeda(item.valor)} ·{' '}
                                {texto(item.status) || 'Status não informado'}
                              </p>
                            </div>

                            {link && (
                              <a
                                href={link}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Abrir
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Painel>

            <Painel
  titulo="Seus dados"
  icone={<UserRound className="h-5 w-5" />}
  acao={
    <button
      type="button"
      onClick={abrirEdicaoAssociado}
      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
    >
      <Pencil className="h-3.5 w-3.5" />
      Editar
    </button>
  }
>
              <Linha label="Nome" valor={associado.nome_assoc} />
              <Linha label="CPF" valor={formatarCpf(associado.cpf_assoc)} />
              <Linha label="Nascimento" valor={associado.nasc_assoc} />
              <Linha
                label="E-mail"
                valor={associado.email_assoc}
                icone={<Mail className="h-4 w-4" />}
              />
              <Linha
                label="Telefone"
                valor={formatarTelefone(associado.tel_assoc)}
                icone={<Phone className="h-4 w-4" />}
              />
            </Painel>
          </section>

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <div className="flex items-center gap-2">
                  <UsersRound className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-lg font-bold">Pessoas vinculadas</h2>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Titulares sob a responsabilidade deste contrato.
                </p>
              </div>

              <div className="flex flex-col items-start gap-3 sm:items-end">
                <button
                  type="button"
                  onClick={abrirInclusao}
                  disabled={!pagamentoConfirmado}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  title={
                    pagamentoConfirmado
                      ? 'Incluir novo titular'
                      : 'Regularize o pagamento para incluir um titular'
                  }
                >
                  <UserPlus className="h-4 w-4" />
                  Incluir titular
                </button>

                <div className="flex flex-wrap items-center justify-end gap-2 text-xs font-bold">
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">
                    {titulares.length} no total
                  </span>
                  <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700">
                    {totalAtivos} ativos
                  </span>
                  <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
                    {totalInativos} inativos
                  </span>
                  {totalExclusoesProgramadas > 0 && (
                    <span className="rounded-full bg-orange-50 px-3 py-1.5 text-orange-700">
                      {totalExclusoesProgramadas} exclusões programadas
                    </span>
                  )}
                </div>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  Ordenar por
                  <select
                    value={ordenacaoTitulares}
                    onChange={(evento) =>
                      setOrdenacaoTitulares(
                        evento.target.value as
                          | 'nome-asc'
                          | 'nome-desc'
                          | 'inclusao-desc'
                          | 'inclusao-asc'
                      )
                    }
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500"
                  >
                    <option value="nome-asc">Nome A–Z</option>
                    <option value="nome-desc">Nome Z–A</option>
                    <option value="inclusao-desc">Inclusão mais recente</option>
                    <option value="inclusao-asc">Inclusão mais antiga</option>
                  </select>
                </label>
              </div>
            </div>

            {titulares.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-slate-500">
                Nenhum titular foi encontrado para este contrato.
              </div>
            ) : (
              <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3 sm:p-6">
                {titularesOrdenados.map((titular, indice) => {
                  const ativo = statusPositivo(titular.status_titular);
                  const chave = chaveTitular(titular) || `titular-${indice}`;
                  const aberto = titularesAbertos.has(chave);

                  return (
                    <article
                      key={chave}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                    >
                      <button
                        type="button"
                        onClick={() => alternarTitular(titular)}
                        aria-expanded={aberto}
                        className="flex w-full items-center justify-between gap-3 p-4 text-left transition hover:bg-slate-100"
                      >
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-extrabold text-slate-900 sm:text-base">
                            {titular.nome_titular || 'Nome não informado'}
                          </h3>
                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-slate-500">
                            <span>{nomePlano(titular)}</span>
                            <span aria-hidden="true">·</span>
                            <span className={ativo ? 'text-emerald-700' : 'text-amber-700'}>
                              {titular.status_titular || 'Não informado'}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>
                              Inclusão {titular.inicio_vigencia || 'não informada'}
                            </span>
                          </div>
                          {titular.exclusao_programada && titular.dt_inativacao_programada && (
                            <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-extrabold text-orange-700">
                              <CalendarDays className="h-3.5 w-3.5" />
                              Exclusão programada para {formatarData(titular.dt_inativacao_programada)}
                            </div>
                          )}
                        </div>

                        <ChevronDown
                          className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${
                            aberto ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {aberto && (
                        <div className="border-t border-slate-200 bg-white p-5">
                          <dl className="grid gap-3 text-sm sm:grid-cols-2">
                            <DetalhePessoa
                              label="CPF"
                              valor={formatarCpf(titular.cpf_titular)}
                            />
                            <DetalhePessoa
                              label="Nascimento"
                              valor={titular.nasc_titular || 'Não informado'}
                            />
                            <DetalhePessoa
                              label="E-mail"
                              valor={titular.email_titular || 'Não informado'}
                            />
                            <DetalhePessoa
                              label="Telefone"
                              valor={formatarTelefone(titular.tel_titular)}
                            />
                            <DetalhePessoa
                              label="Plano"
                              valor={nomePlano(titular)}
                            />
                            <DetalhePessoa
                              label="Início da vigência"
                              valor={titular.inicio_vigencia || 'Não informado'}
                            />
                            {titular.exclusao_programada && (
                              <DetalhePessoa
                                label="Exclusão programada"
                                valor={formatarData(titular.dt_inativacao_programada)}
                              />
                            )}
                          </dl>

                          <div className="mt-5 grid gap-2 sm:grid-cols-2">
                            <button
                              type="button"
                              onClick={() => abrirEdicaoTitular(titular)}
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                            >
                              <Pencil className="h-4 w-4" />
                              Editar dados
                            </button>

                            <button
                              type="button"
                              onClick={() => abrirExclusao(titular)}
                              disabled={!ativo || titular.exclusao_programada}
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-700 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                            >
                              <Trash2 className="h-4 w-4" />
                              {!ativo
                                ? 'Já inativo'
                                : titular.exclusao_programada
                                  ? 'Exclusão já programada'
                                  : 'Excluir titular'}
                            </button>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section className="flex flex-col gap-5 rounded-3xl bg-slate-900 p-6 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-emerald-300">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold">Relatório do contrato</h2>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-300">
                  Gere uma versão organizada com associado, cobrança, planos e
                  titulares. Na janela seguinte, escolha “Salvar como PDF” ou
                  envie diretamente para a impressora.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={imprimirRelatorio}
              disabled={!resposta}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3.5 font-bold text-white hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Printer className="h-5 w-5" />
              Salvar relatório em PDF
            </button>
          </section>

          <footer className="flex items-center justify-center gap-2 py-4 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4" />
            Acesso protegido — SIA ConsulToque
          </footer>
        </div>

        {edicao && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-edicao"
          >
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">
                    Atualização cadastral
                  </p>

                  <h2
                    id="titulo-edicao"
                    className="mt-1 text-2xl font-extrabold text-slate-900"
                  >
                    {edicao.titulo}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={fecharEdicao}
                  disabled={salvandoEdicao}
                  aria-label="Fechar edição"
                  className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form
                className="mt-7 space-y-5"
                onSubmit={(evento) => {
                  evento.preventDefault();
                  void salvarEdicao();
                }}
              >
                <div>
                  <label
                    htmlFor="edicao-email"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    E-mail
                  </label>

                  <input
                    id="edicao-email"
                    type="email"
                    autoComplete="email"
                    value={edicao.email}
                    onChange={(evento) =>
                      setEdicao((atual) =>
                        atual
                          ? {
                              ...atual,
                              email: evento.target.value,
                            }
                          : atual
                      )
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edicao-telefone"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Telefone com DDD
                  </label>

                  <input
                    id="edicao-telefone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={edicao.telefone}
                    onChange={(evento) =>
                      setEdicao((atual) =>
                        atual
                          ? {
                              ...atual,
                              telefone:
                                evento.target.value.replace(
                                  /\D/g,
                                  ''
                                ),
                            }
                          : atual
                      )
                    }
                    maxLength={11}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>

                {erroEdicao && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {erroEdicao}
                  </div>
                )}

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={fecharEdicao}
                    disabled={salvandoEdicao}
                    className="rounded-2xl border border-slate-200 px-5 py-3 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={salvandoEdicao}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {salvandoEdicao ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Pencil className="h-5 w-5" />
                    )}

                    {salvandoEdicao
                      ? 'Salvando...'
                      : 'Salvar alterações'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {inclusaoAberta && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-inclusao"
          >
            <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">
                    Alteração do contrato
                  </p>
                  <h2
                    id="titulo-inclusao"
                    className="mt-1 text-2xl font-extrabold text-slate-900"
                  >
                    Incluir titular
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    A inclusão será efetivada após o pagamento do boleto proporcional.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={fecharInclusao}
                  disabled={salvandoInclusao}
                  aria-label="Fechar inclusão"
                  className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {resultadoInclusao ? (
  <div className="mt-7 space-y-5">
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />

        <div>
          <p className="font-extrabold">Boleto disponível</p>
          <p className="mt-1 text-sm leading-relaxed">
            {resultadoInclusao.mensagem ||
              'O titular será ativado após a confirmação do pagamento.'}
          </p>
        </div>
      </div>
    </div>

    <div className="grid gap-3 sm:grid-cols-2">
      <Linha
        label="Valor proporcional"
        valor={formatarMoeda(
          resultadoInclusao.valor ?? resultadoInclusao.val_cobranca
        )}
      />

      <Linha
        label="Vencimento"
        valor={formatarData(resultadoInclusao.vencimento)}
      />
    </div>

    {texto(resultadoInclusao.url_pagamento) && (
      <a
        href={resultadoInclusao.url_pagamento}
        target="_blank"
        rel="noreferrer"
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3.5 font-bold text-white hover:bg-emerald-700"
      >
        <ExternalLink className="h-5 w-5" />
        Abrir boleto
      </a>
    )}

    <button
      type="button"
      onClick={fecharInclusao}
      className="w-full rounded-2xl border border-slate-200 px-5 py-3 font-bold text-slate-700 hover:bg-slate-50"
    >
      Fechar
    </button>
  </div>
) : (
                <form
                  className="mt-7 space-y-5"
                  onSubmit={(evento) => {
                    evento.preventDefault();
                    void solicitarInclusao();
                  }}
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Nome completo
                      </label>
                      <input
                        value={inclusao.nome_titular}
                        disabled={salvandoInclusao || consultandoCpfInclusao || cpfInclusaoValidado !== inclusao.cpf_titular}
                        onChange={(evento) =>
                          setInclusao((atual) => ({
                            ...atual,
                            nome_titular: evento.target.value,
                          }))
                        }
                        className="w-full disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                      />
                    </div>

                    <div className="rounded-2xl border-2 border-emerald-400 bg-emerald-50 p-4">
                      <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-emerald-700">Comece por aqui</p>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        CPF
                      </label>
                      <p id="orientacao-cpf-inclusao" className="mb-3 text-sm text-emerald-800">
                        Informe e valide o CPF para liberar os demais campos.
                      </p>
                      <input
                        inputMode="numeric"
                        aria-describedby="orientacao-cpf-inclusao"
                        value={inclusao.cpf_titular}
                        disabled={salvandoInclusao}
                        onChange={(evento) => {
                          invalidarCpfInclusao();
                          setErroInclusao(null);
                          setInclusao((atual) => ({
                            ...atual,
                            cpf_titular: somenteNumerosCpf(evento.target.value).slice(0, 11),
                          }));
                        }}
                        maxLength={11}
                        className="w-full disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                      />
                      <button
                        type="button"
                        onClick={() => void validarCpfInclusao()}
                        disabled={consultandoCpfInclusao || salvandoInclusao || !validarCpf(inclusao.cpf_titular) || cpfInclusaoValidado === inclusao.cpf_titular}
                        className="mt-2 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {consultandoCpfInclusao ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                        {consultandoCpfInclusao ? 'Consultando...' : 'Validar CPF'}
                      </button>
                      {cpfInclusaoValidado === inclusao.cpf_titular && (
                        <p role="status" className="mt-2 text-sm font-semibold text-emerald-700">CPF validado.</p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Nascimento
                      </label>
                      <input
                        type="date"
                        value={inclusao.nasc_titular}
                        disabled={salvandoInclusao || consultandoCpfInclusao || cpfInclusaoValidado !== inclusao.cpf_titular}
                        onChange={(evento) =>
                          setInclusao((atual) => ({
                            ...atual,
                            nasc_titular: evento.target.value,
                          }))
                        }
                        className="w-full disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        E-mail
                      </label>
                      <input
                        type="email"
                        value={inclusao.email_titular}
                        disabled={salvandoInclusao || consultandoCpfInclusao || cpfInclusaoValidado !== inclusao.cpf_titular}
                        onChange={(evento) =>
                          setInclusao((atual) => ({
                            ...atual,
                            email_titular: evento.target.value,
                          }))
                        }
                        className="w-full disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Telefone com DDD
                      </label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        value={inclusao.tel_titular}
                        disabled={salvandoInclusao || consultandoCpfInclusao || cpfInclusaoValidado !== inclusao.cpf_titular}
                        onChange={(evento) =>
                          setInclusao((atual) => ({
                            ...atual,
                            tel_titular: evento.target.value.replace(/\D/g, '').slice(0, 11),
                          }))
                        }
                        maxLength={11}
                        className="w-full disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Plano
                      </label>
                      <select
                        value={inclusao.cod_plano}
                        disabled={salvandoInclusao || consultandoCpfInclusao || cpfInclusaoValidado !== inclusao.cpf_titular}
                        onChange={(evento) =>
                          setInclusao((atual) => ({
                            ...atual,
                            cod_plano: evento.target.value as '2878' | '2880',
                          }))
                        }
                        className="w-full disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                      >
                        <option value="2878">Individual — R$ 33</option>
                        <option value="2880">Familiar — R$ 66</option>
                      </select>
                      <p className="mt-2 text-xs text-slate-500">
                        A partir de 10 titulares no contrato, os valores passam para R$ 30 e R$ 60.
                      </p>
                    </div>
                  </div>

                  {erroInclusao && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                      {erroInclusao}
                    </div>
                  )}

                  <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={fecharInclusao}
                      disabled={salvandoInclusao}
                      className="rounded-2xl border border-slate-200 px-5 py-3 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={salvandoInclusao || consultandoCpfInclusao || cpfInclusaoValidado !== inclusao.cpf_titular}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {salvandoInclusao ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <UserPlus className="h-5 w-5" />
                      )}
                      {salvandoInclusao ? 'Gerando boleto...' : 'Gerar boleto de inclusão'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {titularExclusao && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-exclusao"
          >
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-600">
                    Confirmação necessária
                  </p>
                  <h2 id="titulo-exclusao" className="mt-1 text-2xl font-extrabold text-slate-900">
                    Excluir titular
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={fecharExclusao}
                  disabled={excluindoTitular}
                  aria-label="Fechar exclusão"
                  className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900">
                <p className="font-extrabold">
                  {titularExclusao.nome_titular || 'Titular selecionado'}
                </p>
                <p className="mt-1 text-sm">CPF {formatarCpf(titularExclusao.cpf_titular)}</p>
                <p className="mt-3 text-sm leading-relaxed">
                  O acesso será inativado e a próxima mensalidade será recalculada. Se não restar ninguém ativo, a assinatura será encerrada.
                </p>
              </div>

              {erroExclusao && (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {erroExclusao}
                </div>
              )}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={fecharExclusao}
                  disabled={excluindoTitular}
                  className="rounded-2xl border border-slate-200 px-5 py-3 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={() => void confirmarExclusao()}
                  disabled={excluindoTitular}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 font-bold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {excluindoTitular ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Trash2 className="h-5 w-5" />
                  )}
                  {excluindoTitular ? 'Excluindo...' : 'Confirmar exclusão'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      <section className="dashboard-print bg-white text-slate-950">
        <header className="border-b-4 border-emerald-600 pb-5">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-emerald-700">
                SIA ConsulToque
              </p>
              <h1 className="mt-2 text-3xl font-black">Relatório do associado</h1>
              <p className="mt-1 text-sm text-slate-600">
                Contrato {contrato.num_contrato || 'Não informado'}
              </p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p>Documento gerado em</p>
              <p className="mt-1 font-bold text-slate-800">
                {formatarDataHora(resposta?.gerado_em || new Date().toISOString())}
              </p>
            </div>
          </div>
        </header>

        <div className="mt-6 grid grid-cols-3 gap-3 print-avoid-break">
          <RelatorioResumo
            label="Titulares"
            valor={`${titulares.length} total`}
            detalhe={`${totalAtivos} ativos · ${totalInativos} inativos${totalExclusoesProgramadas > 0 ? ` · ${totalExclusoesProgramadas} exclusões programadas` : ''}`}
          />
          <RelatorioResumo
            label="Total mensal atual"
            valor={formatarMoeda(valorMensalAtual)}
            detalhe={diaVencimentoExibicao}
          />
          <RelatorioResumo
            label="Próximo pagamento"
            valor={dataProximoPagamento}
            detalhe={formatarMoeda(valorProximoPagamento)}
          />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 print-avoid-break">
          <RelatorioResumo
            label="Último pagamento"
            valor={dataUltimoPagamento}
            detalhe={formatarMoeda(valorUltimaCobranca)}
          />
          <RelatorioResumo
            label="Situação"
            valor={statusPagamento}
            detalhe={`${numero(contrato.qtd_individual)} individuais · ${numero(
              contrato.qtd_familiar
            )} familiares`}
          />
        </div>

        <div className="mt-7 grid grid-cols-2 gap-6 print-avoid-break">
          <RelatorioBloco titulo="Associado responsável">
            <RelatorioLinha label="Nome" valor={associado.nome_assoc} />
            <RelatorioLinha label="CPF" valor={formatarCpf(associado.cpf_assoc)} />
            <RelatorioLinha label="Nascimento" valor={associado.nasc_assoc} />
            <RelatorioLinha label="E-mail" valor={associado.email_assoc} />
            <RelatorioLinha
              label="Telefone"
              valor={formatarTelefone(associado.tel_assoc)}
            />
          </RelatorioBloco>

          <RelatorioBloco titulo="Contrato">
            <RelatorioLinha label="Empresa" valor={associado.empresa} />
            <RelatorioLinha
              label="Planos individuais"
              valor={String(numero(contrato.qtd_individual))}
            />
            <RelatorioLinha
              label="Planos familiares"
              valor={String(numero(contrato.qtd_familiar))}
            />
            <RelatorioLinha
              label="Pessoas vinculadas"
              valor={String(totalPessoas)}
            />
            <RelatorioLinha
              label="Dia mensal"
              valor={
                contrato.dia_vencimento
                  ? `Dia ${String(contrato.dia_vencimento).padStart(2, '0')}`
                  : 'Não informado'
              }
            />
            <RelatorioLinha
              label="Início do contrato"
              valor={contrato.inicio_contrato || 'Não informado'}
            />
          </RelatorioBloco>
        </div>

        <div className="mt-8">
          <h2 className="mb-3 text-lg font-black">Titulares vinculados</h2>
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="border border-slate-300 px-3 py-2">Nome</th>
                <th className="border border-slate-300 px-3 py-2">CPF</th>
                <th className="border border-slate-300 px-3 py-2">Plano</th>
                <th className="border border-slate-300 px-3 py-2">Status</th>
                <th className="border border-slate-300 px-3 py-2">Início da vigência</th>
              </tr>
            </thead>
            <tbody>
              {titulares.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="border border-slate-300 px-3 py-4 text-center text-slate-500"
                  >
                    Nenhum titular encontrado.
                  </td>
                </tr>
              ) : (
                titularesOrdenados.map((titular, indice) => (
                  <tr
                    key={`pdf-${titular.cpf_titular || 'titular'}-${indice}`}
                    className="print-avoid-break"
                  >
                    <td className="border border-slate-300 px-3 py-2 font-semibold">
                      {titular.nome_titular || 'Não informado'}
                    </td>
                    <td className="border border-slate-300 px-3 py-2">
                      {formatarCpf(titular.cpf_titular)}
                    </td>
                    <td className="border border-slate-300 px-3 py-2">
                      {nomePlano(titular)}
                    </td>
                    <td className="border border-slate-300 px-3 py-2 font-bold">
                      <div>{titular.status_titular || 'Não informado'}</div>
                      {titular.exclusao_programada && titular.dt_inativacao_programada && (
                        <div className="mt-1 text-[10px] font-semibold text-orange-700">
                          Exclusão programada: {formatarData(titular.dt_inativacao_programada)}
                        </div>
                      )}
                    </td>
                    <td className="border border-slate-300 px-3 py-2">
                      {titular.inicio_vigencia || 'Não informado'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <footer className="mt-8 border-t border-slate-300 pt-4 text-center text-xs text-slate-500">
          Relatório informativo da Área do Associado — SIA ConsulToque
        </footer>
      </section>
    </main>
  );
}

type ResumoCardProps = {
  icone: ReactNode;
  titulo: string;
  valor: string;
  detalhe?: string;
  acao?: ReactNode;
  tom?: 'positivo' | 'atencao' | 'neutro';
};

function ResumoCard({
  icone,
  titulo,
  valor,
  detalhe,
  acao,
  tom = 'neutro',
}: ResumoCardProps) {
  const cores = {
    positivo: 'bg-emerald-100 text-emerald-700',
    atencao: 'bg-amber-100 text-amber-700',
    neutro: 'bg-slate-100 text-slate-700',
  };

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${cores[tom]}`}
      >
        {icone}
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">
        {titulo}
      </p>
      <p className="mt-1 text-lg font-extrabold text-slate-900">{valor}</p>
      {detalhe && (
        <p className="mt-1 text-xs font-semibold text-slate-500">{detalhe}</p>
      )}
      {acao}
    </article>
  );
}

type PainelProps = {
  titulo: string;
  icone: ReactNode;
  children: ReactNode;
  acao?: ReactNode;
};

function Painel({
  titulo,
  icone,
  children,
  acao,
}: PainelProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-emerald-700">
          {icone}

          <h2 className="text-lg font-bold text-slate-900">
            {titulo}
          </h2>
        </div>

        {acao}
      </div>

      <dl className="divide-y divide-slate-100">
        {children}
      </dl>
    </section>
  );
}
type LinhaProps = {
  label: string;
  valor?: ReactNode;
  icone?: ReactNode;
  forte?: boolean;
};

function Linha({ label, valor, icone, forte }: LinhaProps) {
  const vazio = valor === undefined || valor === null || valor === '';

  return (
    <div className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd
        className={`flex max-w-[65%] items-center gap-1.5 text-right text-sm text-slate-800 ${
          forte ? 'font-extrabold' : 'font-semibold'
        }`}
      >
        {icone}
        {vazio ? 'Não informado' : valor}
      </dd>
    </div>
  );
}

type StatusBadgeProps = {
  status: string;
  positivo: boolean;
};

function StatusBadge({ status, positivo }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${
        positivo
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-amber-100 text-amber-800'
      }`}
    >
      {status}
    </span>
  );
}

type DetalhePessoaProps = {
  label: string;
  valor: string;
};

function DetalhePessoa({ label, valor }: DetalhePessoaProps) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="mt-0.5 break-words font-semibold text-slate-700">{valor}</dd>
    </div>
  );
}

type RelatorioResumoProps = {
  label: string;
  valor: string;
  detalhe?: string;
};

function RelatorioResumo({ label, valor, detalhe }: RelatorioResumoProps) {
  return (
    <div className="rounded-lg border border-slate-300 bg-slate-50 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-base font-black text-slate-900">{valor}</p>
      {detalhe && (
        <p className="mt-1 text-[10px] font-semibold text-slate-500">{detalhe}</p>
      )}
    </div>
  );
}

type RelatorioBlocoProps = {
  titulo: string;
  children: ReactNode;
};

function RelatorioBloco({ titulo, children }: RelatorioBlocoProps) {
  return (
    <section className="rounded-lg border border-slate-300 p-4">
      <h2 className="mb-3 text-base font-black">{titulo}</h2>
      <dl className="space-y-2 text-xs">{children}</dl>
    </section>
  );
}

type RelatorioLinhaProps = {
  label: string;
  valor?: string;
};

function RelatorioLinha({ label, valor }: RelatorioLinhaProps) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 pb-1 last:border-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-bold text-slate-900">
        {texto(valor) || 'Não informado'}
      </dd>
    </div>
  );
}
