import type { PriceBreakdown } from '../lib/pricing';
import { onlyDigits } from '../lib/pricing';

export interface DadosContratacao {
  agora: string;
  codColab: string;
  responsibleName: string;
  responsibleCpf: string;
  responsibleBirthDate: string;
  responsibleEmail: string;
  responsiblePhone: string;
  cobrancaEmpresa: boolean;
  companyName: string;
  cnpj: string;
  responsibleCpfValidation: { cpf_validado: boolean; maior_idade: boolean; consulta_id: string } | null;
  breakdown: PriceBreakdown;
  holders: { cpf: string; name: string; birthDate: string; email: string; phone: string; plan: 'individual' | 'familia' }[];
  versaoTermo: string;
}
function normalizarNome(valor: string): string {
  return valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
}
function formatBirthDateBR(date: string): string {
  if (!date) return '';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) return date;
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : date;
}
export function construirContratacao(dados: DadosContratacao) {
  const { agora, codColab, responsibleName, responsibleCpf, responsibleBirthDate,
    responsibleEmail, responsiblePhone, cobrancaEmpresa, companyName, cnpj,
    responsibleCpfValidation, breakdown, holders, versaoTermo } = dados;
  if (!/^\d{4}$/.test(codColab)) throw new Error('Indicação comercial não confirmada.');
  return {
      origem: "site_consultoque_empresas",
      enviado_em: agora,

      cod_colab: codColab,

      nome_assoc: normalizarNome(responsibleName.trim()),
      cpf_assoc: onlyDigits(responsibleCpf),
      nasc_assoc: formatBirthDateBR(responsibleBirthDate),
      email_assoc: responsibleEmail.trim().toLowerCase(),
      tel_assoc: onlyDigits(responsiblePhone),
      empresa: cobrancaEmpresa ? companyName.trim() : "",
      cnpj: cobrancaEmpresa ? onlyDigits(cnpj) : "",
      tipo_doc_cobranca: cobrancaEmpresa ? "CNPJ" : "CPF",

      assoc_cpf_validado: Boolean(responsibleCpfValidation?.cpf_validado),
      assoc_maior_idade: Boolean(responsibleCpfValidation?.maior_idade),
      assoc_consulta_id: responsibleCpfValidation?.consulta_id || "",

      qtd_individual: breakdown.individualCount,
      qtd_familiar: breakdown.familyCount,
      vl_individual: breakdown.individualCount * breakdown.individualUnit,
      vl_familiar: breakdown.familyCount * breakdown.familyUnit,
      vl_total: breakdown.totalMonthly,

      desconto_coletivo: breakdown.hasBulkDiscount,
      economia_mensal: breakdown.savings,

      termos_aceitos: true,
      termos_aceitos_em: agora,
      versao_termo: versaoTermo,

      titulares: holders.map((holder) => ({
        cpf_titular: onlyDigits(holder.cpf),
        nome_titular: normalizarNome(holder.name.trim()),
        nasc_titular: formatBirthDateBR(holder.birthDate),
        email_titular: holder.email.trim().toLowerCase(),
        tel_titular: onlyDigits(holder.phone),
        cod_plano: holder.plan === "individual" ? "2878" : "2880",
      })),
    };
}
