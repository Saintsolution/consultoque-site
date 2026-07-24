import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

const WEBHOOK_SOLICITAR_VALIDACAO_CPF =
  'https://n8n.saintsolution.com.br/webhook/solicitar-validacao-cpf';

type OrigemFormulario =
  | 'colaborador'
  | 'individual'
  | 'familiar'
  | 'coletivo';

type SolicitacaoValidacaoCpfProps = {
  aberto: boolean;
  cpf: string;
  origemFormulario: OrigemFormulario;
  motivo?: string;
  mensagemApi?: string;
  onFechar: () => void;
};

function somenteNumeros(valor: string) {
  return String(valor ?? '').replace(/\D/g, '');
}

function formatarCpf(valor: string) {
  const numeros = somenteNumeros(valor).slice(0, 11);

  return numeros
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(
      /^(\d{3})\.(\d{3})(\d)/,
      '$1.$2.$3'
    )
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
}

export function SolicitacaoValidacaoCpf({
  aberto,
  cpf,
  origemFormulario,
  motivo = 'cpf_nao_localizado',
  mensagemApi = '',
  onFechar,
}: SolicitacaoValidacaoCpfProps) {
  const [nomeResponsavel, setNomeResponsavel] =
    useState('');

  const [emailResponsavel, setEmailResponsavel] =
    useState('');

  const [
    telefoneResponsavel,
    setTelefoneResponsavel,
  ] = useState('');

  const [mensagem, setMensagem] = useState(
    'Meu CPF é válido, mas não foi localizado na base de validação. Solicito ajuda para continuar o cadastro.'
  );

  const [enviando, setEnviando] =
    useState(false);

  const [enviado, setEnviado] =
    useState(false);

  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!aberto) {
      return;
    }

    setNomeResponsavel('');
    setEmailResponsavel('');
    setTelefoneResponsavel('');
    setMensagem(
      'Meu CPF é válido, mas não foi localizado na base de validação. Solicito ajuda para continuar o cadastro.'
    );
    setEnviando(false);
    setEnviado(false);
    setErro('');
  }, [aberto, cpf]);

  if (!aberto) {
    return null;
  }

  async function enviarSolicitacao(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cpfLimpo = somenteNumeros(cpf);
    const telefoneLimpo = somenteNumeros(
      telefoneResponsavel
    );

    setErro('');

    if (cpfLimpo.length !== 11) {
      setErro(
        'O CPF informado não possui 11 números.'
      );
      return;
    }

    if (!nomeResponsavel.trim()) {
      setErro(
        'Informe o nome do responsável.'
      );
      return;
    }

    if (!emailResponsavel.trim()) {
      setErro('Informe um e-mail válido.');
      return;
    }

    if (telefoneLimpo.length < 10) {
      setErro(
        'Informe um telefone com DDD.'
      );
      return;
    }

    setEnviando(true);

const referenciaSalva =
  localStorage.getItem('referenciador_id');

const somenteNumerosReferencia =
  somenteNumeros(referenciaSalva || '');

const codPai =
  somenteNumerosReferencia.length >= 1 &&
  somenteNumerosReferencia.length <= 4
    ? somenteNumerosReferencia.padStart(4, '0')
    : '0001';

const payload = {
  origem: 'site_consultoque',
  tipo_solicitacao: 'validacao_manual_cpf',
  origem_form: origemFormulario,
  cod_pai: codPai,

  cpf: cpfLimpo,

  nome_responsavel:
    nomeResponsavel.trim(),

  email_responsavel:
    emailResponsavel.trim().toLowerCase(),

  telefone_responsavel:
    telefoneLimpo,

  motivo:
    motivo || 'cpf_nao_localizado',

  mensagem_api:
    mensagemApi.trim(),

  mensagem_usuario:
    mensagem.trim(),

  enviado_em:
    new Date().toISOString(),
};
    try {
      const response = await fetch(
        WEBHOOK_SOLICITAR_VALIDACAO_CPF,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      let resultado: {
        status?: string;
        mensagem?: string;
      } = {};

      try {
        resultado = await response.json();
      } catch {
        resultado = {};
      }

      if (
        !response.ok ||
        resultado.status === 'erro'
      ) {
        throw new Error(
          resultado.mensagem ||
            'Não foi possível enviar a solicitação.'
        );
      }

      setEnviado(true);
    } catch (error) {
      console.error(
        'Erro ao solicitar validação de CPF:',
        error
      );

      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível enviar a solicitação. Tente novamente.'
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-validacao-cpf"
    >
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h2
              id="titulo-validacao-cpf"
              className="text-xl font-black text-slate-900"
            >
              Solicitar ajuda com o CPF
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              A equipe verificará seus dados
              manualmente.
            </p>
          </div>

          <button
            type="button"
            onClick={onFechar}
            disabled={enviando}
            aria-label="Fechar"
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          >
            <X size={22} />
          </button>
        </div>

        {enviado ? (
          <div className="p-8 text-center">
            <CheckCircle2
              size={58}
              className="mx-auto text-green-600"
            />

            <h3 className="mt-4 text-2xl font-black text-slate-900">
              Solicitação enviada!
            </h3>

            <p className="mt-3 text-slate-600">
              Recebemos seus dados. A equipe
              ConsulToque entrará em contato pelo
              e-mail ou telefone informado.
            </p>

            <button
              type="button"
              onClick={onFechar}
              className="mt-6 rounded-xl bg-blue-700 px-6 py-3 font-black text-white hover:bg-blue-800"
            >
              Fechar
            </button>
          </div>
        ) : (
          <form
            onSubmit={enviarSolicitacao}
            className="space-y-5 p-6"
          >
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
              <div className="flex gap-3">
                <AlertCircle
                  size={22}
                  className="mt-0.5 shrink-0"
                />

                <div>
                  <p className="font-black">
                    CPF não confirmado
                  </p>

                  <p className="mt-1 text-sm">
                    Não foi possível localizar os
                    dados automaticamente. Preencha
                    o formulário para solicitar
                    atendimento.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-slate-700">
                CPF consultado
              </label>

              <input
                type="text"
                value={formatarCpf(cpf)}
                readOnly
                className="w-full cursor-not-allowed rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-slate-700"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-slate-700">
                Nome do responsável
              </label>

              <input
                type="text"
                value={nomeResponsavel}
                onChange={(event) =>
                  setNomeResponsavel(
                    event.target.value
                  )
                }
                autoComplete="name"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                placeholder="Nome completo"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-slate-700">
                E-mail
              </label>

              <input
                type="email"
                value={emailResponsavel}
                onChange={(event) =>
                  setEmailResponsavel(
                    event.target.value
                  )
                }
                autoComplete="email"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                placeholder="email@exemplo.com"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-slate-700">
                Telefone / WhatsApp
              </label>

              <input
                type="tel"
                inputMode="numeric"
                value={telefoneResponsavel}
                onChange={(event) =>
                  setTelefoneResponsavel(
                    event.target.value
                  )
                }
                autoComplete="tel"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                placeholder="DDD + número"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-slate-700">
                Mensagem
              </label>

              <textarea
                value={mensagem}
                onChange={(event) =>
                  setMensagem(
                    event.target.value
                  )
                }
                rows={4}
                required
                className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>

            {erro && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {erro}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onFechar}
                disabled={enviando}
                className="flex-1 rounded-xl bg-slate-200 px-5 py-3 font-black text-slate-800 hover:bg-slate-300 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={enviando}
                className="flex-1 rounded-xl bg-blue-700 px-5 py-3 font-black text-white hover:bg-blue-800 disabled:cursor-wait disabled:opacity-60"
              >
                {enviando
                  ? 'Enviando...'
                  : 'Enviar para a equipe'}
              </button>
            </div>

            <p className="text-center text-xs text-slate-500">
              A solicitação será encaminhada para
              consultoque@gmail.com.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}