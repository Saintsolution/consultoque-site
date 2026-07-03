import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export function InscricaoColaborador() {
  const [refId, setRefId] = useState('0001');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const [sucesso, setSucesso] = useState(false);
  const [dadosRetorno, setDadosRetorno] = useState({
    message: '',
    cod_colab: '',
    link_indicacao: '',
  });

  const [formData, setFormData] = useState({
    nome_colab: '',
    email_colab: '',
    tel_colab: '',
    cpf_colab: '',
    pix_colab: '',
    senha_login: '',
  });

  useEffect(() => {
    const savedRef = localStorage.getItem('referenciador_id');
    if (savedRef) {
      setRefId(savedRef.padStart(4, '0'));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro('');

    const payload = {
      cod_pai: refId || '0001',
      nome_colab: formData.nome_colab.trim(),
      email_colab: formData.email_colab.trim(),
      tel_colab: formData.tel_colab.trim(),
      cpf_colab: formData.cpf_colab.trim(),
      pix_colab: formData.pix_colab.trim(),
      senha_login: formData.senha_login,
      dt_cad: new Date().toLocaleDateString('pt-BR'),
    };

    try {
      const response = await fetch('https://n8n.saintsolution.com.br/webhook/insertcolab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Erro ao enviar cadastro.');

      const data = await response.json();

      setDadosRetorno({
        message: data.message || 'Parabéns! Você agora tem seu link de indicação ConsulToque.',
        cod_colab: data.cod_colab || '',
        link_indicacao: data.link_indicacao || '',
      });

      setSucesso(true);

      setFormData({
        nome_colab: '',
        email_colab: '',
        tel_colab: '',
        cpf_colab: '',
        pix_colab: '',
        senha_login: '',
      });
    } catch (error) {
      console.error('Erro ao cadastrar colaborador:', error);
      setErro('Falha ao cadastrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (sucesso) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-lg text-center">
          <h1 className="text-3xl font-black text-green-700 mb-4">
            Cadastro realizado!
          </h1>

          <p className="text-gray-700 text-lg mb-6">
            {dadosRetorno.message}
          </p>

          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6 text-left">
            <p className="font-bold text-green-900">
              Seu número de colaborador:
            </p>
            <p className="text-2xl font-black text-green-700 mb-4">
              {dadosRetorno.cod_colab}
            </p>

            <p className="font-bold text-green-900">
              Seu link de indicação:
            </p>
            <a
              href={dadosRetorno.link_indicacao}
              target="_blank"
              rel="noreferrer"
              className="text-blue-700 underline break-all font-semibold"
            >
              {dadosRetorno.link_indicacao}
            </a>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            Use esse link para indicar o site e receber seu prêmio pelas compras feitas através dele.
          </p>

          <div className="flex flex-col md:flex-row gap-3">
            <Link
              to="/colaborador"
              className="flex-1 bg-blue-700 text-white py-3 rounded-xl font-bold"
            >
              Ir para Área do Colaborador
            </Link>

            <Link
              to="/"
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-bold"
            >
              Voltar ao site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <Link to="/seja-afiliado" className="text-blue-600 font-bold">
          ← Voltar
        </Link>

        <h1 className="text-2xl font-black mt-6 mb-2">
          Cadastro de Colaborador
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="nome_colab" value={formData.nome_colab} onChange={handleInputChange} placeholder="Nome completo" className="w-full p-3 border rounded-xl" required />
          <input name="email_colab" type="email" value={formData.email_colab} onChange={handleInputChange} placeholder="E-mail" className="w-full p-3 border rounded-xl" required />
          <input name="tel_colab" type="tel" value={formData.tel_colab} onChange={handleInputChange} placeholder="Telefone (DDD + número)" className="w-full p-3 border rounded-xl" required />
          <input name="cpf_colab" value={formData.cpf_colab} onChange={handleInputChange} placeholder="CPF" className="w-full p-3 border rounded-xl" required />
          <input name="pix_colab" value={formData.pix_colab} onChange={handleInputChange} placeholder="Chave PIX" className="w-full p-3 border rounded-xl" required />
          <input name="senha_login" type="password" value={formData.senha_login} onChange={handleInputChange} placeholder="Crie uma senha de acesso" className="w-full p-3 border rounded-xl" required />

          {erro && (
            <div className="bg-red-50 text-red-700 text-sm font-bold p-3 rounded-xl">
              {erro}
            </div>
          )}

          <button
            disabled={loading}
            className={`w-full text-white py-4 rounded-xl font-bold ${
              loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? 'Enviando...' : 'Confirmar Inscrição'}
          </button>
        </form>
      </div>
    </div>
  );
}