import { parseNum, today } from "./helpers";

export function deriveReqStatus(items) {
  const active = items.filter((i) => i.statusItem !== "cancelado");
  if (active.length === 0) return null;
  const allNotStarted = active.every((i) => i.statusItem === "nao_iniciado");
  const allReady = active.every((i) => ["localizado", "aguardando_retirada", "retirado"].includes(i.statusItem));
  if (allNotStarted) return "aberta";
  if (allReady) return "aguardando_retirada";
  return "em_atendimento";
}

export function allItemsRetirado(items) {
  const active = items.filter((i) => i.statusItem !== "cancelado");
  return active.length > 0 && active.every((i) => i.statusItem === "retirado");
}

// Aplica uma alteração de itens e recalcula o status da requisição automaticamente,
// a menos que a requisição já esteja num status final (locked).
export function withDerivedStatus(req, items, locked) {
  const derived = deriveReqStatus(items);
  return { ...req, items, status: locked ? req.status : derived || req.status };
}

export function updateItemQdtLocalizada(item, value) {
  const updated = { ...item, qdtLocalizada: value };
  const solicitada = parseNum(item.qdt);
  const localizada = parseNum(value);
  if (localizada > 0 && solicitada > 0) {
    updated.statusItem = localizada >= solicitada ? "localizado" : "parcial";
  }
  return updated;
}

// Registra uma retirada (quem retirou + quantidade) num item — suporta múltiplas
// retiradas ao longo de períodos diferentes, acumulando até o total localizado.
export function addRetirada(item, quantidade, quemRetira) {
  const qtdNum = parseNum(quantidade);
  if (qtdNum <= 0 || !quemRetira || !quemRetira.trim()) return null;
  const retiradas = [
    ...(item.retiradas || []),
    { id: "ret" + Date.now(), quantidade: qtdNum, quemRetira: quemRetira.trim(), data: today() },
  ];
  const totalRetirado = retiradas.reduce((s, r) => s + r.quantidade, 0);
  const localizadaNum = parseNum(item.qdtLocalizada);
  let statusItem = item.statusItem;
  if (localizadaNum > 0 && totalRetirado >= localizadaNum) statusItem = "retirado";
  else if (totalRetirado > 0) statusItem = "aguardando_retirada";
  return { ...item, retiradas, statusItem };
}
