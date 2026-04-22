import React from 'react';
import { HeaderVisual } from '../components/HeaderVisual';
import { Footer } from '../components/Footer';

export function Privacidade() {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      <HeaderVisual />
      <main className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-3xl font-black mb-8">Política de Privacidade</h1>
        <div className="prose prose-blue max-w-none space-y-6">
          <p>A <strong>CONSULTOQUE (SESSP)</strong> valoriza a sua privacidade. Esta política descreve como tratamos seus dados.</p>
          
          <h2 className="text-xl font-bold">1. Coleta de Dados</h2>
          <p>Coletamos dados básicos (Nome, CPF, E-mail, Telefone) para processar sua adesão ao sistema de telemedicina e clube de vantagens.</p>

          <h2 className="text-xl font-bold">2. Tratamento de Dados de Saúde</h2>
          <p>A Consultoque não armazena prontuários médicos. Toda a parte clínica é operada pela <strong>Click Life Saúde</strong>, que garante o sigilo médico conforme a Lei Federal nº 13.989/2020.</p>

          <h2 className="text-xl font-bold">3. Uso para Marketing</h2>
          <p>Utilizamos cookies e tecnologias de rastreamento (como Google Ads) para oferecer uma melhor experiência e anúncios personalizados, conforme permitido pela LGPD.</p>

          <h2 className="text-xl font-bold">4. Seus Direitos</h2>
          <p>Você pode solicitar a exclusão ou correção dos seus dados a qualquer momento através do e-mail <strong>consultoque@gmail.com</strong>.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}