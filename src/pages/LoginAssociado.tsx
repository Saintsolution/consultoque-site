import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export function LoginAssociado() {
  const [cpf, setCpf] = useState('');
  const [nasc, setNasc] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCpf = (val: string) => setCpf(val.replace(/\D/g, ''));

  const handleNasc = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 8);
    let formatted = clean;
    if (clean.length > 4) formatted = `${clean.slice(0,2)}-${clean.slice(2,4)}-${clean.slice(4)}`;
    else if (clean.length > 2) formatted = `${clean.slice(0,2)}-${clean.slice(2)}`;
    setNasc(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('https://n8n.saintsolution.com.br/webhook/login-cliente', {
        assoc_cpf: cpf,
        assoc_nasc: nasc
      });

      // Lógica corrigida para o formato do seu n8n [ { data: [...] } ]
      const payload = Array.isArray(response.data) ? response.data[0] : response.data;

      if (payload && payload.data && payload.data.length > 0) {
        sessionStorage.setItem('associado_dados', JSON.stringify(payload.data));
        navigate('/dashboard-associado');
      } else {
        alert('Dados não encontrados.');
      }
    } catch (err) {
      console.error('Erro no login:', err);
      alert('Erro ao realizar login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-16 px-6">
      <a href="/" className="text-blue-600 font-bold mb-4 block underline">← Voltar ao site</a>
      <h2 className="text-2xl font-bold mb-6">Acesso do Associado</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input 
          type="text" placeholder="CPF (somente números)" maxLength={11}
          value={cpf} onChange={(e) => handleCpf(e.target.value)}
          className="p-3 border rounded-lg" required
        />
        <input 
          type="text" placeholder="Data de Nascimento (DD-MM-AAAA)" maxLength={10}
          value={nasc} onChange={(e) => handleNasc(e.target.value)}
          className="p-3 border rounded-lg" required
        />
        <button type="submit" disabled={loading} className="bg-green-600 text-white p-3 rounded-lg font-bold">
          {loading ? 'Acessando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}