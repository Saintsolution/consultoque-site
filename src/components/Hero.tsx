


const FORMULARIO_PESSOAL =
  'https://coletivo.consultoque.com.br/formpessoal';

function obterCodigoIndicador() {
  const armazenado =
    localStorage.getItem(
      'referenciador_id'
    );

  const numeros =
    String(armazenado ?? '')
      .replace(/\D/g, '');

  if (
    numeros.length < 1 ||
    numeros.length > 4
  ) {
    return '0001';
  }

  return numeros.padStart(
    4,
    '0'
  );
}

function criarLinkFormulario() {
  const indicador =
    obterCodigoIndicador();

  return (
    `${FORMULARIO_PESSOAL}` +
    `?ref=${encodeURIComponent(indicador)}`
  );
}

export function Hero() {
  const linkFormulario =
    criarLinkFormulario();

  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden bg-gradient-to-br from-blue-500 via-blue-400 to-cyan-400 text-white"
    >
      <div className="w-full px-6 pb-32 pt-20 text-center">
        <p className="mx-auto mb-6 max-w-5xl text-3xl font-extrabold leading-tight text-blue-50 md:text-5xl lg:text-7xl">
          CONSULTA <br className="hidden md:block" />
          por R$ 33,00
        </p>

        <p className="mx-auto mb-14 max-w-4xl text-lg font-medium leading-relaxed text-blue-100/95 md:text-2xl lg:text-3xl">
          Teleconsulta: Saúde na palma da sua mão, sem esperas.
          <br />
          Consultas 24 horas, 7 dias por semana, inclusive feriados.
          <br />
          Sem carência e sem limite de idade.
        </p>

        <div className="mx-auto flex max-w-2xl flex-col justify-center gap-6 md:flex-row">
          <a
            href={linkFormulario}
            className="flex flex-col items-center justify-center rounded-3xl border-b-4 border-green-700 bg-[#22C55E] px-8 py-4 text-white shadow-[0_10px_20px_rgba(0,0,0,0.2)] transition-all hover:scale-105 hover:bg-[#16a34a]"
          >
            <span className="text-xs font-bold uppercase tracking-widest">
              Plano Individual
            </span>

            <span className="mt-1 text-sm font-black uppercase">
              1 titular
            </span>

            <span className="my-1 text-3xl font-black">
              R$ 33,00
            </span>

            <span className="text-xs font-bold uppercase opacity-90">
              por mês
            </span>
          </a>

          <a
            href={linkFormulario}
            className="flex flex-col items-center justify-center rounded-3xl border-b-4 border-gray-200 bg-white px-8 py-4 text-[#22C55E] shadow-[0_10px_20px_rgba(0,0,0,0.2)] transition-all hover:scale-105 hover:bg-gray-100"
          >
            <span className="text-xs font-bold uppercase tracking-widest">
              Plano Familiar
            </span>

            <span className="mt-1 text-sm font-black uppercase">
              1 titular + 3 dependentes
            </span>

            <span className="my-1 text-3xl font-black">
              R$ 66,00
            </span>

            <span className="text-xs font-bold uppercase opacity-90">
              por mês
            </span>
          </a>
        </div>

        <p className="mt-10 text-sm font-semibold tracking-wide text-blue-50/80 md:text-base">
          Sem carência • Sem taxa de adesão • Cancele quando quiser
        </p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 leading-[0]">
        <svg
          viewBox="0 0 1440 120"
          xmlns="http://www.w3.org/2000/svg"
          className="h-24 w-full lg:h-44"
          preserveAspectRatio="none"
        >
          <path
            d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H0V0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}