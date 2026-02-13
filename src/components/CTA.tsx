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
    <section className="relative overflow-hidden py-20 bg-gradient-to-br from-blue-500 via-blue-400 to-cyan-400 text-white">
      
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAgNGgtMnYyaDJ2LTJ6bTQtNHYyaDJ2LTJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Título e preço */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Comece a cuidar da sua saúde hoje mesmo
          </h2>

          <p className="text-xl md:text-2xl text-blue-100 mb-3">
            Tudo que você precisa por apenas
          </p>

          {/* PREÇO – CAIXA AMARELA */}
          <div className="inline-block bg-amber-400 border-2 border-amber-300 px-10 py-5 rounded-2xl mb-6 shadow-xl">
            <p className="text-5xl md:text-6xl font-black text-white leading-none">
              R$ 33,00
            </p>
            <p className="text-lg font-semibold text-white/90">
              por mês
            </p>
          </div>
        </div>

        {/* Benefícios */}
        <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-8 mb-10">
          <h3 className="text-2xl font-bold mb-6 text-center">
            Você terá acesso a:
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center mt-0.5">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <p className="text-blue-50">{feature}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Botão */}
        <div className="text-center">
          <a
            href="https://pay.hotmart.com/Y103466160C"
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex flex-col items-center justify-center
              bg-[#22C55E] hover:bg-[#16a34a]
              text-white
              px-14 py-6 md:px-20 md:py-7
              rounded-full
              shadow-[0_18px_40px_rgba(0,0,0,0.35)]
              transition-all duration-300
              transform hover:scale-105 active:scale-95
              border-b-4 border-green-700
              text-xl md:text-2xl font-black
              mb-6
            "
          >
            Associe-se já
          </a>

          <p className="text-blue-100">
            Pagamento seguro • Ativação imediata • Garantia de 7 dias
          </p>
        </div>

      </div>
    </section>
  );
}
