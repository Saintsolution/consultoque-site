import { useEffect, useRef, useState } from 'react';

const WEBHOOK_URL =
  'https://n8n.saintsolution.com.br/webhook/individual-pessoal';

const WEBHOOK_CONSULTA_CPF =
  'https://n8n.saintsolution.com.br/webhook/BuscaCPF';

export function FormIndividual() {
  const [mesmoTitular, setMesmoTitular] = useState(true);
  const [loading, setLoading] = useState(false);
  const [consultandoCpf, setConsultandoCpf] = useState(false);
  const [dadosValidados, setDadosValidados] = useState(false);
  const [cpfBloqueado, setCpfBloqueado] = useState(false);

  const [erro, setErro] = useState('');
  const [erroValidacao, setErroValidacao] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [mostrarTermos, setMostrarTermos] = useState(false);
  const [termosAceitos, setTermosAceitos] = useState(false);

  const ultimoCpfConsultadoRef = useRef('');
  const consultaAtualRef = useRef(0);

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

  useEffect(() => {
    const cpf = somenteNumeros(formData.assoc_cpf);

    if (
      dadosValidados ||
      cpfBloqueado ||
      consultandoCpf ||
      cpf.length !== 11 ||
      !cpfValido(cpf) ||
      cpf === ultimoCpfConsultadoRef.current
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      consultarCpf(cpf);
    }, 700);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    formData.assoc_cpf,
    dadosValidados,
    cpfBloqueado,
    consultandoCpf,
  ]);

  function formatarData(data: string) {
    if (!data) return '';

    const [ano, mes, dia] = data.split('-');

    if (!ano || !mes || !dia) return '';

    return `${dia}-${mes}-${ano}`;
  }

  function somenteTexto(value: string) {
    return String(value || '').trim();
  }

  function somenteNumeros(value: string) {
    return String(value || '').replace(/\D/g, '');
  }

  function formatarCpfVisual(value: string) {
    const numeros = somenteNumeros(value).slice(0, 11);

    return numeros
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1-$2');
  }

  function cpfValido(value: string) {
    const cpf = somenteNumeros(value);

    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    let soma = 0;

    for (let i = 0; i < 9; i++) {
      soma += Number(cpf[i]) * (10 - i);
    }

    let primeiroDigito = (soma * 10) % 11;

    if (primeiroDigito === 10) {
      primeiroDigito = 0;
    }

    if (primeiroDigito !== Number(cpf[9])) {
      return false;
    }

    soma = 0;

    for (let i = 0; i < 10; i++) {
      soma += Number(cpf[i]) * (11 - i);
    }

    let segundoDigito = (soma * 10) % 11;

    if (segundoDigito === 10) {
      segundoDigito = 0;
    }

    return segundoDigito === Number(cpf[10]);
  }

  function converterNascimentoParaInput(value: string) {
    const data = String(value || '').trim();

    if (!data) return '';

    if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      return data;
    }

    const partes = data.split(/[\/\-]/);

    if (partes.length !== 3) {
      return '';
    }

    const primeira = partes[0];
    const segunda = partes[1];
    const terceira = partes[2];

    if (primeira.length === 4) {
      return `${primeira.padStart(4, '0')}-${segunda.padStart(
        2,
        '0'
      )}-${terceira.padStart(2, '0')}`;
    }

    return `${terceira.padStart(4, '0')}-${segunda.padStart(
      2,
      '0'
    )}-${primeira.padStart(2, '0')}`;
  }

  function calcularIdade(dataNascimento: string) {
    if (!dataNascimento) return null;

    const [ano, mes, dia] = dataNascimento
      .split('-')
      .map(Number);

    if (!ano || !mes || !dia) return null;

    const nascimento = new Date(ano, mes - 1, dia);

    const dataValida =
      nascimento.getFullYear() === ano &&
      nascimento.getMonth() === mes - 1 &&
      nascimento.getDate() === dia;

    if (!dataValida) return null;

    const hoje = new Date();

    let idade = hoje.getFullYear() - ano;

    const aindaNaoFezAniversario =
      hoje.getMonth() < mes - 1 ||
      (
        hoje.getMonth() === mes - 1 &&
        hoje.getDate() < dia
      );

    if (aindaNaoFezAniversario) {
      idade--;
    }

    return idade;
  }

  function limparDadosConsultados() {
    setFormData((prev) => ({
      ...prev,
      assoc_nome: '',
      assoc_nasc: '',
      assoc_email: '',
      assoc_tel: '',
    }));

    setDadosValidados(false);
    setCpfBloqueado(false);
    setErroValidacao('');
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = e.target;

    if (
      dadosValidados &&
      (
        name === 'assoc_cpf' ||
        name === 'assoc_nome' ||
        name === 'assoc_nasc'
      )
    ) {
      return;
    }

    let novoValor = value;

    if (name === 'assoc_cpf' || name === 'tit_cpf') {
      novoValor = formatarCpfVisual(value);
    }

    if (name === 'assoc_cpf') {
      const cpfNovo = somenteNumeros(novoValor);
      const cpfAnterior = somenteNumeros(formData.assoc_cpf);

      if (cpfNovo !== cpfAnterior) {
        ultimoCpfConsultadoRef.current = '';
        limparDadosConsultados();
      }

      if (cpfNovo.length === 11 && !cpfValido(cpfNovo)) {
        setErroValidacao('Informe um CPF válido.');
      } else {
        setErroValidacao('');
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: novoValor,
    }));
  }

  async function consultarCpf(cpfRecebido: string) {
    const cpf = somenteNumeros(cpfRecebido);

    if (cpf.length !== 11) {
      return;
    }

    if (!cpfValido(cpf)) {
      setErroValidacao('Informe um CPF válido.');
      return;
    }

    ultimoCpfConsultadoRef.current = cpf;

    const numeroConsulta = consultaAtualRef.current + 1;
    consultaAtualRef.current = numeroConsulta;

    setConsultandoCpf(true);
    setErro('');
    setErroValidacao('');

    try {
      const response = await fetch(WEBHOOK_CONSULTA_CPF, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cpf,
        }),
      });

      let data: any = null;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          'O servidor de consulta retornou uma resposta inválida.'
        );
      }

      if (numeroConsulta !== consultaAtualRef.current) {
        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.mensagem ||
            'Não foi possível consultar o CPF informado.'
        );
      }

      const nome = somenteTexto(
        data?.nome ||
          data?.nome_completo ||
          data?.name ||
          ''
      );

      const nascimentoRecebido =
        data?.data_nascimento ||
        data?.nascimento ||
        data?.birth_date ||
        data?.birthdate ||
        '';

      const nascimento =
        converterNascimentoParaInput(nascimentoRecebido);

      if (!nome || !nascimento) {
        throw new Error(
          'A consulta não retornou nome e data de nascimento.'
        );
      }

      const idade = calcularIdade(nascimento);

      if (idade === null) {
        throw new Error(
          'A consulta retornou uma data de nascimento inválida.'
        );
      }

      if (idade < 18) {
        setFormData((prev) => ({
          ...prev,
          assoc_nome: nome,
          assoc_cpf: formatarCpfVisual(cpf),
          assoc_nasc: nascimento,
        }));

        setCpfBloqueado(true);
        setDadosValidados(false);

        setErroValidacao(
          data?.mensagem ||
            'A contratação não pode continuar. O responsável precisa ser maior de 18 anos.'
        );

        return;
      }

      if (
        data?.maior_idade === false ||
        data?.status === 'bloqueado'
      ) {
        setFormData((prev) => ({
          ...prev,
          assoc_nome: nome,
          assoc_cpf: formatarCpfVisual(cpf),
          assoc_nasc: nascimento,
        }));

        setCpfBloqueado(true);
        setDadosValidados(false);

        setErroValidacao(
          data?.mensagem ||
            'A contratação não pode continuar. O responsável precisa ser maior de 18 anos.'
        );

        return;
      }

      setFormData((prev) => ({
        ...prev,
        assoc_nome: nome,
        assoc_cpf: formatarCpfVisual(cpf),
        assoc_nasc: nascimento,
      }));

      setCpfBloqueado(false);
      setDadosValidados(true);
      setErroValidacao('');
    } catch (error) {
      console.error(error);

      ultimoCpfConsultadoRef.current = '';

      setFormData((prev) => ({
        ...prev,
        assoc_nome: '',
        assoc_nasc: '',
      }));

      setDadosValidados(false);
      setCpfBloqueado(false);

      setErroValidacao(
        error instanceof Error
          ? error.message
          : 'Não foi possível consultar o CPF. Tente novamente.'
      );
    } finally {
      if (numeroConsulta === consultaAtualRef.current) {
        setConsultandoCpf(false);
      }
    }
  }

  function handleMesmoTitular(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const marcado = e.target.checked;

    setMesmoTitular(marcado);

    if (marcado) {
      setFormData((prev) => ({
        ...prev,
        tit_nome: '',
        tit_cpf: '',
        tit_nasc: '',
        tit_email: '',
        tit_tel: '',
      }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setErro('');

    if (!dadosValidados) {
      setErro(
        'Consulte e valide o CPF do responsável antes de continuar.'
      );
      return;
    }

    setTermosAceitos(false);
    setMostrarTermos(true);
  }

  async function enviarCadastro() {
    if (!dadosValidados) {
      setErro(
        'Os dados do responsável ainda não foram validados.'
      );

      setMostrarTermos(false);
      return;
    }

    setLoading(true);
    setErro('');

    const codColab =
      localStorage.getItem('referenciador_id') ||
      '0001';

    const titular = mesmoTitular
      ? {
          tit_nome: somenteTexto(formData.assoc_nome),
          tit_cpf: somenteNumeros(formData.assoc_cpf),
          tit_nasc: formatarData(formData.assoc_nasc),
          tit_email: somenteTexto(formData.assoc_email),
          tit_tel: somenteTexto(formData.assoc_tel),
          cod_plano: 'p1380',
          tipo_plano: '1380',
          status_titular: 'inativo',
        }
      : {
          tit_nome: somenteTexto(formData.tit_nome),
          tit_cpf: somenteNumeros(formData.tit_cpf),
          tit_nasc: formatarData(formData.tit_nasc),
          tit_email: somenteTexto(formData.tit_email),
          tit_tel: somenteTexto(formData.tit_tel),
          cod_plano: 'p1380',
          tipo_plano: '1380',
          status_titular: 'inativo',
        };

    const totalTitulares = 1;

    const payload = {
      origem: 'site_consultoque',
      origem_form: 'individual',
      cod_colab: codColab,
      cod_plano: 'p1380',
      tipo_plano: '1380',

      assoc_nome: somenteTexto(formData.assoc_nome),
      assoc_cpf: somenteNumeros(formData.assoc_cpf),
      assoc_nasc: formatarData(formData.assoc_nasc),
      assoc_email: somenteTexto(formData.assoc_email),
      assoc_tel: somenteTexto(formData.assoc_tel),

      tit_ind: totalTitulares,
      tit_fam: 0,
      tit_total: totalTitulares,

      vl_ind: 33 * totalTitulares,
      vl_fam: 0,
      vl_total: 33 * totalTitulares,

      status_venda: 'pendente',
      titulares: [titular],

      termos_aceitos: true,
      termos_aceitos_em: new Date().toISOString(),
      versao_termos: '2026-06-26-individual',
    };

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar cadastro.');
      }

      const data = await response.json();

      setDadosPagamento({
        message:
          data.message ||
          'Boleto emitido com sucesso. Enviamos também o link para seu e-mail.',

        url_pagamento:
          data.url_pagamento ||
          data.invoiceUrl ||
          '',

        dt_vencimento:
          data.dt_vencimento ||
          data.dueDate ||
          '',

        dia_vencimento:
          data.dia_vencimento ||
          '',
      });

      setMostrarTermos(false);
      setSucesso(true);
    } catch (error) {
      console.error(error);

      setErro(
        'Não foi possível realizar o cadastro. Tente novamente.'
      );

      setMostrarTermos(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-xl mx-auto mb-4">
        <button
          type="button"
          onClick={() => {
            window.location.href = '/';
          }}
          className="text-sm font-bold text-blue-600 hover:text-blue-800"
        >
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
              {dadosPagamento.message ||
                'Verifique seu e-mail. Enviamos o link para pagamento.'}
            </p>

            {dadosPagamento.dt_vencimento && (
              <p className="text-gray-700 mb-2">
                Vencimento do boleto:{' '}
                <strong>
                  {dadosPagamento.dt_vencimento}
                </strong>
              </p>
            )}

            {dadosPagamento.dia_vencimento && (
              <p className="text-gray-700 mb-6">
                As próximas mensalidades vencerão
                sempre no dia{' '}
                <strong>
                  {dadosPagamento.dia_vencimento}
                </strong>
                .
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
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 text-center">
              Plano Individual
            </h1>

            <p className="text-center text-gray-500 mt-2 mb-8">
              1 titular • Teleconsulta 24h por
              R$ 33,00 mensais.
            </p>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <h2 className="text-lg font-black text-gray-900">
                  Associado responsável pelo pagamento
                </h2>

                <div className="mt-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl px-4 py-3">
                  <p className="text-sm font-bold">
                    A contratação somente pode ser
                    realizada por uma pessoa maior de
                    18 anos.
                  </p>

                  <p className="text-xs mt-1">
                    Ao informar o CPF, o sistema
                    consultará automaticamente o nome e
                    a data de nascimento do responsável.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  CPF do responsável
                </label>

                <input
                  type="text"
                  name="assoc_cpf"
                  value={formData.assoc_cpf}
                  onChange={handleChange}
                  required
                  disabled={
                    dadosValidados ||
                    cpfBloqueado ||
                    consultandoCpf
                  }
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={14}
                  className={`w-full border rounded-xl px-4 py-3 ${
                    dadosValidados
                      ? 'border-green-300 bg-green-50 text-gray-700 cursor-not-allowed'
                      : cpfBloqueado
                        ? 'border-red-300 bg-red-50 text-gray-700 cursor-not-allowed'
                        : consultandoCpf
                          ? 'border-blue-300 bg-blue-50 text-gray-700 cursor-wait'
                          : 'border-gray-300 bg-white'
                  }`}
                  placeholder="Digite o CPF"
                />

                {!dadosValidados &&
                  !cpfBloqueado &&
                  !consultandoCpf &&
                  somenteNumeros(formData.assoc_cpf).length > 0 &&
                  somenteNumeros(formData.assoc_cpf).length < 11 && (
                    <p className="text-xs text-gray-500 mt-1">
                      A consulta será iniciada quando
                      os 11 números forem preenchidos.
                    </p>
                  )}
              </div>

              {consultandoCpf && (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm font-semibold px-4 py-3 rounded-xl">
                  Consultando CPF e verificando a
                  maioridade...
                </div>
              )}

              {erroValidacao && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-semibold px-4 py-3 rounded-xl">
                  {erroValidacao}
                </div>
              )}

              {(dadosValidados || cpfBloqueado) && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Nome completo
                    </label>

                    <input
                      type="text"
                      value={formData.assoc_nome}
                      disabled
                      className={`w-full border rounded-xl px-4 py-3 text-gray-700 cursor-not-allowed ${
                        dadosValidados
                          ? 'border-green-300 bg-green-50'
                          : 'border-red-300 bg-red-50'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Data de nascimento
                    </label>

                    <input
                      type="date"
                      value={formData.assoc_nasc}
                      disabled
                      className={`w-full border rounded-xl px-4 py-3 text-gray-700 cursor-not-allowed ${
                        dadosValidados
                          ? 'border-green-300 bg-green-50'
                          : 'border-red-300 bg-red-50'
                      }`}
                    />
                  </div>
                </>
              )}

              {dadosValidados && (
                <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-4">
                  <p className="font-black">
                    CPF confirmado com sucesso.
                  </p>

                  <p className="text-sm mt-1">
                    Nome, CPF e nascimento foram
                    confirmados e não podem ser
                    alterados nesta contratação.
                  </p>
                </div>
              )}

              {dadosValidados && (
                <>
                  <div className="border-t border-gray-200 pt-5">
                    <h2 className="text-lg font-black text-gray-900">
                      Dados para contato
                    </h2>
                  </div>

                  <input
                    type="email"
                    name="assoc_email"
                    value={formData.assoc_email}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3"
                    placeholder="E-mail do responsável"
                  />

                  <input
                    type="tel"
                    name="assoc_tel"
                    value={formData.assoc_tel}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3"
                    placeholder="Telefone / WhatsApp do responsável"
                  />

                  <label className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mesmoTitular}
                      onChange={handleMesmoTitular}
                      className="mt-1"
                    />

                    <span className="text-sm font-semibold text-blue-900">
                      Eu sou o titular do plano.
                      Desmarque esta opção se outra
                      pessoa utilizará o plano.
                    </span>
                  </label>

                  {!mesmoTitular && (
                    <div className="space-y-5 border-t pt-5">
                      <div>
                        <h2 className="text-lg font-black text-gray-900">
                          Dados do titular
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                          Informe os dados da pessoa
                          que utilizará o plano.
                        </p>
                      </div>

                      <input
                        type="text"
                        name="tit_nome"
                        value={formData.tit_nome}
                        onChange={handleChange}
                        required={!mesmoTitular}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3"
                        placeholder="Nome completo do titular"
                      />

                      <input
                        type="text"
                        name="tit_cpf"
                        value={formData.tit_cpf}
                        onChange={handleChange}
                        required={!mesmoTitular}
                        inputMode="numeric"
                        maxLength={14}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3"
                        placeholder="CPF do titular"
                      />

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                          Data de nascimento do titular
                        </label>

                        <input
                          type="date"
                          name="tit_nasc"
                          value={formData.tit_nasc}
                          onChange={handleChange}
                          required={!mesmoTitular}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white text-gray-900"
                        />
                      </div>

                      <input
                        type="email"
                        name="tit_email"
                        value={formData.tit_email}
                        onChange={handleChange}
                        required={!mesmoTitular}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3"
                        placeholder="E-mail do titular"
                      />

                      <input
                        type="tel"
                        name="tit_tel"
                        value={formData.tit_tel}
                        onChange={handleChange}
                        required={!mesmoTitular}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3"
                        placeholder="Telefone / WhatsApp do titular"
                      />
                    </div>
                  )}

                  {loading && (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm font-semibold px-4 py-3 rounded-xl">
                      Aguarde. Estamos cadastrando
                      seus dados e emitindo sua
                      cobrança. Não feche esta página.
                    </div>
                  )}

                  {erro && (
                    <div className="bg-red-50 text-red-700 text-sm font-semibold px-4 py-3 rounded-xl">
                      {erro}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#22C55E] hover:bg-[#16a34a] disabled:opacity-60 text-white font-black py-4 rounded-2xl uppercase tracking-wide transition-all"
                  >
                    {loading
                      ? 'Processando...'
                      : 'Enviar cadastro'}
                  </button>
                </>
              )}
            </form>
          </>
        )}
      </section>

      {mostrarTermos && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-4">
              Termos de Adesão e Normas de Uso
            </h2>

            <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
              <div>
                <h3 className="font-black text-gray-900">
                  1. TELEMEDICINA
                </h3>

                <p>
                  O serviço será operado pela CLICK
                  LIFE SAÚDE (CNPJ
                  39.549.271/0001-36), responsável
                  pela prestação de consultas médicas
                  à distância, nos termos da Lei nº
                  13.989/2020 e da Resolução CFM nº
                  2.314. O atendimento está disponível
                  24h por dia para médicos generalistas
                  e especialidades conforme agendamento
                  administrativo.
                </p>
              </div>

              <div>
                <h3 className="font-black text-gray-900">
                  2. CLUBE DE VANTAGENS
                </h3>

                <p>
                  Disponibilizado pela plataforma
                  SERVIDA BENEFÍCIOS LTDA (CNPJ
                  62.849.702/0001-00). Oferece
                  descontos em mais de 250 parceiros
                  em todo o país, sendo continuamente
                  atualizado.
                </p>
              </div>

              <div>
                <h3 className="font-black text-gray-900">
                  3. CONDIÇÕES GERAIS
                </h3>

                <p>
                  O serviço é prestado exclusivamente
                  online.
                </p>

                <p>
                  A adesão é validada mediante o
                  pagamento da taxa associativa mensal.
                </p>

                <p>
                  O valor atual é de R$ 33,00/mês,
                  sujeito a reajustes operacionais
                  informados previamente.
                </p>

                <p>
                  A falta de pagamento de uma única
                  mensalidade acarretará a exclusão
                  automática do associado.
                </p>

                <p>
                  O associado declara a veracidade de
                  todos os dados digitados no momento
                  da adesão.
                </p>

                <p>
                  É facultado ao SESSP realizar a
                  substituição de convênios e serviços,
                  mantendo a qualidade da entrega.
                </p>

                <p className="font-bold">
                  IMPORTANTE: A telemedicina NÃO
                  substitui prontos-socorros em casos
                  de emergência grave. Em risco de
                  vida, ligue 192.
                </p>
              </div>
            </div>

            <label className="flex items-start gap-3 mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 cursor-pointer">
              <input
                type="checkbox"
                checked={termosAceitos}
                onChange={(e) =>
                  setTermosAceitos(e.target.checked)
                }
                className="mt-1"
              />

              <span className="text-sm font-semibold text-blue-900">
                Li e aceito os Termos de Adesão e
                Normas de Uso.
              </span>
            </label>

            <div className="flex flex-col md:flex-row gap-3 mt-6">
              <button
                type="button"
                onClick={() =>
                  setMostrarTermos(false)
                }
                disabled={loading}
                className="w-full md:w-1/2 bg-slate-200 text-slate-700 font-black py-3 rounded-xl"
              >
                Voltar
              </button>

              <button
                type="button"
                onClick={enviarCadastro}
                disabled={
                  !termosAceitos || loading
                }
                className="w-full md:w-1/2 bg-[#22C55E] hover:bg-[#16a34a] disabled:opacity-50 text-white font-black py-3 rounded-xl"
              >
                {loading
                  ? 'Emitindo...'
                  : 'Confirmar adesão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}