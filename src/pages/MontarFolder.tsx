import {
  useEffect,
  useRef,
  useState,
} from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const LARGURA_FOLDER = 1187;
const ALTURA_FOLDER = 1671;

const QR_X = 827;
const QR_Y = 1317;
const QR_TAMANHO = 260;

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
  const nomeArquivo = criarId(caminho);

  return nomeArquivo
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

  return String(value)
    .replace(/\D/g, '')
    .padStart(4, '0');
}

export function MontarFolder() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [pronto, setPronto] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const modeloId = params.get('modelo') || '';

  const panfleto = panfletos.find(
    (item) => item.id === modeloId
  );

  const codColab = formatCod(
    localStorage.getItem('cod_colab')
  );

  const linkVenda = codColab
    ? `https://consultoque.com.br/${codColab}`
    : '';

  function desenharPanfleto() {
    if (!panfleto) {
      setErro('O modelo de panfleto não foi encontrado.');
      setCarregando(false);
      return;
    }

    const canvas = canvasRef.current;
    const qrCanvas = qrCanvasRef.current;

    if (!canvas || !qrCanvas) return;

    const contexto = canvas.getContext('2d');

    if (!contexto) {
      setErro('Não foi possível preparar a imagem.');
      setCarregando(false);
      return;
    }

    setCarregando(true);
    setErro('');
    setPronto(false);

    const imagemBase = new Image();

    imagemBase.onload = () => {
      canvas.width = LARGURA_FOLDER;
      canvas.height = ALTURA_FOLDER;

      contexto.clearRect(
        0,
        0,
        LARGURA_FOLDER,
        ALTURA_FOLDER
      );

      contexto.drawImage(
        imagemBase,
        0,
        0,
        LARGURA_FOLDER,
        ALTURA_FOLDER
      );

      contexto.fillStyle = '#ffffff';

      contexto.fillRect(
        QR_X,
        QR_Y,
        QR_TAMANHO,
        QR_TAMANHO
      );

      contexto.drawImage(
        qrCanvas,
        QR_X,
        QR_Y,
        QR_TAMANHO,
        QR_TAMANHO
      );

      setCarregando(false);
      setPronto(true);
    };

    imagemBase.onerror = () => {
      setErro('Não foi possível carregar o panfleto.');
      setCarregando(false);
    };

    imagemBase.src = panfleto.imagem;
  }

  useEffect(() => {
    if (!panfleto || !linkVenda) return;

    const timer = window.setTimeout(() => {
      desenharPanfleto();
    }, 150);

    return () => window.clearTimeout(timer);
  }, [modeloId, linkVenda]);

  function baixarPanfleto() {
    const canvas = canvasRef.current;

    if (!canvas || !panfleto || !pronto) return;

    const url = canvas.toDataURL('image/png', 1);
    const link = document.createElement('a');

    link.href = url;
    link.download =
      `${panfleto.id}_${codColab}.png`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function imprimirPanfleto() {
    const canvas = canvasRef.current;

    if (!canvas || !pronto) return;

    const imagem = canvas.toDataURL('image/png', 1);
    const janela = window.open('', '_blank');

    if (!janela) {
      alert(
        'O navegador bloqueou a janela de impressão. Permita janelas pop-up e tente novamente.'
      );
      return;
    }

    janela.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <title>Imprimir panfleto ConsulToque</title>

          <style>
            @page {
              size: A4 portrait;
              margin: 0;
            }

            * {
              box-sizing: border-box;
            }

            html,
            body {
              width: 210mm;
              min-height: 297mm;
              margin: 0;
              padding: 0;
              background: white;
            }

            img {
              display: block;
              width: 210mm;
              height: 297mm;
              object-fit: fill;
            }
          </style>
        </head>

        <body>
          <img
            src="${imagem}"
            alt="Panfleto ConsulToque"
            onload="window.print();"
          />
        </body>
      </html>
    `);

    janela.document.close();
  }

  function solicitarImpressos() {
    const canvas = canvasRef.current;

    if (!canvas || !panfleto || !pronto) {
      alert(
        'Aguarde o panfleto ficar pronto antes de solicitar a impressão.'
      );
      return;
    }

    try {
      const artePersonalizada = canvas.toDataURL(
        'image/png',
        1
      );

      sessionStorage.setItem(
        'arte_personalizada',
        artePersonalizada
      );

      sessionStorage.setItem(
        'arte_modelo',
        panfleto.id
      );

      window.location.href =
        `/solicitar-impressos?modelo=${encodeURIComponent(
          panfleto.id
        )}`;
    } catch (error) {
      console.error(error);

      alert(
        'Não foi possível preparar a arte para o pedido. Gere o panfleto novamente e tente outra vez.'
      );
    }
  }

  if (!codColab) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl p-8 text-center">
          <div className="text-5xl mb-4">🔒</div>

          <h1 className="text-2xl font-black">
            Faça login para continuar
          </h1>

          <p className="text-slate-600 mt-3">
            Entre na Área do Colaborador para gerar seu
            panfleto personalizado.
          </p>

          <a
            href="/colaborador"
            className="inline-flex mt-6 bg-blue-700 hover:bg-blue-800 text-white font-bold px-6 py-3 rounded-xl"
          >
            Ir para o login
          </a>
        </div>
      </div>
    );
  }

  if (!panfleto) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl p-8 text-center">
          <div className="text-5xl mb-4">🖼️</div>

          <h1 className="text-2xl font-black">
            Panfleto não encontrado
          </h1>

          <p className="text-slate-600 mt-3">
            Volte ao catálogo e escolha uma das artes
            disponíveis.
          </p>

          <a
            href="/panfletos-promocionais"
            className="inline-flex mt-6 bg-blue-700 hover:bg-blue-800 text-white font-bold px-6 py-3 rounded-xl"
          >
            Escolher outro panfleto
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div
        aria-hidden="true"
        className="fixed -left-[9999px] top-0"
      >
        <QRCodeCanvas
          ref={qrCanvasRef}
          value={linkVenda}
          size={520}
          level="H"
          marginSize={2}
          bgColor="#ffffff"
          fgColor="#000000"
        />
      </div>

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
              Montagem do panfleto
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
            Panfleto personalizado
          </p>

          <h1 className="text-3xl sm:text-4xl font-black mt-3">
            {panfleto.titulo}
          </h1>

          <p className="max-w-3xl text-blue-50 text-lg leading-relaxed mt-4">
            Seu QR Code será colocado automaticamente no
            espaço reservado da arte.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-8 items-start">
          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <p className="text-sm font-black uppercase text-blue-700">
                  Prévia
                </p>

                <h2 className="text-2xl font-black mt-1">
                  Seu panfleto pronto
                </h2>
              </div>

              {pronto && (
                <span className="bg-green-100 text-green-800 text-sm font-bold px-3 py-2 rounded-full">
                  ✓ Personalizado
                </span>
              )}
            </div>

            {carregando && (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 font-bold rounded-xl p-4 mb-5">
                Preparando seu panfleto...
              </div>
            )}

            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-700 font-bold rounded-xl p-4 mb-5">
                {erro}
              </div>
            )}

            <div className="max-w-xl mx-auto bg-slate-100 rounded-xl p-2 sm:p-4">
              <canvas
                ref={canvasRef}
                className="block w-full h-auto bg-white shadow-lg"
              />
            </div>
          </section>

          <aside className="space-y-6 lg:sticky lg:top-5">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
              <p className="text-sm font-black uppercase text-green-700">
                Sua identificação
              </p>

              <p className="text-3xl font-black text-slate-900 mt-2">
                {codColab}
              </p>

              <p className="text-sm text-slate-600 break-all mt-2">
                {linkVenda}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-black">
                O que deseja fazer?
              </h2>

              <button
                type="button"
                onClick={baixarPanfleto}
                disabled={!pronto}
                className="w-full mt-5 bg-blue-700 hover:bg-blue-800 text-white font-bold px-5 py-3 rounded-xl disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                Baixar panfleto
              </button>

              <button
                type="button"
                onClick={imprimirPanfleto}
                disabled={!pronto}
                className="w-full mt-3 bg-slate-900 hover:bg-black text-white font-bold px-5 py-3 rounded-xl disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                Imprimir agora
              </button>

              <button
                type="button"
                onClick={solicitarImpressos}
                disabled={!pronto}
                className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-3 rounded-xl disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                Pedir 100 impressos
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <h2 className="font-black text-amber-950">
                Confira antes de usar
              </h2>

              <p className="text-sm text-amber-900 leading-relaxed mt-2">
                Aponte a câmera do celular para o QR Code da
                prévia. Confira se o endereço aberto termina
                com o número <strong>{codColab}</strong>.
              </p>

              <button
                type="button"
                onClick={desenharPanfleto}
                className="text-sm font-bold text-amber-950 underline mt-4"
              >
                Gerar novamente
              </button>
            </div>
          </aside>
        </div>
      </main>

      <footer className="bg-slate-950 text-white mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} ConsulToque.
          Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}