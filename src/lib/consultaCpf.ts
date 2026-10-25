import { enviarIntegracao } from '@/services/http';
import { consultaCpf_WEBHOOK_VALIDAR_CPF as WEBHOOK_VALIDAR_CPF } from '@/services/endpoints';
import { somenteNumerosCpf, validarCpf } from "./cpf";



type CpfResponse = {
  sucesso: boolean;
  cpf_validado: boolean;
  cpf: string;
  nome: string;
  nascimento: string;
  consulta_id: string;
  mensagem: string;
};

export async function consultarCpfTitular(valor: string): Promise<CpfResponse> {
  const cpf = somenteNumerosCpf(valor);
  if (!validarCpf(cpf)) {
    throw new Error("Informe um CPF válido.");
  }
  const response = await enviarIntegracao(WEBHOOK_VALIDAR_CPF, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cpf, origem: "TITULAR" }),
  });
  const raw = (await response.json().catch(() => null)) as
    CpfResponse | CpfResponse[] | null;
  const result = Array.isArray(raw) ? raw[0] : raw;
  if (!response.ok || !result?.sucesso || !result.cpf_validado) {
    throw new Error(result?.mensagem || "Não foi possível validar o CPF.");
  }
  if (somenteNumerosCpf(result.cpf) !== cpf) {
    throw new Error("O CPF retornado não corresponde ao CPF informado.");
  }
  return result;
}
