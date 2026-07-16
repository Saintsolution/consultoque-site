import { useState } from 'react';
import axios from 'axios';

// Colocaremos o endereço do webhook aqui depois.
const WEBHOOK_PEDIDO_IMPRESSOS = 'https://n8n.saintsolution.com.br/webhook/pedido-impressos';

const arquivos = import.meta.glob(
  '../assets/panfletos/folder_*.{png,jpg,jpeg,webp}',
  {
    eager: true,
    import: 'default',
  }
) as Record<string, string>;

type Panfleto = {
  id: string;
  titulo: string;
  imagem: string;
};

function criarId(caminho: string) {
  return (
    caminho
      .split('/')
      .pop()
      ?.replace(/\.(png|jpg|jpeg|webp)$/i, '') || ''
  );
}

function criarTitulo(caminho: string) {
  return criarId(caminho)
    .replace(/^folder_/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letra) => letra.toUpperCase());
}

const panfletos: Panfleto[] = Object.entries(arquivos).map(
  ([caminho, imagem]) => ({
    id: criarId(caminho),
    titulo: criarTitulo(caminho),
    imagem,
  })
);

function formatCod(value: string | null) {
  if (!value) return '';

  return value
    .replace(/\D/g, '')
    .padStart(4, '0');
}

function somenteNumeros(value: string) {
  return value.replace(/\D/g, '');
}

export function SolicitarImpressos() {
  const params = new URLSearchParams(window.location.search);
  const modeloId = params.get('modelo') || '';

  const panfleto = panfletos.find(
    (item) => item.id === modeloId
  );

  const codColab = formatCod(
    localStorage.getItem('cod_colab')
  );

  const [enviando, setEnviando] = useState(false);
  const [pedidoEnviado, setPedidoEnviado] = useState(false);
  const [numeroPedido, setNumeroPedido] = useState('');

  const [formData, setFormData] = useState({
    nome_colab:
      localStorage.getItem('nome_colab') || '',
    email_colab: '',
    tel_colab: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    referencia: '',
    confirmacao_endereco: false,
  });

  function alterarCampo(
    campo: keyof typeof formData,
    valor: string | boolean
  ) {
    setFormData((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  function validarFormulario() {
    if (!formData.nome_colab.trim()) {
      return 'Informe seu nome completo.';
    }

    if (!formData.email_colab.trim()) {
      return 'Informe seu e-mail.';
    }

    if (!formData.email_colab.includes('@')) {
      return 'Informe um e-mail válido.';
    }

    if (somenteNumeros(formData.tel_colab).length < 10) {
      return 'Informe um telefone com DDD.';
    }

    if (somenteNumeros(formData.cep).length !== 8) {
      return 'Informe um CEP válido com 8 números.';
    }

    if (!formData.endereco.trim()) {
      return 'Informe o nome da rua ou avenida.';
    }

    if (!formData.numero.trim()) {
      return 'Informe o número do endereço.';
    }

    if (!formData.bairro.trim()) {
      return 'Informe o bairro.';
    }

    if (!formData.cidade.trim()) {
      return 'Informe a cidade.';
    }

    if (formData.estado.trim().length !== 2) {
      return 'Informe a sigla do estado com 2 letras.';
    }

    if (!formData.confirmacao_endereco) {
      return 'Confirme que o endereço está correto.';
    }

    return '';
  }

  async function enviarPedido(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const erroValidacao = validarFormulario();

    if (erroValidacao) {
      alert(erroValidacao);
      return;
    }

    if (!panfleto) {
      alert('Escolha um panfleto antes de enviar.');
      return;
    }

    if (!WEBHOOK_PEDIDO_IMPRESSOS) {
      alert(
        'O formulário está pronto, mas o webhook do n8n ainda será configurado.'
      );
      return;
    }

    setEnviando(true);

    try {
      const response = await axios.post(
        WEBHOOK_PEDIDO_IMPRESSOS,
        {
          cod_colab: codColab,
          nome_colab: formData.nome_colab.trim(),
          email_colab: formData.email_colab.trim(),
          tel_colab: somenteNumeros(
            formData.tel_colab
          ),
          modelo_folder: panfleto.id,
          nome_modelo: panfleto.titulo,
          quantidade: 100,
          cep: somenteNumeros(formData.cep),
          endereco: formData.endereco.trim(),
          numero: formData.numero.trim(),
          complemento: formData.complemento.trim(),
          bairro: formData.bairro.trim(),
          cidade: formData.cidade.trim(),
          estado: formData.estado
            .trim()
            .toUpperCase(),
          referencia: formData.referencia.trim(),
        },
        {
          timeout: 15000,
        }
      );

      const retorno = Array.isArray(response.data)
        ? response.data[0]
        : response.data;

      if (
        retorno?.status === 'duplicado' ||
        retorno?.status === 'ja_solicitado'
      ) {
        alert(
          retorno?.mensagem ||
            'Você já utilizou o benefício dos 100 panfletos gratuitos.'
        );
        return;
      }

      if (
        retorno?.status &&
        retorno.status !== 'sucesso'
      ) {
        alert(
          retorno?.mensagem ||
            'Não foi possível registrar o pedido.'
        );
        return;
      }

      setNumeroPedido(retorno?.cod_pedido || '');
      setPedidoEnviado(true);

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } catch (error) {
      console.error(error);

      alert(
        'Não foi possível enviar seu pedido. Tente novamente em alguns minutos.'
      );
    } finally {
      setEnviando(false);
    }
  }

  if (!codColab) {
    return (
      <MensagemCentral
        icone="🔒"
        titulo="Faça login para continuar"
        texto="Entre na Área do Colaborador antes de solicitar seus panfletos."
        link="/colaborador"
        textoLink="Ir para o login"
      />
    );
  }

  if (!panfleto) {
    return (
      <MensagemCentral
        icone="🖼️"
        titulo="Escolha um panfleto"
        texto="Volte ao catálogo e escolha a arte que deseja receber."
        link="/panfletos-promocionais"
        textoLink="Ver panfletos"
      />
    );
  }

  if (pedidoEnviado) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-white border border-green-200 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 mx-auto bg-green-100 text-4xl rounded-full flex items-center justify-center">
            ✓
          </div>

          <p className="text-sm font-black uppercase text-green-700 mt-6">
            Solicitação recebida
          </p>

          <h1 className="text-3xl font-black mt-2">
            Seu pedido foi registrado!
          </h1>

          {numeroPedido && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-5">
              <p className="text-sm text-blue-700 font-bold">
                Número do pedido
              </p>

              <p className="text-2xl text-blue-900 font-black mt-1">
                {numeroPedido}
              </p>
            </div>
          )}

          <p className="text-slate-600 leading-relaxed mt-5">
            A ConsulToque verificará os dados e preparará
            seus 100 panfletos personalizados.
          </p>

          <p className="text-slate-600 leading-relaxed mt-2">
            Você receberá um aviso por e-mail quando o
            material for enviado.
          </p>

          <a
            href="/colaborador"
            className="inline-flex mt-7 bg-blue-700 hover:bg-blue-800 text-white font-bold px-6 py-3 rounded-xl"
          >
            Voltar para minha área
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <a
              href="/"
              className="text-2xl font-black tracking-tight"
            >
              <span className="text-blue-700">
                CONSUL
              </span>

              <span className="text-green-600">
                TOQUE
              </span>
            </a>

            <p className="text-sm text-slate-500 mt-1">
              Solicitação de material impresso
            </p>
          </div>

          <a
            href="/panfletos-promocionais"
            className="text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg"
          >
            ← Escolher outra arte
          </a>
        </div>
      </header>

      <section className="bg-gradient-to-br from-blue-800 via-blue-700 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
          <p className="text-green-200 font-bold uppercase tracking-wider text-sm">
            Presente de boas-vindas
          </p>

          <h1 className="text-3xl sm:text-4xl font-black mt-3">
            Solicite seus 100 panfletos
          </h1>

          <p className="max-w-3xl text-blue-50 text-lg leading-relaxed mt-4">
            Preencha seu endereço com atenção. Seu material
            será personalizado com o QR Code de indicação do
            colaborador <strong>{codColab}</strong>.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-8 items-start">
          <aside className="lg:sticky lg:top-5">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-slate-100 p-4">
                <img
                  src={panfleto.imagem}
                  alt={panfleto.titulo}
                  className="w-full rounded-xl shadow-sm"
                />
              </div>

              <div className="p-5">
                <p className="text-xs font-black uppercase text-green-700">
                  Modelo escolhido
                </p>

                <h2 className="text-xl font-black mt-2">
                  {panfleto.titulo}
                </h2>

                <div className="border-t border-slate-200 mt-4 pt-4">
                  <p className="text-sm text-slate-500">
                    Quantidade
                  </p>

                  <p className="text-2xl font-black text-blue-700">
                    100 unidades
                  </p>
                </div>

                <div className="border-t border-slate-200 mt-4 pt-4">
                  <p className="text-sm text-slate-500">
                    Colaborador
                  </p>

                  <p className="text-xl font-black">
                    {codColab}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mt-5">
              <p className="font-black text-amber-950">
                Importante
              </p>

              <p className="text-sm text-amber-900 leading-relaxed mt-2">
                Cada colaborador poderá utilizar este
                benefício gratuito uma única vez.
              </p>
            </div>
          </aside>

          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
            <p className="text-sm font-black uppercase text-blue-700">
              Dados para envio
            </p>

            <h2 className="text-2xl sm:text-3xl font-black mt-2">
              Para onde enviaremos?
            </h2>

            <p className="text-slate-600 leading-relaxed mt-3">
              Preencha todos os campos obrigatórios. Confira
              principalmente o CEP, a rua e o número.
            </p>

            <form
              onSubmit={enviarPedido}
              className="mt-8 space-y-7"
            >
              <BlocoFormulario titulo="Seus dados">
                <Campo
                  label="Nome completo"
                  value={formData.nome_colab}
                  onChange={(valor) =>
                    alterarCampo('nome_colab', valor)
                  }
                  required
                />

                <Campo
                  label="E-mail"
                  type="email"
                  value={formData.email_colab}
                  onChange={(valor) =>
                    alterarCampo('email_colab', valor)
                  }
                  required
                />

                <Campo
                  label="Telefone / WhatsApp com DDD"
                  type="tel"
                  value={formData.tel_colab}
                  onChange={(valor) =>
                    alterarCampo('tel_colab', valor)
                  }
                  required
                />
              </BlocoFormulario>

              <BlocoFormulario titulo="Endereço de entrega">
                <Campo
                  label="CEP"
                  value={formData.cep}
                  onChange={(valor) =>
                    alterarCampo('cep', valor)
                  }
                  maxLength={9}
                  required
                />

                <Campo
                  label="Rua ou avenida"
                  value={formData.endereco}
                  onChange={(valor) =>
                    alterarCampo('endereco', valor)
                  }
                  required
                  larguraTotal
                />

                <Campo
                  label="Número"
                  value={formData.numero}
                  onChange={(valor) =>
                    alterarCampo('numero', valor)
                  }
                  required
                />

                <Campo
                  label="Complemento"
                  placeholder="Apartamento, bloco, casa..."
                  value={formData.complemento}
                  onChange={(valor) =>
                    alterarCampo('complemento', valor)
                  }
                />

                <Campo
                  label="Bairro"
                  value={formData.bairro}
                  onChange={(valor) =>
                    alterarCampo('bairro', valor)
                  }
                  required
                />

                <Campo
                  label="Cidade"
                  value={formData.cidade}
                  onChange={(valor) =>
                    alterarCampo('cidade', valor)
                  }
                  required
                />

                <Campo
                  label="Estado"
                  placeholder="RJ"
                  value={formData.estado}
                  onChange={(valor) =>
                    alterarCampo(
                      'estado',
                      valor
                        .replace(/[^a-zA-Z]/g, '')
                        .slice(0, 2)
                        .toUpperCase()
                    )
                  }
                  maxLength={2}
                  required
                />

                <Campo
                  label="Ponto de referência"
                  placeholder="Próximo a..."
                  value={formData.referencia}
                  onChange={(valor) =>
                    alterarCampo('referencia', valor)
                  }
                  larguraTotal
                />
              </BlocoFormulario>

              <label className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    formData.confirmacao_endereco
                  }
                  onChange={(event) =>
                    alterarCampo(
                      'confirmacao_endereco',
                      event.target.checked
                    )
                  }
                  className="w-5 h-5 mt-0.5 accent-green-600"
                />

                <span className="text-sm text-green-950 leading-relaxed">
                  Conferi os dados acima e confirmo que o
                  endereço está correto e completo.
                </span>
              </label>

              <button
                type="submit"
                disabled={enviando}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-black text-lg px-6 py-4 rounded-xl disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {enviando
                  ? 'Enviando pedido...'
                  : 'Enviar meu pedido'}
              </button>

              <p className="text-xs text-center text-slate-500">
                Seus dados serão utilizados somente para
                processar e entregar o material solicitado.
              </p>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

type CampoProps = {
  label: string;
  value: string;
  onChange: (valor: string) => void;
  type?: string;
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
  larguraTotal?: boolean;
};

function Campo({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  maxLength,
  required,
  larguraTotal,
}: CampoProps) {
  return (
    <label
      className={
        larguraTotal
          ? 'block md:col-span-2'
          : 'block'
      }
    >
      <span className="block text-sm font-bold text-slate-800 mb-2">
        {label}

        {required && (
          <span className="text-red-600"> *</span>
        )}
      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        required={required}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

type BlocoFormularioProps = {
  titulo: string;
  children: React.ReactNode;
};

function BlocoFormulario({
  titulo,
  children,
}: BlocoFormularioProps) {
  return (
    <fieldset>
      <legend className="text-lg font-black text-slate-900 mb-4">
        {titulo}
      </legend>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {children}
      </div>
    </fieldset>
  );
}

type MensagemCentralProps = {
  icone: string;
  titulo: string;
  texto: string;
  link: string;
  textoLink: string;
};

function MensagemCentral({
  icone,
  titulo,
  texto,
  link,
  textoLink,
}: MensagemCentralProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl p-8 text-center">
        <div className="text-5xl mb-4">
          {icone}
        </div>

        <h1 className="text-2xl font-black">
          {titulo}
        </h1>

        <p className="text-slate-600 mt-3">
          {texto}
        </p>

        <a
          href={link}
          className="inline-flex mt-6 bg-blue-700 hover:bg-blue-800 text-white font-bold px-6 py-3 rounded-xl"
        >
          {textoLink}
        </a>
      </div>
    </div>
  );
}