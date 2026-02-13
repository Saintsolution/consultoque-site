import { Heart, Scan, Activity, Pill, Users, Baby, Eye, Bone, Wind, Brain, Stethoscope } from 'lucide-react';

const specialties = [
  { icon: Heart, name: 'Cardiologia', description: 'Cuidados com o coração' },
  { icon: Scan, name: 'Dermatologia', description: 'Saúde da pele' },
  { icon: Activity, name: 'Endocrinologia', description: 'Hormônios e metabolismo' },
  { icon: Pill, name: 'Gastroenterologia', description: 'Sistema digestivo' },
  { icon: Users, name: 'Geriatria', description: 'Saúde do idoso' },
  { icon: Stethoscope, name: 'Ginecologia', description: 'Saúde da mulher' },
  { icon: Eye, name: 'Oftalmologia', description: 'Cuidados com a visão' },
  { icon: Bone, name: 'Ortopedia', description: 'Ossos e articulações' },
  { icon: Wind, name: 'Otorrinolaringologia', description: 'Ouvido, nariz e garganta' },
  { icon: Baby, name: 'Pediatria', description: 'Saúde infantil' },
  { icon: Brain, name: 'Psiquiatria', description: 'Saúde mental' },
];

export function Specialties() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            11 Especialidades Médicas Disponíveis
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-2">
            Atendimento com especialistas em horário comercial
          </p>
          <p className="text-gray-500">
            Após o atendimento inicial com clínico geral, você pode ser direcionado para especialistas
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
          {specialties.map((specialty, index) => {
            const Icon = specialty.icon;
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 p-6 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                    {specialty.name}
                  </h3>
                  <p className="text-xs text-gray-600">{specialty.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Encaminhamento Inteligente
          </h3>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Nossos médicos generalistas avaliam seu caso e, quando necessário, fazem o encaminhamento
            para o especialista mais adequado, otimizando seu tratamento.
          </p>
        </div>
      </div>
    </section>
  );
}
