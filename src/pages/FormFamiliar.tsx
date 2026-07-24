import { useEffect, useRef, useState } from 'react';
import {
  TermoAdesaoAssociado,
  VERSAO_TERMO_ASSOCIADO,
} from '../components/TermoAdesaoAssociado';
import { SolicitacaoValidacaoCpf } from '../components/SolicitacaoValidacaoCpf';

const WEBHOOK_URL =
  'https://n8n.saintsolution.com.br/webhook/familiar-pessoal';

const WEBHOOK_CONSULTA_CPF =
  'https://n8n.saintsolution.com.br/webhook/BuscaCPF';

export function FormFamiliar() {
  const [mesmoTitular, setMesmoTitular] = useState(true);
  const [loading, setLoading] = useState(false);

  const [consultandoCpf, setConsultandoCpf] = useState(false);
  const [dadosValidados, setDadosValidados] = useState(false);
  const [cpfBloqueado, setCpfBloqueado] = useState(false);

  const [consultandoCpfTitular, setConsultandoCpfTitular] =
    useState(false);

  const [titularValidado, setTitularValidado] =
    useState(false);

  const [erro, setErro] = useState('');
  const [erroValidacao, setErroValidacao] = useState('');
  const [erroTitular, setErroTitular] = useState('');
  const [
    solicitarAtendimentoAssociado,
    setSolicitarAtendimentoAssociado,
  ] = useState(false);
  const [
    solicitarAtendimentoTitular,
    setSolicitarAtendimentoTitular,
  ] = useState(false);
  const [
    solicitacaoCpfAberta,
    setSolicitacaoCpfAberta,
  ] = useState<'responsavel' | 'titular' | null>(
    null
  );

  const [sucesso, setSucesso] = useState(false);
  const [mostrarTermos, setMostrarTermos] = useState(false);
  const [termosAceitos, setTermosAceitos] = useState(false);

  const ultimoCpfConsultadoRef = useRef('');
  const consultaAtualRef = useRef(0);

  const ultimoCpfTitularConsultadoRef = useRef('');
  const consultaTitularAtualRef = useRef(0);

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
      consultarCpfAssociado(cpf);
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

  useEffect(() => {
    if (mesmoTitular) {
      return;
    }

    const cpf = somenteNumeros(formData.tit_cpf);

    if (
      titularValidado ||
      consultandoCpfTitular ||
      cpf.length !== 11 ||
      !cpfValido(cpf) ||
      cpf === ultimoCpfTitularConsultadoRef.current
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      consultarCpfTitular(cpf);
    }, 700);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    formData.tit_cpf,
    mesmoTitular,
    titularValidado,
    consultandoCpfTitular,
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
    setSolicitarAtendimentoAssociado(false);
  }

  function limparDadosTitular() {
    setFormData((prev) => ({
      ...prev,
      tit_nome: '',
      tit_nasc: '',
      tit_email: '',
      tit_tel: '',
    }));

    setTitularValidado(false);
    setErroTitular('');
    setSolicitarAtendimentoTitular(false);
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

    if (
      titularValidado &&
      (
        name === 'tit_cpf' ||
        name === 'tit_nome' ||
        name === 'tit_nasc'
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

    if (name === 'tit_cpf') {
      const cpfNovo = somenteNumeros(novoValor);
      const cpfAnterior = somenteNumeros(formData.tit_cpf);

      if (cpfNovo !== cpfAnterior) {
        ultimoCpfTitularConsultadoRef.current = '';
        limparDadosTitular();
      }

      if (cpfNovo.length === 11 && !cpfValido(cpfNovo)) {
        setErroTitular(
          'Informe um CPF válido para o titular.'
        );
      } else {
        setErroTitular('');
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: novoValor,
    }));
  }

  async function consultarCpfAssociado(
    cpfRecebido: string
  ) {
    const cpf = somenteNumeros(cpfRecebido);

    if (cpf.length !== 11) {
      return;
    }

    if (!cpfValido(cpf)) {
      setErroValidacao('Informe um CPF válido.');
      return;
    }

    ultimoCpfConsultadoRef.current = cpf;

    const numeroConsulta =
      consultaAtualRef.current + 1;

    consultaAtualRef.current = numeroConsulta;

    setConsultandoCpf(true);
    setErro('');
    setErroValidacao('');
    setSolicitarAtendimentoAssociado(false);

    try {
      const response = await fetch(
        WEBHOOK_CONSULTA_CPF,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cpf,
            tipo_consulta: 'associado',
          }),
        }
      );

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

      /*
       * O n8n pode devolver HTTP 200 com o erro
       * de negócio normalizado no corpo da resposta.
       */
      if (
        data?.status === 'erro' ||
        data?.cpf_validado === false ||
        data?.liberar_cadastro === false
      ) {
        setFormData((prev) => ({
          ...prev,
          assoc_nome: '',
          assoc_nasc: '',
        }));

        setDadosValidados(false);
        setCpfBloqueado(false);
        setSolicitarAtendimentoAssociado(
          data?.solicitar_atendimento === true
        );

        setErroValidacao(
          data?.mensagem ||
            'Não foi possível confirmar este CPF. Entre em contato com nossa equipe.'
        );

        return;
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
        converterNascimentoParaInput(
          nascimentoRecebido
        );

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

      if (
        idade < 18 ||
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
      setSolicitarAtendimentoAssociado(false);
    } catch (error) {
      console.error(error);

      /*
       * Mantém o CPF como consultado para o
       * useEffect não repetir a mesma requisição.
       */
      ultimoCpfConsultadoRef.current = cpf;

      setFormData((prev) => ({
        ...prev,
        assoc_nome: '',
        assoc_nasc: '',
      }));

      setDadosValidados(false);
      setCpfBloqueado(false);
      setSolicitarAtendimentoAssociado(true);

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

  async function consultarCpfTitular(
    cpfRecebido: string
  ) {
    const cpf = somenteNumeros(cpfRecebido);

    if (cpf.length !== 11) {
      return;
    }

    if (!cpfValido(cpf)) {
      setErroTitular(
        'Informe um CPF válido para o titular.'
      );
      return;
    }

    ultimoCpfTitularConsultadoRef.current = cpf;

    const numeroConsulta =
      consultaTitularAtualRef.current + 1;

    consultaTitularAtualRef.current =
      numeroConsulta;

    setConsultandoCpfTitular(true);
    setErro('');
    setErroTitular('');
    setSolicitarAtendimentoTitular(false);

    try {
      const response = await fetch(
        WEBHOOK_CONSULTA_CPF,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cpf,
            tipo_consulta: 'titular',
          }),
        }
      );

      let data: any = null;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          'O servidor de consulta retornou uma resposta inválida.'
        );
      }

      if (
        numeroConsulta !==
        consultaTitularAtualRef.current
      ) {
        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.mensagem ||
            'Não foi possível consultar o CPF do titular.'
        );
      }

      if (
        data?.status === 'erro' ||
        data?.cpf_validado === false ||
        data?.liberar_cadastro === false
      ) {
        setFormData((prev) => ({
          ...prev,
          tit_nome: '',
          tit_nasc: '',
        }));

        setTitularValidado(false);
        setSolicitarAtendimentoTitular(
          data?.solicitar_atendimento === true
        );

        setErroTitular(
          data?.mensagem ||
            'Não foi possível confirmar o CPF do titular. Entre em contato com nossa equipe.'
        );

        return;
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
        converterNascimentoParaInput(
          nascimentoRecebido
        );

      if (!nome || !nascimento) {
        throw new Error(
          'A consulta não retornou nome e data de nascimento do titular.'
        );
      }

      setFormData((prev) => ({
        ...prev,
        tit_nome: nome,
        tit_cpf: formatarCpfVisual(cpf),
        tit_nasc: nascimento,
      }));

      setTitularValidado(true);
      setErroTitular('');
      setSolicitarAtendimentoTitular(false);
    } catch (error) {
      console.error(error);

      ultimoCpfTitularConsultadoRef.current = cpf;

      setFormData((prev) => ({
        ...prev,
        tit_nome: '',
        tit_nasc: '',
      }));

      setTitularValidado(false);
      setSolicitarAtendimentoTitular(true);

      setErroTitular(
        error instanceof Error
          ? error.message
          : 'Não foi possível consultar o CPF do titular. Tente novamente.'
      );
    } finally {
      if (
        numeroConsulta ===
        consultaTitularAtualRef.current
      ) {
        setConsultandoCpfTitular(false);
      }
    }
  }

  function handleMesmoTitular(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const marcado = e.target.checked;

    setMesmoTitular(marcado);
    setErroTitular('');

    if (marcado) {
      ultimoCpfTitularConsultadoRef.current = '';
      setTitularValidado(false);

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

    if (!mesmoTitular && !titularValidado) {
      setErro(
        'Consulte e valide o CPF do titular antes de continuar.'
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

    if (!mesmoTitular && !titularValidado) {
      setErro(
        'Os dados do titular ainda não foram validados.'
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
          cod_plano: 'p1382',
          tipo_plano: '1382',
          status_titular: 'inativo',
        }
      : {
          tit_nome: somenteTexto(formData.tit_nome),
          tit_cpf: somenteNumeros(formData.tit_cpf),
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
      assoc_cpf: somenteNumeros(formData.assoc_cpf),
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
      versao_termos:
        VERSAO_TERMO_ASSOCIADO,
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
              Plano Familiar
            </h1>

            <p className="text-center text-gray-500 mt-2 mb-8">
              1 titular + 3 dependentes •
              Teleconsulta 24h por R$ 66,00 REAIS.
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
                  <p>{erroValidacao}</p>

                  {solicitarAtendimentoAssociado && (
                    <div className="mt-3 border-t border-red-200 pt-3">
                      <button
                        type="button"
                        onMouseDown={(event) =>
                          event.preventDefault()
                        }
                        onClick={() =>
                          setSolicitacaoCpfAberta(
                            'responsavel'
                          )
                        }
                        className="inline-flex rounded-xl bg-blue-700 px-4 py-2.5 font-black text-white hover:bg-blue-800"
                      >
                        Solicitar ajuda à equipe
                      </button>

                      <p className="mt-2 text-xs text-slate-600">
                        consultoque@gmail.com
                      </p>
                    </div>
                  )}
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

                  <label className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mesmoTitular}
                      onChange={handleMesmoTitular}
                      className="mt-1"
                    />

                    <span className="text-sm font-semibold text-green-900">
                      Eu sou o titular do plano familiar.
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
                          Informe primeiro o CPF da
                          pessoa que utilizará o plano.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                          CPF do titular
                        </label>

                        <input
                          type="text"
                          name="tit_cpf"
                          value={formData.tit_cpf}
                          onChange={handleChange}
                          required={!mesmoTitular}
                          disabled={
                            titularValidado ||
                            consultandoCpfTitular
                          }
                          inputMode="numeric"
                          autoComplete="off"
                          maxLength={14}
                          className={`w-full border rounded-xl px-4 py-3 ${
                            titularValidado
                              ? 'border-green-300 bg-green-50 text-gray-700 cursor-not-allowed'
                              : consultandoCpfTitular
                                ? 'border-blue-300 bg-blue-50 text-gray-700 cursor-wait'
                                : 'border-gray-300 bg-white'
                          }`}
                          placeholder="Digite o CPF do titular"
                        />

                        {!titularValidado &&
                          !consultandoCpfTitular &&
                          somenteNumeros(formData.tit_cpf).length > 0 &&
                          somenteNumeros(formData.tit_cpf).length < 11 && (
                            <p className="text-xs text-gray-500 mt-1">
                              A consulta será iniciada
                              quando os 11 números forem
                              preenchidos.
                            </p>
                          )}
                      </div>

                      {consultandoCpfTitular && (
                        <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm font-semibold px-4 py-3 rounded-xl">
                          Consultando o CPF do titular...
                        </div>
                      )}

                      {erroTitular && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-semibold px-4 py-3 rounded-xl">
                          <p>{erroTitular}</p>

                          {solicitarAtendimentoTitular && (
                            <div className="mt-3 border-t border-red-200 pt-3">
                              <button
                                type="button"
                                onMouseDown={(event) =>
                                  event.preventDefault()
                                }
                                onClick={() =>
                                  setSolicitacaoCpfAberta(
                                    'titular'
                                  )
                                }
                                className="inline-flex rounded-xl bg-blue-700 px-4 py-2.5 font-black text-white hover:bg-blue-800"
                              >
                                Solicitar ajuda à equipe
                              </button>

                              <p className="mt-2 text-xs text-slate-600">
                                consultoque@gmail.com
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {titularValidado && (
                        <>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">
                              Nome completo do titular
                            </label>

                            <input
                              type="text"
                              value={formData.tit_nome}
                              disabled
                              className="w-full border border-green-300 bg-green-50 text-gray-700 cursor-not-allowed rounded-xl px-4 py-3"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">
                              Data de nascimento do titular
                            </label>

                            <input
                              type="date"
                              value={formData.tit_nasc}
                              disabled
                              className="w-full border border-green-300 bg-green-50 text-gray-700 cursor-not-allowed rounded-xl px-4 py-3"
                            />
                          </div>

                          <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3">
                            <p className="text-sm font-black">
                              CPF do titular confirmado
                              com sucesso.
                            </p>
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
                        </>
                      )}
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
                    disabled={
                      loading ||
                      (
                        !mesmoTitular &&
                        !titularValidado
                      )
                    }
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

      <TermoAdesaoAssociado
        aberto={mostrarTermos}
        aceito={termosAceitos}
        carregando={loading}
        plano="Familiar"
        valorMensal={66}
        descricaoPlano="1 titular e até 3 dependentes"
        onAceite={setTermosAceitos}
        onFechar={() => setMostrarTermos(false)}
        onConfirmar={enviarCadastro}
      />

      <SolicitacaoValidacaoCpf
        aberto={solicitacaoCpfAberta !== null}
        cpf={
          solicitacaoCpfAberta === 'titular'
            ? formData.tit_cpf
            : formData.assoc_cpf
        }
        origemFormulario="familiar"
        motivo="cpf_nao_localizado"
        mensagemApi={
          solicitacaoCpfAberta === 'titular'
            ? erroTitular
            : erroValidacao
        }
        onFechar={() =>
          setSolicitacaoCpfAberta(null)
        }
      />
    </main>
  );
}