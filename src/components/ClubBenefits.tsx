import { CheckCircle2, Gift } from 'lucide-react';

export function ClubBenefits() {
  const benefitsList = [
    'Descontos em Farmácias (até 80%)',
    'Economia em Óticas e Lojas',
    'Parcerias em Academias',
    'Descontos em Restaurantes',
    'Rede nacional com 250+ parceiros',
    'Uso ilimitado dos benefícios'
  ];

  return (
    <section id="club-benefits" className="bg-white py-8">
      <div className="max-w-3xl mx-auto px-6">
        {/* Cabeçalho */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-3">
            <Gift className="w-4 h-4" /> Clube de Vantagens
          </div>
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">
            Economia real além da saúde
          </h2>
        </div>

        {/* Lista de Benefícios */}
        <div className="bg-slate-50 border border-gray-100 p-6 rounded-3xl shadow-sm">
          <div className="grid md:grid-cols-2 gap-3">
            {benefitsList.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#22c55e] shrink-0" />
                <span className="text-sm font-bold text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 font-medium mt-6">
          Acesso liberado imediatamente após a ativação do seu plano.
        </p>
      </div>
    </section>
  );
}