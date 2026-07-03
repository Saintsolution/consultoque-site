import React, { useState } from 'react';
import { HeaderVisual } from '../components/HeaderVisual';
import { Footer } from '../components/Footer';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqData = [
  {
    question: "Os médicos são registrados?",
    answer: "Sim. Todos os profissionais são médicos habilitados com CRM ativo. O atendimento segue rigorosamente as normas do Conselho Federal de Medicina (Resolução CFM nº 2.314)."
  },
  {
    question: "Como recebo minha receita ou atestado?",
    answer: "Após a consulta, os documentos são assinados digitalmente e enviados diretamente para o seu WhatsApp ou e-mail, com validade em todo o território nacional."
  },
  {
    question: "O atendimento é realmente 24 horas?",
    answer: "Sim! Para clínico geral e médico da família, o atendimento está disponível 24h por dia, 7 dias por semana, sem necessidade de agendamento prévio."
  },
  {
    question: "Existe carência para usar o Clube de Vantagens?",
    answer: "Não. Assim que sua assinatura é confirmada, você já recebe o acesso ao clube com mais de 250 parceiros para começar a economizar."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-slate-50">
      <HeaderVisual />
      <main className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-black text-blue-600 text-center mb-12">Perguntas Frequentes</h1>
        <div className="space-y-4">
          {faqData.map((item, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <button 
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-6 text-left flex justify-between items-center hover:bg-slate-50 transition"
              >
                <span className="font-bold text-slate-800 text-lg">{item.question}</span>
                {openIndex === index ? <ChevronUp /> : <ChevronDown />}
              </button>
              {openIndex === index && (
                <div className="p-6 pt-0 text-slate-600 leading-relaxed border-t border-slate-100">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}