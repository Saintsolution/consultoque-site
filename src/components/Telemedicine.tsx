import { Video, FileText, Stethoscope, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: Video,
    title: 'Consulta por Vídeo',
    description: 'Atendimento médico por videochamada, no conforto da sua casa',
  },
  {
    icon: Stethoscope,
    title: 'Diagnósticos Rápidos',
    description: 'Médicos generalistas e clínicos gerais para diagnósticos leves e orientações',
  },
  {
    icon: FileText,
    title: 'Receitas e Atestados',
    description: 'Documentos médicos digitais válidos em todo território nacional',
  },
];

export function Telemedicine() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-500 to-cyan-400 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAgNGgtMnYyaDJ2LTJ6bTQtNHYyaDJ2LTJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-6">
              Telemedicina 24/7/365
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Atendimento médico quando você precisar
            </h2>
            <p className="text-xl text-blue-50 mb-8">
              Sem filas, sem espera, sem sair de casa. Consulte com médicos generalistas, clínicos gerais
              e médicos de família a qualquer hora do dia ou da noite.
            </p>

            <div className="space-y-4 mb-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="flex items-start gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                      <p className="text-blue-50 text-sm">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <button className="group bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-50 transition-all duration-300 shadow-xl inline-flex items-center gap-2">
              Começar Agora
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/mediconocel.png"
                alt="Médica sorridente em consulta por telemedicina"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent"></div>
            </div>

            <div className="absolute -bottom-6 -right-6 bg-white text-gray-900 p-6 rounded-2xl shadow-2xl max-w-xs">
              <p className="text-4xl font-bold text-blue-600 mb-1">24h</p>
              <p className="text-sm text-gray-600">Atendimento disponível todos os dias</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
