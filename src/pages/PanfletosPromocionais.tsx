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

function criarTitulo(caminho: string) {
  const nomeArquivo =
    caminho
      .split('/')
      .pop()
      ?.replace(/\.(png|jpg|jpeg|webp)$/i, '') || '';

  return nomeArquivo
    .replace(/^folder_/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letra) => letra.toUpperCase());
}

function criarId(caminho: string) {
  return (
    caminho
      .split('/')
      .pop()
      ?.replace(/\.(png|jpg|jpeg|webp)$/i, '') || ''
  );
}

const panfletos: Panfleto[] = Object.entries(arquivos)
  .map(([caminho, imagem]) => ({
    id: criarId(caminho),
    titulo: criarTitulo(caminho),
    imagem,
  }))
  .sort((a, b) =>
    a.titulo.localeCompare(b.titulo, 'pt-BR')
  );

export function PanfletosPromocionais() {
  const codColab = String(
    localStorage.getItem('cod_colab') || ''
  )
    .replace(/\D/g, '')
    .padStart(4, '0');

  const nomeColab =
    localStorage.getItem('nome_colab') || 'colaborador';

  if (!localStorage.getItem('cod_colab')) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-blue-100 flex items-center justify-center text-3xl">
            🔒
          </div>

          <h1 className="text-2xl font-black text-slate-900">
            Faça login para continuar
          </h1>

          <p className="text-slate-600 leading-relaxed mt-3">
            Para escolher um panfleto personalizado, primeiro entre
            na sua Área do Colaborador.
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
              Panfletos personalizados
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="/material-promocional"
              className="text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg"
            >
              ← Voltar ao material promocional
            </a>

            <a
              href="/colaborador"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-2"
            >
              Minha área
            </a>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-br from-blue-800 via-blue-700 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
          <p className="text-green-200 font-bold uppercase tracking-wider text-sm">
            Material impresso
          </p>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mt-3">
            Escolha seu panfleto
          </h1>

          <p className="max-w-3xl text-blue-50 text-lg leading-relaxed mt-5">
            Olá, <strong>{nomeColab}</strong>! Escolha uma das artes
            abaixo. O sistema colocará automaticamente o QR Code com
            o seu link de indicação.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white border border-blue-200 rounded-2xl p-5 sm:p-6 mb-10 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase text-blue-700">
                Sua identificação
              </p>

              <p className="text-slate-600 mt-1">
                O QR Code será criado para o colaborador:
                <strong className="text-slate-900">
                  {' '}
                  {codColab}
                </strong>
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 text-green-800 font-bold px-4 py-3 rounded-xl break-all">
              https://consultoque.com.br/{codColab}
            </div>
          </div>
        </div>

        {panfletos.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
            <div className="text-5xl mb-4">🖼️</div>

            <h2 className="text-2xl font-black">
              Nenhum panfleto encontrado
            </h2>

            <p className="text-slate-600 mt-3">
              Coloque pelo menos uma imagem com o nome iniciado por
              <strong> folder_</strong> na pasta:
            </p>

            <code className="inline-block mt-4 bg-slate-100 text-slate-800 px-4 py-2 rounded-lg">
              src/assets/panfletos
            </code>
          </div>
        ) : (
          <>
            <div className="mb-7">
              <p className="text-sm font-bold text-green-700 uppercase">
                {panfletos.length}{' '}
                {panfletos.length === 1
                  ? 'modelo disponível'
                  : 'modelos disponíveis'}
              </p>

              <h2 className="text-3xl font-black mt-2">
                Modelos de panfleto
              </h2>

              <p className="text-slate-600 mt-2">
                Clique na arte desejada para visualizar seu QR Code
                aplicado antes de baixar ou solicitar a impressão.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {panfletos.map((panfleto) => (
                <article
                  key={panfleto.id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  <div className="bg-slate-100 p-4">
                    <div className="aspect-[1187/1671] rounded-xl overflow-hidden bg-white shadow-sm">
                      <img
                        src={panfleto.imagem}
                        alt={panfleto.titulo}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="text-xs font-black text-green-700 uppercase">
                      Panfleto ConsulToque
                    </p>

                    <h3 className="text-xl font-black mt-2">
                      {panfleto.titulo}
                    </h3>

                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      Personalize esta arte com seu QR Code de
                      indicação.
                    </p>

                    <a
                      href={`/montar-folder?modelo=${encodeURIComponent(
                        panfleto.id
                      )}`}
                      className="block text-center mt-5 bg-blue-700 hover:bg-blue-800 text-white font-bold px-5 py-3 rounded-xl"
                    >
                      Visualizar e personalizar
                    </a>

                    <a
                      href={`/solicitar-impressos?modelo=${encodeURIComponent(
                        panfleto.id
                      )}`}
                      className="block text-center mt-3 bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-3 rounded-xl"
                    >
                      Pedir 100 impressos
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        <div className="mt-12 bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h2 className="text-xl font-black text-amber-950">
            Antes de imprimir
          </h2>

          <p className="text-amber-900 leading-relaxed mt-2">
            Depois de personalizar o panfleto, teste o QR Code com a
            câmera do celular. Confira se ele abre o site da
            ConsulToque com o número <strong>{codColab}</strong> no
            final do endereço.
          </p>
        </div>
      </main>

      <footer className="bg-slate-950 text-white mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} ConsulToque. Todos os direitos
          reservados.
        </div>
      </footer>
    </div>
  );
}