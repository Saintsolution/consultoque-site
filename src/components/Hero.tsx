export function Hero() {
  return (
    <section className="relative w-full bg-gradient-to-br from-blue-500 via-blue-400 to-cyan-400 text-white overflow-hidden">

      <div className="w-full px-6 pt-20 pb-32 text-center">

        <p className="text-2xl md:text-4xl lg:text-5xl font-extrabold leading-tight max-w-5xl mx-auto mb-6 text-blue-50">
          Consultas médicas a qualquer hora,<br className="hidden md:block" />
          em qualquer lugar
        </p>

        <p className="text-lg md:text-2xl lg:text-3xl font-medium max-w-4xl mx-auto text-blue-100/95 leading-relaxed mb-14">
          Atendimento 24 horas por dia, 7 dias por semana<br className="hidden md:block" />
          + 250 parceiros com descontos exclusivos
        </p>

        {/* CTA */}
        <div className="flex justify-center">
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
            "
          >
            <span className="text-xs md:text-sm font-bold tracking-[0.25em] uppercase">
              ASSOCIE-SE
            </span>
            <span className="text-3xl md:text-4xl font-black my-1">
              R$ 33,00
            </span>
            <span className="text-xs md:text-sm font-bold uppercase opacity-90">
              por mês
            </span>
          </a>
        </div>

        <p className="mt-10 text-sm md:text-base text-blue-50/80 font-semibold tracking-wide">
          Sem carência • Sem taxa de adesão • Cancele quando quiser
        </p>

      </div>

      {/* Onda */}
      <div className="absolute bottom-0 left-0 right-0 leading-[0]">
        <svg
          viewBox="0 0 1440 120"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-24 lg:h-44"
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
