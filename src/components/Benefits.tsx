import { CheckCircle2, HeartPulse, UserCircle, Target } from 'lucide-react';

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

        {/* ESPECIALIDADES MÉDICAS */}
        <div className="bg-slate-50 p-8 rounded-3xl border border-gray-100">
          <h2 className="text-xl font-black text-gray-900 mb-6 uppercase">Consultas Médicas 24h</h2>
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
          <h3 className="font-black text-lg text-gray-900 mb-4 uppercase">Programas de Terapias e Bem-Estar</h3>
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