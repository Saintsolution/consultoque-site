import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const WEBHOOK_BUSCA_CPF =
  "https://n8n.saintsolution.com.br/webhook/BuscaCPFcolab";

const WEBHOOK_INSERT_COLAB =
  "https://n8n.saintsolution.com.br/webhook/insertcolab";

const VERSAO_TERMO_COLABORADOR = "2.1";

type RetornoCpf = {
  status?: string;

  cpf_validado?: boolean;
  cpf_existe?: boolean;
  pode_cadastrar?: boolean;

  maior_idade?: boolean;
  liberar_cadastro?: boolean;

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
  return String(valor ?? "").replace(/\D/g, "");
}

function formatarCpf(valor: string) {
  const numeros = somenteNumeros(valor).slice(0, 11);

  return numeros
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function formatarCodigoColaborador(valor: string | number | undefined) {
  const numeros = somenteNumeros(String(valor ?? ""));

  if (!numeros) {
    return "";
  }

  return numeros.padStart(4, "0");
}

function pegarPrimeiroResultado<T>(valor: T | T[]): T {
  return Array.isArray(valor) ? valor[0] : valor;
}

function encerrarSessaoColaboradorAnterior() {
  const chavesDaSessao = [
    "cod_colab",
    "nome_colab",
    "colaborador_id",
    "colaborador_nome",
    "colaborador_cpf",
    "colaborador_logado",
    "token_colaborador",
  ];

  chavesDaSessao.forEach((chave) => {
    localStorage.removeItem(chave);
    sessionStorage.removeItem(chave);
  });
}

export function InscricaoColaborador() {
  const [refId, setRefId] = useState("0001");

  const [loading, setLoading] = useState(false);
  const [consultandoCpf, setConsultandoCpf] = useState(false);

  const [erro, setErro] = useState("");
  const [mensagemCpf, setMensagemCpf] = useState("");

  const [cpfValidado, setCpfValidado] = useState(false);
  const [cpfJaCadastrado, setCpfJaCadastrado] = useState(false);

  const [ultimoCpfConsultado, setUltimoCpfConsultado] = useState("");

  const [sucesso, setSucesso] = useState(false);
  const [aceitouTermo, setAceitouTermo] = useState(false);
  const [termoAberto, setTermoAberto] = useState(false);

  const [dadosRetorno, setDadosRetorno] = useState({
    message: "",
    cod_colab: "",
    link_indicacao: "",
  });

  const [formData, setFormData] = useState({
    nome_colab: "",
    email_colab: "",
    tel_colab: "",
    cpf_colab: "",
    pix_colab: "",
    senha_login: "",
  });

  useEffect(() => {
    const savedRef = localStorage.getItem("referenciador_id");

    if (savedRef) {
      setRefId(somenteNumeros(savedRef).padStart(4, "0"));
    }
  }, []);

  function limparDadosDepoisCpf() {
    setFormData((prev) => ({
      ...prev,
      nome_colab: "",
      email_colab: "",
      tel_colab: "",
      pix_colab: "",
      senha_login: "",
    }));
  }

  async function consultarCpf(cpfInformado: string) {
    const cpf = somenteNumeros(cpfInformado);

    if (cpf.length !== 11) {
      return;
    }

    if (cpf === ultimoCpfConsultado && (cpfValidado || cpfJaCadastrado)) {
      return;
    }

    setConsultandoCpf(true);

    setErro("");
    setMensagemCpf("Consultando CPF...");

    setCpfValidado(false);
    setCpfJaCadastrado(false);

    try {
      const response = await fetch(WEBHOOK_BUSCA_CPF, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cpf,
        }),
      });

      if (!response.ok) {
        throw new Error("Não foi possível consultar o CPF.");
      }

      const respostaJson = await response.json();

      const resultado = pegarPrimeiroResultado<RetornoCpf>(respostaJson);

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
        resultado?.status === "ja_cadastrado" ||
        resultado?.cpf_existe === true
      ) {
        const codColab = formatarCodigoColaborador(resultado?.cod_colab);

        setCpfValidado(false);
        setCpfJaCadastrado(true);

        setFormData({
          nome_colab: "",
          email_colab: "",
          tel_colab: "",
          cpf_colab: resultado?.cpf || cpf,
          pix_colab: "",
          senha_login: "",
        });

        setMensagemCpf(
          resultado?.mensagem ||
            `Este CPF já possui cadastro. ` +
              `Seu número de colaborador é ${
                codColab || "o número informado por e-mail"
              }. ` +
              `Enviamos seus dados de acesso para ${
                resultado?.email_mascarado || "o e-mail cadastrado"
              }. Após entrar, altere sua senha.`,
        );

        return;
      }

      /*
       * CPF INVÁLIDO OU ERRO DA API
       */
      if (resultado?.status !== "sucesso" || resultado?.cpf_validado !== true) {
        setCpfValidado(false);
        setCpfJaCadastrado(false);

        limparDadosDepoisCpf();

        setMensagemCpf(
          resultado?.mensagem ||
            "O CPF informado não foi validado. Confira os números.",
        );

        return;
      }

      /*
       * O programa de Associados Colaboradores
       * é exclusivo para maiores de 18 anos.
       * Se a API não confirmar expressamente a
       * maioridade, o cadastro permanece bloqueado.
       */
      if (
        resultado?.maior_idade !== true ||
        resultado?.liberar_cadastro === false ||
        resultado?.pode_cadastrar === false
      ) {
        setCpfValidado(false);
        setCpfJaCadastrado(false);

        limparDadosDepoisCpf();

        setMensagemCpf(
          resultado?.mensagem ||
            "O programa de Associados Colaboradores é exclusivo para pessoas maiores de 18 anos.",
        );

        return;
      }

      /*
       * CPF NOVO, MAS SEM NOME
       */
      const nomeEncontrado = resultado?.nome || resultado?.nome_colab || "";

      if (!nomeEncontrado.trim()) {
        setCpfValidado(false);
        setCpfJaCadastrado(false);

        limparDadosDepoisCpf();

        setMensagemCpf("O CPF foi validado, mas o nome não foi encontrado.");

        return;
      }

      /*
       * CPF NOVO, VALIDADO E MAIOR DE IDADE.
       */
      setCpfValidado(true);
      setCpfJaCadastrado(false);

      setFormData((prev) => ({
        ...prev,
        cpf_colab: resultado?.cpf || cpf,
        nome_colab: nomeEncontrado,
      }));

      setMensagemCpf(
        resultado?.mensagem || "CPF validado com sucesso. Cadastro liberado.",
      );
    } catch (error) {
      console.error("Erro ao consultar CPF:", error);

      setCpfValidado(false);
      setCpfJaCadastrado(false);
      setUltimoCpfConsultado("");

      limparDadosDepoisCpf();

      setMensagemCpf(
        "Não foi possível consultar o CPF agora. Tente novamente.",
      );
    } finally {
      setConsultandoCpf(false);
    }
  }

  const handleCpfChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const cpfDigitado = somenteNumeros(event.target.value).slice(0, 11);

    setFormData({
      nome_colab: "",
      email_colab: "",
      tel_colab: "",
      cpf_colab: cpfDigitado,
      pix_colab: "",
      senha_login: "",
    });

    setCpfValidado(false);
    setCpfJaCadastrado(false);

    setErro("");
    setMensagemCpf("");
    setUltimoCpfConsultado("");

    if (cpfDigitado.length === 11) {
      consultarCpf(cpfDigitado);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErro("");

    const cpf = somenteNumeros(formData.cpf_colab);

    if (cpf.length !== 11) {
      setErro("Informe um CPF com 11 números.");
      return;
    }

    if (cpfJaCadastrado) {
      setErro(
        "Este CPF já possui cadastro. Use os dados enviados para o e-mail cadastrado.",
      );
      return;
    }

    if (!cpfValidado) {
      setErro("O CPF precisa ser validado antes da inscrição.");
      return;
    }

    if (!formData.nome_colab.trim()) {
      setErro("Não foi possível identificar o nome do CPF.");
      return;
    }

    if (!formData.email_colab.trim()) {
      setErro("Informe o e-mail.");
      return;
    }

    if (!formData.tel_colab.trim()) {
      setErro("Informe o telefone.");
      return;
    }

    if (!formData.pix_colab.trim()) {
      setErro("Informe a chave PIX.");
      return;
    }

    if (!formData.senha_login.trim()) {
      setErro("Crie uma senha de acesso.");
      return;
    }

    /*
     * O primeiro envio apenas abre o Termo.
     * Nenhum dado é enviado ao webhook neste momento.
     */
    setAceitouTermo(false);
    setTermoAberto(true);
  };

  const enviarCadastro = async () => {
    if (!aceitouTermo) {
      setErro(
        "Marque o aceite no final do Termo para concluir a inscrição.",
      );
      return;
    }

    setLoading(true);
    setErro("");

    const dataAceiteTermo = new Date();
    const cpf = somenteNumeros(formData.cpf_colab);

    const payload = {
      cod_pai: refId || "0001",

      nome_colab: formData.nome_colab.trim(),

      email_colab: formData.email_colab.trim().toLowerCase(),

      tel_colab: somenteNumeros(formData.tel_colab),

      cpf_colab: cpf,

      pix_colab: formData.pix_colab.trim(),

      senha_login: formData.senha_login,

      dt_cad: new Date().toLocaleDateString("pt-BR"),

      aceite_termo: true,
      versao_termo: VERSAO_TERMO_COLABORADOR,
      dt_aceite_termo: dataAceiteTermo.toISOString(),
    };

    try {
      const response = await fetch(WEBHOOK_INSERT_COLAB, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const respostaJson = await response.json().catch(() => null);

      const data = respostaJson
        ? pegarPrimeiroResultado<any>(respostaJson)
        : null;

      if (!response.ok || data?.status === "erro") {
        throw new Error(
          data?.mensagem || data?.message || "Erro ao enviar cadastro.",
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
          "Parabéns! Você agora tem seu link de indicação ConsulToque.",

        cod_colab: formatarCodigoColaborador(data?.cod_colab),

        link_indicacao: data?.link_indicacao || "",
      });

      setSucesso(true);

      setFormData({
        nome_colab: "",
        email_colab: "",
        tel_colab: "",
        cpf_colab: "",
        pix_colab: "",
        senha_login: "",
      });

      setCpfValidado(false);
      setCpfJaCadastrado(false);
      setAceitouTermo(false);
      setTermoAberto(false);

      setMensagemCpf("");
      setUltimoCpfConsultado("");
    } catch (error) {
      console.error("Erro ao cadastrar colaborador:", error);

      setErro(
        error instanceof Error
          ? error.message
          : "Falha ao cadastrar. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  const formularioLiberado =
    cpfValidado && !cpfJaCadastrado && Boolean(formData.nome_colab.trim());

  if (sucesso) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-lg text-center">
          <h1 className="text-3xl font-black text-green-700 mb-4">
            Cadastro realizado!
          </h1>

          <p className="text-gray-700 text-lg mb-6">{dadosRetorno.message}</p>

          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6 text-left">
            <p className="font-bold text-green-900">
              Seu número de colaborador:
            </p>

            <p className="text-2xl font-black text-green-700 mb-4">
              {dadosRetorno.cod_colab}
            </p>

            <p className="font-bold text-green-900">Seu link de indicação:</p>

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
            Use esse link para indicar o site e receber seu prêmio pelas compras
            feitas através dele.
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
        <Link to="/seja-afiliado" className="text-blue-600 font-bold">
          ← Voltar
        </Link>

        <h1 className="text-2xl font-black mt-6 mb-2">
          Cadastro de Colaborador
        </h1>

        <p className="text-sm text-slate-600 mb-6">
          Informe primeiro o CPF. Os demais dados serão liberados após a
          validação.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              CPF
            </label>

            <input
              name="cpf_colab"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={formatarCpf(formData.cpf_colab)}
              onChange={handleCpfChange}
              onBlur={() => {
                const cpf = somenteNumeros(formData.cpf_colab);

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
                  ? "border-green-500 bg-green-50"
                  : cpfJaCadastrado
                    ? "border-amber-500 bg-amber-50"
                    : mensagemCpf && !consultandoCpf
                      ? "border-red-400 bg-red-50"
                      : "border-slate-300"
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
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : cpfJaCadastrado
                      ? "bg-amber-50 text-amber-900 border border-amber-300"
                      : "bg-red-50 text-red-700 border border-red-200"
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
              formularioLiberado ? "" : "opacity-50 pointer-events-none"
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

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm leading-relaxed text-blue-900">
              Ao continuar, será exibido o Termo de Adesão e Compromisso
              completo. A inscrição somente será enviada depois da leitura e
              do aceite no final do documento.
            </p>
          </div>

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-bold p-3 rounded-xl">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={
              loading || consultandoCpf || !formularioLiberado
            }
            className={`w-full text-white py-4 rounded-xl font-bold ${
              loading || consultandoCpf || !formularioLiberado
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading
              ? "Enviando..."
              : consultandoCpf
                ? "Validando CPF..."
                : cpfJaCadastrado
                  ? "CPF já cadastrado"
                  : "Fazer inscrição"}
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
            if (
              event.target === event.currentTarget &&
              !loading
            ) {
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
                  Termo de Adesão e Compromisso do Associado Colaborador — SIA
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Versão {VERSAO_TERMO_COLABORADOR} — 23 de julho de 2026
                </p>
              </div>

              <button
                type="button"
                onClick={() => setTermoAberto(false)}
                disabled={loading}
                className="shrink-0 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 font-black text-slate-700"
                aria-label="Fechar termo"
              >
                ×
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-5 text-sm leading-relaxed text-slate-700">
              <p>
                Ao realizar seu cadastro na plataforma e marcar a opção de
                aceite eletrônico, você, na condição de Associado Colaborador,
                declara que é maior de 18 (dezoito) anos, que leu, compreendeu e
                concorda integralmente com os termos e condições abaixo
                estabelecidos pela SIA – Sistema Inteligente de Apoio
                Associativo e Amparo Comunitário.
              </p>

              <section>
                <h3 className="font-black text-slate-900 mb-2">1. Objeto</h3>
                <div className="space-y-2">
                  <p>
                    Este Termo regula a participação voluntária do Associado
                    Colaborador no programa de divulgação e indicação da SIA.
                  </p>
                  <p>
                    O Associado Colaborador poderá divulgar, por meios lícitos e
                    éticos, os benefícios, programas e serviços associativos
                    disponibilizados na plataforma, utilizando exclusivamente
                    seu link, código ou QR Code individual de indicação.
                  </p>
                  <p>
                    A adesão ou contratação de planos ou benefícios será
                    realizada diretamente pelo interessado nos canais oficiais
                    disponibilizados pela SIA.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="font-black text-slate-900 mb-2">
                  2. Capacidade Civil e Requisitos de Cadastro
                </h3>
                <p className="mb-2">
                  Para atuar como Associado Colaborador, o usuário declara
                  expressamente que:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    É pessoa física maior de 18 (dezoito) anos e plenamente
                    capaz para os atos da vida civil.
                  </li>
                  <li>
                    Os dados cadastrais, bancários e fiscais fornecidos são de
                    sua titularidade, exatos e atualizados.
                  </li>
                  <li>
                    É proibida a realização de cadastro e o recebimento de
                    repasses em nome de menores de idade ou por intermédio de
                    dados de terceiros.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-black text-slate-900 mb-2">
                  3. Autonomia e Inexistência de Vínculo Empregatício
                </h3>
                <div className="space-y-2">
                  <p>
                    A participação do Associado Colaborador possui natureza
                    estritamente associativa, autônoma, voluntária, independente
                    e não exclusiva.
                  </p>
                  <p>
                    O presente aceite não constitui contrato de trabalho,
                    relação de emprego, sociedade, franquia, representação
                    comercial, mandato ou vínculo subordinado com a SIA.
                  </p>
                  <p>O Associado Colaborador:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      Não está sujeito a controle de jornada, cumprimento de
                      horários, metas obrigatórias, subordinação ou chefia.
                    </li>
                    <li>
                      Possui total liberdade para escolher quando, onde e como
                      fará suas divulgações.
                    </li>
                    <li>
                      Pode exercer livremente outras atividades profissionais ou
                      comerciais e interromper sua participação no programa a
                      qualquer momento, sem penalidades.
                    </li>
                    <li>
                      Reconhece que não há garantia de vendas, renda mínima ou
                      compensação financeira fixa.
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="font-black text-slate-900 mb-2">
                  4. Regras de Incentivos e Repasses
                </h3>
                <div className="space-y-3">
                  <p>
                    O Associado Colaborador receberá incentivos financeiros
                    exclusivamente sobre as indicações ativadas, com
                    mensalidades efetivamente pagas e identificadas de forma
                    válida através do seu link, código ou QR Code.
                  </p>
                  <p className="font-bold text-slate-900">
                    Estrutura do Plano de Incentivos:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <strong>Adesão Direta (1ª Mensalidade):</strong> 50%
                      (cinquenta por cento) do valor da primeira mensalidade
                      paga pelos novos Associados cadastrados diretamente pelo
                      seu link de divulgação.
                    </li>
                    <li>
                      <strong>Recorrência Direta (Demais Mensalidades):</strong>{" "}
                      20% (vinte por cento) sobre as mensalidades recorrentes
                      recebidas dos Associados cadastrados diretamente pelo seu
                      link de divulgação, enquanto se mantiverem adimplentes.
                    </li>
                    <li>
                      <strong>Recorrência Indireta (2º Nível):</strong> 10% (dez
                      por cento) sobre as mensalidades recorrentes recebidas dos
                      Associados que forem ativados através do link de outros
                      Associados Colaboradores indicados pelo seu link.
                    </li>
                  </ul>
                  <p className="font-bold text-slate-900">
                    Regras Operacionais de Pagamento:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <strong>Fechamento e Repasse:</strong> o ciclo de apuração
                      encerra-se no dia 20 (vinte) de cada mês, com previsão de
                      repasse dos incentivos até o dia 5 (cinco) do mês
                      subsequente, observados os prazos de liquidação bancária e
                      validação operacional.
                    </li>
                    <li>
                      <strong>Exclusões:</strong> não haverá geração de
                      incentivo sobre cadastros sem pagamento, cobranças
                      pendentes, vencidas, canceladas, estornadas, devolvidas,
                      contestações de cartão (chargeback), fraudes ou vendas sem
                      a devida identificação do link ou código.
                    </li>
                    <li>
                      <strong>Compensação por Estornos:</strong> caso um
                      incentivo contabilizado seja posteriormente estornado ou
                      cancelado por contestação ou fraude, o valor
                      correspondente será deduzido dos repasses futuros, com o
                      devido registro no histórico do colaborador.
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="font-black text-slate-900 mb-2">
                  5. Tributos, Retenções e Encargos
                </h3>
                <div className="space-y-2">
                  <p>
                    Os valores de incentivos exibidos no painel do colaborador
                    correspondem a valores brutos.
                  </p>
                  <p>
                    Sobre os repasses mensais poderão incidir impostos,
                    contribuições previdenciárias (INSS), retenções na fonte ou
                    taxas operacionais de gateway exigíveis pela legislação
                    tributária e financeira vigente.
                  </p>
                  <p>
                    O Associado Colaborador é o único responsável pela
                    declaração e pelo recolhimento dos tributos incidentes sobre
                    sua renda pessoal junto aos órgãos competentes.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="font-black text-slate-900 mb-2">
                  6. Normas de Conduta e Divulgação
                </h3>
                <p className="mb-2">
                  O Associado Colaborador compromete-se a pautar suas
                  divulgações pela boa-fé, ética e transparência, devendo:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    Fornecer informações verdadeiras sobre os benefícios
                    oferecidos.
                  </li>
                  <li>
                    Utilizar exclusivamente os materiais promocionais oficiais
                    disponibilizados no site ou na pasta oficial de materiais.
                  </li>
                  <li>
                    Não se apresentar como funcionário, preposto, corretor
                    exclusivo, profissional de saúde, representante legal ou
                    sócio da SIA.
                  </li>
                  <li>
                    Não receber pagamentos, Pix ou valores de clientes em sua
                    conta pessoal em nome da associação.
                  </li>
                  <li>
                    Não praticar spam, publicidade enganosa, disparo de
                    mensagens não solicitadas, invasão de privacidade, promessas
                    de ganhos fáceis ou qualquer conduta ilícita.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-black text-slate-900 mb-2">
                  7. Uso da Marca e Propriedade Intelectual
                </h3>
                <div className="space-y-2">
                  <p>
                    A autorização para utilização dos materiais promocionais
                    oficiais e da marca SIA é concedida de forma limitada,
                    pessoal, gratuita, revogável a qualquer tempo e não
                    exclusiva.
                  </p>
                  <p>É expressamente proibido:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      Alterar, deformar ou modificar logotipos, marcas e artes
                      oficiais da SIA.
                    </li>
                    <li>
                      Criar sites, canais, páginas ou perfis em redes sociais
                      que simulem ser canais oficiais da associação.
                    </li>
                    <li>
                      Registrar domínios de internet, marcas ou nomes de usuário
                      que contenham a palavra “SIA” ou variações confundíveis.
                    </li>
                  </ul>
                  <p>
                    A autorização de uso da marca encerra-se imediatamente em
                    caso de desligamento do programa.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="font-black text-slate-900 mb-2">
                  8. Proteção de Dados Pessoais (LGPD) e Confidencialidade
                </h3>
                <div className="space-y-2">
                  <p>
                    Os dados pessoais do Associado Colaborador serão tratados
                    pela SIA para fins de identificação, gestão do programa,
                    apuração e pagamento de incentivos, prevenção a fraudes e
                    cumprimento de obrigações legais, nos termos da Lei Geral de
                    Proteção de Dados (Lei nº 13.709/2018).
                  </p>
                  <p>
                    O Associado Colaborador compromete-se a respeitar a
                    privacidade dos indicados, sendo-lhe vedado coletar,
                    armazenar, manipular, divulgar ou compartilhar indevidamente
                    dados pessoais, financeiros ou dados sensíveis de saúde de
                    associados ou terceiros.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="font-black text-slate-900 mb-2">
                  9. Suspensão e Cancelamento do Cadastro
                </h3>
                <div className="space-y-2">
                  <p>
                    A SIA reserva-se o direito de suspender ou encerrar
                    imediatamente o cadastro do Associado Colaborador, sem
                    prejuízo das medidas judiciais cabíveis, nos seguintes
                    casos:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Violação de qualquer cláusula deste Termo.</li>
                    <li>
                      Prática de fraude, envio de informações falsas ou uso de
                      meios automatizados irregulares.
                    </li>
                    <li>
                      Utilização indevida da marca ou conduta que cause danos à
                      imagem da associação ou de terceiros.
                    </li>
                  </ul>
                  <p>
                    <strong>Efeitos do Encerramento:</strong> o cancelamento do
                    cadastro não extingue o direito ao recebimento de incentivos
                    válidos e já apurados até a data do desligamento,
                    ressalvados os valores decorrentes de fraudes, estornos,
                    devoluções, valores contestados ou ressarcimentos de
                    prejuízos causados à entidade.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="font-black text-slate-900 mb-2">
                  10. Atualizações do Termo e Aceite Eletrônico
                </h3>
                <div className="space-y-2">
                  <p>
                    A SIA poderá alterar ou atualizar este Termo periodicamente
                    para adequação a mudanças comerciais, legais ou
                    operacionais.
                  </p>
                  <p>
                    Eventuais alterações relevantes nas regras de
                    comissionamento ou responsabilidades serão comunicadas
                    previamente na plataforma e submetidas a um novo aceite
                    eletrônico.
                  </p>
                  <p>
                    <strong>Validade do Aceite:</strong> o aceite eletrônico
                    deste Termo será registrado no sistema com a identificação
                    do CPF do usuário, endereço IP, versão do documento, data e
                    horário, constituindo meio de prova para os fins aplicáveis.
                  </p>
                </div>
              </section>
            </div>

            <div className="border-t border-slate-200 bg-slate-50 p-5">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <input
                  id="aceite_termo_colaborador"
                  type="checkbox"
                  checked={aceitouTermo}
                  onChange={(event) => {
                    setAceitouTermo(event.target.checked);
                    setErro("");
                  }}
                  disabled={loading}
                  className="mt-1 h-5 w-5 shrink-0 accent-green-600"
                />

                <span className="text-sm font-semibold leading-relaxed text-blue-950">
                  Declaro que sou maior de 18 anos, li, compreendi e concordo
                  integralmente com o Termo de Adesão e Compromisso do
                  Associado Colaborador — SIA.
                </span>
              </label>

              {erro && (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
                  {erro}
                </div>
              )}

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setTermoAberto(false)}
                  disabled={loading}
                  className="rounded-xl bg-slate-200 px-5 py-3 font-bold text-slate-800 disabled:opacity-50"
                >
                  Voltar
                </button>

                <button
                  type="button"
                  onClick={enviarCadastro}
                  disabled={!aceitouTermo || loading}
                  className="rounded-xl bg-green-600 px-5 py-3 font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "Enviando inscrição..."
                    : "Confirmar inscrição"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}