import {
  FileText,
  Truck,
  PackageCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Circle,
  Search,
  CheckCheck,
  Zap,
} from "lucide-react-native";
import { COLORS } from "../theme/colors";

export const ROLES = {
  tecnico: { label: "Técnico de Materiais", desc: "Cria, edita e cancela requisições" },
  planejamento: { label: "Planejamento", desc: "Acompanha o andamento das requisições" },
  logistica: { label: "Logística", desc: "Localiza, separa e atualiza os itens" },
  administrador: { label: "Administrador", desc: "Configura o sistema" },
};

export const PRIORIDADE_META = {
  normal: { label: "Normal", color: COLORS.teal, bg: COLORS.tealSoft, icon: Circle },
  medio: { label: "Média", color: COLORS.amber, bg: COLORS.amberSoft, icon: AlertTriangle },
  urgente: { label: "Urgente", color: COLORS.rust, bg: COLORS.rustSoft, icon: Zap },
};

export const REQ_STATUS_META = {
  aberta: { label: "Aberta", color: COLORS.muted, bg: COLORS.neutralSoft, icon: FileText },
  em_atendimento: { label: "Em Atendimento", color: COLORS.blue, bg: COLORS.blueSoft, icon: Truck },
  aguardando_retirada: { label: "Aguardando Retirada", color: COLORS.amber, bg: COLORS.amberSoft, icon: PackageCheck },
  finalizada: { label: "Finalizada", color: COLORS.teal, bg: COLORS.tealSoft, icon: CheckCircle2 },
  finalizada_pendencias: { label: "Finalizada c/ Pendências", color: COLORS.rust, bg: COLORS.rustSoft, icon: AlertTriangle },
  cancelada: { label: "Cancelada", color: COLORS.rust, bg: COLORS.rustSoft, icon: XCircle },
};

export const ITEM_STATUS_META = {
  nao_iniciado: { label: "Não iniciado", color: COLORS.muted, bg: COLORS.neutralSoft, icon: Circle },
  em_localizacao: { label: "Em localização", color: COLORS.blue, bg: COLORS.blueSoft, icon: Search },
  parcial: { label: "Parcial", color: COLORS.amber, bg: COLORS.amberSoft, icon: AlertTriangle },
  localizado: { label: "Localizado", color: COLORS.teal, bg: COLORS.tealSoft, icon: CheckCircle2 },
  aguardando_retirada: { label: "Aguardando retirada", color: COLORS.indigo, bg: COLORS.indigoSoft, icon: PackageCheck },
  retirado: { label: "Retirado", color: COLORS.ink, bg: COLORS.navySoft, icon: CheckCheck },
  cancelado: { label: "Cancelado", color: COLORS.rust, bg: COLORS.rustSoft, icon: XCircle },
};

export const HEADER_FIELDS = [
  { key: "arquivo", label: "Arquivo" },
  { key: "osContrato", label: "OS Contrato" },
  { key: "centro", label: "Centro" },
  { key: "solicitante", label: "Solicitante" },
  { key: "nomeObra", label: "Nome da obra" },
  { key: "elementoPep", label: "Elemento PEP" },
  { key: "responsavel", label: "Responsável" },
  { key: "emissao", label: "Emissão" },
];

export const HEADER_LABEL_MAP = {
  ARQUIVO: "arquivo",
  "OS CONTRATO": "osContrato",
  CENTRO: "centro",
  SOLICITANTE: "solicitante",
  "NOME DA OBRA": "nomeObra",
  "ELEMENTO PEP": "elementoPep",
  RESPONSAVEL: "responsavel",
  RESPONSÁVEL: "responsavel",
  EMISSAO: "emissao",
  EMISSÃO: "emissao",
};

export const PARSE_COLUMNS = [
  { key: "indice", label: "Índice" },
  { key: "localAplicacao", label: "Local de Aplicação" },
  { key: "desenho", label: "Desenho" },
  { key: "niMaterial", label: "NI Material" },
  { key: "descricaoMaterial", label: "Descrição do Material" },
  { key: "tag", label: "Tag" },
  { key: "qdt", label: "QDT" },
  { key: "ubm", label: "UBM" },
  { key: "os", label: "OS" },
  { key: "refFornecedor", label: "Ref. Fornecedor" },
  { key: "reserva", label: "Reserva" },
  { key: "item", label: "Item" },
  { key: "obs", label: "OBS" },
];

export const TABLE_HEADER_MATCH = ["INDICE", "ÍNDICE"];
