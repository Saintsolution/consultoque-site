import React, { useState } from 'react';
import { Users, UserPlus, DollarSign, ArrowLeft, MessageSquare, ListOrdered, Network } from 'lucide-react';
import { Link } from 'react-router-dom';

const N8N_CADASTRO_URL = 'https://n8n.saintsolution.com.br/webhook/aa35fc51-82dc-468c-8334-b8d0b6c73bf3';

export function AdminAsaas() {
  const [abaAtiva, setAbaAtiva] = useState<'equipe' | 'clientes' | 'financeiro'>('equipe');
  const [exibirForm, setExibirForm] = useState(false);
  
  // Estados do formulário
  const [formData, setFormData] = useState({ nome: '', cpf: '', email: '', whatsapp: '', pix: '', tipo: 'Colaborador', idPai: '' });

  const handleCadastrar = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, id_pai: formData.tipo === 'Subcolaborador' ? formData.idPai : 'Nenhum' };
    
    try {
      const response = await fetch(N8N_CADASTRO_URL, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      });
      if (response.ok) {
        alert('Cadastro enviado com sucesso!');
        setExibirForm(false);
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao conectar ao n8n.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 font-sans text-xs">
      {/* Header */}
      <nav className="bg-slate-900 text-white p-4 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/consultoque_logo_fundo_branco_final.png" alt="Logo" className="h-8 w-8 bg-white p-1 rounded-lg" />
            <h1 className="font-black text-sm tracking-wider uppercase">CRM Admin ConsulToque</h1>
          </div>
          <Link to="/" className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Site
          </Link>
        </div>
      </nav>

      {/* Abas */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 flex gap-6">
          {[
            { id: 'equipe', label: 'Equipe', icon: Users },
            { id: 'clientes', label: 'Clientes', icon: MessageSquare },
            { id: 'financeiro', label: 'Financeiro', icon: DollarSign }
          ].map(aba => (
            <button 
              key={aba.id} 
              onClick={() => setAbaAtiva(aba.id as any)} 
              className={`py-4 px-2 border-b-2 font-black uppercase tracking-wider transition-all flex items-center gap-2 ${abaAtiva === aba.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              <aba.icon className="w-4 h-4" /> {aba.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {abaAtiva === 'equipe' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-black uppercase text-gray-900">Estrutura de Vendas</h2>
              <button 
                onClick={() => setExibirForm(!exibirForm)} 
                className="bg-blue-600 text-white font-bold py-2 px-4 rounded-xl hover:bg-blue-700 uppercase"
              >
                {exibirForm ? 'Cancelar' : 'Adicionar Integrante'}
              </button>
            </div>

            {exibirForm && (
              <form onSubmit={handleCadastrar} className="bg-white p-6 rounded-2xl border border-gray-200 grid sm:grid-cols-2 gap-4">
                <select onChange={(e) => setFormData({...formData, tipo: e.target.value})} className="border p-2 rounded-xl">
                  <option value="Colaborador">Colaborador (Líder)</option>
                  <option value="Subcolaborador">Subcolaborador</option>
                </select>
                <input type="text" placeholder="Nome Completo" onChange={(e) => setFormData({...formData, nome: e.target.value})} className="border p-2 rounded-xl" required />
                <input type="text" placeholder="CPF" onChange={(e) => setFormData({...formData, cpf: e.target.value})} className="border p-2 rounded-xl" required />
                <input type="text" placeholder="Chave PIX" onChange={(e) => setFormData({...formData, pix: e.target.value})} className="border p-2 rounded-xl" required />
                <button type="submit" className="sm:col-span-2 bg-blue-600 text-white p-3 rounded-xl font-black uppercase">Salvar no Sistema</button>
              </form>
            )}

            {/* Painel de Vendedores Simulado */}
            <div className="bg-white border rounded-2xl p-6">
              <h3 className="font-black text-gray-900 uppercase mb-4">Integrantes Ativos</h3>
              {/* Tabela de integrantes... */}
            </div>
          </div>
        )}
        
        {/* Adicione aqui a lógica das outras abas (clientes e financeiro) usando a estrutura acima */}
        {abaAtiva === 'financeiro' && (
            <div className="bg-slate-900 p-8 rounded-2xl text-white flex justify-between items-center">
                <span className="font-black uppercase tracking-widest text-lg">Total a Pagar (Geral)</span>
                <span className="text-4xl font-black text-emerald-400">R$ 165.00</span>
            </div>
        )}
      </main>
    </div>
  );
}