// Defaults e overrides preservados do projeto operacional B. Não contém credenciais.
export const CortesiasAdmin_WEBHOOK_CORTESIAS =
  import.meta.env.VITE_WEBHOOK_EMP_ADMIN_CORTESIAS ??
  "https://n8n.saintsolution.com.br/webhook/emp-admin-cortesias";

export const Admin_WEBHOOK_LOGIN_ADMIN =
  import.meta.env.VITE_WEBHOOK_EMP_ADMIN_LOGIN ??
  "https://n8n.saintsolution.com.br/webhook/admin-login";

export const Admin_WEBHOOK_DASHBOARD_ADMIN =
  import.meta.env.VITE_WEBHOOK_EMP_ADMIN_DASHBOARD ??
  "https://n8n.saintsolution.com.br/webhook/admin-dashboard";

export const Associado_ASSOCIADO_LOGIN_URL =
  'https://n8n.saintsolution.com.br/webhook/associado-login';

export const Associado_ASSOCIADO_RECUPERAR_SENHA_URL =
  'https://n8n.saintsolution.com.br/webhook/associado-recuperar-senha';

export const Colaborador_WEBHOOK_LOGIN =
  import.meta.env
    .VITE_WEBHOOK_COLABORADOR_LOGIN ||
  'https://n8n.saintsolution.com.br/webhook/colaborador-login';

export const Colaborador_WEBHOOK_RECUPERAR_SENHA =
  import.meta.env
    .VITE_WEBHOOK_COLABORADOR_RECUPERAR_SENHA ||
  'https://n8n.saintsolution.com.br/webhook/colaborador-recuperar-senha';

export const ColaboradorDashboard_WEBHOOK_DASHBOARD =

  import.meta.env

    .VITE_WEBHOOK_COLABORADOR_DASHBOARD

    ?.trim() ||

  'https://n8n.saintsolution.com.br/webhook/colaborador-dashboard';

export const ColaboradorDashboard_WEBHOOK_ATUALIZAR_DADOS =

  import.meta.env

    .VITE_WEBHOOK_COLABORADOR_ATUALIZAR_DADOS

    ?.trim() ||

  'https://n8n.saintsolution.com.br/webhook/colaborador-atualiza-dados';

export const ColaboradorDashboard_WEBHOOK_VALIDAR_APELIDO =

  'https://n8n.saintsolution.com.br/webhook/valida-apelido-colaborador';

export const CompletarAdesao_WEBHOOK_BUSCAR_ADESAO =
  import.meta.env.VITE_WEBHOOK_BUSCAR_ADESAO_PENDENTE?.trim() ||
  "https://n8n.saintsolution.com.br/webhook/consultar-adesao-pendente";

export const CompletarAdesao_WEBHOOK_COMPLEMENTAR_ADESAO =
  import.meta.env.VITE_WEBHOOK_COMPLEMENTAR_ADESAO_PENDENTE?.trim() ||
  "https://n8n.saintsolution.com.br/webhook/complementar-adesao-pendente";

export const CriarSenha_WEBHOOK_CRIAR_SENHA =
  'https://n8n.saintsolution.com.br/webhook/criar-senha';

export const FormColetivo_WEBHOOK_URL =
  "https://n8n.saintsolution.com.br/webhook/coletivo-empresarial";

export const FormColetivo_WEBHOOK_VALIDAR_CPF =
  "https://n8n.saintsolution.com.br/webhook/validar-cpf-cadastro";

export const FormColetivo_WEBHOOK_VALIDAR_CNPJ =
  "https://n8n.saintsolution.com.br/webhook/validar-cnpj-cadastro";

export const SejaColaborador_WEBHOOK_CADASTRO =
  "https://n8n.saintsolution.com.br/webhook/colaborador-cadastro";

export const SejaColaborador_WEBHOOK_VALIDAR_CPF =
  "https://n8n.saintsolution.com.br/webhook/validar-cpf-cadastro";

export const SejaColaborador_WEBHOOK_VALIDAR_APELIDO =
  "https://n8n.saintsolution.com.br/webhook/valida-apelido-colaborador";

export const SolicitarImpressos_WEBHOOK_PEDIDO_IMPRESSOS = 'https://n8n.saintsolution.com.br/webhook/pedido-impressos';

export const consultaCpf_WEBHOOK_VALIDAR_CPF =
  "https://n8n.saintsolution.com.br/webhook/validar-cpf-cadastro";
export const AssociadoDashboard_ASSOCIADO_DASHBOARD_URL =
  import.meta.env.VITE_WEBHOOK_ASSOCIADO_DASHBOARD?.trim() ||
  'https://n8n.saintsolution.com.br/webhook/associado-dashboard';

export const AssociadoDashboard_ASSOCIADO_EDITAR_DADOS_URL =
  import.meta.env.VITE_WEBHOOK_ASSOCIADO_EDITAR_DADOS?.trim() ||
  'https://n8n.saintsolution.com.br/webhook/associado-editar-dados';

export const AssociadoDashboard_ASSOCIADO_INCLUIR_TITULAR_URL =
  import.meta.env.VITE_WEBHOOK_ASSOCIADO_INCLUIR_TITULAR?.trim() ||
  'https://n8n.saintsolution.com.br/webhook/associado-incluir-titular';

export const AssociadoDashboard_ASSOCIADO_EXCLUIR_TITULAR_URL =
  import.meta.env.VITE_WEBHOOK_ASSOCIADO_EXCLUIR_TITULAR?.trim() ||
  'https://n8n.saintsolution.com.br/webhook/associado-excluir-titular';
