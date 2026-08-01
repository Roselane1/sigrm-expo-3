export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function daysBetween(a, b) {
  return Math.max(0, Math.round((new Date(b) - new Date(a)) / 86400000));
}

export function parseNum(v) {
  const n = parseFloat(String(v ?? "").replace(",", "."));
  return isNaN(n) ? 0 : n;
}

export function emptyHeader() {
  return {
    arquivo: "",
    osContrato: "",
    centro: "",
    solicitante: "",
    nomeObra: "",
    elementoPep: "",
    responsavel: "",
    emissao: "",
  };
}

export function normalize(str) {
  return String(str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}
