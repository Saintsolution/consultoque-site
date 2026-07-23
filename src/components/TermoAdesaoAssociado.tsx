type TermoAdesaoAssociadoProps = {
  aberto: boolean;
  aceito: boolean;
  carregando?: boolean;
  plano: string;
  valorMensal?: number;
  descricaoPlano?: string;
  onAceite: (aceito: boolean) => void;
  onFechar: () => void;
  onConfirmar: () => void;
};

export const VERSAO_TERMO_ASSOCIADO =
  '2026-07-23-sia-consultoque-v1';

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
  plano,
  valorMensal,
  descricaoPlano,
  onAceite,
  onFechar,
  onConfirmar,
}: TermoAdesaoAssociadoProps) {
  if (!aberto) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (
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
        className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl md:p-8"
      >
        <header className="border-b border-slate-200 pb-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
            SIA / ConsulToque
          </p>

          <h2
            id="titulo-termo-associado"
            className="mt-2 text-2xl font-black text-slate-900 md:text-3xl"
          >
            Termo de Adesão e Regulamento do Associado
          </h2>

          <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950">
            <p>
              <strong>Plano:</strong> {plano}
            </p>

            {typeof valorMensal === 'number' && (
              <p className="mt-1">
                <strong>Contribuição mensal informada:</strong>{' '}
                {formatarMoeda(valorMensal)}
              </p>
            )}

            {descricaoPlano && (
              <p className="mt-1">
                <strong>Composição:</strong>{' '}
                {descricaoPlano}
              </p>
            )}

            <p className="mt-1 text-xs text-blue-700">
              Versão do termo: {VERSAO_TERMO_ASSOCIADO}
            </p>
          </div>
        </header>

        <article className="mt-6 space-y-6 text-sm leading-relaxed text-slate-700 md:text-base">
          <section className="space-y-3">
            <p>
              O CONSULTOQUE é um programa exclusivo de benefícios
              em saúde e bem-estar oferecido pela SIA – Sistema
              Inteligente de Apoio Associativo e Amparo Comunitário,
              viabilizado por meio de parcerias operacionais com a
              Click Life Saúde e a Servida Benefícios.
            </p>

            <p>
              A SIA é uma associação sem fins lucrativos, dedicada a
              promover o associativismo e viabilizar o acesso
              facilitado a serviços de saúde, prevenção e bem-estar,
              utilizando a força da coletividade para obter condições
              diferenciadas junto a fornecedores especializados.
            </p>

            <p>
              Ao aceitar este Termo e realizar o pagamento da
              contribuição associativa inicial, você ativa sua
              condição de Associado Contribuinte, declarando-se
              ciente e de acordo com as regras de fruição dos
              benefícios mantidos pela SIA.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-slate-900">
              1. Telemedicina e Teleconsultas 24h
            </h3>

            <p>
              Por meio da ConsulToque é disponibilizado aos associados
              da SIA o serviço de consultas médicas à distância,
              ilimitadas, realizadas por profissionais habilitados,
              24 (vinte e quatro) horas por dia, 7 (sete) dias por
              semana, exclusivamente nas especialidades de Clínico
              Geral e Médico Generalista.
            </p>

            <p>
              O atendimento de telessaúde é prestado pela parceira
              CLICK LIFE SAÚDE LTDA, inscrita no CNPJ/MF nº
              39.549.271/0001-36, em conformidade com a legislação
              vigente, nos termos da Lei nº 13.989/2020 e da Resolução
              CFM nº 2.314/2022.
            </p>

            <div
              role="alert"
              className="rounded-2xl border-2 border-red-300 bg-red-50 p-4 text-red-950"
            >
              <p className="font-black uppercase">
                Importante — urgência e emergência
              </p>

              <p className="mt-2">
                A telemedicina não substitui atendimentos presenciais
                de urgência ou prontos-socorros em casos de emergência
                grave. Em situações de risco à vida, como dor intensa
                no peito, falta de ar grave, perda de consciência,
                convulsões ou acidentes graves, dirija-se
                imediatamente à unidade de saúde mais próxima ou ligue
                para o SAMU pelo telefone 192.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-slate-900">
              1.1. Encaminhamento para Especialistas
            </h3>

            <p>
              Havendo necessidade de avaliação especializada,
              identificada pelo médico do plantão 24h, o associado
              será encaminhado para consultas agendadas. O atendimento
              por especialistas ocorrerá em dias úteis, das 8h30 às
              17h30, restrito às seguintes especialidades:
            </p>

            <p>
              Cardiologia, Dermatologia, Endocrinologia,
              Gastroenterologia, Geriatria, Ginecologia, Medicina da
              Família, Oftalmologia, Ortopedia,
              Otorrinolaringologia, Pediatria e Psiquiatria.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-slate-900">
              1.2. Terapias e Bem-Estar
            </h3>

            <p>
              O associado poderá agendar até 1 (uma) consulta por mês,
              por especialidade, nas áreas de Psicologia, Nutrição e
              Personal Trainer.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-slate-900">
              2. Clube de Vantagens
            </h3>

            <p>
              Será disponibilizado aos associados titulares o acesso
              a uma plataforma terceirizada de benefícios, com
              descontos em produtos e serviços em âmbito nacional,
              operacionalizada pela SERVIDA BENEFÍCIOS LTDA, inscrita
              no CNPJ/MF nº 62.849.702/0001-00.
            </p>

            <p>
              A entrega, as condições, os percentuais de desconto e a
              disponibilidade das ofertas são de responsabilidade
              exclusiva de cada empresa parceira cadastrada no clube.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-black text-slate-900">
              3. Condições Gerais e Regras Operacionais
            </h3>

            <div>
              <h4 className="font-black text-slate-900">
                3.1. Canais de Atendimento
              </h4>
              <p className="mt-1">
                Os serviços descritos neste Termo serão prestados
                exclusivamente em ambiente online (digital), por
                videoconferência ou chat, por meio das plataformas
                oficiais indicadas pela associação.
              </p>
            </div>

            <div>
              <h4 className="font-black text-slate-900">
                3.2. Responsabilidade pelos Dados Cadastrais
              </h4>
              <p className="mt-1">
                O associado é o único responsável pela veracidade,
                exatidão e digitação correta de todas as informações
                cadastrais prestadas no ato da adesão, respondendo
                civil e criminalmente por inconsistências que venham
                a inviabilizar o atendimento.
              </p>
            </div>

            <div>
              <h4 className="font-black text-slate-900">
                3.3. Ativação e Liberação do Acesso
              </h4>
              <p className="mt-1">
                A liberação do acesso às plataformas ocorrerá mediante
                validação cadastral, incluindo nome, CPF e dados
                correlatos, e estará estritamente condicionada à
                confirmação da compensação financeira do pagamento da
                contribuição inicial. O prazo para ativação dos
                serviços pode ser de até 3 (três) dias úteis após a
                confirmação do pagamento.
              </p>
            </div>

            <div>
              <h4 className="font-black text-slate-900">
                3.4. Continuidade e Adimplência
              </h4>
              <p className="mt-1">
                A manutenção do cadastro ativo, bem como a fruição
                regular de todos os serviços, consultas e benefícios,
                fica condicionada ao pagamento pontual e recorrente das
                contribuições associativas mensais.
              </p>
            </div>

            <div>
              <h4 className="font-black text-slate-900">
                3.5. Inadimplemento, Suspensão e Desligamento
              </h4>
              <p className="mt-1">
                O atraso ou não pagamento de qualquer contribuição
                mensal implicará a suspensão imediata da prestação dos
                serviços. A manutenção da inadimplência por prazo
                superior ao limite operacional da associação será
                considerada manifestação tácita de desligamento
                voluntário do quadro associativo, resultando no
                cancelamento do acesso aos benefícios.
              </p>
            </div>

            <div>
              <h4 className="font-black text-slate-900">
                3.6. Atualização das Contribuições
              </h4>
              <p className="mt-1">
                Os valores das mensalidades poderão ser atualizados
                anualmente com base na variação inflacionária do
                período ou, a qualquer tempo, em decorrência de
                reequilíbrio econômico-financeiro provocado por
                alterações nos custos dos fornecedores parceiros,
                tributos ou custos operacionais do programa.
              </p>
            </div>

            <div>
              <h4 className="font-black text-slate-900">
                3.7. Alteração e Inclusão de Convênios
              </h4>
              <p className="mt-1">
                É facultado à SIA realizar a substituição, inclusão ou
                reformulação de convênios, prestadores de serviços e
                parceiros operacionais, desde que mantida a qualidade
                e o padrão da entrega dos benefícios aos associados.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-slate-900">
              4. Plataformas Oficiais de Acesso
            </h3>

            <ul className="space-y-2">
              <li>
                <strong>Portal principal e movimentações:</strong>{' '}
                <a
                  href="https://www.consultoque.com.br"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-blue-600 underline"
                >
                  www.consultoque.com.br
                </a>
              </li>
              <li>
                <strong>Portal de telemedicina:</strong>{' '}
                <a
                  href="https://telemedicina.consultoque.com.br/login"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-blue-600 underline"
                >
                  telemedicina.consultoque.com.br/login
                </a>
              </li>
              <li>
                <strong>Clube de Vantagens:</strong>{' '}
                <a
                  href="https://clube.servidabeneficios.com.br/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-blue-600 underline"
                >
                  clube.servidabeneficios.com.br
                </a>
              </li>
            </ul>

            <p className="font-black text-slate-900">
              CONSULTOQUE — Simples assim, consulta num toque.
            </p>
          </section>
        </article>

        <label className="mt-7 flex cursor-pointer items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <input
            type="checkbox"
            checked={aceito}
            onChange={(event) =>
              onAceite(event.target.checked)
            }
            disabled={carregando}
            className="mt-1 h-4 w-4"
          />

          <span className="text-sm font-semibold text-blue-950">
            Declaro que li, compreendi e aceito integralmente o Termo
            de Adesão e Regulamento do Associado — SIA / CONSULTOQUE.
          </span>
        </label>

        <div className="mt-6 flex flex-col gap-3 md:flex-row">
          <button
            type="button"
            onClick={onFechar}
            disabled={carregando}
            className="w-full rounded-xl bg-slate-200 py-3 font-black text-slate-700 disabled:opacity-50 md:w-1/2"
          >
            Voltar
          </button>

          <button
            type="button"
            onClick={onConfirmar}
            disabled={!aceito || carregando}
            className="w-full rounded-xl bg-[#22C55E] py-3 font-black text-white hover:bg-[#16a34a] disabled:cursor-not-allowed disabled:opacity-50 md:w-1/2"
          >
            {carregando
              ? 'Emitindo...'
              : 'Confirmar adesão'}
          </button>
        </div>
      </div>
    </div>
  );
}