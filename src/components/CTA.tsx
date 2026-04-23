import { Check } from 'lucide-react';

const features = [
  'Telemedicina 24 horas, 7 dias por semana',
  'Atendimento com 11 especialidades médicas',
  'Receitas e atestados médicos válidos',
  'Clube de vantagens com 250+ parceiros',
  'Descontos em farmácias, óticas e muito mais',
  'Sem carência, sem taxa de adesão',
  'Cancele quando quiser',
];

export function CTA() {
  return (
    <section className="relative overflow-hidden py-16 bg-gradient-to-br from-blue-500 via-blue-400 to-cyan-400 text-white">
      
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAgNGgtMnYyaDJ2LTJ6bTQtNHYyaDJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Título Reduzido */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter text-white leading-tight">
            Comece a cuidar da sua saúde hoje mesmo
          </h2>
        </div>

        {/* Benefícios */}
        <div className="max-w-xl mx-auto bg-white/10 backdrop-blur-sm border border-white/20 rounded-[2rem] p-6 md:p-10 mb-10">
          <h3 className="text-xl font-bold mb-6 text-center uppercase tracking-tight">
            Você terá acesso a:
          </h3>

          <div className="grid md:grid-cols-1 gap-4 max-w-sm mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 bg-cyan-400 rounded-full flex items-center justify-center shadow-md">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
                <p className="text-white font-medium text-base">{feature}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Botão com Tamanho Identico ao Hero */}
        <div className="flex flex-col items-center justify-center text-center">
          <a
            href="https://pay.hotmart.com/Y103466160C"
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex flex-col items-center justify-center
              bg-[#22C55E] hover:bg-[#16a34a]
              text-white
              px-12 py-4 md:px-16 md:py-5
              rounded-full
              shadow-[0_14px_30px_rgba(0,0,0,0.3)]
              transition-all duration-300
              transform hover:scale-105 active:scale-95
              border-b-4 border-green-700
              mb-6
            "
          >
            <span className="text-[10px] md:text-sm font-bold tracking-[0.25em] uppercase">
              Consultar AGORA
            </span>
            <span className="text-2xl md:text-4xl font-black my-1">
              R$ 33,00
            </span>
            <span className="text-[10px] md:text-sm font-bold uppercase opacity-90">
              mensais
            </span>
          </a>

          <p className="text-blue-50 text-sm font-medium">
            Pagamento seguro • Ativação imediata • Sem carência
          </p>
        </div>

      </div>
    </section>
  );
}