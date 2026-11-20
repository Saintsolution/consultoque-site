import { imprimirRelatorio, montagemRelatorio, fechamentoDoLote } from "./relatoriosComissoes";
import { dataBrasileira, elegibilidade, podeSelecionar, resumir, rotulo, situacaoPagamento, somar, valor } from "./dadosComissoes";
import type { ComissaoDetalhe, PagamentosComissao, ResumoComissoes } from "./dadosComissoes";
export type { PagamentosComissao } from "./dadosComissoes";
import { Admin_ENDPOINT_BAIXAS_COMISSOES } from "@/services/endpoints";
import { enviarIntegracao } from "@/services/http";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

const indicadores = [
  ["total_gerado", "Total gerado"],
  ["total_pago", "Pago"],
  ["total_pendente", "Pendente"],
  ["total_devido_liberado", "Devido liberado"],
  ["total_vencido", "Vencido"],
  ["total_a_vencer", "A vencer"],
  ["total_em_conferencia", "Em conferência"],
] as const satisfies ReadonlyArray<readonly [keyof ResumoComissoes, string]>;

const percentual = new Intl.NumberFormat("pt-BR");
const porCodigo = new Intl.Collator("pt-BR", { numeric: true });

function competenciaNormalizada(competencia: string) {
  const partes = competencia.trim().match(/^(0?[1-9]|1[0-2])\/(\d{4})$/);
  return partes ? `${partes[2]}-${partes[1].padStart(2, "0")}` : "";
}

async function copiarId(campo: HTMLInputElement) {
  campo.focus();
  campo.select();
  try {
    await navigator.clipboard.writeText(campo.value);
  } catch {
    // A seleção deixa o identificador disponível para a cópia nativa.
  }
}

function Identificador({ id, numero }: { id: string; numero: number }) {
  const campo = useRef<HTMLInputElement>(null);

  return (
    <details className="relative">
      <summary className="cursor-pointer whitespace-nowrap font-semibold text-blue-700">
        #{numero} <span className="sr-only">Ver ID completo</span>
      </summary>
      <div className="mt-1 flex flex-wrap gap-2">
        <input ref={campo} readOnly value={id} aria-label="ID completo da comissão"
          className="w-48 max-w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs font-mono" />
        <button type="button" className="rounded px-2 py-1 font-semibold text-blue-700"
          onClick={() => campo.current && void copiarId(campo.current)}>
          Copiar ID
        </button>
      </div>
    </details>
  );
}

function podeConferirBaixa(item: ComissaoDetalhe, baseValidada: boolean) {
  return item.status_comissao === "PENDENTE" && podeSelecionar(item, baseValidada);
}

function DetalhesComissoes({ comissoes, baseValidada, selecionados, alternar, numeros }: {
  comissoes: ComissaoDetalhe[];
  baseValidada: boolean;
  selecionados: Set<string>;
  alternar: (id: string) => void;
  numeros: Map<string, number>;
}) {
  if (!comissoes.length) {
    return <p className="p-4 text-slate-600">Nenhuma comissão nesta consulta.</p>;
  }

  return (
    <ul aria-label="Lançamentos de comissão" className="space-y-2">
      {comissoes.map((item, indice) => {
        const campos = [
          ["Contrato", item.num_contrato],
          ["Tipo", rotulo(item.tipo_comissao)],
          ["Competência", item.competencia],
          ["Percentual", Number.isFinite(item.percentual) ? `${percentual.format(item.percentual)}%` : "—"],
          ["Valor", valor(item.vl_comissao)],
          ["Previsão", dataBrasileira(item.data_prevista_iso)],
          ["Elegibilidade", elegibilidade(item, baseValidada)],
          ["Situação", situacaoPagamento(item)],
          ["Status da comissão", rotulo(item.status_comissao)],
          ["Data do pagamento", dataBrasileira(item.dt_pagamento)],
        ];
        return (
          <li key={item.id_comissao} className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
            <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
              <Identificador id={item.id_comissao} numero={numeros.get(item.id_comissao) ?? indice + 1} />
              {podeConferirBaixa(item, baseValidada) && (
                <label className="flex min-h-10 items-center gap-2 px-2 font-medium text-slate-700">
                  <input type="checkbox" value={item.id_comissao}
                    aria-label={`Conferir comissão ${item.id_comissao}`}
                    checked={selecionados.has(item.id_comissao)}
                    onChange={() => alternar(item.id_comissao)} className="h-5 w-5 accent-blue-700" />
                  Conferir baixa
                </label>
              )}
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 2xl:grid-cols-5">
              {campos.map(([titulo, conteudo]) => (
                <div key={titulo} className="min-w-0">
                  <dt className="text-xs font-semibold text-slate-500">{titulo}</dt>
                  <dd className={titulo === "Tipo" ? "whitespace-nowrap text-xs font-medium" : "break-words font-medium"}>{conteudo}</dd>
                </div>
              ))}
            </dl>
            {item.motivo_nao_elegivel && <p className="mt-2 text-xs text-slate-600">{item.motivo_nao_elegivel}</p>}
          </li>
        );
      })}
    </ul>
  );
}

const campoFiltro = "min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm";
const botao = "min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50";

export function ComissoesAdmin({ dados, token, onAtualizar, onSessaoExpirada }: {
  dados: PagamentosComissao;
  token: string;
  onAtualizar: () => void;
  onSessaoExpirada: () => void;
}) {
  const prefixo = useId();
  const confirmacao = useRef<HTMLDialogElement>(null);
  const enviando = useRef(false);
  const [habilitada, setHabilitada] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erroBaixa, setErroBaixa] = useState("");
  const [erroRelatorio, setErroRelatorio] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    void enviarIntegracao(Admin_ENDPOINT_BAIXAS_COMISSOES, { signal: controller.signal })
      .then(async (resposta) => {
        if (resposta.ok && (await resposta.json())?.habilitada === true && !controller.signal.aborted) {
          setHabilitada(true);
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const [codigoAberto, setCodigoAberto] = useState<string | null>(null);
  const [competencia, setCompetencia] = useState("");
  const [lote, setLote] = useState("");
  const [selecionados, setSelecionados] = useState<Set<string>>(() => new Set());
  const [dataPagamento, setDataPagamento] = useState("");
  const baseValidada = dados.conferencia_disponivel === true;
  const colaboradores = useMemo(() => Array.isArray(dados.colaboradores)
    ? [...dados.colaboradores].sort((a, b) => porCodigo.compare(a.cod_colab, b.cod_colab))
    : [], [dados.colaboradores]);
  const lancamentos = useMemo(
    () => colaboradores.flatMap((colaborador) => colaborador.comissoes ?? []),
    [colaboradores],
  );
  const idsAptos = useMemo(() => new Set(lancamentos
    .filter((item) => podeConferirBaixa(item, baseValidada))
    .map((item) => item.id_comissao)), [lancamentos, baseValidada]);

  useEffect(() => {
    setSelecionados((atuais) => {
      const aptos = [...atuais].filter((id) => idsAptos.has(id));
      return aptos.length === atuais.size ? atuais : new Set(aptos);
    });
  }, [idsAptos]);
  const competencias = [...new Set(lancamentos.map((item) => competenciaNormalizada(item.competencia)).filter(Boolean))].sort();
  const lotes = [...new Set(lancamentos.map((item) => item.data_prevista_iso).filter((data): data is string => Boolean(data)))].sort();
  const numeros = new Map(lancamentos.map((item, indice) => [item.id_comissao, indice + 1]));
  const filtrando = Boolean(competencia || lote);
  const visiveis = colaboradores.map((colaborador) => ({
    ...colaborador,
    comissoes: (colaborador.comissoes ?? []).filter((item) =>
      (!competencia || competenciaNormalizada(item.competencia) === competencia)
      && (!lote || item.data_prevista_iso === lote)),
  })).filter((item) => !filtrando || item.comissoes.length > 0);
  const indicadoresAtuais = filtrando
    ? resumir(visiveis.flatMap((item) => item.comissoes), baseValidada) : dados.indicadores;
  const itensSelecionados = [...new Map(lancamentos
    .filter((item) => selecionados.has(item.id_comissao) && podeConferirBaixa(item, baseValidada))
    .map((item) => [item.id_comissao, item])).values()];
  const loteBaixa = {
    ids_comissoes: itensSelecionados.map((item) => item.id_comissao),
    dt_pagamento: dataPagamento,
  };

  const podeRevisar = Boolean(loteBaixa.ids_comissoes.length && loteBaixa.dt_pagamento && !processando);

  async function salvar() {
    if (!habilitada || !token || !podeRevisar || enviando.current) return;

    enviando.current = true;
    setProcessando(true);
    setErroBaixa("");
    setMensagem("");
    try {
      const resposta = await enviarIntegracao(Admin_ENDPOINT_BAIXAS_COMISSOES, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Token": token },
        body: JSON.stringify(loteBaixa),
      });
      if (resposta.status === 401) {
        onSessaoExpirada();
        return;
      }

      const resultado = await resposta.json().catch(() => null);
      const ids = resultado?.ids_comissoes_atualizadas;
      if (!resposta.ok || resultado?.status !== "sucesso"
        || resultado.dt_pagamento !== loteBaixa.dt_pagamento
        || !Array.isArray(ids) || ids.length !== loteBaixa.ids_comissoes.length
        || !loteBaixa.ids_comissoes.every((id) => ids.includes(id))) {
        if (resposta.status === 503) setHabilitada(false);
        throw new Error(resultado?.mensagem || "O servidor não confirmou o lote. Confira o painel.");
      }

      setSelecionados(new Set());
      setDataPagamento("");
      confirmacao.current?.close();
      setMensagem("Baixas confirmadas. Atualizando o painel.");
      onAtualizar();
    } catch (erro) {
      setErroBaixa(erro instanceof Error ? erro.message : "Não foi possível confirmar a baixa.");
    } finally {
      enviando.current = false;
      setProcessando(false);
    }
  }

  const fechamento = fechamentoDoLote(lote);
  const dataReferencia = dados.data_referencia ?? new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Sao_Paulo",
  }).format();
  const guiaDisponivel = baseValidada && fechamento !== null && fechamento <= dataReferencia;

  function gerarRelatorio(tipo: "geral" | "guia" | "simplificado") {
    setErroRelatorio("");
    if (tipo === "guia" && !guiaDisponivel) return;
    const documento = montagemRelatorio(tipo, visiveis, {
      baseValidada,
      competencia,
      lote,
      dataReferencia,
      dadosPixAutorizados: dados.dados_pix_autorizados === true,
    });
    if (!imprimirRelatorio(documento)) setErroRelatorio("Permita a abertura de uma janela para imprimir ou salvar o PDF.");
  }

  function alternar(id: string) {
    if (!idsAptos.has(id)) return;
    setSelecionados((atuais) => {
      const novos = new Set(atuais);
      if (novos.has(id)) novos.delete(id);
      else novos.add(id);
      return novos;
    });
  }

  return (
    <section aria-labelledby={`${prefixo}-titulo`} className="min-w-0 space-y-4">
      <h2 id={`${prefixo}-titulo`} className="text-xl font-black text-slate-950">Comissões</h2>
      {!baseValidada && (
        <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900">
          A conferência das cobranças está indisponível.
        </p>
      )}
      <div className="grid items-end gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-[1fr_1fr_auto]">
        <label className="space-y-1 text-sm font-semibold">
          <span>Competência</span>
          <select className={campoFiltro} value={competencia} onChange={(evento) => setCompetencia(evento.target.value)}>
            <option value="">Todas as competências</option>
            {competencias.map((mes) => <option key={mes} value={mes}>{mes.slice(5)}/{mes.slice(0, 4)}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-sm font-semibold">
          <span>Lote pela previsão de pagamento</span>
          <select className={campoFiltro} value={lote} onChange={(evento) => setLote(evento.target.value)}>
            <option value="">Todos os lotes</option>
            {lotes.map((data) => <option key={data} value={data}>{dataBrasileira(data)}</option>)}
          </select>
        </label>
        <button type="button" className={botao} disabled={!filtrando}
          onClick={() => { setCompetencia(""); setLote(""); }}>
          Limpar filtros
        </button>
      </div>
      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        {indicadores.map(([campo, titulo]) => {
          const historico = campo === "total_gerado" || campo === "total_pago" || campo === "total_pendente";
          return (
            <div key={campo} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <dt className="text-sm font-semibold text-slate-600">{titulo}</dt>
              <dd className="mt-2 whitespace-nowrap text-lg font-black text-slate-950">
                {valor(baseValidada || historico ? indicadoresAtuais?.[campo] : undefined)}
              </dd>
            </div>
          );
        })}
      </dl>
      <section aria-label="Relatórios de comissões" className="space-y-2 rounded-xl border border-slate-200 bg-white p-3">
        <h3 className="font-bold">Relatórios PDF</h3>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={botao} onClick={() => gerarRelatorio("geral")}>Relatório geral</button>
          <button type="button" className={botao} disabled={!guiaDisponivel}
            onClick={() => gerarRelatorio("guia")}>Guia de pagamentos e baixas</button>
          <button type="button" className={botao} onClick={() => gerarRelatorio("simplificado")}>Relatório simplificado</button>
        </div>
        {!guiaDisponivel && <p className="text-sm text-slate-600">Para emitir o guia, selecione um lote do dia 05 com fechamento já alcançado e cobranças conferidas.</p>}
        {erroRelatorio && <p role="alert" className="text-sm text-red-700">{erroRelatorio}</p>}
      </section>
      <section aria-label="Conferência de baixas" className="space-y-3 rounded-xl border border-slate-200 bg-white p-3">
        <h3 className="font-bold">Conferência de baixas</h3>
        <p role="status" className="text-sm font-medium">
          {itensSelecionados.length} selecionado(s) · {valor(somar(itensSelecionados))}
        </p>
        <div className="flex flex-wrap items-end gap-2">
          <label className="w-full space-y-1 text-sm font-semibold sm:w-auto">
            <span>Data do pagamento</span>
            <input type="date" className={campoFiltro} value={dataPagamento}
              onChange={(evento) => setDataPagamento(evento.target.value)} />
          </label>
          <button type="button" className={botao} disabled={!itensSelecionados.length}
            onClick={() => setSelecionados(new Set())}>Limpar seleção</button>
          <button type="button" className={botao} disabled={!podeRevisar}
            onClick={() => confirmacao.current?.showModal()}>Revisar lote</button>
          <button type="button" className={botao} disabled={!habilitada || !podeRevisar}
            onClick={() => confirmacao.current?.showModal()}>Salvar Baixas</button>
        </div>
        <p className="text-sm text-slate-600">{habilitada ? "Confira os lançamentos antes de confirmar a baixa." : "Gravação pendente de homologação no n8n."} A seleção acompanha você ao trocar de filtro.</p>
        {mensagem && <p role="status" className="text-sm text-emerald-700">{mensagem}</p>}
      </section>
      <dialog ref={confirmacao} onCancel={(evento) => { if (enviando.current) evento.preventDefault(); }} aria-labelledby={`${prefixo}-confirmacao`}
        className="m-auto max-h-[85dvh] w-11/12 max-w-lg overflow-y-auto rounded-xl p-4 shadow-xl backdrop:bg-slate-900/60">
        <h3 id={`${prefixo}-confirmacao`} className="font-bold">Confirmar lançamentos do lote</h3>
        <p className="my-2 text-sm">{loteBaixa.ids_comissoes.length} lançamento(s) · {valor(somar(itensSelecionados))} · {dataBrasileira(loteBaixa.dt_pagamento)}</p>
        <ul className="mb-3 space-y-1 text-sm">
          {itensSelecionados.map((item) => <li key={item.id_comissao} className="break-all">{item.id_comissao} · {valor(item.vl_comissao)}</li>)}
        </ul>
        {!habilitada && <p className="mb-3 text-sm text-slate-600">A gravação será habilitada após homologação do endpoint.</p>}
        {erroBaixa && <p role="alert" className="mb-3 text-sm text-red-700">{erroBaixa}</p>}
        <form method="dialog" className="flex flex-wrap gap-2">
          <button className={botao} disabled={processando}>Voltar à seleção</button>
          <button type="button" className={botao} disabled={!habilitada || !podeRevisar}
            onClick={() => void salvar()}>{processando ? "Salvando…" : "Salvar Baixas"}</button>
        </form>
      </dialog>
      <div className="space-y-2" aria-label="Comissões por colaborador">
        {visiveis.map((colaborador) => {
          const codigo = colaborador.cod_colab;
          const aberto = codigoAberto === codigo;
          const detalheId = `${prefixo}-detalhe-${codigo}`;
          const Icone = aberto ? ChevronDown : ChevronRight;
          const resumo = filtrando ? resumir(colaborador.comissoes, baseValidada) : colaborador;
          return (
            <article key={codigo} className="rounded-xl border border-slate-200 bg-white">
              <button type="button" aria-expanded={aberto} aria-controls={detalheId}
                onClick={() => setCodigoAberto(aberto ? null : codigo)}
                className="grid w-full gap-2 rounded-xl p-3 text-left hover:bg-slate-50 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-center">
                <span className="flex items-center gap-2 text-sm font-bold">
                  <Icone size={16} className="shrink-0" aria-hidden="true" />{codigo} · {colaborador.nome_colab}
                </span>
                <span className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                  {[
                    ["Total gerado", valor(resumo.total_gerado)],
                    ["Pago", valor(resumo.total_pago)],
                    ["Pendente", valor(resumo.total_pendente)],
                    ["Devido liberado", valor(baseValidada ? resumo.total_devido_liberado : undefined)],
                  ].map(([titulo, total]) => (
                    <span key={titulo} className="font-semibold">
                      <span className="block text-xs text-slate-500">{titulo}</span>{total}
                    </span>
                  ))}
                </span>
              </button>
              <div id={detalheId} hidden={!aberto} className="rounded-b-xl bg-slate-50 p-2 sm:p-3">
                {aberto && <DetalhesComissoes comissoes={colaborador.comissoes} baseValidada={baseValidada}
                  selecionados={selecionados} alternar={alternar} numeros={numeros} />}
              </div>
            </article>
          );
        })}
        {!visiveis.length && <p className="p-4 text-slate-600">Nenhum colaborador nesta consulta.</p>}
      </div>
    </section>
  );
}
