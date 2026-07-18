import { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const LINK_VIDEOS =
  'https://drive.google.com/drive/folders/11umxlHmomrmMQIi3mEBuGD_R5k2Kgg-6?usp=drive_link';

const LINK_TEXTOS =
  'https://drive.google.com/drive/folders/1pjk7eKKBeAavOw_7-0i8BW-ad0ymoKTj?usp=drive_link';

const LINK_MATERIAL_IMPRESSO =
  'https://drive.google.com/drive/folders/1qkwIorYxgoIhFYFfrMfvq5y2ogrX8rlr?usp=drive_link';

const VIDEOS_PROMOCIONAIS = [
  {
    slug: 'crianca-noite',
    titulo: 'Criança durante a noite',
    descricao:
      'Uma família encontra atendimento médico para o filho durante a madrugada.',
    formato: 'Vertical',
  },
  {
    slug: 'morena-tiktok',
    titulo: 'Morena TikTok',
    descricao:
      'Vídeo curto e direto, preparado para compartilhamento em redes sociais.',
    formato: 'Vertical',
  },
  {
    slug: 'japones-doente',
    titulo: 'Japonês doente',
    descricao:
      'Campanha promocional mostrando uma situação cotidiana e a solução ConsulToque.',
    formato: 'Vertical',
  },
  {
    slug: 'medico-explica',
    titulo: 'Médico explica',
    descricao:
      'Um médico explica de maneira simples como funciona o atendimento.',
    formato: 'Horizontal',
  },
] as const;

function formatCod(value: string | null) {
  if (!value) return '';

  return String(value)
    .replace(/\D/g, '')
    .padStart(4, '0');
}

export function MaterialPromocional() {
  const qrCodeRef = useRef<SVGSVGElement | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [videoCopiado, setVideoCopiado] = useState<string | null>(null);

  const codColab = formatCod(localStorage.getItem('cod_colab'));
  const nomeColab =
    localStorage.getItem('nome_colab') || 'colaborador';

  const linkVenda = codColab
    ? `https://consultoque.com.br/${codColab}`
    : '';

  async function copiarLink() {
    if (!linkVenda) return;

    try {
      await navigator.clipboard.writeText(linkVenda);
      setCopiado(true);

      window.setTimeout(() => {
        setCopiado(false);
      }, 2500);
    } catch (error) {
      console.error(error);
      window.prompt(
        'Copie seu link de vendas:',
        linkVenda
      );
    }
  }

  function compartilharWhatsApp() {
    if (!linkVenda) return;

    const mensagem = [
      'Olá! Quero apresentar a você a ConsulToque.',
      'Conheça nossos planos e veja como funciona:',
      linkVenda,
    ].join('\n\n');

    const urlWhatsApp =
      `https://wa.me/?text=${encodeURIComponent(mensagem)}`;

    window.open(
      urlWhatsApp,
      '_blank',
      'noopener,noreferrer'
    );
  }

  function criarLinkVideo(slug: string) {
    if (!codColab) return '';

    return `https://consultoque.com.br/play/${slug}/${codColab}`;
  }

  async function copiarLinkVideo(slug: string) {
    const linkVideo = criarLinkVideo(slug);

    if (!linkVideo) return;

    try {
      await navigator.clipboard.writeText(linkVideo);
      setVideoCopiado(slug);

      window.setTimeout(() => {
        setVideoCopiado((atual) =>
          atual === slug ? null : atual
        );
      }, 2500);
    } catch (error) {
      console.error(error);
      window.prompt(
        'Copie o link deste vídeo:',
        linkVideo
      );
    }
  }

  function compartilharVideoWhatsApp(
    slug: string,
    titulo: string
  ) {
    const linkVideo = criarLinkVideo(slug);

    if (!linkVideo) return;

    const mensagem = [
      `Assista a este vídeo da ConsulToque: ${titulo}`,
      linkVideo,
    ].join('\n\n');

    const urlWhatsApp =
      `https://wa.me/?text=${encodeURIComponent(mensagem)}`;

    window.open(
      urlWhatsApp,
      '_blank',
      'noopener,noreferrer'
    );
  }

  function baixarQRCode() {
    const svg = qrCodeRef.current;

    if (!svg || !codColab) return;

    const svgCopiado = svg.cloneNode(true) as SVGSVGElement;

    svgCopiado.setAttribute(
      'xmlns',
      'http://www.w3.org/2000/svg'
    );

    const conteudoSVG =
      new XMLSerializer().serializeToString(svgCopiado);

    const arquivo = new Blob([conteudoSVG], {
      type: 'image/svg+xml;charset=utf-8',
    });

    const url = URL.createObjectURL(arquivo);
    const link = document.createElement('a');

    link.href = url;
    link.download = `qrcode-consultoque-${codColab}.svg`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  if (!codColab) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-blue-100 flex items-center justify-center text-3xl">
            🔒
          </div>

          <h1 className="text-2xl font-black text-slate-900 mb-3">
            Entre na Área do Colaborador
          </h1>

          <p className="text-slate-600 leading-relaxed mb-6">
            Para visualizar seu link, seu QR Code e os materiais
            promocionais, primeiro faça o login na sua área.
          </p>

          <a
            href="/colaborador"
            className="inline-flex items-center justify-center bg-blue-700 hover:bg-blue-800 text-white font-bold px-6 py-3 rounded-xl transition-colors"
          >
            Ir para o login
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
              <span className="text-blue-700">CONSUL</span>
              <span className="text-green-600">TOQUE</span>
            </a>

            <p className="text-sm text-slate-500 mt-1">
              Apoio ao colaborador
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/colaborador"
              className="text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
            >
              ← Voltar ao painel
            </a>

            <a
              href="/"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-2"
            >
              Início do site
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="bg-gradient-to-br from-blue-800 via-blue-700 to-green-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
            <div className="max-w-3xl">
              <p className="text-green-200 font-bold uppercase tracking-wider text-sm mb-3">
                Área de divulgação
              </p>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
                Material Promocional e Dicas de Venda
              </h1>

              <p className="text-blue-50 text-lg leading-relaxed mt-5">
                Olá, <strong>{nomeColab}</strong>! Nesta página você
                encontrará materiais e instruções simples para divulgar
                a ConsulToque e fazer suas indicações.
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-7 relative z-10">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px]">
              <div className="p-6 sm:p-8">
                <p className="text-sm font-black uppercase tracking-wider text-blue-700">
                  Seus dados de divulgação
                </p>

                <h2 className="text-2xl font-black mt-2">
                  Este é o seu link exclusivo
                </h2>

                <p className="text-slate-600 leading-relaxed mt-3">
                  Sempre use este endereço para divulgar a ConsulToque.
                  O número no final identifica que o novo associado
                  chegou por sua indicação.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr] gap-4 mt-6">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <p className="text-xs font-bold uppercase text-slate-500">
                      Seu número
                    </p>

                    <p className="text-3xl font-black text-green-600 mt-1">
                      {codColab}
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 min-w-0">
                    <p className="text-xs font-bold uppercase text-blue-700">
                      Seu link de vendas
                    </p>

                    <a
                      href={linkVenda}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-800 font-black mt-2 break-all hover:underline"
                    >
                      {linkVenda}
                    </a>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-5">
                  <button
                    type="button"
                    onClick={copiarLink}
                    className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-5 py-3 rounded-xl transition-colors"
                  >
                    {copiado ? '✓ Link copiado!' : 'Copiar meu link'}
                  </button>

                  <button
                    type="button"
                    onClick={compartilharWhatsApp}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-3 rounded-xl transition-colors"
                  >
                    Enviar pelo WhatsApp
                  </button>

                  <a
                    href={linkVenda}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-center bg-slate-900 hover:bg-black text-white font-bold px-5 py-3 rounded-xl transition-colors"
                  >
                    Abrir meu link
                  </a>
                </div>

                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-amber-900 font-bold">
                    Atenção
                  </p>

                  <p className="text-sm text-amber-900 leading-relaxed mt-1">
                    Não retire o número <strong>{codColab}</strong> do
                    final do endereço. Sem ele, o sistema não saberá
                    que o associado chegou por sua indicação.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-200 p-6 sm:p-8 flex flex-col items-center justify-center text-center">
                <p className="font-black text-slate-900 mb-1">
                  Seu QR Code
                </p>

                <p className="text-sm text-slate-500 mb-5">
                  Ele abre seu link exclusivo.
                </p>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <QRCodeSVG
                    ref={qrCodeRef}
                    value={linkVenda}
                    size={190}
                    level="H"
                    marginSize={1}
                    bgColor="#ffffff"
                    fgColor="#0f172a"
                    title={`QR Code do colaborador ${codColab}`}
                  />
                </div>

                <button
                  type="button"
                  onClick={baixarQRCode}
                  className="w-full mt-5 bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-3 rounded-xl transition-colors"
                >
                  Baixar meu QR Code
                </button>

                <p className="text-xs text-slate-500 leading-relaxed mt-3">
                  Antes de imprimir, aponte a câmera do celular para o
                  código e confira se o seu link abre corretamente.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-14">
          <div className="max-w-3xl mb-8">
            <p className="text-sm font-black uppercase tracking-wider text-blue-700">
              Vídeos com sua indicação
            </p>

            <h2 className="text-3xl font-black mt-2">
              Escolha um vídeo e envie seu link
            </h2>

            <p className="text-slate-600 leading-relaxed mt-3">
              Todos os links abaixo já contêm seu número de
              colaborador. Quando a pessoa assistir e clicar em
              Saiba Mais, sua indicação continuará registrada.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {VIDEOS_PROMOCIONAIS.map((video) => {
              const linkVideo = criarLinkVideo(video.slug);
              const foiCopiado = videoCopiado === video.slug;

              return (
                <article
                  key={video.slug}
                  className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col"
                >
                  <div className="bg-gradient-to-br from-blue-800 via-blue-700 to-green-600 text-white p-6">
                    <div className="w-12 h-12 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-2xl">
                      ▶️
                    </div>

                    <p className="text-xs font-black uppercase tracking-wider text-green-200 mt-5">
                      {video.formato}
                    </p>

                    <h3 className="text-xl font-black mt-1">
                      {video.titulo}
                    </h3>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {video.descricao}
                    </p>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mt-5">
                      <p className="text-xs font-bold uppercase text-slate-500">
                        Seu link deste vídeo
                      </p>

                      <p className="text-sm text-blue-800 font-bold break-all mt-1">
                        {linkVideo}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-2 mt-5">
                      <a
                        href={linkVideo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-center bg-slate-900 hover:bg-black text-white font-bold px-4 py-3 rounded-xl transition-colors"
                      >
                        Assistir ao vídeo
                      </a>

                      <button
                        type="button"
                        onClick={() =>
                          compartilharVideoWhatsApp(
                            video.slug,
                            video.titulo
                          )
                        }
                        className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-3 rounded-xl transition-colors"
                      >
                        Enviar pelo WhatsApp
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          copiarLinkVideo(video.slug)
                        }
                        className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 font-bold px-4 py-3 rounded-xl transition-colors"
                      >
                        {foiCopiado
                          ? '✓ Link copiado!'
                          : 'Copiar link do vídeo'}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="max-w-3xl mb-8">
            <p className="text-sm font-black uppercase tracking-wider text-green-700">
              Escolha como divulgar
            </p>

            <h2 className="text-3xl font-black mt-2">
              Materiais disponíveis
            </h2>

            <p className="text-slate-600 leading-relaxed mt-3">
              Você não precisa ser vendedor profissional. Escolha um
              dos materiais abaixo, siga as instruções e compartilhe
              sempre o seu link exclusivo.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <CardMaterial
              numero="1"
              cor="azul"
              titulo="Vídeos para vendas"
              descricao="Vídeos prontos para baixar e publicar no WhatsApp, Instagram, TikTok, Facebook e outras redes sociais."
              instrucao="Baixe um vídeo e envie junto com o seu link de vendas."
              textoBotao="Abrir vídeos"
              link={LINK_VIDEOS}
            />

            <CardMaterial
              numero="2"
              cor="verde"
              titulo="Textos para WhatsApp e e-mail"
              descricao="Mensagens prontas que você pode copiar, personalizar e enviar para seus contatos."
              instrucao={`Antes de enviar, coloque este link na mensagem: ${linkVenda}`}
              textoBotao="Abrir textos"
              link={LINK_TEXTOS}
            />

            <CardMaterial
              numero="3"
              cor="preto"
              titulo="Material impresso"
              descricao="Escolha um panfleto, veja seu QR Code aplicado automaticamente e baixe a arte pronta para imprimir."
              instrucao="O sistema usa seu número de colaborador e prepara o panfleto sem você precisar encaixar o QR Code manualmente."
              textoBotao="Escolher meu panfleto"
              link="/panfletos-promocionais"
              novaAba={false}
              linkSecundario={LINK_MATERIAL_IMPRESSO}
              textoLinkSecundario="Ver arquivos originais no Drive"
            />
          </div>
        </section>

        <section className="bg-white border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div>
                <p className="text-sm font-black uppercase tracking-wider text-blue-700">
                  Passo a passo
                </p>

                <h2 className="text-3xl font-black mt-2">
                  Como começar a divulgar
                </h2>

                <div className="mt-7 space-y-5">
                  <Passo
                    numero="1"
                    titulo="Escolha um material"
                    texto="Você pode usar um vídeo, uma mensagem pronta ou um folheto impresso."
                  />

                  <Passo
                    numero="2"
                    titulo="Copie seu link"
                    texto={`Use sempre o endereço ${linkVenda}.`}
                  />

                  <Passo
                    numero="3"
                    titulo="Envie para seus contatos"
                    texto="Compartilhe pelo WhatsApp, e-mail ou pelas suas redes sociais."
                  />

                  <Passo
                    numero="4"
                    titulo="Confira o número"
                    texto={`Antes de enviar, verifique se o endereço termina com ${codColab}.`}
                  />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-600 to-blue-700 text-white rounded-2xl p-7 sm:p-9 shadow-lg">
                <div className="text-4xl mb-4">🎁</div>

                <p className="text-green-100 font-bold uppercase tracking-wider text-sm">
                  Presente de boas-vindas
                </p>

                <h2 className="text-3xl font-black mt-2">
                  Seus primeiros 100 folhetos gratuitos
                </h2>

                <p className="text-blue-50 leading-relaxed mt-4">
                  Cada colaborador poderá solicitar uma única remessa
                  gratuita com 100 folhetos personalizados, já com seu
                  QR Code de indicação.
                </p>

                <div className="mt-6 bg-white/10 border border-white/20 rounded-xl p-4">
                  <p className="font-bold">
                    Escolha primeiro o seu panfleto
                  </p>

                  <p className="text-sm text-blue-50 mt-1">
                    Depois de escolher a arte, você poderá baixar,
                    imprimir ou preencher seus dados para solicitar
                    a remessa gratuita.
                  </p>
                </div>

                <a
                  href="/panfletos-promocionais"
                  className="block text-center w-full mt-6 bg-white hover:bg-blue-50 text-blue-800 font-black px-5 py-3 rounded-xl transition-colors"
                >
                  Escolher meu panfleto
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14 text-center">
          <h2 className="text-2xl font-black">
            Estamos preparando novos materiais
          </h2>

          <p className="text-slate-600 leading-relaxed mt-3">
            Novos vídeos, textos, campanhas e materiais impressos serão
            adicionados regularmente para apoiar suas indicações.
          </p>

          <p className="text-slate-900 font-bold mt-5">
            A ConsulToque agradece sua parceria e deseja excelentes
            indicações e boas vendas!
          </p>

          <a
            href="/colaborador"
            className="inline-flex mt-7 bg-blue-700 hover:bg-blue-800 text-white font-bold px-6 py-3 rounded-xl transition-colors"
          >
            Voltar para minha área
          </a>
        </section>
      </main>

      <footer className="bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} ConsulToque. Todos os direitos
          reservados.
        </div>
      </footer>
    </div>
  );
}

type CardMaterialProps = {
  numero: string;
  cor: 'azul' | 'verde' | 'preto';
  titulo: string;
  descricao: string;
  instrucao: string;
  textoBotao: string;
  link: string;
  novaAba?: boolean;
  linkSecundario?: string;
  textoLinkSecundario?: string;
};

function CardMaterial({
  numero,
  cor,
  titulo,
  descricao,
  instrucao,
  textoBotao,
  link,
  novaAba = true,
  linkSecundario,
  textoLinkSecundario,
}: CardMaterialProps) {
  const estilos = {
    azul: {
      numero: 'bg-blue-100 text-blue-800',
      botao: 'bg-blue-700 hover:bg-blue-800',
    },
    verde: {
      numero: 'bg-green-100 text-green-800',
      botao: 'bg-green-600 hover:bg-green-700',
    },
    preto: {
      numero: 'bg-slate-200 text-slate-900',
      botao: 'bg-slate-900 hover:bg-black',
    },
  };

  const estilo = estilos[cor];

  return (
    <article className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black ${estilo.numero}`}
      >
        {numero}
      </div>

      <h3 className="text-xl font-black mt-5">
        {titulo}
      </h3>

      <p className="text-slate-600 leading-relaxed mt-3">
        {descricao}
      </p>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-5">
        <p className="text-sm font-bold text-slate-800">
          Como usar:
        </p>

        <p className="text-sm text-slate-600 leading-relaxed mt-1 break-words">
          {instrucao}
        </p>
      </div>

      <a
        href={link}
        target={novaAba ? '_blank' : undefined}
        rel={novaAba ? 'noopener noreferrer' : undefined}
        className={`mt-6 text-center text-white font-bold px-5 py-3 rounded-xl transition-colors ${estilo.botao}`}
      >
        {textoBotao}
      </a>

      {linkSecundario && textoLinkSecundario && (
        <a
          href={linkSecundario}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 text-center text-sm font-bold text-blue-700 hover:text-blue-900 hover:underline"
        >
          {textoLinkSecundario}
        </a>
      )}
    </article>
  );
}

type PassoProps = {
  numero: string;
  titulo: string;
  texto: string;
};

function Passo({
  numero,
  titulo,
  texto,
}: PassoProps) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 w-10 h-10 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-black">
        {numero}
      </div>

      <div>
        <h3 className="font-black text-slate-900">
          {titulo}
        </h3>

        <p className="text-slate-600 leading-relaxed mt-1 break-words">
          {texto}
        </p>
      </div>
    </div>
  );
}