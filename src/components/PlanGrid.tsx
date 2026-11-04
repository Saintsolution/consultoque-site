import { priceForPlan, BULK_THRESHOLD } from '../lib/pricing';
import { comOrigemVisual } from '../app/origemVisual';
import { useParceiro } from '../app/ContextoParceiro';
import { armazenamentoReferencia } from '../services/referencia';
import { linkComercial } from '../services/parceiro';

export function PlanGrid() {
  const parceiro = useParceiro();
  const linkBase = linkComercial('/contratar', parceiro, armazenamentoReferencia.ler() || '0001');
  const linkFormulario = comOrigemVisual(linkBase, 'home');

  return (
    <section className="space-y-8 py-10">
      <h2 className="text-center text-xl font-black uppercase tracking-tight text-gray-900">
        Escolha o seu plano agora
      </h2>

      <div className="mx-auto flex max-w-2xl flex-col justify-center gap-6 px-6 md:flex-row">
        <a
          href={linkFormulario}
          className="flex w-full flex-col items-center justify-center rounded-3xl border-b-4 border-green-700 bg-[#22C55E] px-8 py-6 text-white shadow-[0_10px_20px_rgba(0,0,0,0.2)] transition-all hover:scale-105 hover:bg-[#16a34a] md:w-1/2"
        >
          <span className="text-xs font-bold uppercase tracking-widest opacity-90">
            Plano Individual
          </span>

          <span className="mt-1 text-sm font-black uppercase">
            1 titular
          </span>

          <span className="my-2 text-4xl font-black">
            R$ {priceForPlan('individual', 1, Boolean(parceiro)).toFixed(2).replace('.', ',')}
          </span>

          <span className="text-xs font-bold uppercase opacity-90">
            por mês
          </span>
        </a>

        <a
          href={linkFormulario}
          className="flex w-full flex-col items-center justify-center rounded-3xl border-b-4 border-gray-200 bg-white px-8 py-6 text-[#22C55E] shadow-[0_10px_20px_rgba(0,0,0,0.2)] transition-all hover:scale-105 hover:bg-gray-100 md:w-1/2"
        >
          <span className="text-xs font-bold uppercase tracking-widest">
            Plano Familiar
          </span>

          <span className="mt-1 text-sm font-black uppercase">
            1 titular + 3 dependentes
          </span>

          <span className="my-2 text-4xl font-black">
            R$ {priceForPlan('familia', 1, Boolean(parceiro)).toFixed(2).replace('.', ',')}
          </span>

          <span className="text-xs font-bold uppercase opacity-90">
            por mês
          </span>
        </a>
      </div>
      {parceiro && <p className="mx-auto max-w-2xl px-6 text-center text-sm text-green-800">Com {BULK_THRESHOLD} ou mais titulares no mesmo contrato: R$ {priceForPlan('individual', BULK_THRESHOLD, true)},00 individual e R$ {priceForPlan('familia', BULK_THRESHOLD, true)},00 familiar por titular/mês. Você pode combinar os planos.</p>}
    </section>
  );
}
