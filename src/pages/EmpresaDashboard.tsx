import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CircleDollarSign,
  FileText,
  Gift,
  HandCoins,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingCart,
  UserRoundCheck,
  Users,
  X,
} from "lucide-react";

const WEBHOOK_LOGIN_ADMIN =
  "https://n8n.saintsolution.com.br/webhook/admin-login";

const WEBHOOK_DASHBOARD_ADMIN =
  "https://n8n.saintsolution.com.br/webhook/admin-dashboard";

const CHAVE_TOKEN_ADMIN = "consultoque_admin_token";
const CHAVE_EXPIRACAO_ADMIN = "consultoque_admin_expira";
const CHAVE_DADOS_ADMIN = "consultoque_admin_dados";

type Aba =
  | "resumo"
  | "contratos"
  | "vendas"
  | "associados"
  | "titulares"
  | "colaboradores"
  | "comissoes"
  | "cortesias";

type Registro = Record<string, unknown>;

type Admin = {
  cod_admin: string;
  nome_admin: string;
  email_admin: string;
  nivel_admin: string;
};

type LoginResposta = {
  status?: string;
  autorizado?: boolean;
  mensagem?: string;
  admin?: Admin;
  token_sessao?: string;
  expira_sessao?: string;
};

type CardsDashboard = {
  qtd_vendas: number;
  qtd_vendas_pagas: number;
  qtd_vendas_nao_pagas: number;
  qtd_associados: number;
  qtd_titulares: number;
  qtd_titulares_ativos: number;
  qtd_titulares_inativos: number;
  qtd_colaboradores: number;
  qtd_comissoes: number;
  qtd_comissoes_pagas: number;
  qtd_comissoes_pendentes: number;
  qtd_cortesias: number;
  qtd_cortesias_ativas: number;
  qtd_cortesias_inativas: number;
  total_vendido: number;
  total_recebido: number;
  total_pendente: number;
  total_comissoes: number;
  total_comissoes_pagas: number;
  total_comissoes_pendentes: number;
  qtd_contratos: number;
  qtd_contratos_ativos: number;
  qtd_contratos_inativos: number;
  previsao_mensal: number;
  total_vendido_mes: number;
  total_vendido_ano: number;
  total_recebido_mes: number;
  total_recebido_ano: number;
  qtd_comissoes_cadastradas: number;
  qtd_comissoes_elegiveis: number;
  qtd_comissoes_nao_elegiveis: number;
};

type RankingColaborador = {
  cod_colab?: string | number;
  nome_colab?: string;
  qtd_vendas?: number;
  qtd_vendas_pagas?: number;
  total_vendido?: number;
  total_recebido?: number;
  total_comissao_direta?: number;
  total_comissao_rede?: number;
  total_comissoes?: number;
};

type DashboardResposta = {
  status?: string;
  autorizado?: boolean;
  mensagem?: string;
  gerado_em?: string;
  cards?: Partial<CardsDashboard>;
  graficos?: {
    vendas_por_mes?: Registro[];
    planos?: Registro[];
    comissoes_por_competencia?: Registro[];
    status_vendas?: Registro[];
    status_titulares?: Registro[];
    status_contratos?: Registro[];
  };
  ranking_colaboradores?: RankingColaborador[];
  ranking_comissoes?: RankingColaborador[];
  listas?: {
    associados?: Registro[];
    contratos?: Registro[];
    contratos_ativos?: Registro[];
    contratos_inativos?: Registro[];
    vendas?: Registro[];
    vendas_pagas?: Registro[];
    vendas_nao_pagas?: Registro[];
    titulares?: Registro[];
    titulares_ativos?: Registro[];
    titulares_inativos?: Registro[];
    colaboradores?: Registro[];
    comissoes?: Registro[];
    comissoes_elegiveis?: Registro[];
    comissoes_nao_elegiveis?: Registro[];
    comissoes_pagas?: Registro[];
    comissoes_pendentes?: Registro[];
    cortesias?: Registro[];
  };
};

type ColunaTabela = {
  chave: string;
  titulo: string;
  formato?:
    | "texto"
    | "dinheiro"
    | "cpf"
    | "codigo"
    | "status"
    | "booleano";
};

const cardsVazios: CardsDashboard = {
  qtd_vendas: 0,
  qtd_vendas_pagas: 0,
  qtd_vendas_nao_pagas: 0,
  qtd_associados: 0,
  qtd_titulares: 0,
  qtd_titulares_ativos: 0,
  qtd_titulares_inativos: 0,
  qtd_colaboradores: 0,
  qtd_comissoes: 0,
  qtd_comissoes_pagas: 0,
  qtd_comissoes_pendentes: 0,
  qtd_cortesias: 0,
  qtd_cortesias_ativas: 0,
  qtd_cortesias_inativas: 0,
  total_vendido: 0,
  total_recebido: 0,
  total_pendente: 0,
  total_comissoes: 0,
  total_comissoes_pagas: 0,
  total_comissoes_pendentes: 0,
  qtd_contratos: 0,
  qtd_contratos_ativos: 0,
  qtd_contratos_inativos: 0,
  previsao_mensal: 0,
  total_vendido_mes: 0,
  total_vendido_ano: 0,
  total_recebido_mes: 0,
  total_recebido_ano: 0,
  qtd_comissoes_cadastradas: 0,
  qtd_comissoes_elegiveis: 0,
  qtd_comissoes_nao_elegiveis: 0,
};

const configuracaoAbas: Array<{
  id: Aba;
  nome: string;
  icone: typeof LayoutDashboard;
}> = [
  { id: "resumo", nome: "Visão geral", icone: LayoutDashboard },
  { id: "contratos", nome: "Contratos", icone: FileText },
  { id: "vendas", nome: "Vendas", icone: ShoppingCart },
  { id: "associados", nome: "Associados", icone: Users },
  { id: "titulares", nome: "Titulares", icone: UserRoundCheck },
  { id: "colaboradores", nome: "Colaboradores", icone: BarChart3 },
  { id: "comissoes", nome: "Comissões", icone: HandCoins },
  { id: "cortesias", nome: "Cortesias", icone: Gift },
];

function primeiroResultado<T>(valor: T | T[]): T {
  return Array.isArray(valor) ? valor[0] : valor;
}

function texto(valor: unknown) {
  return String(valor ?? "").trim();
}

function numero(valor: unknown) {
  const convertido = Number(valor ?? 0);
  return Number.isFinite(convertido) ? convertido : 0;
}

function dinheiro(valor: unknown) {
  return numero(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function codigoColaborador(valor: unknown) {
  const numeros = texto(valor).replace(/\D/g, "");
  return numeros ? numeros.padStart(4, "0") : "—";
}

function cpfMascarado(valor: unknown) {
  const cpf = texto(valor).replace(/\D/g, "").padStart(11, "0").slice(-11);

  if (!/^\d{11}$/.test(cpf)) {
    return "—";
  }

  return `${cpf.slice(0, 3)}.***.***-${cpf.slice(-2)}`;
}

function dataHora(valor: unknown) {
  const data = new Date(texto(valor));

  if (!Number.isFinite(data.getTime())) {
    return texto(valor) || "—";
  }

  return data.toLocaleString("pt-BR");
}

function classeStatus(valor: unknown) {
  const status = texto(valor).toLowerCase();

  if (
    status === "ativo" ||
    status === "pago" ||
    status === "sucesso" ||
    status === "recebido"
  ) {
    return "bg-emerald-100 text-emerald-800";
  }

  if (status === "pendente" || status === "nao_pago" || status === "não pago") {
    return "bg-amber-100 text-amber-800";
  }

  return "bg-rose-100 text-rose-800";
}

function valorCelula(valor: unknown, formato: ColunaTabela["formato"]) {
  if (formato === "dinheiro") {
    return dinheiro(valor);
  }

  if (formato === "cpf") {
    return cpfMascarado(valor);
  }

  if (formato === "codigo") {
    return codigoColaborador(valor);
  }

  if (formato === "booleano") {
    return valor === true ? "Sim" : "Não";
  }

  return texto(valor) || "—";
}

function sessaoAindaValida(expiracao: string | null) {
  if (!expiracao) return false;

  const data = new Date(expiracao);

  return Number.isFinite(data.getTime()) && data.getTime() > Date.now();
}

function CartaoMetrica({
  titulo,
  valor,
  detalhe,
  icone: Icone,
  cor = "azul",
}: {
  titulo: string;
  valor: string | number;
  detalhe?: string;
  icone: typeof LayoutDashboard;
  cor?: "azul" | "verde" | "dourado" | "roxo";
}) {
  const cores = {
    azul: "bg-blue-50 text-blue-700",
    verde: "bg-emerald-50 text-emerald-700",
    dourado: "bg-amber-50 text-amber-700",
    roxo: "bg-violet-50 text-violet-700",
  };

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-slate-500">
            {titulo}
          </p>

          <p className="mt-2 text-3xl font-black text-slate-950">{valor}</p>

          {detalhe && (
            <p className="mt-2 text-sm font-semibold text-slate-500">
              {detalhe}
            </p>
          )}
        </div>

        <div className={`rounded-2xl p-3 ${cores[cor]}`}>
          <Icone size={23} />
        </div>
      </div>
    </article>
  );
}

function BarraComparativa({
  titulo,
  valor,
  maximo,
  legenda,
}: {
  titulo: string;
  valor: number;
  maximo: number;
  legenda: string;
}) {
  const percentual =
    maximo > 0 ? Math.min(100, Math.max(4, (valor / maximo) * 100)) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-bold text-slate-700">{titulo}</span>
        <span className="font-black text-slate-950">{legenda}</span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-700 to-cyan-500"
          style={{ width: `${percentual}%` }}
        />
      </div>
    </div>
  );
}

function TabelaDados({
  titulo,
  registros,
  colunas,
  busca,
  onBusca,
}: {
  titulo: string;
  registros: Registro[];
  colunas: ColunaTabela[];
  busca: string;
  onBusca: (valor: string) => void;
}) {
  const registrosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) {
      return registros;
    }

    return registros.filter((registro) =>
      Object.values(registro).some((valor) =>
        texto(valor).toLowerCase().includes(termo),
      ),
    );
  }, [busca, registros]);

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-950">{titulo}</h2>
          <p className="text-sm font-semibold text-slate-500">
            {registrosFiltrados.length} registro(s)
          </p>
        </div>

        <div className="relative w-full md:max-w-sm">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={busca}
            onChange={(event) => onBusca(event.target.value)}
            placeholder="Buscar nesta lista"
            className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 outline-none focus:border-blue-600"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {colunas.map((coluna) => (
                <th
                  key={coluna.chave}
                  className="whitespace-nowrap px-5 py-3 font-black"
                >
                  {coluna.titulo}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {registrosFiltrados.map((registro, indice) => (
              <tr
                key={`${texto(registro.row_number) || titulo}-${indice}`}
                className="hover:bg-slate-50"
              >
                {colunas.map((coluna) => {
                  const valor = registro[coluna.chave];

                  return (
                    <td
                      key={coluna.chave}
                      className="whitespace-nowrap px-5 py-4 font-medium text-slate-700"
                    >
                      {coluna.formato === "status" ? (
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase ${classeStatus(
                            valor,
                          )}`}
                        >
                          {texto(valor).replace(/_/g, " ") || "—"}
                        </span>
                      ) : (
                        valorCelula(valor, coluna.formato)
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}

            {registrosFiltrados.length === 0 && (
              <tr>
                <td
                  colSpan={colunas.length}
                  className="px-5 py-12 text-center font-semibold text-slate-500"
                >
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function EmpresaDashboard() {
  const [logado, setLogado] = useState(false);
  const [carregandoLogin, setCarregandoLogin] = useState(false);
  const [carregandoDashboard, setCarregandoDashboard] = useState(false);
  const [erro, setErro] = useState("");

  const [formLogin, setFormLogin] = useState({
    cod_admin: "",
    senha_admin: "",
  });

  const [admin, setAdmin] = useState<Admin | null>(null);
  const [dashboard, setDashboard] = useState<DashboardResposta | null>(null);
  const [aba, setAba] = useState<Aba>("resumo");
  const [menuAberto, setMenuAberto] = useState(false);
  const [busca, setBusca] = useState("");

  const encerrarSessao = (mensagem = "") => {
    sessionStorage.removeItem(CHAVE_TOKEN_ADMIN);
    sessionStorage.removeItem(CHAVE_EXPIRACAO_ADMIN);
    sessionStorage.removeItem(CHAVE_DADOS_ADMIN);

    setLogado(false);
    setAdmin(null);
    setDashboard(null);
    setAba("resumo");
    setBusca("");
    setErro(mensagem);
  };

  const buscarDashboard = async (token: string) => {
    setCarregandoDashboard(true);
    setErro("");

    try {
      const response = await fetch(WEBHOOK_DASHBOARD_ADMIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Token": token,
        },
        body: JSON.stringify({}),
      });

      const respostaJson = await response.json().catch(() => null);
      const resultado = respostaJson
        ? primeiroResultado<DashboardResposta>(respostaJson)
        : null;

      if (response.status === 401 || resultado?.autorizado === false) {
        encerrarSessao("Sua sessão expirou. Entre novamente para continuar.");
        return;
      }

      if (!response.ok || resultado?.status !== "sucesso") {
        throw new Error(
          resultado?.mensagem ||
            "Não foi possível carregar o painel administrativo.",
        );
      }

      setDashboard(resultado);
      setLogado(true);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);

      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar o painel administrativo.",
      );
    } finally {
      setCarregandoDashboard(false);
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem(CHAVE_TOKEN_ADMIN);
    const expiracao = sessionStorage.getItem(CHAVE_EXPIRACAO_ADMIN);
    const adminSalvo = sessionStorage.getItem(CHAVE_DADOS_ADMIN);

    if (!token || !sessaoAindaValida(expiracao)) {
      encerrarSessao();
      return;
    }

    if (adminSalvo) {
      try {
        setAdmin(JSON.parse(adminSalvo));
      } catch {
        sessionStorage.removeItem(CHAVE_DADOS_ADMIN);
      }
    }

    setLogado(true);
    buscarDashboard(token);
  }, []);

  const realizarLogin = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    if (carregandoLogin) return;

    const codAdmin = formLogin.cod_admin.trim().toUpperCase();
    const senhaAdmin = formLogin.senha_admin;

    if (!codAdmin || !senhaAdmin.trim()) {
      setErro("Informe o código administrativo e a senha.");
      return;
    }

    setCarregandoLogin(true);
    setErro("");

    try {
      const response = await fetch(WEBHOOK_LOGIN_ADMIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cod_admin: codAdmin,
          senha_admin: senhaAdmin,
        }),
      });

      const respostaJson = await response.json().catch(() => null);
      const resultado = respostaJson
        ? primeiroResultado<LoginResposta>(respostaJson)
        : null;

      if (
        !response.ok ||
        resultado?.autorizado !== true ||
        !resultado.token_sessao ||
        !resultado.expira_sessao
      ) {
        throw new Error(resultado?.mensagem || "Código ou senha incorretos.");
      }

      sessionStorage.setItem(CHAVE_TOKEN_ADMIN, resultado.token_sessao);
      sessionStorage.setItem(CHAVE_EXPIRACAO_ADMIN, resultado.expira_sessao);

      if (resultado.admin) {
        sessionStorage.setItem(
          CHAVE_DADOS_ADMIN,
          JSON.stringify(resultado.admin),
        );
        setAdmin(resultado.admin);
      }

      setFormLogin({
        cod_admin: "",
        senha_admin: "",
      });

      setLogado(true);
      await buscarDashboard(resultado.token_sessao);
    } catch (error) {
      console.error("Erro no login administrativo:", error);

      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível realizar o login.",
      );
    } finally {
      setCarregandoLogin(false);
    }
  };

  const atualizarDashboard = () => {
    const token = sessionStorage.getItem(CHAVE_TOKEN_ADMIN);

    if (!token) {
      encerrarSessao("Entre novamente para continuar.");
      return;
    }

    buscarDashboard(token);
  };

  const selecionarAba = (novaAba: Aba) => {
    setAba(novaAba);
    setBusca("");
    setMenuAberto(false);
  };

  if (!logado) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-12">
        <div className="mx-auto flex min-h-[80vh] max-w-md items-center">
          <section className="w-full rounded-3xl border border-white/10 bg-white p-7 shadow-2xl md:p-9">
            <a
              href="/"
              className="text-sm font-black text-blue-700 hover:text-blue-900"
            >
              ← Voltar ao site
            </a>

            <div className="mt-8 flex items-center gap-3">
              <div className="rounded-2xl bg-blue-700 p-3 text-white">
                <ShieldCheck size={28} />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">
                  ConsulToque
                </p>
                <h1 className="text-2xl font-black text-slate-950">
                  Área Administrativa
                </h1>
              </div>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-slate-600">
              Acesso restrito aos administradores autorizados.
            </p>

            <form onSubmit={realizarLogin} className="mt-7 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-black text-slate-700">
                  Código administrativo
                </label>

                <input
                  value={formLogin.cod_admin}
                  onChange={(event) =>
                    setFormLogin((anterior) => ({
                      ...anterior,
                      cod_admin: event.target.value.toUpperCase(),
                    }))
                  }
                  autoComplete="username"
                  placeholder="ADM0001"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 uppercase outline-none focus:border-blue-700"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-black text-slate-700">
                  Senha
                </label>

                <input
                  type="password"
                  value={formLogin.senha_admin}
                  onChange={(event) =>
                    setFormLogin((anterior) => ({
                      ...anterior,
                      senha_admin: event.target.value,
                    }))
                  }
                  autoComplete="current-password"
                  placeholder="Sua senha administrativa"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
                />
              </div>

              {erro && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-700">
                  {erro}
                </div>
              )}

              <button
                type="submit"
                disabled={carregandoLogin}
                className="w-full rounded-xl bg-blue-700 px-5 py-3.5 font-black text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {carregandoLogin ? "Validando..." : "Entrar"}
              </button>
            </form>
          </section>
        </div>
      </main>
    );
  }

  const cards: CardsDashboard = {
    ...cardsVazios,
    ...(dashboard?.cards || {}),
  };

  const listas = {
    associados: dashboard?.listas?.associados || [],
    contratos: dashboard?.listas?.contratos || [],
    contratosAtivos: dashboard?.listas?.contratos_ativos || [],
    contratosInativos: dashboard?.listas?.contratos_inativos || [],
    vendas: dashboard?.listas?.vendas || [],
    vendasPagas: dashboard?.listas?.vendas_pagas || [],
    vendasNaoPagas: dashboard?.listas?.vendas_nao_pagas || [],
    titulares: dashboard?.listas?.titulares || [],
    titularesAtivos: dashboard?.listas?.titulares_ativos || [],
    titularesInativos: dashboard?.listas?.titulares_inativos || [],
    colaboradores: dashboard?.listas?.colaboradores || [],
    comissoes: dashboard?.listas?.comissoes || [],
    comissoesElegiveis: dashboard?.listas?.comissoes_elegiveis || [],
    comissoesNaoElegiveis:
      dashboard?.listas?.comissoes_nao_elegiveis || [],
    cortesias: dashboard?.listas?.cortesias || [],
  };

  const ranking = dashboard?.ranking_colaboradores || [];
  const rankingComissoes = dashboard?.ranking_comissoes || [];
  const maiorVendaRanking = Math.max(
    1,
    ...ranking.map((item) => numero(item.total_recebido)),
  );
  const maiorComissaoRanking = Math.max(
    1,
    ...rankingComissoes.map((item) => numero(item.total_comissoes)),
  );

  const conteudoTabela: Partial<
    Record<
      Aba,
      {
        titulo: string;
        registros: Registro[];
        colunas: ColunaTabela[];
      }
    >
  > = {
    contratos: {
      titulo: "Contratos",
      registros: listas.contratos,
      colunas: [
        { chave: "num_contrato", titulo: "Contrato" },
        { chave: "assoc_nome", titulo: "Responsável" },
        { chave: "assoc_cpf", titulo: "CPF", formato: "cpf" },
        { chave: "cod_colab", titulo: "Colab.", formato: "codigo" },
        { chave: "tipo_plano", titulo: "Plano" },
        {
          chave: "vl_total",
          titulo: "Mensalidade",
          formato: "dinheiro",
        },
        {
          chave: "quantidade_titulares_ativos",
          titulo: "Tit. ativos",
        },
        {
          chave: "quantidade_titulares_inativos",
          titulo: "Tit. inativos",
        },
        {
          chave: "status_contrato",
          titulo: "Status",
          formato: "status",
        },
      ],
    },
    vendas: {
      titulo: "Vendas",
      registros: listas.vendas,
      colunas: [
        { chave: "num_contrato", titulo: "Contrato" },
        { chave: "dt_venda", titulo: "Data" },
        { chave: "assoc_nome", titulo: "Associado" },
        { chave: "assoc_cpf", titulo: "CPF", formato: "cpf" },
        { chave: "cod_colab", titulo: "Colab.", formato: "codigo" },
        { chave: "tipo_plano", titulo: "Plano" },
        { chave: "vl_total", titulo: "Valor", formato: "dinheiro" },
        { chave: "status_venda", titulo: "Status", formato: "status" },
      ],
    },
    associados: {
      titulo: "Associados",
      registros: listas.associados,
      colunas: [
        { chave: "assoc_nome", titulo: "Nome" },
        { chave: "assoc_cpf", titulo: "CPF", formato: "cpf" },
        { chave: "assoc_email", titulo: "E-mail" },
        { chave: "assoc_tel", titulo: "Telefone" },
        { chave: "quantidade_contratos", titulo: "Contratos" },
        { chave: "contratos_ativos", titulo: "Ativos" },
        { chave: "contratos_inativos", titulo: "Inativos" },
        {
          chave: "total_contratado",
          titulo: "Contratado",
          formato: "dinheiro",
        },
        { chave: "total_pago", titulo: "Pago", formato: "dinheiro" },
      ],
    },
    titulares: {
      titulo: "Titulares",
      registros: listas.titulares,
      colunas: [
        { chave: "num_contrato", titulo: "Contrato" },
        { chave: "tit_nome", titulo: "Nome" },
        { chave: "tit_cpf", titulo: "CPF", formato: "cpf" },
        { chave: "tit_email", titulo: "E-mail" },
        { chave: "tit_tel", titulo: "Telefone" },
        { chave: "tipo_plano", titulo: "Plano" },
        {
          chave: "status_titular",
          titulo: "Status",
          formato: "status",
        },
        { chave: "assoc_nome", titulo: "Responsável" },
        {
          chave: "assoc_cpf",
          titulo: "CPF responsável",
          formato: "cpf",
        },
        { chave: "assoc_email", titulo: "E-mail responsável" },
        { chave: "assoc_tel", titulo: "Telefone responsável" },
        { chave: "dt_cad", titulo: "Cadastro" },
      ],
    },
    colaboradores: {
      titulo: "Colaboradores",
      registros: listas.colaboradores,
      colunas: [
        { chave: "cod_colab", titulo: "Código", formato: "codigo" },
        { chave: "nome_colab", titulo: "Nome" },
        { chave: "cpf_colab", titulo: "CPF", formato: "cpf" },
        { chave: "email_colab", titulo: "E-mail" },
        { chave: "tel_colab", titulo: "Telefone" },
        { chave: "cod_pai", titulo: "Pai", formato: "codigo" },
        { chave: "dt_cad", titulo: "Cadastro" },
      ],
    },
    comissoes: {
      titulo: "Comissões",
      registros: listas.comissoes,
      colunas: [
        { chave: "cod_comissao", titulo: "Comissão" },
        { chave: "competencia", titulo: "Competência" },
        { chave: "cod_colab", titulo: "Colab.", formato: "codigo" },
        { chave: "assoc_nome", titulo: "Associado" },
        { chave: "tipo_comissao", titulo: "Tipo" },
        {
          chave: "vl_comissao",
          titulo: "Direta",
          formato: "dinheiro",
        },
        { chave: "vl_com_pai", titulo: "Pai", formato: "dinheiro" },
        {
          chave: "valor_total_comissao",
          titulo: "Total",
          formato: "dinheiro",
        },
        {
          chave: "status_venda_relacionada",
          titulo: "Venda",
          formato: "status",
        },
        {
          chave: "elegivel_financeiro",
          titulo: "Elegível",
          formato: "booleano",
        },
        {
          chave: "status_comissao",
          titulo: "Status",
          formato: "status",
        },
        { chave: "motivo_nao_elegivel", titulo: "Observação" },
      ],
    },
    cortesias: {
      titulo: "Cortesias",
      registros: listas.cortesias,
      colunas: [
        { chave: "num_contrato", titulo: "Contrato" },
        { chave: "tit_nome", titulo: "Beneficiário" },
        { chave: "tit_cpf", titulo: "CPF", formato: "cpf" },
        { chave: "tit_email", titulo: "E-mail" },
        { chave: "tipo_plano", titulo: "Plano" },
        {
          chave: "status_titular",
          titulo: "Status",
          formato: "status",
        },
        { chave: "dt_cad", titulo: "Cadastro" },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {menuAberto && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setMenuAberto(false)}
          className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform bg-slate-950 text-white transition-transform lg:translate-x-0 ${
          menuAberto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-white/10 p-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
                ConsulToque
              </p>
              <p className="text-xl font-black">Administração</p>
            </div>

            <button
              type="button"
              onClick={() => setMenuAberto(false)}
              className="rounded-xl p-2 text-slate-300 hover:bg-white/10 lg:hidden"
            >
              <X size={22} />
            </button>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto p-4">
            {configuracaoAbas.map((item) => {
              const Icone = item.icone;
              const selecionada = aba === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selecionarAba(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-bold transition ${
                    selecionada
                      ? "bg-blue-700 text-white"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icone size={20} />
                  {item.nome}
                </button>
              );
            })}
          </nav>

          <div className="border-t border-white/10 p-4">
            <div className="mb-4 rounded-2xl bg-white/5 p-4">
              <p className="font-black">
                {admin?.nome_admin || "Administrador"}
              </p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wide text-cyan-400">
                {admin?.nivel_admin || "ADMIN"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => encerrarSessao()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 font-bold text-slate-200 hover:bg-white/10"
            >
              <LogOut size={18} />
              Sair
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur md:px-7">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMenuAberto(true)}
                className="rounded-xl border border-slate-200 p-2.5 lg:hidden"
              >
                <Menu size={22} />
              </button>

              <div className="min-w-0">
                <h1 className="truncate text-xl font-black text-slate-950 md:text-2xl">
                  {configuracaoAbas.find((item) => item.id === aba)?.nome}
                </h1>
                <p className="truncate text-xs font-semibold text-slate-500 md:text-sm">
                  Atualizado em {dataHora(dashboard?.gerado_em)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={atualizarDashboard}
              disabled={carregandoDashboard}
              className="flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-black text-white hover:bg-blue-800 disabled:bg-slate-400"
            >
              <RefreshCw
                size={18}
                className={carregandoDashboard ? "animate-spin" : ""}
              />
              <span className="hidden sm:inline">Atualizar</span>
            </button>
          </div>
        </header>

        <main className="p-4 md:p-7">
          {erro && (
            <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 font-bold text-rose-700">
              {erro}
            </div>
          )}

          {carregandoDashboard && !dashboard ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="text-center">
                <RefreshCw
                  size={36}
                  className="mx-auto animate-spin text-blue-700"
                />
                <p className="mt-4 font-black text-slate-600">
                  Carregando painel administrativo...
                </p>
              </div>
            </div>
          ) : aba === "resumo" ? (
            <div className="space-y-7">
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <CartaoMetrica
                  titulo="Contratos ativos"
                  valor={cards.qtd_contratos_ativos}
                  detalhe={`${cards.qtd_contratos_inativos} inativo(s) de ${cards.qtd_contratos}`}
                  icone={FileText}
                  cor="verde"
                />
                <CartaoMetrica
                  titulo="Previsão mensal"
                  valor={dinheiro(cards.previsao_mensal)}
                  detalhe="Contratos atualmente ativos"
                  icone={CircleDollarSign}
                  cor="verde"
                />
                <CartaoMetrica
                  titulo="Recebido no mês"
                  valor={dinheiro(cards.total_recebido_mes)}
                  detalhe={`${dinheiro(cards.total_recebido_ano)} no ano`}
                  icone={CircleDollarSign}
                  cor="azul"
                />
                <CartaoMetrica
                  titulo="Comissões pendentes"
                  valor={dinheiro(cards.total_comissoes_pendentes)}
                  detalhe={`${cards.qtd_comissoes_pendentes} elegível(is) · ${cards.qtd_comissoes_nao_elegiveis} não elegível(is)`}
                  icone={HandCoins}
                  cor="roxo"
                />
              </section>

              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <CartaoMetrica
                  titulo="Vendido no mês"
                  valor={dinheiro(cards.total_vendido_mes)}
                  detalhe={`${dinheiro(cards.total_vendido_ano)} no ano`}
                  icone={ShoppingCart}
                  cor="azul"
                />
                <CartaoMetrica
                  titulo="Total vendido"
                  valor={dinheiro(cards.total_vendido)}
                  detalhe={`${cards.qtd_vendas} venda(s) cadastrada(s)`}
                  icone={ShoppingCart}
                />
                <CartaoMetrica
                  titulo="Total recebido"
                  valor={dinheiro(cards.total_recebido)}
                  detalhe={`${cards.qtd_vendas_pagas} venda(s) paga(s)`}
                  icone={CircleDollarSign}
                  cor="verde"
                />
                <CartaoMetrica
                  titulo="Não recebido"
                  valor={dinheiro(cards.total_pendente)}
                  detalhe={`${cards.qtd_vendas_nao_pagas} venda(s) não paga(s)`}
                  icone={CircleDollarSign}
                  cor="dourado"
                />
              </section>

              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <CartaoMetrica
                  titulo="Associados"
                  valor={cards.qtd_associados}
                  detalhe={`${cards.qtd_contratos} contrato(s)`}
                  icone={Users}
                />
                <CartaoMetrica
                  titulo="Titulares"
                  valor={cards.qtd_titulares}
                  detalhe={`${cards.qtd_titulares_ativos} ativo(s) · ${cards.qtd_titulares_inativos} inativo(s)`}
                  icone={UserRoundCheck}
                  cor="verde"
                />
                <CartaoMetrica
                  titulo="Colaboradores"
                  valor={cards.qtd_colaboradores}
                  detalhe="Rede cadastrada"
                  icone={BarChart3}
                  cor="dourado"
                />
                <CartaoMetrica
                  titulo="Cortesias"
                  valor={cards.qtd_cortesias}
                  detalhe={`${cards.qtd_cortesias_ativas} ativa(s) · ${cards.qtd_cortesias_inativas} inativa(s)`}
                  icone={Gift}
                  cor="roxo"
                />
              </section>

              <section className="grid gap-5 xl:grid-cols-2">
                <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-black text-slate-950">
                    Situação financeira
                  </h2>

                  <div className="mt-6 space-y-6">
                    <BarraComparativa
                      titulo="Recebido"
                      valor={cards.total_recebido}
                      maximo={Math.max(cards.total_vendido, 1)}
                      legenda={dinheiro(cards.total_recebido)}
                    />
                    <BarraComparativa
                      titulo="Pendente"
                      valor={cards.total_pendente}
                      maximo={Math.max(cards.total_vendido, 1)}
                      legenda={dinheiro(cards.total_pendente)}
                    />
                    <BarraComparativa
                      titulo="Comissões devidas"
                      valor={cards.total_comissoes_pendentes}
                      maximo={Math.max(cards.total_vendido, 1)}
                      legenda={dinheiro(cards.total_comissoes_pendentes)}
                    />
                    <BarraComparativa
                      titulo="Comissões pagas"
                      valor={cards.total_comissoes_pagas}
                      maximo={Math.max(cards.total_vendido, 1)}
                      legenda={dinheiro(cards.total_comissoes_pagas)}
                    />
                  </div>
                </article>

                <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-black text-slate-950">
                    Ranking por vendas recebidas
                  </h2>

                  <div className="mt-6 space-y-5">
                    {ranking.slice(0, 6).map((item, indice) => (
                      <BarraComparativa
                        key={`${texto(item.cod_colab)}-${indice}`}
                        titulo={`${codigoColaborador(item.cod_colab)} · ${
                          item.nome_colab || "Sem nome"
                        }`}
                        valor={numero(item.total_recebido)}
                        maximo={maiorVendaRanking}
                        legenda={dinheiro(item.total_recebido)}
                      />
                    ))}

                    {ranking.length === 0 && (
                      <p className="py-8 text-center font-semibold text-slate-500">
                        Ainda não existem dados para o ranking.
                      </p>
                    )}
                  </div>
                </article>
              </section>

              <section className="grid gap-5 xl:grid-cols-2">
                <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-black text-slate-950">
                    Ranking por comissões
                  </h2>

                  <div className="mt-6 space-y-5">
                    {rankingComissoes.slice(0, 6).map((item, indice) => (
                      <BarraComparativa
                        key={`comissao-${texto(item.cod_colab)}-${indice}`}
                        titulo={`${codigoColaborador(item.cod_colab)} · ${
                          item.nome_colab || "Sem nome"
                        }`}
                        valor={numero(item.total_comissoes)}
                        maximo={maiorComissaoRanking}
                        legenda={dinheiro(item.total_comissoes)}
                      />
                    ))}

                    {rankingComissoes.length === 0 && (
                      <p className="py-8 text-center font-semibold text-slate-500">
                        Ainda não existem comissões elegíveis.
                      </p>
                    )}
                  </div>
                </article>

                <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-black text-slate-950">
                    Atenção operacional
                  </h2>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => selecionarAba("titulares")}
                      className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-left transition hover:bg-rose-100"
                    >
                      <p className="text-3xl font-black text-rose-700">
                        {cards.qtd_titulares_inativos}
                      </p>
                      <p className="mt-1 font-black text-rose-900">
                        Titulares inativos
                      </p>
                      <p className="mt-2 text-sm font-semibold text-rose-700">
                        Consulte o responsável para atendimento e recuperação.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => selecionarAba("comissoes")}
                      className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-left transition hover:bg-amber-100"
                    >
                      <p className="text-3xl font-black text-amber-700">
                        {cards.qtd_comissoes_nao_elegiveis}
                      </p>
                      <p className="mt-1 font-black text-amber-900">
                        Comissões não elegíveis
                      </p>
                      <p className="mt-2 text-sm font-semibold text-amber-700">
                        Permanecem visíveis, mas não entram no valor devido.
                      </p>
                    </button>
                  </div>
                </article>
              </section>
            </div>
          ) : (
            (() => {
              const tabela = conteudoTabela[aba];

              if (!tabela) return null;

              return (
                <TabelaDados
                  titulo={tabela.titulo}
                  registros={tabela.registros}
                  colunas={tabela.colunas}
                  busca={busca}
                  onBusca={setBusca}
                />
              );
            })()
          )}
        </main>
      </div>
    </div>
  );
}