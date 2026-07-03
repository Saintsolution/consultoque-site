import { useState } from 'react';

const WEBHOOK_URL = 'https://n8n.saintsolution.com.br/webhook/coletivo-empresarial';

type Titular = {
  tipo: 'individual' | 'familiar';
  tit_nome: string;
  tit_cpf: string;
  tit_nasc: string;
  tit_email: string;
  tit_tel: string;
};

export function FormColetivo() {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const [qtdInd, setQtdInd] = useState(0);
  const [qtdFam, setQtdFam] = useState(0);

  const [formData, setFormData] = useState({
    assoc_nome: '',
    assoc_cpf: '',
    assoc_nasc: '',
    assoc_email: '',
    assoc_tel: '',
  });

  const [titulares, setTitulares] = useState<Titular[]>([]);

  const totalTitulares = qtdInd + qtdFam;
  const precoInd = totalTitulares >= 10 ? 30 : 33;
  const precoFam = totalTitulares >= 10 ? 60 : 66;
  const vlTotal = qtdInd * precoInd + qtdFam * precoFam;

  // Função para formatar a data de aaaa-mm-dd para dd-mm-aaaa
  function formatarData(data: string) {
    if (!data) return '';
    const [ano, mes, dia] = data.split('-');
    return `${dia}-${mes}-${ano}`;
  }

  // Função para limpar espaços em branco
  function somenteTexto(value: string) {
    return String(value || '').trim();
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function atualizarQuantidades(novoInd: number, novoFam: number) {
    setQtdInd(novoInd);
    setQtdFam(novoFam);

    const novosTitulares: Titular[] = [];
    for (let i = 0; i < novoInd; i++) {
      novosTitulares.push({
        tipo: 'individual',
        tit_nome: titulares[i]?.tit_nome || '',
        tit_cpf: titulares[i]?.tit_cpf || '',
        tit_nasc: titulares[i]?.tit_nasc || '',
        tit_email: titulares[i]?.tit_email || '',
        tit_tel: titulares[i]?.tit_tel || '',
      });
    }
    for (let i = 0; i < novoFam; i++) {
      const indexAntigo = novoInd + i;
      novosTitulares.push({
        tipo: 'familiar',
        tit_nome: titulares[indexAntigo]?.tit_nome || '',
        tit_cpf: titulares[indexAntigo]?.tit_cpf || '',
        tit_nasc: titulares[indexAntigo]?.tit_nasc || '',
        tit_email: titulares[indexAntigo]?.tit_email || '',
        tit_tel: titulares[indexAntigo]?.tit_tel || '',
      });
    }
    setTitulares(novosTitulares);
  }

  function handleTitularChange(index: number, campo: keyof Titular, valor: string) {
    setTitulares((prev) =>
      prev.map((titular, i) =>
        i === index ? { ...titular, [campo]: valor } : titular
      )
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro('');

    if (totalTitulares === 0) {
      setErro('Informe pelo menos 1 titular.');
      setLoading(false);
      return;
    }

    const codColab = localStorage.getItem('referenciador_id') || '0001';

    const titularesPayload = titulares.map((titular) => ({
      tit_nome: somenteTexto(titular.tit_nome),
      tit_cpf: somenteTexto(titular.tit_cpf),
      tit_nasc: formatarData(titular.tit_nasc),
      tit_email: somenteTexto(titular.tit_email),
      tit_tel: somenteTexto(titular.tit_tel),
      cod_plano: titular.tipo === 'individual' ? 'c1380' : 'c1382',
      tipo_plano: titular.tipo === 'individual' ? '1380' : '1382',
      tipo_titular: titular.tipo,
      status_titular: 'inativo',
    }));

    const payload = {
      origem: 'site_consultoque',
      origem_form: 'coletivo',
      cod_colab: codColab,
      cod_plano: 'coletivo',
      tipo_plano: 'coletivo',
      
      assoc_nome: somenteTexto(formData.assoc_nome),
      assoc_cpf: somenteTexto(formData.assoc_cpf),
      assoc_nasc: formatarData(formData.assoc_nasc),
      assoc_email: somenteTexto(formData.assoc_email),
      assoc_tel: somenteTexto(formData.assoc_tel),
      
      tit_ind: qtdInd,
      tit_fam: qtdFam,
      tit_total: totalTitulares,
      
      vl_ind: precoInd,
      vl_fam: precoFam,
      vl_total: vlTotal,
      
      status_venda: 'pendente',
      titulares: titularesPayload,
    };

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Erro ao enviar cadastro.');

      setSucesso(true);
    } catch (error) {
      console.error(error);
      setErro('Não foi possível realizar o cadastro. Tente novamente.');
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto mb-4">
        <button type="button" onClick={() => window.location.href = '/'} className="text-sm font-bold text-blue-600 hover:text-blue-800">
          ← Voltar e revisar os planos
        </button>
      </div>

      <section className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg p-6 md:p-8">
        {sucesso ? (
          <div className="text-center py-12">
            <h2 className="text-3xl font-black text-green-600 mb-4">Cadastro realizado!</h2>
            <p className="text-lg text-gray-700">Verifique seu e-mail, enviamos o link para acessar o pagamento da sua mensalidade.</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 text-center">Plano Coletivo</h1>
            <p className="text-center text-gray-500 mt-2 mb-8">A partir de 10 titulares, valores reduzidos: R$ 30 individual e R$ 60 familiar.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-lg font-black text-gray-900">Associado responsável</h2>
              <input type="text" name="assoc_nome" value={formData.assoc_nome} onChange={handleChange} required className="w-full border border-gray-300 rounded-xl px-4 py-3" placeholder="Nome completo" />
              <input type="text" name="assoc_cpf" value={formData.assoc_cpf} onChange={handleChange} required className="w-full border border-gray-300 rounded-xl px-4 py-3" placeholder="CPF" />
              <input type="date" name="assoc_nasc" value={formData.assoc_nasc} onChange={handleChange} required className="w-full border border-gray-300 rounded-xl px-4 py-3" />
              <input type="email" name="assoc_email" value={formData.assoc_email} onChange={handleChange} required className="w-full border border-gray-300 rounded-xl px-4 py-3" placeholder="E-mail" />
              <input type="tel" name="assoc_tel" value={formData.assoc_tel} onChange={handleChange} required className="w-full border border-gray-300 rounded-xl px-4 py-3" placeholder="Telefone / WhatsApp" />

              <div className="grid md:grid-cols-2 gap-4 border-t pt-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Qtd. Individuais</label>
                  <input type="number" min="0" value={qtdInd} onChange={(e) => atualizarQuantidades(Number(e.target.value), qtdFam)} className="w-full border border-gray-300 rounded-xl px-4 py-3" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Qtd. Familiares</label>
                  <input type="number" min="0" value={qtdFam} onChange={(e) => atualizarQuantidades(qtdInd, Number(e.target.value))} className="w-full border border-gray-300 rounded-xl px-4 py-3" />
                </div>
              </div>

              {titulares.map((titular, index) => (
                <div key={index} className="border rounded-2xl p-4 space-y-3 bg-slate-50">
                  <h3 className="font-black">Titular {index + 1} ({titular.tipo})</h3>
                  <input type="text" value={titular.tit_nome} onChange={(e) => handleTitularChange(index, 'tit_nome', e.target.value)} required className="w-full border rounded-xl px-4 py-3" placeholder="Nome completo" />
                  <input type="text" value={titular.tit_cpf} onChange={(e) => handleTitularChange(index, 'tit_cpf', e.target.value)} required className="w-full border rounded-xl px-4 py-3" placeholder="CPF" />
                  <input type="date" value={titular.tit_nasc} onChange={(e) => handleTitularChange(index, 'tit_nasc', e.target.value)} required className="w-full border rounded-xl px-4 py-3" />
                  <input type="email" value={titular.tit_email} onChange={(e) => handleTitularChange(index, 'tit_email', e.target.value)} required className="w-full border rounded-xl px-4 py-3" placeholder="E-mail" />
                  <input type="tel" value={titular.tit_tel} onChange={(e) => handleTitularChange(index, 'tit_tel', e.target.value)} required className="w-full border rounded-xl px-4 py-3" placeholder="WhatsApp" />
                </div>
              ))}

              {erro && <div className="text-red-600 font-semibold">{erro}</div>}

              <button type="submit" disabled={loading} className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-2xl uppercase transition-all">
                {loading ? 'Processando...' : 'Enviar cadastro'}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}