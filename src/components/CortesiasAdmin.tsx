import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  CheckCircle2,
  Gift,
  Loader2,
  Plus,
  Power,
  PowerOff,
  Search,
  X,
} from "lucide-react";

const WEBHOOK_CORTESIAS =
  "https://n8n.saintsolution.com.br/webhook/admin-cortesias";

type Registro = Record<string, unknown>;

type RespostaCortesia = {
  status?: string;
  autorizado?: boolean;
  rota?: string;
  prosseguir?: boolean;
  mensagem?: string;
  num_contrato?: string;
  status_titular?: string;
};

type FormularioCortesia = {
  tit_nome: string;
  tit_cpf: string;
  tit_tel: string;
  tit_email: string;
  tit_nasc: string;
  planoid: "1380" | "1382";
};

type Propriedades = {
  registros: Registro[];
  token: string;
  onAtualizar: () => void | Promise<void>;
  onSessaoExpirada: () => void;
};

const formularioVazio: FormularioCortesia = {
  tit_nome: "",
  tit_cpf: "",
  tit_tel: "",
  tit_email: "",
  tit_nasc: "",
  planoid: "1380",
};

function texto(valor: unknown) {
  return String(valor ?? "").trim();
}

function somenteNumeros(valor: unknown) {
  return texto(valor).replace(/\D/g, "");
}

function primeiroResultado<T>(valor: T | T[]): T {
  return Array.isArray(valor) ? valor[0] : valor;
}

function cpfExibicao(valor: unknown) {
  const cpf = somenteNumeros(valor);

  if (cpf.length !== 11) {
    return texto(valor) || "—";
  }

  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(
    6,
    9,
  )}-${cpf.slice(9)}`;
}

function telefoneExibicao(valor: unknown) {
  const telefone = somenteNumeros(valor);

  if (telefone.length === 11) {
    return `(${telefone.slice(0, 2)}) ${telefone.slice(
      2,
      7,
    )}-${telefone.slice(7)}`;
  }

  if (telefone.length === 10) {
    return `(${telefone.slice(0, 2)}) ${telefone.slice(
      2,
      6,
    )}-${telefone.slice(6)}`;
  }

  return texto(valor) || "—";
}

function dataParaBrasil(valor: string) {
  const partes = valor.split("-");

  if (
    partes.length === 3 &&
    partes[0].length === 4 &&
    partes[1].length === 2 &&
    partes[2].length === 2
  ) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  return valor;
}

function estaAtivo(registro: Registro) {
  return texto(registro.status_titular).toLowerCase() === "ativo";
}

export function CortesiasAdmin({
  registros,
  token,
  onAtualizar,
  onSessaoExpirada,
}: Propriedades) {
  const [busca, setBusca] = useState("");
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [formulario, setFormulario] =
    useState<FormularioCortesia>(formularioVazio);
  const [enviando, setEnviando] = useState(false);
  const [cpfEmAlteracao, setCpfEmAlteracao] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const totais = useMemo(() => {
    const ativas = registros.filter(estaAtivo).length;

    return {
      total: registros.length,
      ativas,
      inativas: registros.length - ativas,
    };
  }, [registros]);

  const registrosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) return registros;

    return registros.filter((registro) =>
      [
        registro.num_contrato,
        registro.tit_nome,
        registro.tit_cpf,
        registro.tit_email,
        registro.tit_tel,
        registro.tipo_plano,
        registro.status_titular,
      ].some((valor) => texto(valor).toLowerCase().includes(termo)),
    );
  }, [busca, registros]);

  const limparAvisos = () => {
    setMensagem("");
    setErro("");
  };

  const chamarWebhook = async (
    payload: Record<string, string | number>,
  ): Promise<RespostaCortesia> => {
    if (!token) {
      onSessaoExpirada();
      throw new Error("Sessão administrativa não encontrada.");
    }

    const response = await fetch(WEBHOOK_CORTESIAS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Token": token,
      },
      body: JSON.stringify(payload),
    });

    const respostaTexto = await response.text();
    let resultado: RespostaCortesia = {};

    if (respostaTexto) {
      try {
        resultado = primeiroResultado<RespostaCortesia>(
          JSON.parse(respostaTexto),
        );
      } catch {
        resultado = {
          mensagem: respostaTexto,
        };
      }
    }

    if (response.status === 401 || resultado.autorizado === false) {
      onSessaoExpirada();
      throw new Error(
        resultado.mensagem ||
          "Sua sessão expirou. Entre novamente para continuar.",
      );
    }

    if (!response.ok || resultado.rota === "ERRO") {
      throw new Error(
        resultado.mensagem || "Não foi possível concluir a operação.",
      );
    }

    return resultado;
  };

  const cadastrarCortesia = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (enviando) return;

    limparAvisos();

    const cpf = somenteNumeros(formulario.tit_cpf);
    const telefone = somenteNumeros(formulario.tit_tel);

    if (!formulario.tit_nome.trim()) {
      setErro("Informe o nome do beneficiário.");
      return;
    }

    if (cpf.length !== 11) {
      setErro("Informe um CPF com 11 números.");
      return;
    }

    if (telefone.length < 10 || telefone.length > 11) {
      setErro("Informe um telefone válido com DDD.");
      return;
    }

    setEnviando(true);

    try {
      const resultado = await chamarWebhook({
        status_titular: "ativo",
        planoid: Number(formulario.planoid),
        tit_nome: formulario.tit_nome.trim(),
        tit_cpf: cpf,
        tit_tel: telefone,
        tit_email: formulario.tit_email.trim().toLowerCase(),
        tit_nasc: dataParaBrasil(formulario.tit_nasc),
      });

      setMensagem(
        resultado.mensagem ||
          "Cortesia cadastrada e enviada para ativação.",
      );
      setFormulario(formularioVazio);
      setFormularioAberto(false);
      await onAtualizar();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível cadastrar a cortesia.",
      );
    } finally {
      setEnviando(false);
    }
  };

  const alterarStatus = async (registro: Registro) => {
    const cpf = somenteNumeros(registro.tit_cpf);
    const ativo = estaAtivo(registro);
    const novoStatus = ativo ? "inativo" : "ativo";

    if (!cpf) {
      setErro("Esta cortesia não possui um CPF válido.");
      return;
    }

    const verbo = ativo ? "inativar" : "reativar";
    const nome = texto(registro.tit_nome) || cpfExibicao(cpf);

    if (
      !window.confirm(
        `Deseja realmente ${verbo} a cortesia de ${nome}?`,
      )
    ) {
      return;
    }

    limparAvisos();
    setCpfEmAlteracao(cpf);

    try {
      const resultado = await chamarWebhook({
        status_titular: novoStatus,
        tit_cpf: cpf,
      });

      setMensagem(
        resultado.mensagem ||
          `Cortesia ${novoStatus === "ativo" ? "ativada" : "inativada"}.`,
      );
      await onAtualizar();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível alterar a cortesia.",
      );
    } finally {
      setCpfEmAlteracao("");
    }
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wider text-slate-500">
            Total de cortesias
          </p>
          <p className="mt-2 text-3xl font-black text-slate-950">
            {totais.total}
          </p>
        </article>

        <article className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wider text-emerald-700">
            Ativas
          </p>
          <p className="mt-2 text-3xl font-black text-emerald-800">
            {totais.ativas}
          </p>
        </article>

        <article className="rounded-3xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wider text-rose-700">
            Inativas
          </p>
          <p className="mt-2 text-3xl font-black text-rose-800">
            {totais.inativas}
          </p>
        </article>
      </section>

      {mensagem && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 font-bold text-emerald-800">
          <CheckCircle2 size={21} className="mt-0.5 shrink-0" />
          <p>{mensagem}</p>
        </div>
      )}

      {erro && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 font-bold text-rose-700">
          {erro}
        </div>
      )}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-black text-slate-950">
              <Gift size={22} className="text-violet-700" />
              Gestão de cortesias
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Cadastre, reative ou inative beneficiários gratuitos.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Nome, CPF ou contrato"
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 outline-none focus:border-blue-700 sm:w-72"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                limparAvisos();
                setFormularioAberto(true);
              }}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 font-black text-white transition hover:bg-blue-800"
            >
              <Plus size={19} />
              Nova cortesia
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="whitespace-nowrap px-5 py-3 font-black">
                  Contrato
                </th>
                <th className="whitespace-nowrap px-5 py-3 font-black">
                  Beneficiário
                </th>
                <th className="whitespace-nowrap px-5 py-3 font-black">
                  CPF
                </th>
                <th className="whitespace-nowrap px-5 py-3 font-black">
                  Contato
                </th>
                <th className="whitespace-nowrap px-5 py-3 font-black">
                  Plano
                </th>
                <th className="whitespace-nowrap px-5 py-3 font-black">
                  Status
                </th>
                <th className="whitespace-nowrap px-5 py-3 text-right font-black">
                  Ação
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {registrosFiltrados.map((registro, indice) => {
                const ativo = estaAtivo(registro);
                const cpf = somenteNumeros(registro.tit_cpf);
                const alterando = cpfEmAlteracao === cpf;

                return (
                  <tr
                    key={`${texto(registro.num_contrato)}-${indice}`}
                    className="hover:bg-slate-50"
                  >
                    <td className="whitespace-nowrap px-5 py-4 font-black text-slate-900">
                      {texto(registro.num_contrato) || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900">
                        {texto(registro.tit_nome) || "Sem nome"}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {texto(registro.tit_email) || "Sem e-mail"}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-700">
                      {cpfExibicao(registro.tit_cpf)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-700">
                      {telefoneExibicao(registro.tit_tel)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 font-black text-slate-700">
                      {texto(registro.tipo_plano) === "1382"
                        ? "Familiar · 1382"
                        : "Individual · 1380"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase ${
                          ativo
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <button
                        type="button"
                        disabled={alterando}
                        onClick={() => alterarStatus(registro)}
                        className={`inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-xs font-black text-white transition disabled:cursor-not-allowed disabled:bg-slate-400 ${
                          ativo
                            ? "bg-rose-600 hover:bg-rose-700"
                            : "bg-emerald-600 hover:bg-emerald-700"
                        }`}
                      >
                        {alterando ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : ativo ? (
                          <PowerOff size={16} />
                        ) : (
                          <Power size={16} />
                        )}
                        {alterando
                          ? "Processando"
                          : ativo
                            ? "Inativar"
                            : "Reativar"}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {registrosFiltrados.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center font-semibold text-slate-500"
                  >
                    Nenhuma cortesia encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {formularioAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-nova-cortesia"
        >
          <section className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5 md:p-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
                  ConsulToque
                </p>
                <h2
                  id="titulo-nova-cortesia"
                  className="mt-1 text-2xl font-black text-slate-950"
                >
                  Nova cortesia
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setFormularioAberto(false)}
                disabled={enviando}
                aria-label="Fechar"
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                <X size={23} />
              </button>
            </div>

            <form onSubmit={cadastrarCortesia} className="p-5 md:p-6">
              {erro && (
                <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-700">
                  {erro}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <label className="md:col-span-2">
                  <span className="mb-1 block text-sm font-black text-slate-700">
                    Nome do beneficiário *
                  </span>
                  <input
                    value={formulario.tit_nome}
                    onChange={(event) =>
                      setFormulario((anterior) => ({
                        ...anterior,
                        tit_nome: event.target.value,
                      }))
                    }
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
                  />
                </label>

                <label>
                  <span className="mb-1 block text-sm font-black text-slate-700">
                    CPF *
                  </span>
                  <input
                    value={formulario.tit_cpf}
                    onChange={(event) =>
                      setFormulario((anterior) => ({
                        ...anterior,
                        tit_cpf: event.target.value,
                      }))
                    }
                    inputMode="numeric"
                    placeholder="Somente números"
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
                  />
                </label>

                <label>
                  <span className="mb-1 block text-sm font-black text-slate-700">
                    Telefone com DDD *
                  </span>
                  <input
                    value={formulario.tit_tel}
                    onChange={(event) =>
                      setFormulario((anterior) => ({
                        ...anterior,
                        tit_tel: event.target.value,
                      }))
                    }
                    inputMode="tel"
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
                  />
                </label>

                <label>
                  <span className="mb-1 block text-sm font-black text-slate-700">
                    E-mail
                  </span>
                  <input
                    type="email"
                    value={formulario.tit_email}
                    onChange={(event) =>
                      setFormulario((anterior) => ({
                        ...anterior,
                        tit_email: event.target.value,
                      }))
                    }
                    placeholder="Opcional"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
                  />
                </label>

                <label>
                  <span className="mb-1 block text-sm font-black text-slate-700">
                    Data de nascimento
                  </span>
                  <input
                    type="date"
                    value={formulario.tit_nasc}
                    onChange={(event) =>
                      setFormulario((anterior) => ({
                        ...anterior,
                        tit_nasc: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
                  />
                </label>

                <label className="md:col-span-2">
                  <span className="mb-1 block text-sm font-black text-slate-700">
                    Plano *
                  </span>
                  <select
                    value={formulario.planoid}
                    onChange={(event) =>
                      setFormulario((anterior) => ({
                        ...anterior,
                        planoid: event.target.value as "1380" | "1382",
                      }))
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-700"
                  >
                    <option value="1380">Individual · plano 1380</option>
                    <option value="1382">Familiar · plano 1382</option>
                  </select>
                </label>
              </div>

              <p className="mt-5 rounded-xl bg-blue-50 p-4 text-sm font-semibold leading-relaxed text-blue-800">
                A nova cortesia será cadastrada diretamente como ativa. Se o
                CPF já existir, o sistema aplicará a regra correspondente sem
                criar outro contrato.
              </p>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setFormularioAberto(false)}
                  disabled={enviando}
                  className="rounded-xl border border-slate-300 px-5 py-3 font-black text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={enviando}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-black text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {enviando && (
                    <Loader2 size={18} className="animate-spin" />
                  )}
                  {enviando ? "Cadastrando..." : "Cadastrar e ativar"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}