import { Check } from 'lucide-react';

const FORMULARIO_PESSOAL =
  'https://coletivo.consultoque.com.br/formpessoal';

const features = [
  'Telemedicina 24 horas, 7 dias por semana',
  'Atendimento com 11 especialidades médicas',
  'Receitas e atestados médicos válidos',
  'Clube de vantagens com 250+ parceiros',
  'Descontos em farmácias, óticas e muito mais',
  'Sem carência, sem taxa de adesão',
  'Cancele quando quiser',
];

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

export function CTA() {
  const linkFormulario =
    criarLinkFormulario();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-400 to-cyan-400 py-16 text-white">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAgNGgtMnYyaDJ2LTJ6bTQtNHYyaDJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-black uppercase italic leading-tight tracking-tighter text-white md:text-4xl">
            Comece a cuidar da sua saúde hoje mesmo
          </h2>
        </div>

        <div className="mx-auto mb-10 max-w-xl rounded-[2rem] border border-white/20 bg-white/10 p-6 backdrop-blur-sm md:p-10">
          <h3 className="mb-6 text-center text-xl font-bold uppercase tracking-tight">
            Você terá acesso a:
          </h3>

          <div className="mx-auto grid max-w-sm gap-4 md:grid-cols-1">
            {features.map(
              (feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-cyan-400 shadow-md">
                    <Check className="h-3.5 w-3.5 text-white" />
                  </div>

                  <p className="text-base font-medium text-white">
                    {feature}
                  </p>
                </div>
              )
            )}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-center">
          <a
            href={linkFormulario}
            className="mb-6 flex flex-col items-center justify-center rounded-full border-b-4 border-green-700 bg-[#22C55E] px-12 py-4 text-white shadow-[0_14px_30px_rgba(0,0,0,0.3)] transition-all duration-300 hover:scale-105 hover:bg-[#16a34a] active:scale-95 md:px-16 md:py-5"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] md:text-sm">
              Escolher meu plano
            </span>

            <span className="my-1 text-2xl font-black md:text-4xl">
              A partir de R$ 33,00
            </span>

            <span className="text-[10px] font-bold uppercase opacity-90 md:text-sm">
              por mês
            </span>
          </a>

          <p className="text-sm font-medium text-blue-50">
            Pagamento seguro • Ativação após o pagamento • Sem carência
          </p>
        </div>
      </div>
    </section>
  );
}