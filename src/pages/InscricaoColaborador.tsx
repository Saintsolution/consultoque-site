import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const WEBHOOK_BUSCA_CPF =
  'https://n8n.saintsolution.com.br/webhook/BuscaCPFcolab';

const WEBHOOK_INSERT_COLAB =
  'https://n8n.saintsolution.com.br/webhook/insertcolab';

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

    setLoading(true);

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
              !formularioLiberado
            }
            className={`w-full text-white py-4 rounded-xl font-bold ${
              loading ||
              consultandoCpf ||
              !formularioLiberado
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
    </div>
  );
}