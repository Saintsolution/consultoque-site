import { Tag, ShoppingBag, Glasses, Pill, Dumbbell, Utensils, Gift, Sparkles } from 'lucide-react';

const categories = [
  {
    icon: Pill,
    name: 'Farmácias',
    discount: 'Até 80%',
    color: 'from-cyan-400 to-green-400',
  },
  {
    icon: Glasses,
    name: 'Óticas',
    discount: 'Até 50%',
    color: 'from-blue-400 to-cyan-400',
  },
  {
    icon: Dumbbell,
    name: 'Academias',
    discount: 'Até 40%',
    color: 'from-orange-400 to-red-400',
  },
  {
    icon: Utensils,
    name: 'Restaurantes',
    discount: 'Até 30%',
    color: 'from-pink-400 to-rose-400',
  },
  {
    icon: ShoppingBag,
    name: 'Lojas',
    discount: 'Até 60%',
    color: 'from-yellow-400 to-orange-400',
  },
  {
    icon: Gift,
    name: 'Entretenimento',
    discount: 'Até 45%',
    color: 'from-cyan-300 to-teal-400',
  },
];

export function ClubBenefits() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAgNGgtMnYyaDJ2LTJ6bTQtNHYyaDJ2LTJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 py-2 rounded-full font-semibold mb-6">
            <Sparkles className="w-5 h-5" />
            Clube de Vantagens SESSP
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Mais de 250 Parceiros em Todo Brasil
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Economize milhares de reais por ano com descontos exclusivos
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{category.name}</h3>
                    <p className="text-2xl font-bold text-cyan-400">{category.discount}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-xl text-center">
            <Tag className="w-10 h-10 mx-auto mb-3 text-cyan-400" />
            <p className="text-3xl font-bold mb-2">250+</p>
            <p className="text-gray-300">Parceiros</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-xl text-center">
            <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-cyan-400" />
            <p className="text-3xl font-bold mb-2">Nacional</p>
            <p className="text-gray-300">Todo Brasil</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-xl text-center">
            <Sparkles className="w-10 h-10 mx-auto mb-3 text-cyan-400" />
            <p className="text-3xl font-bold mb-2">Ilimitado</p>
            <p className="text-gray-300">Uso dos descontos</p>
          </div>
        </div>
      </div>
    </section>
  );
}
