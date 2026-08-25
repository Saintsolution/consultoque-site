import { CheckCircle2, HeartPulse, UserCircle, Target, Clock, Calendar } from 'lucide-react';

export function Benefits() {
  const especialidadesMedicas = [
    'Cardiologia', 'Dermatologia', 'Endocrinologia', 'Gastroenterologia', 
    'Geriatria', 'Ginecologia', 'Medicina da Família', 'Oftalmologia', 
    'Ortopedia', 'Otorrinolaringologia', 'Pediatria', 'Psiquiatria'
  ];

  return (
    <section id="benefits" className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4 space-y-16">
        
        {/* VÍDEO WISTIA */}
        <div className="aspect-video w-full max-w-4xl mx-auto bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
          <iframe
            src="https://fast.wistia.net/embed/iframe/6a7aa410u4?videoFoam=true"
            title="Vídeo de Apresentação ConsulToque"
            allow="autoplay; fullscreen"
            className="w-full h-full"
          ></iframe>
        </div>

        {/* TEXTO EXPLICATIVO GERAL */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl font-black text-gray-900 uppercase">Atendimento Sob Medida</h2>
          <p className="text-base text-gray-600 leading-relaxed">
            Consultas 24 horas com clínico geral, além de especialistas e programas de bem-estar com agendamento.
          </p>
          <div className="flex flex-wrap justify-center gap-6 pt-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <span className="flex items-center gap-1.5 text-emerald-600">
              <Clock className="w-4 h-4" /> Clínico Geral 24h
            </span>
            <span className="flex items-center gap-1.5 text-blue-600">
              <Calendar className="w-4 h-4" /> Especialistas com Agendamento
            </span>
          </div>
        </div>

        {/* ESPECIALIDADES MÉDICAS */}
        <div className="bg-slate-50 p-8 rounded-3xl border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <h3 className="text-xl font-black text-gray-900 uppercase">Especialidades Médicas</h3>
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-blue-700 bg-blue-50 px-3 py-1 rounded-full w-fit">
              <Calendar className="w-3.5 h-3.5" /> Com Agendamento
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm font-bold text-gray-700">
            {especialidadesMedicas.map((esp) => (
              <div key={esp} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
                {esp}
              </div>
            ))}
          </div>
        </div>

        {/* BENEFÍCIOS ADICIONAIS (O texto de venda) */}
        <div className="bg-white border-2 border-slate-100 p-8 rounded-3xl shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <h3 className="font-black text-lg text-gray-900 uppercase">Programas de Terapias e Bem-Estar</h3>
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-blue-700 bg-blue-50 px-3 py-1 rounded-full w-fit">
              <Calendar className="w-3.5 h-3.5" /> Com Agendamento
            </span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            Mantenha sua rotina em dia com o direito de agendar <strong>uma consulta mensal</strong> para cada pilar essencial da sua saúde: <strong>Psicologia, Nutrição e Personal Trainer</strong>.
          </p>
          <div className="flex gap-4 text-blue-600">
            <HeartPulse className="w-6 h-6" />
            <UserCircle className="w-6 h-6" />
            <Target className="w-6 h-6" />
          </div>
        </div>

      </div>
    </section>
  );
}