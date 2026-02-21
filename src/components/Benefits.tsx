import { useState } from 'react';
import { Clock, Shield, Heart, CreditCard, Play } from 'lucide-react';

const benefits = [
  {
    icon: Clock,
    title: 'Atendimento 24/7',
    description: 'Médicos disponíveis todos os dias, a qualquer hora, incluindo feriados',
  },
  {
    icon: Heart,
    title: '11 Especialidades',
    description: 'Acesso a cardiologistas, dermatologistas, pediatras e mais especialistas',
  },
  {
    icon: Shield,
    title: 'Receitas e Atestados',
    description: 'Emissão de receitas médicas e atestados válidos em todo Brasil',
  },
  {
    icon: CreditCard,
    title: '250+ Descontos',
    description: 'Clube de vantagens com descontos em farmácias, óticas e muito mais',
  },
];

export function Benefits() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* VÍDEO DE VENDA COM CAPA CUSTOMIZADA */}
        <div className="mb-20">
          <div className="max-w-5xl mx-auto overflow-hidden rounded-3xl shadow-2xl border-4 border-white bg-black relative group">
            
            <div className="aspect-video w-full">
              <iframe
                src={`https://fast.wistia.net/embed/iframe/6a7aa410u4?videoFoam=true&autoPlay=${isPlaying}&muted=false&controlsVisibleOnLoad=false&playbar=false&fullscreenButton=true`}
                title="Vídeo de Apresentação ConsulToque"
                allow="autoplay; fullscreen"
                frameBorder="0"
                className="w-full h-full"
              ></iframe>
            </div>

            {/* OVERLAY DO BOTÃO CUSTOMIZADO - SOME QUANDO DÁ PLAY */}
            {!isPlaying && (
              <div 
                className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer group-hover:bg-black/50 transition-colors"
                onClick={() => setIsPlaying(true)}
              >
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-black text-xl md:text-2xl shadow-2xl transform hover:scale-110 transition-all flex items-center gap-3 border-2 border-white/50">
                  <Play fill="white" size={32} />
                  CONHEÇA A CONSULTOQUE
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Tudo que você precisa em um só lugar
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Cuide da sua saúde e economize com benefícios exclusivos
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 text-center group"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}