import { Link } from 'react-router-dom';

interface PlanGridProps {
  title?: string;
}

export function PlanGrid({ title = "GRUPOS A PARTIR DE 10 TITULARES" }: PlanGridProps) {
  return (
    <section className="space-y-8 py-10">
      <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight text-center">
        {title}
      </h2>

      <div className="flex flex-col md:flex-row justify-center gap-6 max-w-2xl mx-auto px-6">
        
        {/* Plano Coletivo - R$ 30,00 (Estilo Verde) */}
        <Link
          to="/form-coletivo"
          className="flex flex-col items-center justify-center bg-[#22C55E] hover:bg-[#16a34a] text-white px-8 py-6 rounded-3xl shadow-[0_10px_20px_rgba(0,0,0,0.2)] transition-all hover:scale-105 border-b-4 border-green-700 w-full md:w-1/2"
        >
          <span className="text-xs font-bold uppercase tracking-widest opacity-90">Plano Individual</span>
          <span className="text-sm font-black uppercase mt-1">1 Titular</span>
          <span className="text-4xl font-black my-2">R$ 30,00</span>
          <span className="text-xs font-bold uppercase opacity-90">mensais</span>
        </Link>

        {/* Plano Coletivo - R$ 60,00 (Estilo Branco) */}
        <Link
          to="/form-coletivo"
          className="flex flex-col items-center justify-center bg-white hover:bg-gray-100 text-[#22C55E] px-8 py-6 rounded-3xl shadow-[0_10px_20px_rgba(0,0,0,0.2)] transition-all hover:scale-105 border-b-4 border-gray-200 w-full md:w-1/2"
        >
          <span className="text-xs font-bold uppercase tracking-widest">Plano Familiar</span>
          <span className="text-sm font-black uppercase mt-1">1 Titular + 3 Dependentes</span>
          <span className="text-4xl font-black my-2">R$ 60,00</span>
          <span className="text-xs font-bold uppercase opacity-90">mensais</span>
        </Link>
      </div>
    </section>
  );
}