type TermoAdesaoAssociadoProps = {
  aberto: boolean;
  aceito: boolean;
  carregando?: boolean;
  plano: string;
  valorMensal?: number;
  descricaoPlano?: string;
  somenteLeitura?: boolean;
  onAceite: (aceito: boolean) => void;
  onFechar: () => void;
  onConfirmar: () => void;
};

export const VERSAO_TERMO_ASSOCIADO =
  'CONSULTOQUE-TERMO-ADESAO-V2.1';

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

export function TermoAdesaoAssociado({
  aberto,
  aceito,
  carregando = false,
  valorMensal,
  descricaoPlano,
  somenteLeitura = false,
  onAceite,
  onFechar,
  onConfirmar,
}: TermoAdesaoAssociadoProps) {
  if (!aberto) return null;

  return (
    <div
      className={
        somenteLeitura
          ? 'min-h-screen bg-slate-100 p-4 md:p-8'
          : 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'
      }
      role="presentation"
      onMouseDown={(event) => {
        if (
          !somenteLeitura &&
          event.target === event.currentTarget &&
          !carregando
        ) {
          onFechar();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-termo-associado"
        className={
          somenteLeitura
            ? 'mx-auto w-full max-w-4xl rounded-3xl bg-white p-6 shadow-2xl md:p-10'
            : 'max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl md:p-8'
        }
      >
        <header className="border-b border-slate-200 pb-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
            ConsulToque
          </p>

          <h2
            id="titulo-termo-associado"
            className="mt-2 text-2xl font-black text-slate-900 md:text-3xl"
          >
            Termo de Contratação de Serviços
          </h2>

          <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950">
            <p>
              <strong>Plano:</strong> Plano de Telemedicina ConsulToque
            </p>

            {typeof valorMensal === 'number' && (
              <p className="mt-1">
                <strong>Mensalidade informada:</strong>{' '}
                {formatarMoeda(valorMensal)}
              </p>
            )}

            {descricaoPlano && (
              <p className="mt-1">
                <strong>Composição:</strong> {descricaoPlano}
              </p>
            )}

            <p className="mt-1 text-xs text-blue-700">
              Versão 2.1
            </p>
          </div>
        </header>

        <article className="mt-6 space-y-6 text-sm leading-relaxed text-slate-700 md:text-base">
          <section className="space-y-3">
            <p>
              Este Termo regula a contratação dos serviços oferecidos pela{' '}
              <strong>CONSULTOQUE SISTEMA FACILITADOR DE SAÚDE LTDA</strong>,
              inscrita no CNPJ sob o nº <strong>68.681.466/0001-33</strong>,
              doravante denominada <strong>CONSULTOQUE</strong>, por meio de
              suas plataformas digitais e parceiros operacionais.
            </p>

            <p>
              A <strong>CONSULTOQUE</strong> disponibiliza planos de acesso a
              serviços de telemedicina, saúde, bem-estar e clube de vantagens,
              conforme o plano contratado. Para dúvidas relativas a este Termo,
              o consumidor poderá utilizar o e-mail oficial:{' '}
              <strong>consultoque@gmail.com</strong>.
            </p>

            <p>
              Ao aceitar este Termo e realizar o pagamento inicial, o
              beneficiário/contratante declara estar ciente e de acordo com as
              condições de contratação, utilização, pagamento, limites
              operacionais e cancelamento dos serviços descritos a seguir.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-slate-900">
              1. Telemedicina e Teleconsultas 24h
            </h3>

            <p>
              A <strong>CONSULTOQUE</strong> disponibiliza aos titulares e
              beneficiários cadastrados o serviço de consultas médicas à
              distância, realizadas por profissionais habilitados, 24 (vinte e
              quatro) horas por dia, 7 (sete) dias por semana (24/7),
              exclusivamente nas especialidades de <strong>Clínico Geral</strong>{' '}
              e <strong>Médico Generalista</strong>.
            </p>

            <p>
              O atendimento de Telemedicina é prestado pela parceira médica{' '}
              <strong>CLICK LIFE SAÚDE LTDA</strong>, inscrita no CNPJ/MF nº{' '}
              <strong>39.549.271/0001-36</strong>, em estrita conformidade com
              a legislação vigente, nos termos da Lei nº 14.510/2022 e da
              Resolução CFM nº 2.314/2022, sob a responsabilidade técnica do
              médico <strong>Dr. Maicon Gonçalves Primo (CRM-SP: 163.013)</strong>.
            </p>

            <div
              role="alert"
              className="rounded-2xl border-2 border-red-300 bg-red-50 p-4 text-red-950"
            >
              <p className="font-black uppercase">
                Importante — urgência e emergência
              </p>
              <p className="mt-2">
                A telemedicina <strong>não substitui</strong> atendimentos
                presenciais de urgência ou prontos-socorros em casos de
                emergência grave. Em situações de risco à vida, como dor
                intensa no peito, falta de ar grave, perda de consciência,
                convulsões, AVC ou acidentes graves, dirija-se imediatamente à
                unidade de saúde/hospital mais próximo ou ligue para o{' '}
                <strong>SAMU pelo telefone 192</strong>.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-slate-900">
              1.1. Encaminhamento Obrigatório para Especialistas
            </h3>
            <p>
              Havendo necessidade de avaliação especializada, identificada e
              atestada pelo médico do plantão 24h, o beneficiário será
              encaminhado para consultas agendadas. O atendimento por
              especialistas ocorrerá <strong>obrigatoriamente mediante
              encaminhamento prévio</strong>, em dias úteis, das 8h30 às 17h30,
              restrito às seguintes especialidades:
            </p>
            <p>
              Cardiologia, Dermatologia, Endocrinologia, Gastroenterologia,
              Geriatria, Ginecologia, Medicina da Família, Oftalmologia,
              Ortopedia, Otorrinolaringologia, Pediatria e Psiquiatria.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-slate-900">
              1.2. Terapias e Bem-Estar
            </h3>
            <p>
              O beneficiário cadastrado poderá agendar até <strong>1 (uma)
              consulta por mês, por especialidade</strong>, nas áreas de{' '}
              <strong>Psicologia, Nutrição e Personal Trainer</strong>.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-slate-900">
              1.3. Fator Moderador
            </h3>
            <p>
              As consultas de pronto atendimento 24h são disponibilizadas para
              o uso consciente dos beneficiários. Para a manutenção do
              equilíbrio econômico-financeiro do programa, poderá ser aplicado
              o fator moderador estipulado pela operadora, a ser faturado na
              mensalidade subsequente.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-slate-900">
              2. Clube de Vantagens
            </h3>
            <p>
              Será disponibilizado aos titulares cadastrados o acesso a uma
              plataforma terceirizada de benefícios, com descontos em produtos,
              serviços e farmácias em âmbito nacional, operacionalizada pela{' '}
              <strong>SERVIDA BENEFÍCIOS LTDA</strong>, inscrita no CNPJ/MF nº{' '}
              <strong>62.849.702/0001-00</strong>.
            </p>
            <p>
              A entrega, as condições, os percentuais de desconto e a
              disponibilidade das ofertas são de responsabilidade exclusiva de
              cada empresa parceira cadastrada no clube.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-black text-slate-900">
              3. Condições Gerais e Regras Operacionais
            </h3>

            <div>
              <h4 className="font-black text-slate-900">3.1. Canais de Atendimento</h4>
              <p className="mt-1">
                Os serviços descritos neste Termo serão prestados exclusivamente
                em ambiente online (digital), por videoconferência ou chat, por
                meio das plataformas digitais oficiais indicadas pela{' '}
                <strong>CONSULTOQUE</strong>.
              </p>
            </div>

            <div>
              <h4 className="font-black text-slate-900">3.2. Responsabilidade pelos Dados Cadastrais</h4>
              <p className="mt-1">
                O contratante/beneficiário é o único responsável pela
                veracidade, exatidão e digitação correta de todas as informações
                cadastrais (nome, CPF, data de nascimento e e-mail) prestadas no
                ato da adesão, respondendo civil e criminalmente por
                inconsistências que venham a inviabilizar o atendimento médico.
              </p>
            </div>

            <div>
              <h4 className="font-black text-slate-900">3.3. Ativação e Liberação do Acesso</h4>
              <p className="mt-1">
                A liberação do acesso às plataformas ocorrerá mediante validação
                cadastral e estará estritamente condicionada à confirmação da
                compensação financeira do pagamento inicial. O prazo para
                ativação e liberação dos acessos nos sistemas é de{' '}
                <strong>11 segundos até 3 (três) dias úteis</strong> após a
                confirmação do pagamento.
              </p>
            </div>

            <div>
              <h4 className="font-black text-slate-900">3.4. Continuidade e Adimplência</h4>
              <p className="mt-1">
                A manutenção do cadastro ativo, bem como a fruição regular de
                todas as consultas, agendamentos e clube de benefícios, fica
                condicionada ao pagamento pontual e recorrente das mensalidades
                contratadas.
              </p>
            </div>

            <div>
              <h4 className="font-black text-slate-900">3.5. Inadimplemento, Suspensão e Desligamento</h4>
              <p className="mt-1">
                O atraso ou não pagamento de qualquer mensalidade implicará a{' '}
                <strong>suspensão imediata</strong> da prestação dos serviços e
                do acesso às plataformas de telemedicina e benefícios enquanto
                persistir a inadimplência. A manutenção do atraso por período
                superior a 30 (trinta) dias acarretará o cancelamento definitivo
                da conta.
              </p>
            </div>

            <div>
              <h4 className="font-black text-slate-900">3.6. Atualização das Mensalidades</h4>
              <p className="mt-1">
                Os valores das mensalidades poderão ser atualizados anualmente
                com base na variação do índice inflacionário do período
                (INPC/IBGE ou IPCA) ou, a qualquer tempo, em decorrência de
                reequilíbrio econômico-financeiro provocado por alterações nos
                custos dos fornecedores parceiros, tributos ou custos
                operacionais do programa.
              </p>
            </div>

            <div>
              <h4 className="font-black text-slate-900">3.7. Alteração e Inclusão de Convênios</h4>
              <p className="mt-1">
                A <strong>CONSULTOQUE</strong> poderá realizar a substituição,
                inclusão ou reformulação de convênios, prestadores de serviços e
                parceiros operacionais, desde que mantida a qualidade e o padrão
                da entrega dos serviços contratados.
              </p>
            </div>

            <div>
              <h4 className="font-black text-slate-900">3.8. Direito de Arrependimento e Cancelamento</h4>
              <p className="mt-1">
                Nas contratações realizadas pela internet, o consumidor poderá
                desistir da contratação no prazo de <strong>7 (sete) dias
                corridos</strong>, contados da assinatura deste Termo ou da
                liberação do serviço, conforme o artigo 49 da Lei nº 8.078/1990
                (Código de Defesa do Consumidor).
              </p>
              <ul className="mt-2 list-disc space-y-2 pl-6">
                <li>
                  O direito de arrependimento poderá ser exercido sem multa,
                  enviando a solicitação para o e-mail{' '}
                  <strong>consultoque@gmail.com</strong>. Os valores pagos serão
                  devolvidos integralmente na forma da lei.
                </li>
                <li>
                  Solicitações de cancelamento efetuadas após o prazo de 7 (sete)
                  dias deverão respeitar o aviso prévio de 30 (trinta) dias e o
                  ciclo mensal em curso.
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-slate-900">
              4. Plataformas Oficiais de Acesso
            </h3>
            <ul className="space-y-2">
              <li>
                <strong>Portal principal e movimentações:</strong>{' '}
                <a href="https://www.consultoque.com.br" target="_blank" rel="noreferrer" className="font-bold text-blue-600 underline">
                  www.consultoque.com.br
                </a>
              </li>
              <li>
                <strong>Portal de telemedicina:</strong>{' '}
                <a href="https://telemedicina.consultoque.com.br/login" target="_blank" rel="noreferrer" className="font-bold text-blue-600 underline">
                  telemedicina.consultoque.com.br/login
                </a>
              </li>
              <li>
                <strong>Clube de Vantagens:</strong>{' '}
                <a href="https://clube.servidabeneficios.com.br/" target="_blank" rel="noreferrer" className="font-bold text-blue-600 underline">
                  clube.servidabeneficios.com.br
                </a>
              </li>
            </ul>
            <p className="font-black text-slate-900">
              CONSULTOQUE — Simples assim, consulta num toque.
            </p>
          </section>
        </article>

        {somenteLeitura ? (
          <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 md:flex-row print:hidden">
            <a href="https://consultoque.com.br" className="w-full rounded-xl bg-slate-200 px-5 py-3 text-center font-black text-slate-700 md:w-1/2">
              Voltar ao site ConsulToque
            </a>
            <button type="button" onClick={() => window.print()} className="w-full rounded-xl bg-blue-700 px-5 py-3 font-black text-white hover:bg-blue-800 md:w-1/2">
              Imprimir ou salvar em PDF
            </button>
          </div>
        ) : (
          <>
            <label className="mt-7 flex cursor-pointer items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <input
                type="checkbox"
                checked={aceito}
                onChange={(event) => onAceite(event.target.checked)}
                disabled={carregando}
                className="mt-1 h-4 w-4"
              />
              <span className="text-sm font-semibold text-blue-950">
                Declaro que li, compreendi e aceito integralmente o Termo de
                Contratação de Serviços da CONSULTOQUE.
              </span>
            </label>

            <div className="mt-6 flex flex-col gap-3 md:flex-row">
              <button type="button" onClick={onFechar} disabled={carregando} className="w-full rounded-xl bg-slate-200 py-3 font-black text-slate-700 disabled:opacity-50 md:w-1/2">
                Voltar
              </button>
              <button type="button" onClick={onConfirmar} disabled={!aceito || carregando} className="w-full rounded-xl bg-[#22C55E] py-3 font-black text-white hover:bg-[#16a34a] disabled:cursor-not-allowed disabled:opacity-50">
                {carregando ? 'Emitindo...' : 'Confirmar contratação'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
