import { enviarIntegracao } from '@/services/http';
import { CompletarAdesao_WEBHOOK_BUSCAR_ADESAO as WEBHOOK_BUSCAR_ADESAO, CompletarAdesao_WEBHOOK_COMPLEMENTAR_ADESAO as WEBHOOK_COMPLEMENTAR_ADESAO } from '@/services/endpoints';
import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Loader2,
  Plus,
  Printer,
  ShieldCheck,
  Trash2,
  UsersRound,
} from "lucide-react";
import {
  calculatePrice,
  formatCPF,
  formatPhone,
  onlyDigits,
  type HolderEntry,
  type PlanType,
} from "@/lib/pricing";
import { somenteNumerosCpf, validarCpf } from "@/lib/cpf";
import { consultarCpfTitular } from "@/lib/consultaCpf";





type Titular = {
  cpf_titular?: string;
  nome_titular?: string;
  nasc_titular?: string;
  email_titular?: string;
  tel_titular?: string;
  cod_plano?: string | number;
};

type Contrato = {
  num_contrato?: string;
  qtd_individual?: number | string;
  qtd_familiar?: number | string;
  vl_total?: number | string;
  vencimento?: string;
  url_pagamento?: string;
};

type BuscaResponse = {
  sucesso?: boolean;
  mensagem?: string;
  token_complemento?: string;
  associado?: {
    cpf_assoc?: string;
    nome_assoc?: string;
    email_assoc?: string;
    tel_assoc?: string;
  };
  contrato?: Contrato;
  titulares?: Titular[];
};

type NovoTitular = {
  id: string;
  plan: PlanType;
  cpf: string;
  nome: string;
  nascimento: string;
  email: string;
  telefone: string;
  validado: boolean;
  consultaId: string;
};

function normalizarNome(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

function nascimentoInput(valor: string) {
  const partes = String(valor ?? "").match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return partes ? `${partes[3]}-${partes[2]}-${partes[1]}` : valor;
}

function nascimentoBr(valor: string) {
  const partes = String(valor ?? "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return partes ? `${partes[3]}/${partes[2]}/${partes[1]}` : valor;
}

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function novoTitular(): NovoTitular {
  return {
    id: crypto.randomUUID(),
    plan: "individual",
    cpf: "",
    nome: "",
    nascimento: "",
    email: "",
    telefone: "",
    validado: false,
    consultaId: "",
  };
}

function paraEntry(titular: Titular, index: number): HolderEntry {
  return {
    id: `existente-${index}`,
    name: String(titular.nome_titular ?? ""),
    cpf: onlyDigits(String(titular.cpf_titular ?? "")),
    plan: String(titular.cod_plano) === "2880" ? "familia" : "individual",
  };
}

export default function CompletarAdesao() {
  const [cpfAssoc, setCpfAssoc] = useState("");
  const [dados, setDados] = useState<BuscaResponse | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [erroBusca, setErroBusca] = useState("");
  const [novos, setNovos] = useState<NovoTitular[]>([]);
  const [rascunho, setRascunho] = useState<NovoTitular | null>(null);
  const [consultandoCpf, setConsultandoCpf] = useState(false);
  const [erroTitular, setErroTitular] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [conferenciaAberta, setConferenciaAberta] = useState(false);
  const [conferenciaVista, setConferenciaVista] = useState(false);
  const [resultado, setResultado] = useState<{
    mensagem?: string;
    url_pagamento?: string;
  } | null>(null);

  const titularesExistentes = dados?.titulares ?? [];
  const resumo = useMemo(
    () =>
      calculatePrice([
        ...titularesExistentes.map(paraEntry),
        ...novos.map((titular) => ({
          id: titular.id,
          plan: titular.plan,
          name: titular.nome,
          cpf: onlyDigits(titular.cpf),
        })),
      ]),
    [titularesExistentes, novos],
  );

  async function buscarAdesao() {
    const cpf = somenteNumerosCpf(cpfAssoc);
    if (!validarCpf(cpf)) {
      setErroBusca("Informe o CPF válido do associado responsável.");
      return;
    }

    setBuscando(true);
    setErroBusca("");
    setDados(null);
    setNovos([]);
    setConferenciaAberta(false);
    setConferenciaVista(false);
    setResultado(null);

    try {
      const response = await enviarIntegracao(WEBHOOK_BUSCAR_ADESAO, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf_assoc: cpf }),
      });
      const result = (await response
        .json()
        .catch(() => null)) as BuscaResponse | null;

      if (!response.ok || !result?.sucesso || !result.contrato?.num_contrato) {
        throw new Error(
          result?.mensagem ||
            "Não foi encontrada uma adesão pendente para este CPF.",
        );
      }
      setDados(result);
    } catch (error) {
      setErroBusca(
        error instanceof Error
          ? error.message
          : "Não foi possível consultar a adesão.",
      );
    } finally {
      setBuscando(false);
    }
  }

  function alterarRascunho(patch: Partial<NovoTitular>) {
    setRascunho((atual) => (atual ? { ...atual, ...patch } : atual));
  }

  function alterarCpfTitular(valor: string) {
    const cpf = formatCPF(valor);
    setRascunho((atual) =>
      atual
        ? {
            ...atual,
            cpf,
            nome: "",
            nascimento: "",
            validado: false,
            consultaId: "",
          }
        : atual,
    );
    setErroTitular("");
  }

  async function validarCpfTitular() {
    if (!rascunho) return;
    const cpf = somenteNumerosCpf(rascunho.cpf);
    if (!validarCpf(cpf)) {
      setErroTitular("Informe um CPF válido.");
      return;
    }
    const cpfJaCadastrado =
      titularesExistentes.some(
        (titular) => onlyDigits(String(titular.cpf_titular ?? "")) === cpf,
      ) || novos.some((titular) => onlyDigits(titular.cpf) === cpf);

    if (cpfJaCadastrado) {
      setErroTitular("Este CPF já está cadastrado neste contrato.");
      return;
    }

    setConsultandoCpf(true);
    setErroTitular("");
    try {
      const result = await consultarCpfTitular(cpf);
      alterarRascunho({
        validado: true,
        consultaId: result.consulta_id || "",
        nome: normalizarNome(result.nome),
        nascimento: nascimentoInput(result.nascimento),
      });
    } catch (error) {
      setErroTitular(
        error instanceof Error
          ? error.message
          : "Não foi possível validar o CPF.",
      );
    } finally {
      setConsultandoCpf(false);
    }
  }

  function salvarTitular() {
    if (!rascunho?.validado) {
      setErroTitular("Valide o CPF do titular antes de salvar.");
      return;
    }
    setNovos((atuais) => [...atuais, rascunho]);
    setConferenciaAberta(false);
    setConferenciaVista(false);
    setRascunho(null);
    setErroTitular("");
  }

  function abrirConferencia() {
    if (novos.length === 0 || rascunho) return;

    setConferenciaVista(true);
    setConferenciaAberta(true);
  }

  function imprimirConferencia() {
    window.print();
  }

  async function atualizarBoleto() {
    if (!dados?.contrato?.num_contrato || novos.length === 0) return;
    setEnviando(true);
    setResultado(null);
    try {
      const response = await enviarIntegracao(WEBHOOK_COMPLEMENTAR_ADESAO, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token_complemento: dados.token_complemento || "",
          num_contrato: dados.contrato.num_contrato,
          cpf_assoc: somenteNumerosCpf(cpfAssoc),
          titulares_adicionados: novos.map((titular) => ({
            cpf_titular: somenteNumerosCpf(titular.cpf),
            nome_titular: titular.nome,
            nasc_titular: nascimentoBr(titular.nascimento),
            email_titular: titular.email.trim().toLowerCase(),
            tel_titular: onlyDigits(titular.telefone),
            cod_plano: titular.plan === "familia" ? "2880" : "2878",
            consulta_id: titular.consultaId,
          })),
        }),
      });
      const result = (await response.json().catch(() => null)) as {
        sucesso?: boolean;
        mensagem?: string;
        url_pagamento?: string;
      } | null;
      if (!response.ok || !result?.sucesso) {
        throw new Error(
          result?.mensagem || "Não foi possível atualizar a adesão.",
        );
      }
      setResultado(result);
    } catch (error) {
      setResultado({
        mensagem:
          error instanceof Error
            ? error.message
            : "Não foi possível atualizar a adesão.",
      });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="min-h-screen bg-ocean-50 px-4 py-8 sm:px-6">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #conferencia-inclusao,
          #conferencia-inclusao * { visibility: visible; }
          #conferencia-inclusao {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: 0;
            box-shadow: none;
          }
          .nao-imprimir { display: none !important; }
        }
      `}</style>
      <div className="mx-auto max-w-4xl">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-ocean-700 hover:text-ocean-900"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao início
        </a>

        <section className="mt-5 rounded-3xl border border-ocean-100 bg-white p-6 shadow-card sm:p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-ocean-100 p-3 text-ocean-700">
              <UsersRound className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-ocean-500">
                Adesão coletiva pendente
              </p>
              <h1 className="font-display text-2xl font-bold text-ocean-900">
                Completar cadastro de titulares
              </h1>
              <p className="mt-2 text-sm text-ocean-600">
                Use o CPF do associado responsável para incluir novas vidas
                antes do primeiro pagamento.
              </p>
            </div>
          </div>

          {!dados && (
            <div className="mt-6 max-w-md">
              <label className="label-field">
                CPF do associado responsável
              </label>
              <input
                value={cpfAssoc}
                onChange={(event) => setCpfAssoc(formatCPF(event.target.value))}
                inputMode="numeric"
                className="input-field"
                placeholder="000.000.000-00"
              />
              <button
                type="button"
                onClick={buscarAdesao}
                disabled={buscando || !validarCpf(cpfAssoc)}
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-ocean-700 px-5 py-3 text-sm font-bold text-white hover:bg-ocean-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {buscando ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="h-4 w-4" />
                )}
                {buscando ? "Buscando..." : "Buscar adesão pendente"}
              </button>
              {erroBusca && (
                <p className="mt-3 flex gap-2 text-sm font-semibold text-red-600">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  {erroBusca}
                </p>
              )}
            </div>
          )}

          {dados?.contrato && (
            <>
              <div className="mt-6 grid gap-3 rounded-2xl bg-ocean-50 p-5 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-ocean-500">Contrato</p>
                  <p className="font-bold text-ocean-900">
                    {dados.contrato.num_contrato}
                  </p>
                </div>
                <div>
                  <p className="text-ocean-500">Titulares cadastrados</p>
                  <p className="font-bold text-ocean-900">
                    {titularesExistentes.length}
                  </p>
                </div>
                <div>
                  <p className="text-ocean-500">Valor atual</p>
                  <p className="font-bold text-ocean-900">
                    {moeda(Number(dados.contrato.vl_total ?? 0))}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-ocean-100 p-5">
                <h2 className="font-display text-lg font-bold text-ocean-900">
                  Titulares já cadastrados
                </h2>
                <ul className="mt-3 space-y-2 text-sm text-ocean-700">
                  {titularesExistentes.map((titular, index) => (
                    <li key={`${titular.cpf_titular}-${index}`}>
                      {index + 1}. {titular.nome_titular} —{" "}
                      {String(titular.cod_plano) === "2880"
                        ? "FAMILIAR"
                        : "INDIVIDUAL"}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 rounded-2xl border border-mint-200 bg-mint-50 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display text-lg font-bold text-ocean-900">
                      Novos titulares
                    </h2>
                    <p className="text-sm text-ocean-600">
                      E-mail e telefone são opcionais. Se vazios, serão usados
                      os contatos do associado responsável.
                    </p>
                  </div>
                  {!rascunho && (
                    <button
                      type="button"
                      onClick={() => setRascunho(novoTitular())}
                      className="inline-flex items-center gap-2 rounded-xl bg-mint-600 px-4 py-3 text-sm font-bold text-white hover:bg-mint-700"
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar
                    </button>
                  )}
                </div>
                {novos.map((titular) => (
                  <div
                    key={titular.id}
                    className="mt-3 flex items-center justify-between rounded-xl bg-white p-3 text-sm"
                  >
                    <span>
                      {titular.nome} —{" "}
                      {titular.plan === "familia" ? "FAMILIAR" : "INDIVIDUAL"}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        {
                          setNovos((atuais) =>
                            atuais.filter((item) => item.id !== titular.id),
                          );
                          setConferenciaAberta(false);
                          setConferenciaVista(false);
                        }
                      }
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {rascunho && (
                  <div className="mt-5 grid gap-4 rounded-xl bg-white p-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <p className="label-field">Plano</p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            alterarRascunho({ plan: "individual" })
                          }
                          className={`rounded-xl px-4 py-2 text-sm font-bold ${rascunho.plan === "individual" ? "bg-blue-700 text-white" : "bg-ocean-100 text-ocean-700"}`}
                        >
                          Individual
                        </button>
                        <button
                          type="button"
                          onClick={() => alterarRascunho({ plan: "familia" })}
                          className={`rounded-xl px-4 py-2 text-sm font-bold ${rascunho.plan === "familia" ? "bg-green-600 text-white" : "bg-ocean-100 text-ocean-700"}`}
                        >
                          Familiar
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="label-field">CPF do titular</label>
                      <input
                        value={rascunho.cpf}
                        onChange={(event) =>
                          alterarCpfTitular(event.target.value)
                        }
                        disabled={consultandoCpf}
                        inputMode="numeric"
                        className="input-field"
                        placeholder="000.000.000-00"
                      />
                      <button
                        type="button"
                        onClick={validarCpfTitular}
                        disabled={consultandoCpf || !validarCpf(rascunho.cpf)}
                        className="mt-2 inline-flex items-center gap-2 rounded-xl bg-ocean-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                      >
                        {consultandoCpf ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ShieldCheck className="h-4 w-4" />
                        )}
                        {consultandoCpf ? "Consultando..." : "Validar CPF"}
                      </button>
                    </div>
                    <div>
                      <label className="label-field">Nome do titular</label>
                      <input
                        value={rascunho.nome}
                        readOnly
                        disabled={!rascunho.validado}
                        className="input-field"
                        placeholder="Preenchido após validar o CPF"
                      />
                    </div>
                    <div>
                      <label className="label-field">
                        Nascimento do titular
                      </label>
                      <input
                        type="date"
                        value={rascunho.nascimento}
                        readOnly
                        disabled={!rascunho.validado}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="label-field">
                        E-mail do titular (opcional)
                      </label>
                      <input
                        type="email"
                        value={rascunho.email}
                        onChange={(event) =>
                          alterarRascunho({ email: event.target.value })
                        }
                        disabled={!rascunho.validado}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="label-field">
                        Telefone do titular (opcional)
                      </label>
                      <input
                        value={rascunho.telefone}
                        onChange={(event) =>
                          alterarRascunho({
                            telefone: formatPhone(event.target.value),
                          })
                        }
                        disabled={!rascunho.validado}
                        inputMode="numeric"
                        className="input-field"
                      />
                    </div>
                    {rascunho.validado && (
                      <p className="sm:col-span-2 flex items-center gap-2 text-sm font-bold text-mint-700">
                        <CheckCircle2 className="h-5 w-5" />
                        CPF validado. Nome e nascimento preenchidos.
                      </p>
                    )}
                    {erroTitular && (
                      <p className="sm:col-span-2 text-sm font-bold text-red-600">
                        {erroTitular}
                      </p>
                    )}
                    <div className="sm:col-span-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setRascunho(null)}
                        className="rounded-xl border border-ocean-200 px-4 py-3 text-sm font-bold text-ocean-700"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={salvarTitular}
                        disabled={!rascunho.validado}
                        className="rounded-xl bg-mint-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
                      >
                        Salvar titular
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {novos.length > 0 && !rascunho && (
                <div className="mt-6 rounded-2xl border border-ocean-200 bg-white p-5">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <h2 className="font-display text-lg font-bold text-ocean-900">
                        Conferência antes do envio
                      </h2>
                      <p className="mt-1 text-sm text-ocean-600">
                        Revise a relação completa e, se desejar, imprima ou salve
                        em PDF antes de atualizar o boleto.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={abrirConferencia}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-ocean-700 px-4 py-3 text-sm font-bold text-ocean-800 hover:bg-ocean-50"
                    >
                      <FileText className="h-4 w-4" />
                      Conferir relação
                    </button>
                  </div>
                </div>
              )}

              {conferenciaAberta && dados?.contrato && (
                <section
                  id="conferencia-inclusao"
                  className="mt-6 rounded-2xl border-2 border-ocean-200 bg-white p-6 text-ocean-900 shadow-card"
                >
                  <div className="flex flex-col justify-between gap-4 border-b border-ocean-100 pb-5 sm:flex-row sm:items-start">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-ocean-500">
                        Prévia para conferência
                      </p>
                      <h2 className="font-display text-2xl font-bold">
                        Inclusão de novos titulares
                      </h2>
                      <p className="mt-1 text-sm text-ocean-600">
                        Contrato {dados.contrato.num_contrato}
                      </p>
                    </div>
                    <div className="text-sm sm:text-right">
                      <p className="text-ocean-500">Associado responsável</p>
                      <p className="font-bold">{dados.associado?.nome_assoc}</p>
                      <p>{formatCPF(String(dados.associado?.cpf_assoc ?? cpfAssoc))}</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
                    <div className="rounded-xl bg-ocean-50 p-4">
                      <p className="text-ocean-500">Titulares atuais</p>
                      <p className="mt-1 text-xl font-bold">{titularesExistentes.length}</p>
                    </div>
                    <div className="rounded-xl bg-mint-50 p-4">
                      <p className="text-ocean-600">Novas inclusões</p>
                      <p className="mt-1 text-xl font-bold">{novos.length}</p>
                    </div>
                    <div className="rounded-xl bg-ocean-900 p-4 text-white">
                      <p className="text-ocean-200">Nova mensalidade</p>
                      <p className="mt-1 text-xl font-bold">{moeda(resumo.totalMonthly)}</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-bold">Titulares já cadastrados</h3>
                    <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-ocean-700">
                      {titularesExistentes.map((titular, index) => (
                        <li key={`conferencia-existente-${titular.cpf_titular}-${index}`}>
                          {titular.nome_titular} — {String(titular.cod_plano) === "2880" ? "FAMILIAR" : "INDIVIDUAL"}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="mt-6 rounded-xl border border-mint-200 bg-mint-50 p-4">
                    <h3 className="font-bold text-mint-800">Novos titulares a incluir</h3>
                    <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-ocean-800">
                      {novos.map((titular) => (
                        <li key={`conferencia-novo-${titular.id}`}>
                          {titular.nome} — {titular.plan === "familia" ? "FAMILIAR" : "INDIVIDUAL"} — CPF {formatCPF(titular.cpf)}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                    Esta é uma prévia para conferência. Os novos titulares ficarão
                    pendentes e serão ativados após a confirmação do pagamento do boleto.
                  </p>

                  <div className="nao-imprimir mt-5 flex flex-col justify-end gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => setConferenciaAberta(false)}
                      className="rounded-xl border border-ocean-200 px-4 py-3 text-sm font-bold text-ocean-700"
                    >
                      Voltar para editar
                    </button>
                    <button
                      type="button"
                      onClick={imprimirConferencia}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-ocean-700 px-4 py-3 text-sm font-bold text-white hover:bg-ocean-800"
                    >
                      <Printer className="h-4 w-4" />
                      Imprimir / salvar em PDF
                    </button>
                  </div>
                </section>
              )}

              <div className="mt-6 rounded-2xl bg-ocean-900 p-5 text-white">
                <p className="text-sm text-ocean-200">
                  Nova mensalidade após incluir {novos.length} vida(s)
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {moeda(resumo.totalMonthly)}
                </p>
                <p className="mt-1 text-sm text-ocean-200">
                  {resumo.individualCount} individual(is) e {resumo.familyCount}{" "}
                  familiar(es).
                </p>
                <button
                  type="button"
                  onClick={atualizarBoleto}
                  disabled={
                    enviando ||
                    novos.length === 0 ||
                    !!rascunho ||
                    !conferenciaVista
                  }
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-ocean-900 disabled:opacity-50"
                >
                  {enviando && <Loader2 className="h-4 w-4 animate-spin" />}
                  {enviando ? "Atualizando..." : "Atualizar adesão e boleto"}
                </button>
                {!conferenciaVista && novos.length > 0 && !rascunho && (
                  <p className="mt-3 text-sm font-semibold text-ocean-200">
                    Abra a conferência da relação antes de atualizar a adesão.
                  </p>
                )}
              </div>
              {resultado && (
                <div
                  className={`mt-5 rounded-2xl p-5 text-sm font-semibold ${resultado.url_pagamento ? "bg-mint-50 text-mint-800" : "bg-red-50 text-red-700"}`}
                >
                  {resultado.mensagem}
                  {resultado.url_pagamento && (
                    <a
                      href={resultado.url_pagamento}
                      className="mt-3 block font-bold underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Abrir novo boleto
                    </a>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
