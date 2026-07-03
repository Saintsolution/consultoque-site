import React from 'react';
import { ShieldCheck, Scale, Stethoscope, Check } from 'lucide-react';

export function Extra() {
  return (
    <section className="relative overflow-hidden py-20 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 text-white">
      
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAgNGgtMnYyaDJ2LTJ6bTQtNHYyaDJ2LTJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Título da Seção */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
            Compromisso com a Legalidade
          </h2>
          <p className="text-xl text-blue-50 max-w-3xl mx-auto font-medium">
            Sua consulta é realizada dentro das normas do CFM e da legislação federal brasileira.
          </p>
        </div>

        {/* Caixa Branca (Glassmorphism) */}
        <div className="max-w-5xl mx-auto bg-white/95 backdrop-blur-md rounded-[2.5rem] p-8 md:p-14 shadow-2xl border-2 border-white/20">
          
          <div className="grid md:grid-cols-3 gap-12">
            
            {/* Registro CRM */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <ShieldCheck className="w-9 h-9 text-blue-600" />
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-3">Profissionais Habilitados</h4>
              <p className="text-slate-600 leading-relaxed text-sm">
                Todos os atendimentos são feitos por <strong>médicos com CRM ativo</strong>. Receitas e atestados têm validade em todo o Brasil.
              </p>
            </div>

            {/* Base Legal */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <Scale className="w-9 h-9 text-cyan-600" />
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-3">Lei Federal 13.989/2020</h4>
              <p className="text-slate-600 leading-relaxed text-sm">
                Operamos sob a <strong>Lei da Telemedicina</strong> e a Resolução CFM nº 2.314/2022, garantindo ética e sigilo total dos dados.
              </p>
            </div>

            {/* Responsabilidade Técnica - Dr. Maicon */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <Stethoscope className="w-9 h-9 text-amber-600" />
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-2">Responsabilidade Técnica</h4>
              <p className="text-blue-600 font-bold text-xs uppercase mb-2 tracking-widest leading-tight">
                Dr. Maicon Gonçalves Primo <br /> CRM-SP 163.013
              </p>
              <p className="text-slate-600 leading-relaxed text-xs">
                Médico e pesquisador em Saúde Digital, especialista em gestão médica e na implantação de protocolos avançados de telemedicina.
              </p>
            </div>

          </div>

          {/* Selo de Garantia / Link para Termos */}
          <div className="mt-12 pt-8 border-t border-slate-200 text-center">
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-[0.2em] mb-4">
              Operação Técnica: Click Life Saúde (CNPJ 39.549.271/0001-36)
            </p>
           <a 
  href="/termos" 
  target="_blank" 
  rel="noopener noreferrer" 
  className="inline-flex items-center gap-2 text-blue-600 font-black uppercase italic text-sm hover:text-blue-800 transition-colors"
>
  Consultar Termos de Adesão e Normas de Uso
  <Check className="w-4 h-4 bg-blue-600 text-white rounded-full p-0.5" />
</a>""
          </div>
        </div>

      </div>
    </section>
  );
}