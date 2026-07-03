import { AlertCircle, Clock, Users, TrendingUp } from 'lucide-react';

const stats = [
  { icon: Clock, value: '4-6h', label: 'de espera no pronto-socorro' },
  { icon: Users, value: '80%', label: 'de casos resolvidos online' },
  { icon: AlertCircle, value: '3-6m', label: 'esperando especialistas' },
  { icon: TrendingUp, value: '75%', label: 'de eficácia na telemedicina' },
];

export function Problem() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Chamada de Dor */}
        <div className="text-center mb-12">
          <span className="text-blue-600 font-black tracking-widest uppercase text-xs mb-2 block">O Cenário Atual</span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">
            A realidade do sistema de saúde
          </h2>
          <p className="text-slate-600 text-sm max-w-xl mx-auto">
            Milhões de brasileiros enfrentam diariamente o caos do atendimento presencial. 
            O tempo perdido é apenas o início do problema.
          </p>
        </div>

        {/* Estatísticas Enxutas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all"
              >
                <Icon className="w-6 h-6 text-blue-600 mb-3" />
                <p className="text-2xl font-black text-slate-900 mb-1">
                  {stat.value}
                </p>
                <p className="text-[11px] font-bold text-slate-500 uppercase leading-tight">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}