import { comOrigemVisual, linkOrigemVisual } from '../app/origemVisual';
import { identidadeParceiro } from '../app/identidadesParceiros';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { OfertaParceiro } from '../services/parceiro';
import './timeweb-preview.css';
import { ArrowRight, CheckCircle2, Clock3, HeartPulse, Menu, ShieldCheck, Smartphone, X } from 'lucide-react';
import { Benefits } from '../components/Benefits';
import { ClubBenefits } from '../components/ClubBenefits';
import { LegalCompliance } from '../components/LegalCompliance';

// A identidade visual não concede autorização comercial.
export function PaginaParceiro({ oferta }: { oferta: OfertaParceiro }) {
  const identidade = identidadeParceiro(oferta);
  const origem = `parceiro:${oferta.apelido}`;
  const [logoFalhou, setLogoFalhou] = useState(false);
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);
  const [selection, setSelection] = useState<string | null>(null);
  return <div className="timeweb-preview min-h-screen bg-white text-slate-900">
    <div className="bg-slate-900 px-4 py-2 text-center text-xs text-white">{identidade.nome} · indicação {oferta.codigo} · condição comercial confirmada pelo cadastro</div>
    <header>
      <div className="timeweb-banner">
        <picture><source media="(min-width: 768px)" srcSet="/banner_desk.png" /><img src="/banner_cel.png" alt="Família ConsulToque — cuidado para todas as gerações" className="block w-full" /></picture>
        <a href="#inicio" aria-label={`${identidade.nome} — início`} className="timeweb-brand-panel">
          <div className="partner-logo-frame">{logoFalhou ? <strong>{identidade.nome}</strong> : <img src={identidade.logo} alt={identidade.nome} onError={() => setLogoFalhou(true)} className="partner-primary-logo" />}</div>
          <span className="timeweb-partners-label">Parceiros</span>
          <img src="/logo.png" alt="ConsulToque" className="timeweb-secondary-logo" />
        </a>
      </div>
      <nav aria-label="Navegação da página do parceiro" className="bg-green-600 text-white">
        <div className="mx-auto max-w-6xl px-5 py-3">
          <button type="button" aria-expanded={menu} aria-controls="timeweb-menu" onClick={() => setMenu(!menu)} aria-label={menu ? 'Fechar menu' : 'Abrir menu'} className="flex items-center gap-2 font-bold md:hidden">{menu ? <X /> : <Menu />} Menu</button>
          <div id="timeweb-menu" className={`${menu ? 'flex' : 'hidden'} flex-col gap-5 pt-4 text-sm font-bold md:flex md:flex-row md:justify-center md:gap-8 md:pt-0`}>
            {[['Benefícios', '#benefits'], ['Nossos planos', '#planos'], ['Área do Associado', '/associado'], ['Área do Colaborador', '/colaborador'], ['Área Administrativa', '/admin']].map(([label, href]) => <a key={label} href={['/associado', '/colaborador'].includes(href) ? linkOrigemVisual(href, origem) : href} onClick={() => setMenu(false)} className="rounded py-1 hover:underline">{label}</a>)}
          </div>
        </div>
      </nav>
    </header>
    <main id="inicio">
      <section className="timeweb-hero px-6 py-14 text-center sm:py-20">
        <div className="mx-auto max-w-4xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-green-100"><HeartPulse size={16} /> {identidade.nome} + ConsulToque</span>
          <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-white sm:text-6xl">Mais cuidado para você.<br /><span className="text-green-300">Mais tranquilidade para sua família.</span></h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-blue-100">Telemedicina e benefícios para o seu dia a dia, com condições especiais da parceria {identidade.nome} e ConsulToque.</p>
          <a href="#planos" className="mt-8 inline-flex items-center gap-3 rounded-xl bg-green-600 px-7 py-4 font-bold text-white shadow-lg shadow-blue-950/30 hover:bg-green-700">Conheça os planos <ArrowRight size={20} /></a>
          <div className="mt-10 grid gap-4 text-sm font-semibold text-white sm:grid-cols-3">
            {[{ Icon: Clock3, label: 'Clínico geral 24 horas' }, { Icon: Smartphone, label: 'Atendimento online' }, { Icon: ShieldCheck, label: 'Especialidades com agendamento' }].map(({ Icon, label }) => <div key={label} className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 p-4"><Icon className="h-5 w-5 shrink-0 text-green-300" />{label}</div>)}
          </div>
        </div>
      </section>
      <Benefits showVideo={false} />
      <ClubBenefits />
      <section id="planos" className="timeweb-plans px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="text-center"><p className="text-xs font-bold uppercase tracking-widest text-green-700">Condição especial da parceria</p><h2 className="mt-3 text-3xl font-black text-blue-950 sm:text-4xl">Seu cuidado começa aqui</h2><p className="mt-4 text-slate-600">Individual ou familiar. Condição especial desde a primeira inscrição.</p></div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {[{ name: 'Individual', old: 33, price: 30, description: '1 titular' }, { name: 'Familiar', old: 66, price: 60, description: '1 titular + 3 dependentes' }].map(plan => <article key={plan.name} className={`timeweb-plan-card ${plan.name === 'Familiar' ? 'timeweb-family-card' : ''} rounded-3xl p-7 sm:p-9`}>
              <h3 className="text-2xl font-black text-blue-950">{plan.name}</h3><p className="mt-2 text-sm text-slate-600">{plan.description}</p>
              <p className="mt-7 text-sm text-slate-500">De <del>R$ {plan.old},00</del> por</p><p className="mt-1 flex items-baseline gap-1"><span className="text-lg font-bold text-green-700">R$</span><span className="text-6xl font-black tracking-tight text-green-700">{plan.price}</span><span className="text-slate-500">/mês</span></p>
              <ul className="my-7 space-y-3 text-sm text-slate-600">{['Clínico geral 24 horas', 'Especialidades com agendamento', 'Clube de vantagens'].map(item => <li key={item} className="flex items-center gap-2"><CheckCircle2 size={17} className="shrink-0 text-green-600" />{item}</li>)}</ul>
              <button type="button" onClick={() => oferta ? navigate(comOrigemVisual(`/contratar?oferta=${oferta.apelido}&ref=${oferta.codigo}`, origem)) : setSelection(plan.name)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-4 font-bold text-white hover:bg-green-700">Quero o plano {plan.name.toLowerCase()} <ArrowRight size={18} /></button>
            </article>)}
          </div>
          <p className="mt-5 text-center text-xs leading-relaxed text-slate-500">A oferta e a contratação especial dependem de validação no servidor. Consulte as condições e o Termo de Adesão.</p>
        </div>
      </section>
      <div className="mx-auto max-w-5xl px-6 py-10"><LegalCompliance /></div>
      <section className="timeweb-recruit px-6 py-16 text-center text-white">
        <p className="text-xs font-bold uppercase tracking-widest text-green-100">Faça parte da nossa equipe</p><h2 className="mx-auto mt-4 max-w-3xl text-3xl font-black sm:text-4xl">Indique a ConsulToque e construa sua rede</h2><p className="mx-auto mt-5 max-w-2xl text-lg text-green-50">Conheça como ser colaborador e acompanhar suas indicações, sua rede e suas comissões.</p>
        <a href={linkOrigemVisual(`/seja-afiliado?ref=${oferta.codigo}`, origem)} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-4 font-bold text-green-800 shadow-lg">Quero ser colaborador <ArrowRight size={18} /></a>
      </section>
    </main>
    <footer className="bg-blue-950 px-6 py-9 text-center text-sm text-blue-100"><p className="font-bold text-white">{identidade.nome} · Uma parceria com ConsulToque</p><div className="mt-4 flex flex-wrap justify-center gap-6"><a href="/termos" className="underline">Termos de Adesão</a><a href="/privacidade" className="underline">Privacidade</a><a href="/" className="underline">Site ConsulToque</a></div></footer>
    {selection && <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-950/60 p-5" onClick={() => setSelection(null)}><section role="dialog" aria-modal="true" aria-labelledby="timeweb-demo-title" className="w-full max-w-md rounded-2xl bg-white p-7 shadow-xl" onClick={e => e.stopPropagation()}><h2 id="timeweb-demo-title" className="text-xl font-bold text-blue-950">Plano {selection}</h2><p className="mt-4 text-slate-600">A condição comercial será confirmada pelo cadastro antes da emissão.</p><button type="button" autoFocus onClick={() => setSelection(null)} className="mt-6 rounded-lg bg-green-600 px-5 py-3 font-bold text-white">Voltar</button></section></div>}
  </div>;
}
