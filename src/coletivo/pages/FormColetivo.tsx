import { construirContratacao } from '@/services/contratacao';
import { enviarIntegracao } from '@/services/http';
import { FormColetivo_WEBHOOK_URL as WEBHOOK_URL, FormColetivo_WEBHOOK_VALIDAR_CPF as WEBHOOK_VALIDAR_CPF, FormColetivo_WEBHOOK_VALIDAR_CNPJ as WEBHOOK_VALIDAR_CNPJ } from '@/services/endpoints';
import { referenciaComercial } from '@/services/referencia';
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  User,
  Heart,
  Calculator,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Info,
  AlertCircle,
  Pencil,
  FileText,
  X,
} from "lucide-react";
import {
  TermoAdesaoAssociado,
  VERSAO_TERMO_ASSOCIADO,
} from "@/coletivo/components/TermoAdesaoAssociado";
import {
  type HolderEntry,
  type PlanType,
  calculatePrice,
  formatCPF,
  formatCNPJ,
  formatPhone,
  onlyDigits,
  isValidCNPJ,
  isValidEmail,
  BULK_THRESHOLD,
} from "@/lib/pricing";
import { calcularIdade, somenteNumerosCpf, validarCpf } from "@/lib/cpf";

/*
 * Endpoint publicado do fluxo coletivo empresarial no n8n.
 */






const CHAVE_TRANSFERENCIA_COLETIVO = "consultoque_transferencia_coletivo";

type TransferenciaPessoal = {
  criado_em: string;
  cod_colab: string;
  nome_assoc: string;
  cpf_assoc: string;
  nasc_assoc: string;
  email_assoc: string;
  tel_assoc: string;
  cpf_validado: boolean;
  maior_idade: boolean;
  consulta_id: string;
};

function normalizarNome(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

function getCodColab(): string {
  return referenciaComercial.codigoConfirmado();
}

function formatBirthDateBR(date: string): string {
  if (!date) return "";

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
    return date;
  }

  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  return match ? `${match[3]}/${match[2]}/${match[1]}` : date;
}

interface HolderField {
  id: string;
  plan: PlanType;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  birthDate: string;
  cpfValidated: boolean;
  cpfConsultaId: string;
}

interface PaymentResponse {
  status: string;
  message: string;
  url_pagamento: string;
  dt_vencimento: string;
  dia_vencimento: string;
  email: string;
}

interface CpfValidationResponse {
  status: string;
  sucesso: boolean;
  cpf_validado: boolean;
  cpf: string;
  origem: string;
  nome: string;
  nascimento: string;
  idade: number | null;
  maior_idade: boolean;
  consulta_id: string;
  mensagem: string;
}

interface CnpjValidationResponse {
  status: string;
  sucesso: boolean;
  cnpj_validado: boolean;
  cnpj: string;
  origem: string;
  razao_social: string;
  nome_fantasia: string;
  tipo_empresa: string;
  endereco: string;
  consulta_id: string;
  mensagem: string;
}

function birthDateToInput(value: string): string {
  const match = String(value ?? "").match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  return match ? `${match[3]}-${match[2]}-${match[1]}` : value;
}

function newHolder(): HolderField {
  return {
    id: crypto.randomUUID(),
    plan: "individual",
    name: "",
    cpf: "",
    email: "",
    phone: "",
    birthDate: "",
    cpfValidated: false,
    cpfConsultaId: "",
  };
}

function toHolderEntry(h: HolderField): HolderEntry {
  return { id: h.id, plan: h.plan, name: h.name, cpf: onlyDigits(h.cpf) };
}

function planLabel(plan: PlanType): string {
  return plan === "individual" ? "Individual" : "Familiar";
}

function maskCPF(cpf: string): string {
  const digits = onlyDigits(cpf);

  return digits.length === 11
    ? `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`
    : cpf;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default function FormColetivo() {
  const [companyName, setCompanyName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [cobrancaEmpresa, setCobrancaEmpresa] = useState(false);
  const [responsibleName, setResponsibleName] = useState("");
  const [responsibleCpf, setResponsibleCpf] = useState("");
  const [responsibleBirthDate, setResponsibleBirthDate] = useState("");
  const [responsibleEmail, setResponsibleEmail] = useState("");
  const [responsiblePhone, setResponsiblePhone] = useState("");
  const [responsibleSaved, setResponsibleSaved] = useState(false);
  const [validatingResponsibleCpf, setValidatingResponsibleCpf] =
    useState(false);
  const [responsibleCpfValidation, setResponsibleCpfValidation] =
    useState<CpfValidationResponse | null>(null);
  const [responsibleCpfError, setResponsibleCpfError] = useState<string | null>(
    null,
  );
  const [validatingCnpj, setValidatingCnpj] = useState(false);
  const [cnpjValidation, setCnpjValidation] =
    useState<CnpjValidationResponse | null>(null);
  const [cnpjError, setCnpjError] = useState<string | null>(null);
  const [responsibleFormError, setResponsibleFormError] = useState<
    string | null
  >(null);
  const [holders, setHolders] = useState<HolderField[]>([]);
  const [holderDraft, setHolderDraft] = useState<HolderField | null>(null);
  const [holderFormError, setHolderFormError] = useState<string | null>(null);
  const [validatingHolderCpf, setValidatingHolderCpf] = useState(false);
  const [holderCpfError, setHolderCpfError] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [paymentResponse, setPaymentResponse] =
    useState<PaymentResponse | null>(null);

  useEffect(() => {
    const salvo = sessionStorage.getItem(CHAVE_TRANSFERENCIA_COLETIVO);
    if (!salvo) return;

    try {
      const dados = JSON.parse(salvo) as TransferenciaPessoal;
      const criadoEm = new Date(dados.criado_em).getTime();
      if (!Number.isFinite(criadoEm) || Date.now() - criadoEm > 30 * 60 * 1000)
        return;

      setResponsibleName(normalizarNome(dados.nome_assoc));
      setResponsibleCpf(formatCPF(dados.cpf_assoc));
      setResponsibleBirthDate(dados.nasc_assoc);
      setResponsibleEmail(dados.email_assoc.toLowerCase());
      setResponsiblePhone(formatPhone(dados.tel_assoc));
      setResponsibleCpfValidation({
        status: "sucesso",
        sucesso: true,
        cpf_validado: dados.cpf_validado,
        cpf: dados.cpf_assoc,
        origem: "ASSOCIADO",
        nome: normalizarNome(dados.nome_assoc),
        nascimento: dados.nasc_assoc,
        idade: null,
        maior_idade: dados.maior_idade,
        consulta_id: dados.consulta_id,
        mensagem: "",
      });
      setResponsibleSaved(dados.cpf_validado && dados.maior_idade);
    } catch {
      // Transferência inválida é descartada sem bloquear a contratação coletiva.
    } finally {
      sessionStorage.removeItem(CHAVE_TRANSFERENCIA_COLETIVO);
    }
  }, []);

  const breakdown = useMemo(
    () => calculatePrice(holders.map(toHolderEntry)),
    [holders],
  );

  const cnpjConfirmado = Boolean(
    cnpjValidation?.sucesso === true &&
      cnpjValidation.cnpj_validado === true &&
      onlyDigits(String(cnpjValidation.cnpj ?? "")) === onlyDigits(cnpj) &&
      isValidCNPJ(cnpj) &&
      companyName.trim(),
  );

  const validation = useMemo(() => {
    const errors: string[] = [];
    if (!responsibleSaved) errors.push("Salve os dados do responsável.");
    if (cobrancaEmpresa && !cnpjConfirmado)
      errors.push("Valide o CNPJ da empresa antes de concluir a contratação.");
    if (holderDraft) errors.push("Salve ou cancele o titular que está aberto.");
    if (holders.length === 0) errors.push("Adicione pelo menos 1 titular.");

    const holderCpfs = holders.map((holder) => onlyDigits(holder.cpf));
    const repeatedCpfs = holderCpfs.filter(
      (cpf, index) => cpf && holderCpfs.indexOf(cpf) !== index,
    );

    if (repeatedCpfs.length > 0) {
      errors.push("Existem titulares com CPF repetido.");
    }

    return errors;
  }, [responsibleSaved, holderDraft, holders, cobrancaEmpresa, cnpjConfirmado]);

  const isValid = validation.length === 0;

  function changeResponsibleCpf(value: string) {
    const formatted = formatCPF(value);

    setResponsibleCpf(formatted);
    setResponsibleCpfValidation(null);
    setResponsibleCpfError(null);
    setResponsibleName("");
    setResponsibleBirthDate("");
  }

  function changeCnpj(value: string) {
    setCnpj(formatCNPJ(value));
    setCompanyName("");
    setCnpjValidation(null);
    setCnpjError(null);
  }

  function changeCobrancaEmpresa(value: boolean) {
    if (!responsibleCpfValidation?.cpf_validado || validatingCnpj) return;
    setCobrancaEmpresa(value);
    setResponsibleSaved(false);
    setResponsibleFormError(null);
    setAcceptedTerms(false);
    if (!value) {
      setCompanyName("");
      setCnpj("");
      setCnpjValidation(null);
      setCnpjError(null);
    }
  }

  async function validateCnpj() {
    if (!cobrancaEmpresa || !responsibleCpfValidation?.cpf_validado || validatingCnpj)
      return;
    const documento = onlyDigits(cnpj);

    if (!isValidCNPJ(documento)) {
      setCnpjError("Informe um CNPJ válido.");
      setCnpjValidation(null);
      return;
    }

    setValidatingCnpj(true);
    setCnpjError(null);
    setResponsibleFormError(null);

    try {
      const response = await enviarIntegracao(WEBHOOK_VALIDAR_CNPJ, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cnpj: documento,
          origem: "COBRANCA_CNPJ",
        }),
      });

      const rawResult = (await response.json().catch(() => null)) as
        CnpjValidationResponse | CnpjValidationResponse[] | null;

      const result = Array.isArray(rawResult) ? rawResult[0] : rawResult;

      if (!response.ok || result?.sucesso !== true || result.cnpj_validado !== true) {
        throw new Error(result?.mensagem || "Não foi possível validar o CNPJ.");
      }

      if (onlyDigits(String(result.cnpj ?? "")) !== documento) {
        throw new Error("O CNPJ retornado não corresponde ao CNPJ informado.");
      }

      const razaoSocial = String(result.razao_social ?? "").trim();

      if (!razaoSocial) {
        throw new Error("A consulta não retornou a razão social da empresa.");
      }

      setCnpjValidation(result);
      setCompanyName(normalizarNome(razaoSocial));
    } catch (error) {
      setCnpjValidation(null);
      setCnpjError(
        error instanceof Error
          ? error.message
          : "Não foi possível validar o CNPJ.",
      );
    } finally {
      setValidatingCnpj(false);
    }
  }

  async function validateResponsibleCpf() {
    const cpf = somenteNumerosCpf(responsibleCpf);

    if (!validarCpf(cpf)) {
      setResponsibleCpfError("Informe um CPF válido.");
      setResponsibleCpfValidation(null);
      return;
    }

    setValidatingResponsibleCpf(true);
    setResponsibleCpfError(null);
    setResponsibleFormError(null);

    try {
      const response = await enviarIntegracao(WEBHOOK_VALIDAR_CPF, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cpf,
          origem: "ASSOCIADO",
        }),
      });

      const rawResult = (await response.json().catch(() => null)) as
        CpfValidationResponse | CpfValidationResponse[] | null;

      const result = Array.isArray(rawResult) ? rawResult[0] : rawResult;

      if (
        !response.ok ||
        !result?.sucesso ||
        !result.cpf_validado ||
        !result.maior_idade
      ) {
        throw new Error(result?.mensagem || "Não foi possível validar o CPF.");
      }

      if (somenteNumerosCpf(result.cpf) !== cpf) {
        throw new Error("O CPF retornado não corresponde ao CPF informado.");
      }

      setResponsibleCpfValidation(result);
      setResponsibleName(normalizarNome(result.nome));
      setResponsibleBirthDate(birthDateToInput(result.nascimento));
    } catch (error) {
      setResponsibleCpfValidation(null);
      setResponsibleName("");
      setResponsibleBirthDate("");
      setResponsibleCpfError(
        error instanceof Error
          ? error.message
          : "Não foi possível validar o CPF.",
      );
    } finally {
      setValidatingResponsibleCpf(false);
    }
  }

  function saveResponsible() {
    if (validatingCnpj || validatingResponsibleCpf) return;
    const errors: string[] = [];

    if (cobrancaEmpresa && !isValidCNPJ(cnpj)) {
      errors.push("CNPJ inválido.");
    }
    if (cobrancaEmpresa && !cnpjConfirmado) {
      errors.push("Valide o CNPJ da empresa para utilizá-lo na cobrança.");
    }
    if (cobrancaEmpresa && !companyName.trim()) {
      errors.push("Valide o CNPJ para preencher a razão social da empresa.");
    }
    if (!responsibleCpfValidation?.cpf_validado)
      errors.push("Valide o CPF do responsável.");
    if (!responsibleCpfValidation?.maior_idade)
      errors.push("O responsável precisa ter pelo menos 18 anos.");
    if (!responsibleName.trim()) errors.push("Informe o nome.");
    if (onlyDigits(responsibleCpf).length !== 11)
      errors.push("Informe os 11 dígitos do CPF.");
    if (!responsibleBirthDate) errors.push("Informe o nascimento.");
    if (!isValidEmail(responsibleEmail))
      errors.push("Informe um e-mail válido.");
    if (onlyDigits(responsiblePhone).length < 10)
      errors.push("Informe um telefone válido.");

    if (errors.length > 0) {
      setResponsibleFormError(errors.join(" "));
      return;
    }

    setResponsibleFormError(null);
    setResponsibleSaved(true);
  }

  function editResponsible() {
    setResponsibleSaved(false);
    setResponsibleFormError(null);
  }

  function clearResponsible() {
    setCompanyName("");
    setCnpj("");
    setCobrancaEmpresa(false);
    setCnpjValidation(null);
    setCnpjError(null);
    setResponsibleName("");
    setResponsibleCpf("");
    setResponsibleBirthDate("");
    setResponsibleEmail("");
    setResponsiblePhone("");
    setResponsibleCpfValidation(null);
    setResponsibleCpfError(null);
    setValidatingResponsibleCpf(false);
    setResponsibleSaved(false);
    setResponsibleFormError(null);
  }

  function addHolder() {
    if (!responsibleSaved || holderDraft) return;
    setHolderDraft(newHolder());
    setHolderFormError(null);
  }

  function removeHolder(id: string) {
    setHolders((prev) => prev.filter((holder) => holder.id !== id));
  }

  function editHolder(holder: HolderField) {
    if (holderDraft) return;
    setHolderDraft({ ...holder });
    setHolderFormError(null);
  }

  function updateHolderDraft(patch: Partial<HolderField>) {
    setHolderDraft((current) => (current ? { ...current, ...patch } : current));
  }

  function updateHolderCpf(value: string) {
    const formatted = formatCPF(value);

    setHolderDraft((current) => {
      if (!current) return current;

      const cpfChanged =
        somenteNumerosCpf(current.cpf) !== somenteNumerosCpf(formatted);

      return {
        ...current,
        cpf: formatted,
        ...(cpfChanged
          ? {
              name: "",
              email: "",
              phone: "",
              birthDate: "",
              cpfValidated: false,
              cpfConsultaId: "",
            }
          : {}),
      };
    });

    setHolderFormError(null);
    setHolderCpfError(null);
  }

  async function validateHolderCpf() {
    if (!holderDraft) return;

    const cpf = somenteNumerosCpf(holderDraft.cpf);

    if (!validarCpf(cpf)) {
      setHolderCpfError("Informe um CPF válido.");
      return;
    }

    setValidatingHolderCpf(true);
    setHolderCpfError(null);
    setHolderFormError(null);

    try {
      const response = await enviarIntegracao(WEBHOOK_VALIDAR_CPF, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cpf,
          origem: "TITULAR",
        }),
      });

      const rawResult = (await response.json().catch(() => null)) as
        CpfValidationResponse | CpfValidationResponse[] | null;

      const result = Array.isArray(rawResult) ? rawResult[0] : rawResult;

      if (!response.ok || !result?.sucesso || !result.cpf_validado) {
        throw new Error(result?.mensagem || "Não foi possível validar o CPF.");
      }

      if (somenteNumerosCpf(result.cpf) !== cpf) {
        throw new Error("O CPF retornado não corresponde ao CPF informado.");
      }

      setHolderDraft((current) =>
        current
          ? {
              ...current,
              cpfValidated: true,
              cpfConsultaId: result.consulta_id || "",
              name: normalizarNome(result.nome),
              birthDate: birthDateToInput(result.nascimento),
            }
          : current,
      );
    } catch (error) {
      setHolderDraft((current) =>
        current
          ? {
              ...current,
              cpfValidated: false,
              cpfConsultaId: "",
              name: "",
              birthDate: "",
            }
          : current,
      );
      setHolderCpfError(
        error instanceof Error
          ? error.message
          : "Não foi possível validar o CPF.",
      );
    } finally {
      setValidatingHolderCpf(false);
    }
  }

  function cancelHolder() {
    setHolderDraft(null);
    setHolderFormError(null);
    setHolderCpfError(null);
  }

  function saveHolder() {
    if (!holderDraft) return;

    const errors: string[] = [];
    if (!holderDraft.cpfValidated) errors.push("Valide o CPF do titular.");
    if (!holderDraft.name.trim()) errors.push("Informe o nome.");
    if (!validarCpf(holderDraft.cpf)) errors.push("Informe um CPF válido.");
    if (!holderDraft.birthDate) errors.push("Informe o nascimento.");
    if (holderDraft.email.trim() && !isValidEmail(holderDraft.email))
      errors.push("Informe um e-mail válido.");
    if (holderDraft.phone.trim() && onlyDigits(holderDraft.phone).length < 10)
      errors.push("Informe um telefone válido.");

    const repeatedCpf = holders.some(
      (holder) =>
        holder.id !== holderDraft.id &&
        onlyDigits(holder.cpf) === onlyDigits(holderDraft.cpf),
    );
    if (repeatedCpf) errors.push("Este CPF já está no grupo.");

    if (errors.length > 0) {
      setHolderFormError(errors.join(" "));
      return;
    }

    setHolders((current) => {
      const alreadyExists = current.some(
        (holder) => holder.id === holderDraft.id,
      );

      return alreadyExists
        ? current.map((holder) =>
            holder.id === holderDraft.id ? holderDraft : holder,
          )
        : [...current, holderDraft];
    });
    setHolderDraft(null);
    setHolderFormError(null);
  }

  function generateGroupPdf() {
    if (!isValid) return;

    const printWindow = window.open("", "_blank", "width=900,height=700");

    if (!printWindow) {
      setSubmitError(
        "O navegador bloqueou a janela do PDF. Autorize pop-ups e tente novamente.",
      );
      return;
    }

    const holderRows = holders
      .map(
        (holder, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(holder.name.trim())}</td>
            <td>${escapeHtml(maskCPF(holder.cpf))}</td>
            <td>${escapeHtml(formatBirthDateBR(holder.birthDate))}</td>
            <td>${escapeHtml(holder.email.trim().toLowerCase())}</td>
            <td>${escapeHtml(formatPhone(holder.phone))}</td>
            <td>${planLabel(holder.plan)}</td>
          </tr>
        `,
      )
      .join("");

    const companyRows =
      companyName.trim() || cnpj
        ? `
          <div class="data-grid">
            ${
              companyName.trim()
                ? `<div><span>Empresa</span><strong>${escapeHtml(
                    companyName.trim(),
                  )}</strong></div>`
                : ""
            }
            ${
              cnpj
                ? `<div><span>CNPJ</span><strong>${escapeHtml(cnpj)}</strong></div>`
                : ""
            }
          </div>
        `
        : "";

    printWindow.document.write(`
      <!doctype html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8" />
          <title>Relação prévia do plano coletivo</title>
          <style>
            * { box-sizing: border-box; }
            body {
              margin: 0;
              padding: 32px;
              color: #12324a;
              font-family: Arial, Helvetica, sans-serif;
              background: #fff;
            }
            h1 { margin: 0; color: #0b4267; font-size: 26px; }
            h2 { margin: 28px 0 10px; color: #0b4267; font-size: 17px; }
            .subtitle { margin: 8px 0 24px; color: #557086; font-size: 13px; }
            .data-grid {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 10px;
              margin-top: 10px;
            }
            .data-grid div {
              border: 1px solid #d9e6ee;
              border-radius: 8px;
              padding: 10px;
            }
            .data-grid span {
              display: block;
              margin-bottom: 4px;
              color: #668096;
              font-size: 10px;
              font-weight: bold;
              text-transform: uppercase;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
            }
            th, td {
              border: 1px solid #d9e6ee;
              padding: 8px 6px;
              text-align: left;
              vertical-align: top;
            }
            th { color: #0b4267; background: #eef8fb; }
            .summary {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 10px;
              margin-top: 20px;
            }
            .summary div {
              border-radius: 8px;
              padding: 12px;
              color: #0b4267;
              background: #eafaf5;
            }
            .summary span { display: block; font-size: 10px; }
            .summary strong { display: block; margin-top: 4px; font-size: 16px; }
            .notice {
              margin-top: 24px;
              padding-top: 12px;
              border-top: 1px solid #d9e6ee;
              color: #668096;
              font-size: 10px;
            }
            @media print {
              body { padding: 0; }
              @page { size: A4 landscape; margin: 12mm; }
            }
          </style>
        </head>
        <body>
          <h1>ConsulToque — Relação prévia do plano coletivo</h1>
          <p class="subtitle">
            Gerado em ${new Date().toLocaleString("pt-BR")} · Indicador:
            ${escapeHtml(getCodColab())}
          </p>

          ${companyRows}

          <h2>Responsável financeiro</h2>
          <div class="data-grid">
            <div><span>Nome</span><strong>${escapeHtml(
              responsibleName.trim(),
            )}</strong></div>
            <div><span>CPF</span><strong>${escapeHtml(
              maskCPF(responsibleCpf),
            )}</strong></div>
            <div><span>Nascimento</span><strong>${escapeHtml(
              formatBirthDateBR(responsibleBirthDate),
            )}</strong></div>
            <div><span>E-mail</span><strong>${escapeHtml(
              responsibleEmail.trim().toLowerCase(),
            )}</strong></div>
            <div><span>Telefone</span><strong>${escapeHtml(
              formatPhone(responsiblePhone),
            )}</strong></div>
          </div>

          <h2>Titulares</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nome</th>
                <th>CPF</th>
                <th>Nascimento</th>
                <th>E-mail</th>
                <th>Telefone</th>
                <th>Plano</th>
              </tr>
            </thead>
            <tbody>${holderRows}</tbody>
          </table>

          <div class="summary">
            <div><span>Individuais</span><strong>${breakdown.individualCount}</strong></div>
            <div><span>Familiares</span><strong>${breakdown.familyCount}</strong></div>
            <div><span>Total</span><strong>${breakdown.total}</strong></div>
            <div><span>Valor mensal</span><strong>R$ ${breakdown.totalMonthly
              .toFixed(2)
              .replace(".", ",")}</strong></div>
          </div>

          <p class="notice">
            Documento de conferência gerado antes da contratação. Esta relação
            não confirma pagamento nem ativação dos serviços.
          </p>
          <script>
            window.addEventListener('load', function () {
              setTimeout(function () { window.print(); }, 250);
            });
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    setSubmitError(null);
  }

  function openTerms() {
    if (!isValid || submitting) return;
    setAcceptedTerms(false);
    setShowTerms(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid || !acceptedTerms || submitting) return;

    setSubmitting(true);
    setSubmitError(null);

    const agora = new Date().toISOString();
    try {
    const codColab = getCodColab();

    const payload = construirContratacao({
      agora, codColab, responsibleName, responsibleCpf, responsibleBirthDate,
      responsibleEmail, responsiblePhone, cobrancaEmpresa, companyName, cnpj,
      responsibleCpfValidation, breakdown, holders, versaoTermo: VERSAO_TERMO_ASSOCIADO,
    });

      const res = await enviarIntegracao(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await res
        .json()
        .catch(() => null)) as Partial<PaymentResponse> | null;

      if (!res.ok) {
        throw new Error(result?.message || `HTTP ${res.status}`);
      }

      if (
        !result ||
        typeof result.url_pagamento !== "string" ||
        !/^https?:\/\//i.test(result.url_pagamento)
      ) {
        throw new Error("O servidor não retornou o link do boleto.");
      }

      setPaymentResponse({
        status: String(result.status || "sucesso"),
        message: String(
          result.message ||
            "Boleto emitido com sucesso. Enviamos também o link para seu e-mail.",
        ),
        url_pagamento: result.url_pagamento,
        dt_vencimento: String(result.dt_vencimento || ""),
        dia_vencimento: String(result.dia_vencimento || ""),
        email: String(result.email || responsibleEmail.trim().toLowerCase()),
      });
      setShowTerms(false);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? `Não foi possível enviar: ${err.message}`
          : "Não foi possível enviar o formulário.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-ocean-50">
        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
          <div className="mx-auto max-w-xl rounded-3xl border border-mint-200 bg-white p-10 text-center shadow-card">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mint-100">
              <CheckCircle2 className="h-9 w-9 text-mint-600" />
            </div>
            <h1 className="mt-5 font-display text-2xl font-extrabold text-ocean-900">
              Boleto emitido com sucesso!
            </h1>
            <p className="mt-3 text-ocean-600">
              Recebemos a inscrição coletiva de{" "}
              <strong>{breakdown.total}</strong> titular(es). O link do boleto
              também foi enviado para{" "}
              <strong>{paymentResponse?.email || responsibleEmail}</strong>.
            </p>
            <div className="mt-6 rounded-2xl bg-ocean-50 p-5 text-left">
              <p className="text-sm text-ocean-700">
                Valor mensal total:{" "}
                <strong className="text-mint-700">
                  R$ {breakdown.totalMonthly.toFixed(2).replace(".", ",")}
                </strong>
              </p>
              {paymentResponse?.dt_vencimento && (
                <p className="mt-2 text-sm text-ocean-700">
                  Vencimento:{" "}
                  <strong className="text-ocean-900">
                    {paymentResponse.dt_vencimento}
                  </strong>
                </p>
              )}
              {breakdown.hasBulkDiscount && (
                <p className="mt-1 text-xs text-mint-600">
                  Desconto coletivo aplicado ({breakdown.total} inscrições).
                </p>
              )}
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
              {paymentResponse?.url_pagamento && (
                <a
                  href={paymentResponse.url_pagamento}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary"
                >
                  Abrir boleto
                </a>
              )}
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-xl border border-ocean-200 px-6 py-3 font-bold text-ocean-700 transition-colors hover:bg-ocean-50"
              >
                Voltar ao início
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ocean-50">
      <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8 lg:py-8">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-ocean-600 hover:text-ocean-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao início
        </a>

        <div className="mt-6 max-w-3xl">
          <span className="section-eyebrow">Adesão ConsulToque</span>
          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ocean-900 sm:text-4xl">
            Monte seu plano ConsulToque
          </h1>
          <p className="mt-3 text-ocean-600">
            Preencha os dados do responsável e adicione os titulares. Nome da
            empresa e CNPJ são opcionais. O valor é calculado em tempo real.
          </p>

          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-mint-200 bg-mint-50 p-4 sm:p-5">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-mint-700" />
            <div className="text-sm leading-relaxed text-ocean-700">
              <p>
                Você pode contratar o ConsulToque somente para você e sua família
                ou realizar uma contratação coletiva, incluindo outros titulares
                e suas respectivas famílias.
              </p>
              <p className="mt-2 font-semibold">
                Para uma contratação coletiva, basta adicionar novos titulares
                durante o preenchimento do formulário.
              </p>
            </div>
          </div>
        </div>

        <form
          id="collective-form"
          onSubmit={handleSubmit}
          className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]"
        >
          {/* Main column */}
          <div className="space-y-8">
            {/* Company + responsible */}
            <section className="rounded-3xl border border-ocean-100 bg-white p-6 shadow-card sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-display text-xl font-bold text-ocean-900">
                  1. Responsável pelo grupo
                </h2>
                {responsibleSaved && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-mint-50 px-3 py-1 text-xs font-bold text-mint-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Salvo
                  </span>
                )}
              </div>

              <div className="mt-5 rounded-xl border border-ocean-200 bg-ocean-50 p-4">
                <label className="inline-flex items-center gap-3 text-sm font-bold text-ocean-800">
                  <input
                    id="cobrancaEmpresa"
                    type="checkbox"
                    checked={cobrancaEmpresa}
                    onChange={(e) => changeCobrancaEmpresa(e.target.checked)}
                    disabled={!responsibleCpfValidation?.cpf_validado || validatingCnpj}
                    className="h-4 w-4 rounded border-ocean-300 text-ocean-700 focus:ring-ocean-500"
                  />
                  Cobrança em nome da empresa
                </label>
                <p className="mt-2 text-xs text-ocean-600">
                  {!responsibleCpfValidation?.cpf_validado
                    ? "Valide primeiro o CPF do responsável para escolher a cobrança pela empresa."
                    : "Marque para validar o CNPJ e emitir os boletos em nome da empresa. Desmarcado, a cobrança será pelo CPF do responsável."}
                </p>
              </div>

              {!responsibleSaved ? (
                <div className="mt-6">
                  <div className="grid gap-5 sm:grid-cols-2">
                    {cobrancaEmpresa && (
                      <>
                        <div className="sm:col-span-2">
                          <label className="label-field" htmlFor="companyName">
                            Razão social da empresa
                          </label>
                          <input
                            id="companyName"
                            type="text"
                            value={companyName}
                            readOnly
                            disabled={!responsibleCpfValidation?.cpf_validado}
                            className="input-field disabled:cursor-not-allowed disabled:bg-slate-100"
                            placeholder="Preenchida após validar o CNPJ"
                          />
                        </div>
                        <div>
                          <label className="label-field" htmlFor="cnpj">
                            CNPJ da empresa
                          </label>
                          <input
                            id="cnpj"
                            type="text"
                            inputMode="numeric"
                            value={cnpj}
                            onChange={(e) => changeCnpj(e.target.value)}
                            disabled={
                              !responsibleCpfValidation?.cpf_validado ||
                              validatingCnpj
                            }
                            className="input-field disabled:cursor-not-allowed disabled:bg-slate-100"
                            placeholder="00.000.000/0000-00"
                          />
                          <button
                            type="button"
                            onClick={validateCnpj}
                            disabled={
                              !responsibleCpfValidation?.cpf_validado ||
                              validatingCnpj ||
                              !isValidCNPJ(cnpj)
                            }
                            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-ocean-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-ocean-800 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {validatingCnpj ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <ShieldCheck className="h-4 w-4" />
                            )}
                            {validatingCnpj ? "Consultando..." : "Validar CNPJ"}
                          </button>
                          {cnpjConfirmado && (
                            <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-mint-700">
                              <CheckCircle2 className="h-4 w-4" />
                              CNPJ validado: {companyName}
                            </p>
                          )}
                          {cnpjError && (
                            <p className="mt-2 text-xs font-semibold text-red-600">
                              {cnpjError}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                    <div>
                      <label className="label-field" htmlFor="responsibleCpf">
                        CPF do responsável
                      </label>
                      <input
                        id="responsibleCpf"
                        type="text"
                        inputMode="numeric"
                        value={responsibleCpf}
                        onChange={(e) => changeResponsibleCpf(e.target.value)}
                        className="input-field"
                        placeholder="000.000.000-00"
                        disabled={validatingResponsibleCpf || validatingCnpj}
                      />
                      <button
                        type="button"
                        onClick={validateResponsibleCpf}
                        disabled={
                          validatingResponsibleCpf ||
                          validatingCnpj ||
                          !validarCpf(responsibleCpf)
                        }
                        className="mt-2 inline-flex items-center gap-2 rounded-xl bg-ocean-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-ocean-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {validatingResponsibleCpf ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ShieldCheck className="h-4 w-4" />
                        )}
                        {validatingResponsibleCpf
                          ? "Consultando..."
                          : "Validar CPF"}
                      </button>

                      {responsibleCpfValidation?.cpf_validado && (
                        <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-mint-700">
                          <CheckCircle2 className="h-4 w-4" />
                          CPF validado com sucesso.
                        </p>
                      )}

                      {responsibleCpfError && (
                        <p className="mt-2 text-xs font-semibold text-red-600">
                          {responsibleCpfError}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="label-field" htmlFor="responsibleName">
                        Nome do responsável pelo pagamento
                      </label>
                      <input
                        id="responsibleName"
                        type="text"
                        value={responsibleName}
                        readOnly
                        disabled={!responsibleCpfValidation?.cpf_validado}
                        className="input-field disabled:cursor-not-allowed disabled:bg-slate-100"
                        placeholder="Preenchido após validar o CPF"
                      />
                    </div>
                    <div>
                      <label className="label-field" htmlFor="responsibleEmail">
                        E-mail do responsável
                      </label>
                      <input
                        id="responsibleEmail"
                        type="email"
                        value={responsibleEmail}
                        onChange={(e) => setResponsibleEmail(e.target.value)}
                        disabled={!responsibleCpfValidation?.cpf_validado}
                        className="input-field disabled:cursor-not-allowed disabled:bg-slate-100"
                        placeholder="responsavel@empresa.com"
                      />
                    </div>
                    <div>
                      <label className="label-field" htmlFor="responsiblePhone">
                        Telefone do responsável
                      </label>
                      <input
                        id="responsiblePhone"
                        type="tel"
                        inputMode="numeric"
                        value={responsiblePhone}
                        onChange={(e) =>
                          setResponsiblePhone(formatPhone(e.target.value))
                        }
                        disabled={!responsibleCpfValidation?.cpf_validado}
                        className="input-field disabled:cursor-not-allowed disabled:bg-slate-100"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                    <div>
                      <label
                        className="label-field"
                        htmlFor="responsibleBirthDate"
                      >
                        Nascimento do responsável
                      </label>
                      <input
                        id="responsibleBirthDate"
                        type="date"
                        value={responsibleBirthDate}
                        readOnly
                        disabled={!responsibleCpfValidation?.cpf_validado}
                        className="input-field disabled:cursor-not-allowed disabled:bg-slate-100"
                      />
                    </div>
                  </div>

                  {responsibleFormError && (
                    <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">
                      {responsibleFormError}
                    </p>
                  )}

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={saveResponsible}
                      disabled={!responsibleCpfValidation?.cpf_validado || validatingCnpj}
                      className="btn-primary"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Salvar responsável
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-mint-200 bg-mint-50/50 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-display text-lg font-bold text-ocean-900">
                        {responsibleName}
                      </p>
                      {companyName && (
                        <p className="mt-1 text-sm font-semibold text-ocean-600">
                          {companyName}
                        </p>
                      )}
                      <p className="mt-2 text-sm text-ocean-600">
                        {maskCPF(responsibleCpf)} · {responsibleEmail}
                      </p>
                      <p className="mt-1 text-sm text-ocean-500">
                        {responsiblePhone}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={editResponsible}
                        className="inline-flex items-center gap-2 rounded-xl border border-ocean-200 bg-white px-4 py-2 text-sm font-bold text-ocean-700 hover:bg-ocean-50"
                      >
                        <Pencil className="h-4 w-4" />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={clearResponsible}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Limpar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Holders */}
            <section className="rounded-3xl border border-ocean-100 bg-white p-6 shadow-card sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-display text-xl font-bold text-ocean-900">
                  2. Titulares ({holders.length})
                </h2>
                <button
                  type="button"
                  onClick={addHolder}
                  disabled={!responsibleSaved || !!holderDraft}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-glow-blue transition-transform enabled:hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar titular
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {holders.length === 0 && !holderDraft && (
                  <div className="rounded-2xl border border-dashed border-ocean-200 bg-ocean-50/50 p-6 text-center">
                    <p className="font-semibold text-ocean-700">
                      Nenhum titular salvo.
                    </p>
                    <p className="mt-1 text-sm text-ocean-500">
                      Salve o responsável e use “Adicionar titular”.
                    </p>
                  </div>
                )}

                {holders.map((holder, idx) =>
                  holderDraft?.id === holder.id ? null : (
                    <div
                      key={holder.id}
                      className="rounded-2xl border border-ocean-100 bg-ocean-50/50 p-4 sm:p-5"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-display text-xs font-black uppercase tracking-wide text-ocean-500">
                              Titular #{idx + 1}
                            </p>
                            <span className="rounded-full bg-mint-100 px-2.5 py-1 text-xs font-bold text-mint-700">
                              {planLabel(holder.plan)}
                            </span>
                          </div>
                          <p className="mt-2 truncate font-display text-lg font-bold text-ocean-900">
                            {holder.name}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() => editHolder(holder)}
                            disabled={!!holderDraft}
                            className="inline-flex items-center gap-2 rounded-xl border border-ocean-200 bg-white px-3 py-2 text-sm font-bold text-ocean-700 hover:bg-ocean-50 disabled:opacity-40"
                          >
                            <Pencil className="h-4 w-4" />
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => removeHolder(holder.id)}
                            disabled={!!holderDraft}
                            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-40"
                            aria-label="Remover titular"
                          >
                            <Trash2 className="h-4 w-4" />
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  ),
                )}

                {holderDraft && (
                  <div className="rounded-2xl border-2 border-mint-300 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-display text-lg font-bold text-ocean-900">
                          {holders.some(
                            (holder) => holder.id === holderDraft.id,
                          )
                            ? "Editar titular"
                            : "Novo titular"}
                        </p>
                        <p className="mt-1 text-sm text-ocean-500">
                          Preencha os dados e salve para fechar este cartão.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={cancelHolder}
                        className="rounded-xl p-2 text-ocean-500 hover:bg-ocean-50"
                        aria-label="Cancelar edição"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {(
                        [
                          {
                            key: "individual",
                            label: "Individual",
                            icon: User,
                            price: "R$ 33/mês",
                          },
                          {
                            key: "familia",
                            label: "Familiar",
                            icon: Heart,
                            price: "R$ 66/mês",
                          },
                        ] as const
                      ).map((opt) => (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => updateHolderDraft({ plan: opt.key })}
                          className={`flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-all sm:min-h-0 sm:flex-row sm:justify-start sm:gap-2 ${
                            holderDraft.plan === opt.key
                              ? "border-mint-500 bg-mint-50 text-mint-700"
                              : "border-ocean-200 bg-white text-ocean-600 hover:border-ocean-300"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <opt.icon className="h-4 w-4" />
                            <span>{opt.label}</span>
                          </span>

                          <span className="text-xs text-ocean-400 sm:ml-auto">
                            {opt.price}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="mt-4 space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="label-field">CPF do titular</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={holderDraft.cpf}
                            onChange={(e) => updateHolderCpf(e.target.value)}
                            disabled={validatingHolderCpf}
                            className="input-field disabled:cursor-not-allowed disabled:bg-slate-100"
                            placeholder="000.000.000-00"
                          />

                          <button
                            type="button"
                            onClick={validateHolderCpf}
                            disabled={
                              validatingHolderCpf ||
                              !validarCpf(holderDraft.cpf)
                            }
                            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-ocean-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-ocean-800 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {validatingHolderCpf ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <ShieldCheck className="h-4 w-4" />
                            )}
                            {validatingHolderCpf
                              ? "Consultando..."
                              : "Validar CPF"}
                          </button>

                          {holderDraft.cpfValidated && (
                            <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-mint-700">
                              <CheckCircle2 className="h-4 w-4" />
                              CPF validado. Nome e nascimento preenchidos.
                            </p>
                          )}

                          {somenteNumerosCpf(holderDraft.cpf).length === 11 &&
                            !validarCpf(holderDraft.cpf) && (
                              <p className="mt-2 text-xs font-semibold text-red-600">
                                Informe um CPF válido.
                              </p>
                            )}

                          {holderCpfError && (
                            <p className="mt-2 text-xs font-semibold text-red-600">
                              {holderCpfError}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="label-field">Nome do titular</label>
                          <input
                            type="text"
                            value={holderDraft.name}
                            readOnly
                            disabled={!holderDraft.cpfValidated}
                            className="input-field disabled:cursor-not-allowed disabled:bg-slate-100"
                            placeholder="Preenchido após validar o CPF"
                          />
                        </div>

                        <div>
                          <label className="label-field">
                            Nascimento do titular
                          </label>
                          <input
                            type="date"
                            value={holderDraft.birthDate}
                            readOnly
                            disabled={!holderDraft.cpfValidated}
                            className="input-field disabled:cursor-not-allowed disabled:bg-slate-100"
                          />
                          {holderDraft.birthDate &&
                            calcularIdade(holderDraft.birthDate) !== null && (
                              <p className="mt-2 text-xs font-semibold text-ocean-500">
                                Idade: {calcularIdade(holderDraft.birthDate)}{" "}
                                anos
                              </p>
                            )}
                        </div>

                        <div>
                          <label className="label-field">
                            E-mail do titular (opcional)
                          </label>
                          <input
                            type="email"
                            value={holderDraft.email}
                            onChange={(e) =>
                              updateHolderDraft({
                                email: e.target.value,
                              })
                            }
                            disabled={!holderDraft.cpfValidated}
                            className="input-field disabled:cursor-not-allowed disabled:bg-slate-100"
                            placeholder="titular@email.com"
                          />
                        </div>

                        <div>
                          <label className="label-field">
                            Telefone do titular (opcional)
                          </label>
                          <input
                            type="tel"
                            inputMode="numeric"
                            value={holderDraft.phone}
                            onChange={(e) =>
                              updateHolderDraft({
                                phone: formatPhone(e.target.value),
                              })
                            }
                            disabled={!holderDraft.cpfValidated}
                            className="input-field disabled:cursor-not-allowed disabled:bg-slate-100"
                            placeholder="(00) 00000-0000"
                          />
                          <p className="mt-2 text-xs font-semibold text-ocean-500">
                            Se não informar, usaremos o e-mail e telefone do
                            responsável pelo grupo.
                          </p>
                        </div>
                      </div>
                    </div>

                    {holderFormError && (
                      <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">
                        {holderFormError}
                      </p>
                    )}

                    <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={cancelHolder}
                        className="inline-flex items-center justify-center rounded-xl border border-ocean-200 px-5 py-3 text-sm font-bold text-ocean-700 hover:bg-ocean-50"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={saveHolder}
                        disabled={
                          !holderDraft.cpfValidated || validatingHolderCpf
                        }
                        className="btn-primary"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Salvar titular
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Terms */}
            <section className="rounded-3xl border border-ocean-100 bg-white p-6 shadow-card sm:p-8">
              <h2 className="font-display text-xl font-bold text-ocean-900">
                3. Termos de adesão
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ocean-700">
                Depois de salvar todos os cartões, você pode gerar a lista em
                PDF. Ao emitir o boleto, o Termo de Adesão será exibido para
                leitura e aceite antes do envio.
              </p>
            </section>
          </div>

          {/* Sticky summary */}
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-3xl border border-ocean-100 bg-white p-6 shadow-card">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-mint-600" />
                <h3 className="font-display text-lg font-bold text-ocean-900">
                  Resumo do pedido
                </h3>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-ocean-600">Individuais</span>
                  <span className="font-semibold text-ocean-900">
                    {breakdown.individualCount} × R${" "}
                    {breakdown.individualUnit.toFixed(2).replace(".", ",")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ocean-600">Familiares</span>
                  <span className="font-semibold text-ocean-900">
                    {breakdown.familyCount} × R${" "}
                    {breakdown.familyUnit.toFixed(2).replace(".", ",")}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-ocean-100 pt-3">
                  <span className="text-ocean-600">Total de inscrições</span>
                  <span className="font-semibold text-ocean-900">
                    {breakdown.total}
                  </span>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-mint-gradient p-5 text-white">
                <p className="text-sm text-white/85">Valor mensal total</p>
                <p className="mt-1 font-display text-3xl font-extrabold">
                  R$ {breakdown.totalMonthly.toFixed(2).replace(".", ",")}
                </p>
                {breakdown.hasBulkDiscount && (
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Desconto coletivo aplicado
                  </p>
                )}
                {breakdown.savings > 0 && (
                  <p className="mt-2 text-xs text-white/85">
                    Você economiza R${" "}
                    {breakdown.savings.toFixed(2).replace(".", ",")}/mês
                  </p>
                )}
              </div>

              {breakdown.total < BULK_THRESHOLD && (
                <div className="mt-4 flex items-start gap-2 rounded-xl bg-ocean-50 p-3 text-xs text-ocean-600">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-ocean-400" />
                  <span>
                    Faltam {BULK_THRESHOLD - breakdown.total} inscrição(ões)
                    para o desconto coletivo (a partir de {BULK_THRESHOLD} no
                    total).
                  </span>
                </div>
              )}

              {/* Validation summary */}
              {!isValid && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                    <AlertCircle className="h-4 w-4" />
                    Corrija antes de enviar:
                  </p>
                  <ul className="mt-2 list-inside list-disc space-y-0.5 text-xs text-amber-700">
                    {validation.slice(0, 5).map((err) => (
                      <li key={err}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                type="button"
                onClick={generateGroupPdf}
                disabled={!isValid || submitting}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-ocean-200 bg-white px-6 py-3.5 text-sm font-bold text-ocean-700 transition-colors enabled:hover:bg-ocean-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FileText className="h-5 w-5" />
                Gerar lista em PDF
              </button>

              <button
                type="button"
                onClick={openTerms}
                disabled={!isValid || submitting}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-6 py-4 text-base font-bold text-white shadow-glow-blue transition-all duration-300 enabled:hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShieldCheck className="h-5 w-5" />
                Emitir boleto e concluir
              </button>

              {submitError && (
                <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-600">
                  {submitError}
                </p>
              )}
            </div>
          </aside>
        </form>

        <section
          aria-labelledby="adesao-pendente-titulo"
          className="mt-8 rounded-3xl border border-mint-200 bg-mint-50 p-6 sm:p-8"
        >
          <h2
            id="adesao-pendente-titulo"
            className="font-display text-xl font-bold text-ocean-900"
          >
            Já tem uma adesão pendente?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ocean-700">
            Já gerou um boleto de adesão e ainda não pagou? Se deseja incluir mais
            pessoas na sua inscrição antes do pagamento, clique aqui.
          </p>
          <a
            href="/completar-adesao"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-mint-600 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-mint-700 sm:w-auto"
          >
            <Plus className="h-4 w-4 shrink-0" />
            Adicionar pessoas à adesão pendente
          </a>
        </section>

        <TermoAdesaoAssociado
          aberto={showTerms}
          aceito={acceptedTerms}
          carregando={submitting}
          plano="Plano Coletivo ConsulToque"
          valorMensal={breakdown.totalMonthly}
          descricaoPlano={`${breakdown.individualCount} individual(is) e ${breakdown.familyCount} familiar(es)`}
          onAceite={setAcceptedTerms}
          onFechar={() => setShowTerms(false)}
          onConfirmar={() => {
            document
              .querySelector<HTMLFormElement>("#collective-form")
              ?.requestSubmit();
          }}
        />
      </div>
    </div>
  );
}
