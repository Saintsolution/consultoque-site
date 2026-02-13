import { AlertCircle, Clock, Users, TrendingUp } from 'lucide-react';

const stats = [
  {
    icon: Clock,
    value: '4-6 horas',
    label: 'Tempo médio de espera em pronto-socorro',
    color: 'from-red-500 to-orange-500',
  },
  {
    icon: Users,
    value: '80%',
    label: 'Das consultas no SUS podem ser resolvidas online',
    color: 'from-orange-500 to-yellow-500',
  },
  {
    icon: AlertCircle,
    value: '3-6 meses',
    label: 'Espera para consulta com especialista no SUS',
    color: 'from-yellow-500 to-red-500',
  },
  {
    icon: TrendingUp,
    value: '75%',
    label: 'Das consultas por telemedicina são resolvidas com sucesso',
    color: 'from-red-600 to-red-500',
  },
];

export function Problem() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            A realidade do sistema público de saúde
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Milhões de brasileiros enfrentam dificuldades diárias para ter acesso a atendimento médico
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow duration-300"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${stat.color} rounded-full mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Você não precisa mais esperar
          </h3>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Com o <span className="font-semibold text-blue-600">CONSULTOQUE</span>, você tem acesso imediato a médicos qualificados,
            sem filas, sem espera, sem burocracia. Consultas por vídeo, receitas digitais e atestados válidos em minutos, e Não expõe seus familiares ao risco de infeções nos Hospitais Públicos.
          </p>
        </div>
      </div>
    </section>
  );
}
