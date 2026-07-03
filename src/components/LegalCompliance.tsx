import { Link } from 'react-router-dom';

export function LegalCompliance() {
  return (
    <section className="px-6 py-8 bg-blue-50/50 border border-blue-100 rounded-2xl text-center space-y-6">
      {/* Texto de Conformidade */}
      <p className="max-w-3xl mx-auto text-xs text-blue-900/70 font-medium leading-relaxed">
        A ConsulToque opera em estrita conformidade com a legislação brasileira de telemedicina, 
        incluindo a Lei nº 13.989/2020 e a Resolução CFM nº 2.314/2022. 
        Nossa infraestrutura garante atendimento médico seguro, ético e disponível 24 horas por dia.
      </p>

      {/* Lista de Parceiros/Prestadores */}
      <div className="flex flex-col items-center gap-2 pt-2 border-t border-blue-100/50">
        <span className="text-[10px] font-bold text-blue-900/50 uppercase tracking-widest mb-1">Parceiros Estratégicos</span>
        
        <a 
          href="https://telemedicina.consultoque.com.br/login" 
          target="_blank" 
          rel="noreferrer" 
          className="text-xs font-semibold text-blue-700 hover:text-blue-900 transition-colors underline underline-offset-2"
        >
          Prestador de Telemedicina
        </a>
        
        <a 
          href="https://clube.servidabeneficios.com.br/" 
          target="_blank" 
          rel="noreferrer" 
          className="text-xs font-semibold text-blue-700 hover:text-blue-900 transition-colors underline underline-offset-2"
        >
          Clube de Benefícios
        </a>
        
        <Link 
          to="/login" 
          className="text-xs font-semibold text-blue-700 hover:text-blue-900 transition-colors underline underline-offset-2"
        >
          Portal do Associado
        </Link>
      </div>
    </section>
  );
}