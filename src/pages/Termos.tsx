import React from 'react';
import { HeaderVisual } from '../components/HeaderVisual';
import { Footer } from '../components/Footer';

export function Termos() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderVisual />
      <main className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-black text-slate-900 mb-8">Termos de Adesão e Normas de Uso</h1>
        
        <div className="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed">
          
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <h2 className="text-xl font-bold text-blue-900 mb-3">1. TELEMEDICINA</h2>
            <p className="text-sm">
              O serviço será operado pela <strong>CLICK LIFE SAÚDE (CNPJ 39.549.271/0001-36)</strong>, responsável pela prestação de consultas médicas à distância, nos termos da Lei nº 13.989/2020 e da Resolução CFM nº 2.314. O atendimento está disponível 24h por dia para médicos generalistas e especialidades conforme agendamento administrativo.
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-3">2. CLUBE DE VANTAGENS</h2>
            <p className="text-sm">
              Disponibilizado pela plataforma <strong>SERVIDA BENEFÍCIOS LTDA (CNPJ 62.849.702/0001-00)</strong>. Oferece descontos em mais de 250 parceiros em todo o país, sendo continuamente atualizado.
            </p>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800">3. CONDIÇÕES GERAIS</h2>
            <ul className="list-decimal pl-5 space-y-2 text-sm font-medium">
              <li>O serviço é prestado exclusivamente online.</li>
              <li>A adesão é validada mediante o pagamento da taxa associativa mensal.</li>
              <li>O valor atual é de <strong>R$ 33,00/mês</strong>, sujeito a reajustes operacionais informados previamente.</li>
              <li>A falta de pagamento de uma única mensalidade acarretará a exclusão automática do associado.</li>
              <li>O associado declara a veracidade de todos os dados digitados no momento da adesão.</li>
              <li>É facultado ao <strong>SESSP</strong> realizar a substituição de convênios e serviços, mantendo a qualidade da entrega.</li>
              <li><strong>IMPORTANTE:</strong> A telemedicina NÃO substitui prontos-socorros em casos de emergência grave. Em risco de vida, ligue 192.</li>
            </ul>
          </section>

          <p className="text-xs text-slate-400 italic pt-8 border-t border-slate-100">
            Última atualização: Abril de 2026. Foro eleito: Rio de Janeiro/RJ.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}