import {
  dataBrasileira, elegibilidade, podeSelecionar, resumir, rotulo, situacaoPagamento, somar, valor,
} from "./dadosComissoes";
import type { ColaboradorResumo, ComissaoDetalhe } from "./dadosComissoes";

type Tipo = "geral" | "guia" | "simplificado";
type Contexto = {
  baseValidada: boolean;
  competencia: string;
  lote: string;
  dataReferencia: string;
  dadosPixAutorizados?: boolean;
};

const titulos = {
  geral: "Relatório Geral de Comissões",
  guia: "Guia de Pagamentos e Baixas",
  simplificado: "Relatório Simplificado por Colaborador",
};

export function fechamentoDoLote(lote: string) {
  const partes = lote.match(/^(\d{4})-(0[1-9]|1[0-2])-05$/);
  if (!partes) return null;
  const anterior = new Date(Date.UTC(Number(partes[1]), Number(partes[2]) - 2, 20));
  return anterior.toISOString().slice(0, 10);
}

function escapar(texto: string) {
  return texto.replace(/[&<>"']/g, (caractere) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[caractere] ?? caractere));
}

function tabela(colunas: string[], linhas: string[][], rodape?: string[]) {
  return `<table><thead><tr>${colunas.map((coluna) => `<th scope="col">${escapar(coluna)}</th>`).join("")}
    </tr></thead><tbody>${linhas.map((linha) => `<tr>${linha.map((celula) =>
      `<td>${celula === "☐" ? '<span class="check" aria-label="Marcar pago"></span>' : escapar(celula)}</td>`).join("")}</tr>`).join("")}
    </tbody></table>${rodape ? `<p class="totais">${escapar(rodape.join(" · "))}</p>` : ""}`;
}

function totais(itens: ComissaoDetalhe[]) {
  const resumo = resumir(itens, false);
  return [`Gerado ${valor(resumo.total_gerado)}`, `Pago ${valor(resumo.total_pago)}`,
    `Pendente ${valor(resumo.total_pendente)}`];
}

const porCodigo = new Intl.Collator("pt-BR", { numeric: true });
const percentual = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 2 });

export function montagemRelatorio(tipo: Tipo, colaboradores: ColaboradorResumo[], contexto: Contexto) {
  const { baseValidada, competencia, lote, dataReferencia } = contexto;
  const fechamento = fechamentoDoLote(lote);
  const guiaDisponivel = baseValidada && fechamento !== null && fechamento <= dataReferencia;
  const grupos = [...colaboradores].sort((a, b) => porCodigo.compare(a.cod_colab, b.cod_colab))
    .map((grupo) => ({
      ...grupo,
      comissoes: grupo.comissoes.filter((item) => tipo !== "guia"
        || (guiaDisponivel && item.data_prevista_iso === lote && podeSelecionar(item, baseValidada))),
    })).filter((grupo) => tipo === "simplificado" || grupo.comissoes.length > 0);
  const itens = grupos.flatMap((grupo) => grupo.comissoes);
  const filtros = [
    competencia ? `Competência ${competencia.slice(5)}/${competencia.slice(0, 4)}` : "Todas as competências",
    lote ? `Previsão do lote ${dataBrasileira(lote)}` : "Todos os lotes",
    ...(tipo === "guia" && fechamento ? [`Fechamento ${dataBrasileira(fechamento)}`] : []),
  ];

  let conteudo = '<p class="vazio">Nenhum lançamento para os filtros selecionados.</p>';
  if (tipo === "simplificado" && grupos.length) {
    conteudo = tabela(["Código", "Colaborador", "Total gerado", "Total pago", "Saldo pendente"], grupos.map((grupo) => {
      const resumo = resumir(grupo.comissoes, false);
      return [grupo.cod_colab, grupo.nome_colab, valor(resumo.total_gerado), valor(resumo.total_pago), valor(resumo.total_pendente)];
    }));
  } else if (itens.length) {
    conteudo = grupos.map((grupo) => {
      const colunas = tipo === "guia"
        ? ["ID da comissão", "Contrato", "Tipo", "Competência", "Valor", "PAGO"]
        : ["ID / Contrato", "Tipo / Competência", "Percentual", "Valor base", "Comissão",
          "Elegibilidade / Situação", "Status da comissão", "Previsão", "Pagamento"];
      const linhas = grupo.comissoes.map((item) => tipo === "guia"
        ? [item.id_comissao, item.num_contrato, rotulo(item.tipo_comissao), item.competencia, valor(item.vl_comissao), "☐"]
        : [`${item.id_comissao}\n${item.num_contrato}`, `${rotulo(item.tipo_comissao)}\n${item.competencia}`,
          percentual.format(item.percentual / 100), valor(item.vl_base), valor(item.vl_comissao),
          `${elegibilidade(item, baseValidada)}\n${situacaoPagamento(item)}`, rotulo(item.status_comissao),
          dataBrasileira(item.data_prevista_iso), dataBrasileira(item.dt_pagamento)]);
      const dadosPix = tipo === "guia" && contexto.dadosPixAutorizados === true
        ? [grupo.cpf_colab && `CPF ${grupo.cpf_colab}`, grupo.pix_colab && `PIX ${grupo.pix_colab}`].filter(Boolean).join(" · ")
        : "";
      return `<section><h2>${escapar(grupo.cod_colab)} · ${escapar(grupo.nome_colab)}</h2>
        ${dadosPix ? `<p class="dados-pix">${escapar(dadosPix)}</p>` : ""}
        ${tabela(colunas, linhas, tipo === "guia" ? [`Subtotal a pagar ${valor(somar(grupo.comissoes))}`] : totais(grupo.comissoes))}</section>`;
    }).join("");
  }

  const resumoFinal = tipo === "guia"
    ? `Total geral do lote ${valor(somar(itens))}`
    : `Totais gerais · ${totais(itens).join(" · ")}`;

  return `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${titulos[tipo]}</title><style>
    @page { size: A4 ${tipo === "geral" ? "landscape" : "portrait"}; margin: 13mm; }
    * { box-sizing:border-box; } body { margin: 20px auto; max-width: 1100px; padding: 0 12px; color:#162238; font:12px system-ui,sans-serif; }
    h1 { font-size: 23px; margin: 2px 0 6px; } h2 { font-size: 15px; margin: 16px 0 5px; break-after:avoid; }
    p { margin: 6px 0; } header { border-bottom: 2px solid #19477b; padding-bottom: 10px; margin-bottom: 14px; }
    table { width:100%; border-collapse:collapse; table-layout:fixed; } thead { display:table-header-group; }
    th, td { text-align:left; vertical-align:top; padding:6px; border-bottom:1px solid #cbd5e1; overflow-wrap:anywhere; white-space:pre-line; }
    th { color:#102742; background:#edf2f7; } tr { break-inside:avoid; } th:first-child { width: ${tipo === "simplificado" ? "15%" : "22%"}; }
    .dados-pix { overflow-wrap:anywhere; break-after:avoid; }
    .totais, footer { padding:8px 0; font-weight:700; break-inside:avoid; } footer { margin-top:14px; border-top:2px solid #19477b; }
    .check { display:inline-block; width:13px; height:13px; border:1px solid #162238; } .vazio { padding:12px 0; }
    button { padding:10px; margin-bottom:12px; } @media print { body { margin:0; padding:0; max-width:none; } button { display:none; } }
    </style><body><button type="button" id="imprimir">Imprimir ou salvar PDF</button>
    <header><strong>ConsulToque · Financeiro</strong><h1>${titulos[tipo]}</h1>
    <p>${escapar(filtros.join(" · "))}</p>
    ${tipo === "guia" ? "<p>Chaves PIX devem ser conferidas no cadastro autorizado antes da transferência.</p>" : ""}</header>
    <main>${conteudo}</main><footer><p>${escapar(resumoFinal)}</p>
    ${tipo === "guia" ? "<p>Data efetiva ____/____/________ · Conferido por ____________________________</p>" : ""}
    </footer></body></html>`;
}

export function imprimirRelatorio(documento: string) {
  const janela = window.open("", "_blank");
  if (!janela) return false;
  janela.opener = null;
  janela.document.open();
  janela.document.write(documento);
  janela.document.close();
  janela.document.getElementById("imprimir")?.addEventListener("click", () => janela.print());
  janela.focus();
  return true;
}
