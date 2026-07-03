import React from 'react';
import { HeaderVisual } from '../components/HeaderVisual';
import { Hero } from '../components/Hero';
import { Benefits } from '../components/Benefits';
import { Extra } from '../components/Extra';
import { CTA } from '../components/CTA';
import { ShieldCheck } from 'lucide-react';

export function Vendas() {
  return (
    <div className="min-h-screen bg-white">
      {/* 1. Header Visual */}
      <HeaderVisual />

      {/* 2. Hero */}
      <Hero />

      {/* 3. Benefícios */}
      <Benefits />

      {/* 4. Extra (Dr. Maicon / Legalidade) */}
      <Extra />

      {/* 5. CTA Final */}
      <CTA />

      {/* FOOTER BLINDADO - LINKS ABREM EM NOVA ABA */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <img
              src="/consultoque_logo_fundo_branco_final.png"
              alt="CONSULTOQUE"
              className="h-10 w-10 object-contain bg-white rounded-full p-1 opacity-80"
            />
          </div>
          
          <p className="text-sm mb-4 text-white font-bold uppercase tracking-widest">
            ConsulToque Saúde Digital
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 text-xs mb-8">
            {/* O SEGREDO ESTÁ AQUI: target="_blank" e rel="noopener noreferrer" */}
            <a 
              href="/privacidade" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-white transition-colors underline underline-offset-4"
            >
              Política de Privacidade
            </a>
            <a 
              href="/termos" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-white transition-colors underline underline-offset-4"
            >
              Termos de Uso
            </a>
            <span className="text-gray-600">CNPJ: 39.549.271/0001-36</span>
          </div>

          <div className="flex justify-center items-center gap-2 text-[10px] text-gray-600 uppercase tracking-tighter">
            <ShieldCheck className="w-3 h-3" />
            <span>Ambiente Seguro e Criptografado</span>
          </div>

          <p className="mt-8 text-[10px] text-gray-700">
            © {new Date().getFullYear()} ConsulToque. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}