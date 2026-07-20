import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const WEBHOOK_BUSCA_CPF =
  'https://n8n.saintsolution.com.br/webhook/BuscaCPFcolab';

const WEBHOOK_INSERT_COLAB =
  'https://n8n.saintsolution.com.br/webhook/insertcolab';

const VERSAO_TERMO_COLABORADOR = '1.0';

type RetornoCpf = {
  status?: string;

  cpf_validado?: boolean;
  cpf_existe?: boolean;
  pode_cadastrar?: boolean;

  maior_idade?: boolean;

  nome?: string;
  nome_colab?: string;

  cpf?: string;
  data_nascimento?: string;
  idade?: number;

  cod_colab?: string | number;
  email_mascarado?: string;

  mensagem?: string;
};

function somenteNumeros(valor: string) {
  return String(valor ?? '').replace(/\D/g, '');
}

function formatarCpf(valor: string) {
  const numeros = somenteNumeros(valor).slice(0, 11);

  return numeros
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
}

function formatarCodigoColaborador(
  valor: string | number | undefined
) {
  const numeros = somenteNumeros(String(valor ?? ''));

  if (!numeros) {
    return '';
  }

  return numeros.padStart(4, '0');
}

function pegarPrimeiroResultado<T>(valor: T | T[]): T {
  return Array.isArray(valor) ? valor[0] : valor;
}

function encerrarSessaoColaboradorAnterior() {
  const chavesDaSessao = [
    'cod_colab',
    'nome_colab',
    'colaborador_id',
    'colaborador_nome',
    'colaborador_cpf',
    'colaborador_logado',
    'token_colaborador',
  ];

  chavesDaSessao.forEach((chave) => {
    localStorage.removeItem(chave);
    sessionStorage.removeItem(chave);
  });
}

export function InscricaoColaborador() {
  const [refId, setRefId] = useState('0001');

  const [loading, setLoading] = useState(false);
  const [consultandoCpf, setConsultandoCpf] = useState(false);

  const [erro, setErro] = useState('');
  const [mensagemCpf, setMensagemCpf] = useState('');

  const [cpfValidado, setCpfValidado] = useState(false);
  const [cpfJaCadastrado, setCpfJaCadastrado] = useState(false);

  const [ultimoCpfConsultado, setUltimoCpfConsultado] =
    useState('');

  const [sucesso, setSucesso] = useState(false);
  const [aceitouTermo, setAceitouTermo] = useState(false);
  const [termoAberto, setTermoAberto] = useState(false);

  const [dadosRetorno, setDadosRetorno] = useState({
    message: '',
    cod_colab: '',
    link_indicacao: '',
  });

  const [formData, setFormData] = useState({
    nome_colab: '',
    email_colab: '',
    tel_colab: '',
    cpf_colab: '',
    pix_colab: '',
    senha_login: '',
  });

  useEffect(() => {
    const savedRef = localStorage.getItem('referenciador_id');

    if (savedRef) {
      setRefId(
        somenteNumeros(savedRef).padStart(4, '0')
      );
    }
  }, []);

  function limparDadosDepoisCpf() {
    setFormData((prev) => ({
      ...prev,
      nome_colab: '',
      email_colab: '',
      tel_colab: '',
      pix_colab: '',
      senha_login: '',
    }));
  }

  async function consultarCpf(cpfInformado: string) {
    const cpf = somenteNumeros(cpfInformado);

    if (cpf.length !== 11) {
      return;
    }

    if (
      cpf === ultimoCpfConsultado &&
      (cpfValidado || cpfJaCadastrado)
    ) {
      return;
    }

    setConsultandoCpf(true);

    setErro('');
    setMensagemCpf('Consultando CPF...');

    setCpfValidado(false);
    setCpfJaCadastrado(false);

    try {
      const response = await fetch(WEBHOOK_BUSCA_CPF, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cpf,
        }),
      });

      if (!response.ok) {
        throw new Error(
          'Não foi possível consultar o CPF.'
        );
      }

      const respostaJson = await response.json();

      const resultado = pegarPrimeiroResultado<RetornoCpf>(
        respostaJson
      );

      setUltimoCpfConsultado(cpf);

      /*
       * CPF JÁ EXISTE NA PLANILHA
       *
       * O n8n já enviou o e-mail com:
       * - número do colaborador;
       * - senha;
       * - link de indicação.
       *
       * O formulário deve permanecer bloqueado.
       */
      if (
        resultado?.status === 'ja_cadastrado' ||
        resultado?.cpf_existe === true ||
        resultado?.pode_cadastrar === false
      ) {
        const codColab = formatarCodigoColaborador(
          resultado?.cod_colab
        );

        setCpfValidado(false);
        setCpfJaCadastrado(true);

        setFormData({
          nome_colab: '',
          email_colab: '',
          tel_colab: '',
          cpf_colab: resultado?.cpf || cpf,
          pix_colab: '',
          senha_login: '',
        });

        setMensagemCpf(
          resultado?.mensagem ||
            `Este CPF já possui cadastro. ` +
              `Seu número de colaborador é ${
                codColab || 'o número informado por e-mail'
              }. ` +
              `Enviamos seus dados de acesso para ${
                resultado?.email_mascarado ||
                'o e-mail cadastrado'
              }. Após entrar, altere sua senha.`
        );

        return;
      }

      /*
       * CPF INVÁLIDO OU ERRO DA API
       */
      if (
        resultado?.status !== 'sucesso' ||
        resultado?.cpf_validado !== true
      ) {
        setCpfValidado(false);
        setCpfJaCadastrado(false);

        limparDadosDepoisCpf();

        setMensagemCpf(
          resultado?.mensagem ||
            'O CPF informado não foi validado. Confira os números.'
        );

        return;
      }

      /*
       * CPF NOVO, MAS SEM NOME
       */
      const nomeEncontrado =
        resultado?.nome ||
        resultado?.nome_colab ||
        '';

      if (!nomeEncontrado.trim()) {
        setCpfValidado(false);
        setCpfJaCadastrado(false);

        limparDadosDepoisCpf();

        setMensagemCpf(
          'O CPF foi validado, mas o nome não foi encontrado.'
        );

        return;
      }

      /*
       * CPF NOVO E VALIDADO
       *
       * Menores de idade também podem se cadastrar.
       * Por isso maior_idade não bloqueia mais o formulário.
       */
      setCpfValidado(true);
      setCpfJaCadastrado(false);

      setFormData((prev) => ({
        ...prev,
        cpf_colab: resultado?.cpf || cpf,
        nome_colab: nomeEncontrado,
      }));

      if (resultado?.maior_idade === false) {
        setMensagemCpf(
          'CPF validado com sucesso. Cadastro liberado.'
        );
      } else {
        setMensagemCpf(
          resultado?.mensagem ||
            'CPF validado com sucesso.'
        );
      }
    } catch (error) {
      console.error('Erro ao consultar CPF:', error);

      setCpfValidado(false);
      setCpfJaCadastrado(false);
      setUltimoCpfConsultado('');

      limparDadosDepoisCpf();

      setMensagemCpf(
        'Não foi possível consultar o CPF agora. Tente novamente.'
      );
    } finally {
      setConsultandoCpf(false);
    }
  }

  const handleCpfChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const cpfDigitado = somenteNumeros(
      event.target.value
    ).slice(0, 11);

    setFormData({
      nome_colab: '',
      email_colab: '',
      tel_colab: '',
      cpf_colab: cpfDigitado,
      pix_colab: '',
      senha_login: '',
    });

    setCpfValidado(false);
    setCpfJaCadastrado(false);

    setErro('');
    setMensagemCpf('');
    setUltimoCpfConsultado('');

    if (cpfDigitado.length === 11) {
      consultarCpf(cpfDigitado);
    }
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErro('');

    const cpf = somenteNumeros(formData.cpf_colab);

    if (cpf.length !== 11) {
      setErro('Informe um CPF com 11 números.');
      return;
    }

    if (cpfJaCadastrado) {
      setErro(
        'Este CPF já possui cadastro. Use os dados enviados para o e-mail cadastrado.'
      );
      return;
    }

    if (!cpfValidado) {
      setErro(
        'O CPF precisa ser validado antes da inscrição.'
      );
      return;
    }

    if (!formData.nome_colab.trim()) {
      setErro(
        'Não foi possível identificar o nome do CPF.'
      );
      return;
    }

    if (!formData.email_colab.trim()) {
      setErro('Informe o e-mail.');
      return;
    }

    if (!formData.tel_colab.trim()) {
      setErro('Informe o telefone.');
      return;
    }

    if (!formData.pix_colab.trim()) {
      setErro('Informe a chave PIX.');
      return;
    }

    if (!formData.senha_login.trim()) {
      setErro('Crie uma senha de acesso.');
      return;
    }

    if (!aceitouTermo) {
      setErro(
        'Leia e aceite o Termo de Adesão e Compromisso para concluir a inscrição.'
      );
      return;
    }

    setLoading(true);

    const dataAceiteTermo = new Date();

    const payload = {
      cod_pai: refId || '0001',

      nome_colab: formData.nome_colab.trim(),

      email_colab:
        formData.email_colab.trim().toLowerCase(),

      tel_colab: somenteNumeros(
        formData.tel_colab
      ),

      cpf_colab: cpf,

      pix_colab: formData.pix_colab.trim(),

      senha_login: formData.senha_login,

      dt_cad: new Date().toLocaleDateString('pt-BR'),

      aceite_termo: true,
      versao_termo: VERSAO_TERMO_COLABORADOR,
      dt_aceite_termo: dataAceiteTermo.toISOString(),
    };

    try {
      const response = await fetch(
        WEBHOOK_INSERT_COLAB,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const respostaJson = await response
        .json()
        .catch(() => null);

      const data = respostaJson
        ? pegarPrimeiroResultado<any>(respostaJson)
        : null;

      if (
        !response.ok ||
        data?.status === 'erro'
      ) {
        throw new Error(
          data?.mensagem ||
            data?.message ||
            'Erro ao enviar cadastro.'
        );
      }

      /*
       * Remove apenas a sessão do colaborador que estava
       * anteriormente conectado nesta máquina.
       *
       * Não apaga referenciador_id, porque esse código
       * identifica quem indicou o novo colaborador.
       */
      encerrarSessaoColaboradorAnterior();

      setDadosRetorno({
        message:
          data?.message ||
          data?.mensagem ||
          'Parabéns! Você agora tem seu link de indicação ConsulToque.',

        cod_colab: formatarCodigoColaborador(
          data?.cod_colab
        ),

        link_indicacao:
          data?.link_indicacao || '',
      });

      setSucesso(true);

      setFormData({
        nome_colab: '',
        email_colab: '',
        tel_colab: '',
        cpf_colab: '',
        pix_colab: '',
        senha_login: '',
      });

      setCpfValidado(false);
      setCpfJaCadastrado(false);
      setAceitouTermo(false);

      setMensagemCpf('');
      setUltimoCpfConsultado('');
    } catch (error) {
      console.error(
        'Erro ao cadastrar colaborador:',
        error
      );

      setErro(
        error instanceof Error
          ? error.message
          : 'Falha ao cadastrar. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const formularioLiberado =
    cpfValidado &&
    !cpfJaCadastrado &&
    Boolean(formData.nome_colab.trim());

  if (sucesso) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-lg text-center">
          <h1 className="text-3xl font-black text-green-700 mb-4">
            Cadastro realizado!
          </h1>

          <p className="text-gray-700 text-lg mb-6">
            {dadosRetorno.message}
          </p>

          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6 text-left">
            <p className="font-bold text-green-900">
              Seu número de colaborador:
            </p>

            <p className="text-2xl font-black text-green-700 mb-4">
              {dadosRetorno.cod_colab}
            </p>

            <p className="font-bold text-green-900">
              Seu link de indicação:
            </p>

            <a
              href={dadosRetorno.link_indicacao}
              target="_blank"
              rel="noreferrer"
              className="text-blue-700 underline break-all font-semibold"
            >
              {dadosRetorno.link_indicacao}
            </a>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            Use esse link para indicar o site e receber seu
            prêmio pelas compras feitas através dele.
          </p>

          <div className="flex flex-col md:flex-row gap-3">
            <Link
              to="/colaborador"
              className="flex-1 bg-blue-700 text-white py-3 rounded-xl font-bold"
            >
              Ir para Área do Colaborador
            </Link>

            <Link
              to="/"
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-bold"
            >
              Voltar ao site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <Link
          to="/seja-afiliado"
          className="text-blue-600 font-bold"
        >
          ← Voltar
        </Link>

        <h1 className="text-2xl font-black mt-6 mb-2">
          Cadastro de Colaborador
        </h1>

        <p className="text-sm text-slate-600 mb-6">
          Informe primeiro o CPF. Os demais dados serão
          liberados após a validação.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              CPF
            </label>

            <input
              name="cpf_colab"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={formatarCpf(
                formData.cpf_colab
              )}
              onChange={handleCpfChange}
              onBlur={() => {
                const cpf = somenteNumeros(
                  formData.cpf_colab
                );

                if (
                  cpf.length === 11 &&
                  !cpfValidado &&
                  !cpfJaCadastrado &&
                  !consultandoCpf
                ) {
                  consultarCpf(cpf);
                }
              }}
              placeholder="000.000.000-00"
              className={`w-full p-3 border rounded-xl outline-none ${
                cpfValidado
                  ? 'border-green-500 bg-green-50'
                  : cpfJaCadastrado
                    ? 'border-amber-500 bg-amber-50'
                    : mensagemCpf && !consultandoCpf
                      ? 'border-red-400 bg-red-50'
                      : 'border-slate-300'
              }`}
              required
            />

            {consultandoCpf && (
              <p className="mt-2 text-sm font-bold text-blue-700">
                Consultando CPF...
              </p>
            )}

            {!consultandoCpf && mensagemCpf && (
              <div
                className={`mt-2 text-sm font-bold p-4 rounded-xl ${
                  cpfValidado
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : cpfJaCadastrado
                      ? 'bg-amber-50 text-amber-900 border border-amber-300'
                      : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                <p>{mensagemCpf}</p>

                {cpfJaCadastrado && (
                  <Link
                    to="/colaborador"
                    className="inline-block mt-3 text-blue-700 underline font-black"
                  >
                    Ir para Área do Colaborador
                  </Link>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Nome completo
            </label>

            <input
              name="nome_colab"
              value={formData.nome_colab}
              readOnly
              placeholder="Será preenchido após a validação do CPF"
              className="w-full p-3 border rounded-xl bg-slate-100 text-slate-700"
              required
            />
          </div>

          <div
            className={`space-y-4 ${
              formularioLiberado
                ? ''
                : 'opacity-50 pointer-events-none'
            }`}
          >
            <input
              name="email_colab"
              type="email"
              value={formData.email_colab}
              onChange={handleInputChange}
              placeholder="E-mail"
              className="w-full p-3 border rounded-xl"
              disabled={!formularioLiberado}
              required
            />

            <input
              name="tel_colab"
              type="tel"
              inputMode="numeric"
              value={formData.tel_colab}
              onChange={handleInputChange}
              placeholder="Telefone (DDD + número)"
              className="w-full p-3 border rounded-xl"
              disabled={!formularioLiberado}
              required
            />

            <input
              name="pix_colab"
              value={formData.pix_colab}
              onChange={handleInputChange}
              placeholder="Chave PIX"
              className="w-full p-3 border rounded-xl"
              disabled={!formularioLiberado}
              required
            />

            <input
              name="senha_login"
              type="password"
              value={formData.senha_login}
              onChange={handleInputChange}
              placeholder="Crie uma senha de acesso"
              className="w-full p-3 border rounded-xl"
              disabled={!formularioLiberado}
              required
            />
          </div>

          <div
            className={`rounded-xl border p-4 ${
              formularioLiberado
                ? 'border-slate-300 bg-slate-50'
                : 'border-slate-200 bg-slate-100 opacity-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                id="aceite_termo_colaborador"
                type="checkbox"
                checked={aceitouTermo}
                onChange={(event) => {
                  setAceitouTermo(event.target.checked);
                  setErro('');
                }}
                disabled={!formularioLiberado}
                className="mt-1 h-5 w-5 shrink-0 accent-green-600"
                required
              />

              <label
                htmlFor="aceite_termo_colaborador"
                className="text-sm text-slate-700 leading-relaxed"
              >
                Li e concordo com o{' '}
                <button
                  type="button"
                  onClick={() => setTermoAberto(true)}
                  disabled={!formularioLiberado}
                  className="font-black text-blue-700 underline disabled:text-slate-500"
                >
                  Termo de Adesão e Compromisso do Colaborador
                  ConsulToque
                </button>
                . Estou ciente de que a participação é autônoma,
                sem salário fixo, horário, subordinação ou garantia
                de rendimentos.
              </label>
            </div>
          </div>

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-bold p-3 rounded-xl">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={
              loading ||
              consultandoCpf ||
              !formularioLiberado ||
              !aceitouTermo
            }
            className={`w-full text-white py-4 rounded-xl font-bold ${
              loading ||
              consultandoCpf ||
              !formularioLiberado ||
              !aceitouTermo
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading
              ? 'Enviando...'
              : consultandoCpf
                ? 'Validando CPF...'
                : cpfJaCadastrado
                  ? 'CPF já cadastrado'
                  : 'Confirmar Inscrição'}
          </button>
        </form>
      </div>

      {termoAberto && (
        <div
          className="fixed inset-0 z-50 bg-black/60 p-4 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-termo-colaborador"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setTermoAberto(false);
            }
          }}
        >
          <div className="w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="titulo-termo-colaborador"
                  className="text-xl font-black text-slate-900"
                >
                  Termo de Adesão e Compromisso do Colaborador
                  ConsulToque
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Versão {VERSAO_TERMO_COLABORADOR} — 20 de julho de 2026
                </p>
              </div>

              <button
                type="button"
                onClick={() => setTermoAberto(false)}
                className="shrink-0 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 font-black text-slate-700"
                aria-label="Fechar termo"
              >
                ×
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-5 text-sm leading-relaxed text-slate-700">
              <p>
                Ao realizar seu cadastro e marcar a opção de aceite,
                o COLABORADOR declara que leu, compreendeu e concorda
                com as condições abaixo.
              </p>

              <section>
                <h3 className="font-black text-slate-900 mb-2">
                  1. Objeto
                </h3>
                <p>
                  Este Termo regula a participação voluntária do
                  COLABORADOR no programa de indicações da ConsulToque.
                  O COLABORADOR poderá divulgar, por meios lícitos e
                  éticos, os produtos e serviços disponibilizados no
                  site e utilizar seu link, código ou QR Code individual
                  de indicação. A aquisição será realizada diretamente
                  pelo interessado nos canais oficiais indicados pela
                  ConsulToque.
                </p>
              </section>

              <section>
                <h3 className="font-black text-slate-900 mb-2">
                  2. Autonomia e inexistência de vínculo empregatício
                </h3>
                <p>
                  A participação possui natureza autônoma, independente
                  e não exclusiva. O cadastro não constitui contrato de
                  trabalho, sociedade, franquia, mandato, emprego ou
                  vínculo empregatício com a ConsulToque. O COLABORADOR
                  não está sujeito a jornada, controle de horário,
                  salário fixo, metas obrigatórias, chefe ou supervisor.
                  Poderá escolher livremente quando, onde e como fará
                  suas divulgações, exercer outras atividades e
                  interromper sua participação a qualquer momento. Não
                  existe garantia de vendas, renda mínima ou recebimento
                  de comissões.
                </p>
              </section>

              <section>
                <h3 className="font-black text-slate-900 mb-2">
                  3. Comissões
                </h3>
                <p>
                  O COLABORADOR receberá exclusivamente comissões sobre
                  vendas válidas, efetivamente pagas e corretamente
                  identificadas por seu código, link ou QR Code. As
                  regras atuais são: 50% sobre a primeira mensalidade
                  recebida; 20% sobre mensalidades recorrentes recebidas;
                  e 5% sobre valores elegíveis gerados por colaborador
                  diretamente indicado, conforme as regras da rede.
                  O fechamento ocorre no dia 20 de cada mês, com
                  previsão de pagamento no dia 5 subsequente, observadas
                  as regras operacionais e bancárias.
                </p>
                <p className="mt-2">
                  Não haverá comissão sobre cadastro sem pagamento,
                  cobrança vencida, cancelada, excluída, devolvida,
                  estornada, contestada ou fraudulenta, nem sobre venda
                  sem identificação válida. Comissão já contabilizada
                  sobre pagamento posteriormente desfeito poderá ser
                  compensada em pagamentos futuros, com registro no
                  histórico do colaborador.
                </p>
              </section>

              <section>
                <h3 className="font-black text-slate-900 mb-2">
                  4. Tributos e descontos legais
                </h3>
                <p>
                  Os valores exibidos no painel poderão corresponder a
                  valores brutos. Sobre as comissões poderão incidir
                  tributos, contribuições previdenciárias, retenções e
                  outros descontos exigidos pela legislação, conforme a
                  situação cadastral e tributária do COLABORADOR. O
                  pagamento poderá ser documentado por recibo,
                  comprovante ou nota fiscal, conforme aplicável. O
                  COLABORADOR é responsável pela veracidade e atualização
                  de suas informações cadastrais e fiscais.
                </p>
              </section>

              <section>
                <h3 className="font-black text-slate-900 mb-2">
                  5. Regras de divulgação
                </h3>
                <p>
                  O COLABORADOR compromete-se a fornecer informações
                  verdadeiras, utilizar preferencialmente materiais
                  oficiais, não prometer condições inexistentes, não se
                  apresentar como funcionário, profissional de saúde,
                  representante legal ou sócio da ConsulToque e não
                  receber pagamentos de clientes em nome da empresa. É
                  proibido praticar spam, publicidade enganosa, fraude,
                  constrangimento ou qualquer divulgação ilícita.
                </p>
              </section>

              <section>
                <h3 className="font-black text-slate-900 mb-2">
                  6. Marca e materiais
                </h3>
                <p>
                  A autorização para utilizar os materiais promocionais
                  oficiais é limitada, pessoal, gratuita, revogável e
                  não exclusiva. É proibido alterar indevidamente a
                  marca, criar canais que aparentem ser oficiais,
                  registrar domínios ou perfis com o nome ConsulToque ou
                  produzir materiais enganosos. A autorização termina
                  com o encerramento do cadastro.
                </p>
              </section>

              <section>
                <h3 className="font-black text-slate-900 mb-2">
                  7. Dados pessoais e confidencialidade
                </h3>
                <p>
                  Os dados do cadastro poderão ser utilizados para
                  identificação, administração do programa, apuração e
                  pagamento de comissões, prevenção de fraudes,
                  cumprimento de obrigações legais e comunicação com o
                  COLABORADOR. É proibido coletar, armazenar, divulgar ou
                  compartilhar indevidamente dados pessoais, financeiros
                  ou de saúde de clientes, associados ou colaboradores.
                </p>
              </section>

              <section>
                <h3 className="font-black text-slate-900 mb-2">
                  8. Suspensão e encerramento
                </h3>
                <p>
                  A participação poderá ser suspensa ou encerrada por
                  fraude, informação falsa, uso indevido da marca,
                  violação de dados, publicidade enganosa, desrespeito a
                  consumidores ou descumprimento deste Termo. O
                  encerramento não elimina comissões válidas já apuradas,
                  ressalvados valores relacionados a fraude, estorno,
                  contestação, devolução ou infração comprovada.
                </p>
              </section>

              <section>
                <h3 className="font-black text-slate-900 mb-2">
                  9. Atualizações e aceite eletrônico
                </h3>
                <p>
                  A ConsulToque poderá atualizar este Termo para atender
                  a mudanças comerciais, operacionais ou legais. Mudança
                  relevante na remuneração ou nas responsabilidades será
                  informada e submetida a novo aceite antes de produzir
                  efeitos futuros. O aceite eletrônico será registrado
                  com o CPF, a versão do Termo, a data e o horário.
                </p>
              </section>
            </div>

            <div className="p-5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                type="button"
                onClick={() => setTermoAberto(false)}
                className="px-5 py-3 rounded-xl bg-slate-200 text-slate-800 font-bold"
              >
                Fechar
              </button>

              <button
                type="button"
                onClick={() => {
                  setAceitouTermo(true);
                  setTermoAberto(false);
                  setErro('');
                }}
                className="px-5 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold"
              >
                Li e concordo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}