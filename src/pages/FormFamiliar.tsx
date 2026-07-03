import { useState } from 'react';

const WEBHOOK_URL = 'https://n8n.saintsolution.com.br/webhook/familiar-pessoal';

export function FormFamiliar() {
  const [mesmoTitular, setMesmoTitular] = useState(true);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [mostrarTermos, setMostrarTermos] = useState(false);
  const [termosAceitos, setTermosAceitos] = useState(false);

  const [dadosPagamento, setDadosPagamento] = useState({
    message: '',
    url_pagamento: '',
    dt_vencimento: '',
    dia_vencimento: '',
  });

  const [formData, setFormData] = useState({
    assoc_nome: '',
    assoc_cpf: '',
    assoc_nasc: '',
    assoc_email: '',
    assoc_tel: '',
    tit_nome: '',
    tit_cpf: '',
    tit_nasc: '',
    tit_email: '',
    tit_tel: '',
  });

  function formatarData(data: string) {
    if (!data) return '';
    const [ano, mes, dia] = data.split('-');
    return `${dia}-${mes}-${ano}`;
  }

  function somenteTexto(value: string) {
    return String(value || '').trim();
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setTermosAceitos(false);
    setMostrarTermos(true);
  }

  async function enviarCadastro() {
    setLoading(true);
    setErro('');

    const codColab = localStorage.getItem('referenciador_id') || '0001';

    const titular = mesmoTitular
      ? {
          tit_nome: somenteTexto(formData.assoc_nome),
          tit_cpf: somenteTexto(formData.assoc_cpf),
          tit_nasc: formatarData(formData.assoc_nasc),
          tit_email: somenteTexto(formData.assoc_email),
          tit_tel: somenteTexto(formData.assoc_tel),
          cod_plano: 'p1382',
          tipo_plano: '1382',
          status_titular: 'inativo',
        }
      : {
          tit_nome: somenteTexto(formData.tit_nome),
          tit_cpf: somenteTexto(formData.tit_cpf),
          tit_nasc: formatarData(formData.tit_nasc),
          tit_email: somenteTexto(formData.tit_email),
          tit_tel: somenteTexto(formData.tit_tel),
          cod_plano: 'p1382',
          tipo_plano: '1382',
          status_titular: 'inativo',
        };

    const totalTitulares = 1;

    const payload = {
      origem: 'site_consultoque',
      origem_form: 'familiar',
      cod_colab: codColab,
      cod_plano: 'p1382',
      tipo_plano: '1382',

      assoc_nome: somenteTexto(formData.assoc_nome),
      assoc_cpf: somenteTexto(formData.assoc_cpf),
      assoc_nasc: formatarData(formData.assoc_nasc),
      assoc_email: somenteTexto(formData.assoc_email),
      assoc_tel: somenteTexto(formData.assoc_tel),

      tit_ind: 0,
      tit_fam: totalTitulares,
      tit_total: totalTitulares,

      vl_ind: 0,
      vl_fam: 66 * totalTitulares,
      vl_total: 66 * totalTitulares,

      status_venda: 'pendente',
      titulares: [titular],

      termos_aceitos: true,
      termos_aceitos_em: new Date().toISOString(),
      versao_termos: '2026-06-26-familiar',
    };

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Erro ao enviar cadastro.');

      const data = await response.json();

      setDadosPagamento({
        message:
          data.message ||
          'Boleto emitido com sucesso. Enviamos também o link para seu e-mail.',
        url_pagamento: data.url_pagamento || data.invoiceUrl || '',
        dt_vencimento: data.dt_vencimento || data.dueDate || '',
        dia_vencimento: data.dia_vencimento || '',
      });

      setMostrarTermos(false);
      setSucesso(true);
    } catch (error) {
      console.error(error);
      setErro('Não foi possível realizar o cadastro. Tente novamente.');
      setLoading(false);
      setMostrarTermos(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-xl mx-auto mb-4">
        <button type="button" onClick={() => window.location.href = '/'} className="text-sm font-bold text-blue-600 hover:text-blue-800">
          ← Voltar e revisar os planos
        </button>
      </div>

      <section className="max-w-xl mx-auto bg-white rounded-3xl shadow-lg p-6 md:p-8">
        {sucesso ? (
          <div className="text-center py-12">
            <h2 className="text-3xl font-black text-green-600 mb-4">
              Boleto emitido!
            </h2>

            <p className="text-lg text-gray-700 mb-4">
              {dadosPagamento.message || 'Verifique seu e-mail. Enviamos o link para pagamento.'}
            </p>

            {dadosPagamento.dt_vencimento && (
              <p className="text-gray-700 mb-2">
                Vencimento do boleto: <strong>{dadosPagamento.dt_vencimento}</strong>
              </p>
            )}

            {dadosPagamento.dia_vencimento && (
              <p className="text-gray-700 mb-6">
                As próximas mensalidades vencerão sempre no dia{' '}
                <strong>{dadosPagamento.dia_vencimento}</strong>.
              </p>
            )}

            {dadosPagamento.url_pagamento && (
              <a
                href={dadosPagamento.url_pagamento}
                target="_blank"
                rel="noreferrer"
                className="inline-block bg-[#22C55E] hover:bg-[#16a34a] text-white font-black px-6 py-4 rounded-2xl uppercase"
              >
                Abrir boleto agora
              </a>
            )}
          </div>
        ) : (
          <>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 text-center">Plano Familiar</h1>
            <p className="text-center text-gray-500 mt-2 mb-8">1 titular + 3 dependentes • Teleconsulta 24h por R$ 66,00 mensais.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="text-lg font-black text-gray-900">Associado responsável pelo pagamento</h2>

              <input type="text" name="assoc_nome" value={formData.assoc_nome} onChange={handleChange} required className="w-full border border-gray-300 rounded-xl px-4 py-3" placeholder="Nome completo do responsável" />
              <input type="text" name="assoc_cpf" value={formData.assoc_cpf} onChange={handleChange} required className="w-full border border-gray-300 rounded-xl px-4 py-3" placeholder="CPF do responsável" />

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Data de nascimento</label>
                <input type="date" name="assoc_nasc" value={formData.assoc_nasc} onChange={handleChange} required className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white text-gray-900" />
              </div>

              <input type="email" name="assoc_email" value={formData.assoc_email} onChange={handleChange} required className="w-full border border-gray-300 rounded-xl px-4 py-3" placeholder="E-mail do responsável" />
              <input type="tel" name="assoc_tel" value={formData.assoc_tel} onChange={handleChange} required className="w-full border border-gray-300 rounded-xl px-4 py-3" placeholder="Telefone / WhatsApp do responsável" />

              <label className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4 cursor-pointer">
                <input type="checkbox" checked={mesmoTitular} onChange={(e) => setMesmoTitular(e.target.checked)} className="mt-1" />
                <span className="text-sm font-semibold text-green-900">O titular do plano familiar é o próprio associado.</span>
              </label>

              {!mesmoTitular && (
                <div className="space-y-5 border-t pt-5">
                  <h2 className="text-lg font-black text-gray-900">Dados do titular</h2>

                  <input type="text" name="tit_nome" value={formData.tit_nome} onChange={handleChange} required={!mesmoTitular} className="w-full border border-gray-300 rounded-xl px-4 py-3" placeholder="Nome completo do titular" />
                  <input type="text" name="tit_cpf" value={formData.tit_cpf} onChange={handleChange} required={!mesmoTitular} className="w-full border border-gray-300 rounded-xl px-4 py-3" placeholder="CPF do titular" />

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Data de nascimento do titular</label>
                    <input type="date" name="tit_nasc" value={formData.tit_nasc} onChange={handleChange} required={!mesmoTitular} className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white text-gray-900" />
                  </div>

                  <input type="email" name="tit_email" value={formData.tit_email} onChange={handleChange} required={!mesmoTitular} className="w-full border border-gray-300 rounded-xl px-4 py-3" placeholder="E-mail do titular" />
                  <input type="tel" name="tit_tel" value={formData.tit_tel} onChange={handleChange} required={!mesmoTitular} className="w-full border border-gray-300 rounded-xl px-4 py-3" placeholder="Telefone / WhatsApp do titular" />
                </div>
              )}

              {loading && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm font-semibold px-4 py-3 rounded-xl">
                  Aguarde. Estamos cadastrando seus dados e emitindo sua cobrança. Não feche esta página.
                </div>
              )}

              {erro && <div className="bg-red-50 text-red-700 text-sm font-semibold px-4 py-3 rounded-xl">{erro}</div>}

              <button type="submit" disabled={loading} className="w-full bg-[#22C55E] hover:bg-[#16a34a] disabled:opacity-60 text-white font-black py-4 rounded-2xl uppercase tracking-wide transition-all">
                {loading ? 'Processando...' : 'Enviar cadastro'}
              </button>
            </form>
          </>
        )}
      </section>

      {mostrarTermos && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-4">Termos de Adesão e Normas de Uso</h2>

            <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
              <div>
                <h3 className="font-black text-gray-900">1. TELEMEDICINA</h3>
                <p>
                  O serviço será operado pela CLICK LIFE SAÚDE (CNPJ 39.549.271/0001-36),
                  responsável pela prestação de consultas médicas à distância, nos termos da Lei nº 13.989/2020
                  e da Resolução CFM nº 2.314. O atendimento está disponível 24h por dia para médicos
                  generalistas e especialidades conforme agendamento administrativo.
                </p>
              </div>

              <div>
                <h3 className="font-black text-gray-900">2. CLUBE DE VANTAGENS</h3>
                <p>
                  Disponibilizado pela plataforma SERVIDA BENEFÍCIOS LTDA (CNPJ 62.849.702/0001-00).
                  Oferece descontos em mais de 250 parceiros em todo o país, sendo continuamente atualizado.
                </p>
              </div>

              <div>
                <h3 className="font-black text-gray-900">3. CONDIÇÕES GERAIS</h3>
                <p>O serviço é prestado exclusivamente online.</p>
                <p>A adesão é validada mediante o pagamento da taxa associativa mensal.</p>
                <p>O plano familiar dá direito a 1 titular e até 3 dependentes.</p>
                <p>O valor atual é de R$ 66,00/mês, sujeito a reajustes operacionais informados previamente.</p>
                <p>A falta de pagamento de uma única mensalidade acarretará a exclusão automática do associado.</p>
                <p>O associado declara a veracidade de todos os dados digitados no momento da adesão.</p>
                <p>É facultado ao SESSP realizar a substituição de convênios e serviços, mantendo a qualidade da entrega.</p>
                <p className="font-bold">
                  IMPORTANTE: A telemedicina NÃO substitui prontos-socorros em casos de emergência grave.
                  Em risco de vida, ligue 192.
                </p>
              </div>
            </div>

            <label className="flex items-start gap-3 mt-6 bg-green-50 border border-green-200 rounded-xl p-4 cursor-pointer">
              <input type="checkbox" checked={termosAceitos} onChange={(e) => setTermosAceitos(e.target.checked)} className="mt-1" />
              <span className="text-sm font-semibold text-green-900">
                Li e aceito os Termos de Adesão e Normas de Uso.
              </span>
            </label>

            <div className="flex flex-col md:flex-row gap-3 mt-6">
              <button type="button" onClick={() => setMostrarTermos(false)} disabled={loading} className="w-full md:w-1/2 bg-slate-200 text-slate-700 font-black py-3 rounded-xl">
                Voltar
              </button>

              <button type="button" onClick={enviarCadastro} disabled={!termosAceitos || loading} className="w-full md:w-1/2 bg-[#22C55E] hover:bg-[#16a34a] disabled:opacity-50 text-white font-black py-3 rounded-xl">
                {loading ? 'Emitindo...' : 'Confirmar adesão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}