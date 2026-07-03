import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, HeartPulse, Clock, Smile, Activity, Lock } from 'lucide-react';

// Links diretos dos checkouts do Asaas
const LINKS_ASAAS = {
  individual: 'https://www.asaas.com/c/seu_link_plano_individual',
  familiar: 'https://www.asaas.com/c/seu_link_plano_familiar'
};

// URL do seu Webhook do n8n que vai salvar no Google Sheets
const N8N_WEBHOOK_URL = 'https://seu-n8n.com/webhook/consultoque-leads';

export function VendasAsaas() {
  const [refCode, setRefCode] = useState<string | null>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState(false);
  
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const date = new Date();
      date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
      document.cookie = `consultoque_ref=${id}; expires=${date.toUTCString()}; path=/`;
      setRefCode(id);
      notificarN8n(id, 'visita');
    } else {
      const match = document.cookie.match(/(?:^|; )consultoque_ref=([^;]*)/);
      if (match && match[1]) {
        setRefCode(match[1]);
      } else {
        const padraoDono = '0001';
        const date = new Date();
        date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
        document.cookie = `consultoque_ref=${padraoDono}; expires=${date.toUTCString()}; path=/`;
        setRefCode(padraoDono);
        notificarN8n(padraoDono, 'visita');
      }
    }
  }, [id]);

  const notificarN8n = async (corretorId: string, acao: 'visita' | 'clique_checkout', plano?: string) => {
    try {
      await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          corretor_id: corretorId,
          acao: acao,
          plano: plano || 'nenhum',
          timestamp: new Date().toISOString(),
          origem: 'pagina_asaas'
        })
      });
    } catch (error) {
      console.error('Erro de rastro:', error);
    }
  };

  const handleCheckoutClick = (plano: 'individual' | 'familiar') => {
    if (refCode) {
      notificarN8n(refCode, 'clique_checkout', plano);
    }
    window.location.href = LINKS_ASAAS[plano];
  };

  const handleAdminAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === '1234') {
      setShowAdminModal(false);
      setAdminError(false);
      setAdminPassword('');
      navigate('/admin');
    } else {
      setAdminError(true);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased">
      
      {/* 1. HEADER VISUAL NATIVO (MOBILE / DESKTOP) */}
      <header className="w-full overflow-hidden">
        <div className="block w-full">
          {/* BANNER MOBILE */}
          <div className="block md:hidden w-full">
            <img
              src="/banner_cel.png"
              alt="Consultoque Saúde"
              className="w-full h-auto"
            />
          </div>
          {/* BANNER DESKTOP */}
          <div className="hidden md:block w-full">
            <img
              src="/banner_desk.png"
              alt="Consultoque Saúde"
              className="w-full h-auto"
            />
          </div>
        </div>
      </header>

      {/* 2. PRIMEIRA FAIXA AZUL MAIS CLARA (Baseada na imagem de referência) */}
      <section className="bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] text-white py-14 px-4 text-center shadow-md">
        <div className="max-w-4xl mx-auto space-y-3">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight uppercase drop-shadow-sm">
            ConsulToque Saúde Digital
          </h2>
          <p className="text-xl md:text-3xl font-bold italic tracking-wide drop-shadow-xs text-white/90">
            Simples assim, consulta num toque!
          </p>
          
          {/* Badges de Credibilidade */}
          <div className="flex flex-wrap justify-center gap-3 pt-6 max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-xs border border-white/20 px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-white" /> Sem Carência imediata
            </div>
            <div className="bg-white/10 backdrop-blur-xs border border-white/20 px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2">
              <Smile className="w-4 h-4 text-white" /> Qualquer Idade aceita
            </div>
            <div className="bg-white/10 backdrop-blur-xs border border-white/20 px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-white" /> Atendimentos Ilimitados
            </div>
          </div>
        </div>
      </section>

      {/* 3. BLOCO DE CTAs PREMIUM NO TOPO (Botão Redondo, Preço Grande - Igual ao site principal) */}
      <section className="max-w-4xl mx-auto px-4 pt-14 text-center space-y-6">
        <p className="text-xs font-black uppercase text-gray-400 tracking-widest">
          Escolha seu plano e contrate agora
        </p>
        
        <div className="grid sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Botão Individual Topo */}
          <div className="flex flex-col items-center space-y-2">
            <button
              onClick={() => handleCheckoutClick('individual')}
              className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-black px-6 py-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] flex flex-col items-center justify-center cursor-pointer border-b-4 border-[#15803d]"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">PLANO INDIVIDUAL</span>
              <span className="text-2xl md:text-3xl font-black tracking-tight my-0.5">R$ 33,00</span>
              <span className="text-[9px] font-bold opacity-80 uppercase tracking-widest">MENSAIS</span>
            </button>
            <span className="text-[11px] text-gray-400 font-semibold">Acesso exclusivo para o titular</span>
          </div>

          {/* Botão Familiar Topo */}
          <div className="flex flex-col items-center space-y-2">
            <button
              onClick={() => handleCheckoutClick('familiar')}
              className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-black px-6 py-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] flex flex-col items-center justify-center cursor-pointer border-b-4 border-[#15803d]"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">PLANO FAMILIAR</span>
              <span className="text-2xl md:text-3xl font-black tracking-tight my-0.5">R$ 66,00</span>
              <span className="text-[9px] font-bold opacity-80 uppercase tracking-widest">MENSAIS</span>
            </button>
            <span className="text-[11px] text-gray-400 font-semibold">Titular + até 3 dependentes</span>
          </div>
        </div>
        
        <p className="text-[11px] text-gray-400 font-medium pt-2">
          Sem carência • Sem taxa de adesão • Cancele quando quiser
        </p>
      </section>

      {/* 4. CONTEÚDO DA LANDING PAGE */}
      <main className="max-w-5xl mx-auto px-4 py-16 space-y-20">
        
        {/* BLOCO TELEMEDICINA */}
        <section className="grid md:grid-cols-12 gap-8 items-center bg-slate-50 p-8 md:p-12 rounded-3xl border border-gray-100 shadow-xs">
          <div className="md:col-span-7 space-y-5">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">
              Conforto e Segurança
            </span>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">
              Consultas Médicas Online Disponíveis 24h por Dia
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
              Esqueça as longas filas de prontos-socorros. Acesse nossa infraestrutura direto do seu celular de maneira ilimitada. Operamos em estrita conformidade com a Lei nº 13.989/2020 e a Resolução CFM nº 2.314.
            </p>
            <div className="bg-white border-l-4 border-blue-500 p-4 rounded-r-xl text-xs md:text-sm text-gray-700 font-semibold shadow-xs">
              🎯 <span className="text-gray-900 font-bold">Plantão Médico ativo:</span> Equipes altamente qualificadas prontas para atendimentos de Clínica Geral e Generalista sem agendamento prévio.
            </div>
          </div>

          {/* Grid Técnico de Especialidades */}
          <div className="md:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-900 text-xs mb-4 flex items-center gap-2 border-b pb-2 uppercase tracking-wider text-slate-500">
              Encaminhamentos Diretos
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs font-bold text-gray-700">
              {['Cardiologia', 'Dermatologia', 'Endocrinologia', 'Gastroenterologia', 'Geriatria', 'Ginecologia', 'Medicina da Família', 'Oftalmologia', 'Ortopedia', 'Otorrinolaringologia', 'Pediatria', 'Psiquiatria'].map((esp) => (
                <div key={esp} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                  <span className="truncate">{esp}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BENEFÍCIOS ADICIONAIS */}
        <section className="grid md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 p-8 rounded-3xl space-y-3 shadow-xs">
            <div className="text-2xl">🌱</div>
            <h3 className="font-black text-xl text-gray-900">Programas de Terapias e Bem-Estar</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Mantenha sua rotina em dia com o direito de agendar <strong>uma consulta mensal</strong> para cada pilar essencial da sua saúde: <span className="font-bold text-gray-900">Psicologia, Nutrição e Personal Trainer</span>.
            </p>
          </div>

          <div className="bg-white border border-gray-200 p-8 rounded-3xl space-y-3 shadow-xs">
            <div className="text-2xl">🎁</div>
            <h3 className="font-black text-xl text-gray-900">Clube de Vantagens Integrado</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Economia real fora das consultas. Desfrute de descontos estruturados, vantagens e benefícios comerciais ativos em uma rede com mais de <strong>250 parceiros comerciais</strong> pelo Brasil.
            </p>
          </div>
        </section>

        {/* SEÇÃO DE MATRIZ DE PREÇOS (BORDAS DA COR DO BOTÃO INVERTIDAS) */}
        <section className="space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight uppercase">
              Nossos Planos Disponíveis
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Card Individual - Borda Verde Invertida */}
            <div className="bg-white rounded-3xl p-8 border-4 border-[#22c55e] shadow-sm flex flex-col justify-between text-center transform hover:translate-y-[-4px] transition-all duration-300">
              <div className="space-y-4">
                <span className="bg-slate-100 text-slate-800 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Foco Individual</span>
                <h3 className="text-2xl font-black text-gray-900">Plano Individual</h3>
                <p className="text-xs text-gray-400 font-medium">Acesso integral liberado para o titular da assinatura</p>
                <div className="py-4">
                  <span className="text-4xl md:text-5xl font-black text-gray-900">R$ 33,00</span>
                  <span className="text-gray-400 text-sm font-bold">/mês</span>
                </div>
              </div>
              <button 
                onClick={() => handleCheckoutClick('individual')}
                className="mt-8 w-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-black py-4 px-6 rounded-full shadow-md transition-all uppercase text-xs tracking-wider transform hover:scale-[1.02] cursor-pointer border-b-4 border-[#15803d]"
              >
                Contratar por R$ 33,00
              </button>
            </div>

            {/* Card Familiar - Borda Verde Invertida */}
            <div className="bg-white rounded-3xl p-8 border-4 border-[#22c55e] shadow-sm flex flex-col justify-between text-center transform hover:translate-y-[-4px] transition-all duration-300">
              <div className="space-y-4">
                <span className="bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Proteção Completa</span>
                <h3 className="text-2xl font-black text-gray-900">Plano Familiar</h3>
                <p className="text-xs text-gray-400 font-medium">Inclusão protegida do titular + até 3 dependentes diretos</p>
                <div className="py-4">
                  <span className="text-4xl md:text-5xl font-black text-[#22c55e]">R$ 66,00</span>
                  <span className="text-gray-400 text-sm font-bold">/mês</span>
                </div>
              </div>
              <button 
                onClick={() => handleCheckoutClick('familiar')}
                className="mt-8 w-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-black py-4 px-6 rounded-full shadow-md transition-all uppercase text-xs tracking-wider transform hover:scale-[1.02] cursor-pointer border-b-4 border-[#15803d]"
              >
                Contratar por R$ 66,00
              </button>
            </div>
          </div>
        </section>

        {/* AMBIENTE DE ACESSO BLINDADO */}
        <section className="bg-slate-50 border border-gray-200 p-8 md:p-10 rounded-3xl space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="font-black text-lg uppercase tracking-wide text-gray-900">
              Acesso Imediato ao seu painel de saúde
            </h3>
          </div>
          <div className="space-y-3 text-xs md:text-sm font-bold text-gray-700">
            <div className="p-4 bg-white rounded-xl border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-2 shadow-xs">
              <span>📱 <strong>Plataforma de Consultas Médicas:</strong> <span className="text-blue-600 font-bold ml-1">telemedicina.consultoque.com.br</span></span>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md font-black uppercase tracking-tight">Ambiente Seguro</span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs">
              🎁 <strong>Acesso ao Clube de Vantagens:</strong> <span className="text-gray-600 ml-1">clube.servidabeneficios.com.br</span>
            </div>
          </div>
        </section>
      </main>

      {/* 5. SEGUNDA FAIXA AZUL MAIS CLARA (Logo antes do footer) */}
      <section className="bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] text-white py-12 px-4 text-center shadow-md">
        <div className="max-w-3xl mx-auto space-y-2">
          <p className="text-xl md:text-2xl font-bold tracking-wide">
            Consultas ilimitadas com a segurança e o suporte que você merece.
          </p>
          <p className="text-xs opacity-85">
            O ecossistema de telemedicina ideal para você e seus corretores parceiros.
          </p>
        </div>
      </section>

      {/* 6. FOOTER COM ÁREA DE ADMINISTRAÇÃO SECRETA */}
      <footer className="bg-slate-900 text-gray-400 py-12 text-center text-xs">
        <div className="max-w-5xl mx-auto px-4 space-y-6">
          <div className="flex justify-center">
            <img
              src="/consultoque_logo_fundo_branco_final.png"
              alt="CONSULTOQUE"
              className="h-10 w-10 object-contain bg-white rounded-xl p-1.5 opacity-90 shadow-xs"
            />
          </div>
          <p className="text-white font-bold uppercase tracking-widest text-sm">ConsulToque Saúde Digital</p>
          <div className="flex flex-wrap justify-center gap-6 text-gray-400 font-semibold">
            <a href="/privacidade" target="_blank" rel="noopener noreferrer" className="hover:text-white underline underline-offset-4 transition-colors">Política de Privacidade</a>
            <a href="/termos" target="_blank" rel="noopener noreferrer" className="hover:text-white underline underline-offset-4 transition-colors">Termos de Uso</a>
            <span className="text-gray-500">CNPJ: 39.549.271/0001-36</span>
          </div>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-[11px] uppercase tracking-wider text-gray-500 pt-4 border-t border-gray-800/60 max-w-xl mx-auto">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Criptografia Ativa Asaas</span>
            </div>
            <span className="hidden md:inline text-gray-700">|</span>
            <button 
              onClick={() => setShowAdminModal(true)}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-400 transition-colors font-bold cursor-pointer"
            >
              <Lock className="w-3 h-3" /> Area Restrita
            </button>
          </div>
        </div>
      </footer>

      {/* MODAL SECRETO DE AUTENTICAÇÃO DA ADMINISTRAÇÃO */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 px-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-black text-gray-900">Acesso Restrito Admin</h4>
              <p className="text-xs text-gray-400 font-medium mt-0.5">Insira a chave de verificação corporativa</p>
            </div>

            <form onSubmit={handleAdminAccess} className="space-y-3">
              <input
                type="password"
                placeholder="Senha de Acesso"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl text-center font-mono text-sm focus:outline-none focus:ring-2 ${
                  adminError ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-100'
                }`}
                autoFocus
              />
              {adminError && (
                <p className="text-[11px] text-red-500 text-center font-bold">Chave inválida. Tente novamente.</p>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAdminModal(false); setAdminError(false); setAdminPassword(''); }}
                  className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-xs"
                >
                  Verificar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}