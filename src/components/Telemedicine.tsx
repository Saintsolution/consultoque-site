import { ArrowRight, CheckCircle2 } from 'lucide-react';

export function Telemedicine() {
  return (
    <section className="py-16 bg-gradient-to-br from-blue-600 to-blue-500 text-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
        
        {/* Lado Esquerdo: Mensagem de Venda */}
        <div className="space-y-6">
          <h2 className="text-3xl md:text-4xl font-black leading-tight tracking-tight">
            Você não precisa mais esperar.
          </h2>
          <p className="text-blue-50 text-lg leading-relaxed">
            Com o <strong className="text-white">CONSULTOQUE</strong>, você tem acesso imediato a médicos qualificados. 
            Sem filas, sem burocracia e sem expor sua família a riscos em hospitais. 
            Consultas, receitas e atestados na palma da sua mão.
          </p>

          <div className="space-y-3 pt-4">
            {['Atendimento imediato 24h', 'Médicos qualificados', 'Documentos digitais válidos'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm font-semibold">
                <CheckCircle2 className="w-5 h-5 text-cyan-300" />
                {item}
              </div>
            ))}
          </div>

          <a 
            href="#precos" // Ajuste conforme o ID da sua grade de preços
            className="group mt-8 bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-bold hover:bg-cyan-50 transition-all shadow-lg inline-flex items-center gap-2"
          >
            Conheça os Planos
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* Lado Direito: Imagem com Badge 24h */}
        <div className="relative">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10">
            <img
              src="/mediconocel.png"
              alt="Consulta por telemedicina"
              className="w-full h-full object-cover aspect-[4/3]"
            />
          </div>

          {/* Badge 24h */}
          <div className="absolute -bottom-6 -right-2 md:right-6 bg-white text-slate-900 p-6 rounded-2xl shadow-2xl w-48">
            <p className="text-4xl font-black text-blue-600 mb-1">24h</p>
            <p className="text-xs font-bold text-slate-500 uppercase">Disponível todos os dias</p>
          </div>
        </div>
      </div>
    </section>
  );
}