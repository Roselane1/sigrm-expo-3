import * as XLSX from "xlsx";
import { HEADER_LABEL_MAP, PARSE_COLUMNS, HEADER_ROW_MIN_MATCHES } from "../data/constants";
import { emptyHeader, normalize } from "./helpers";
 
function formatDate(date) {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
 
// Verifica se o texto de uma célula corresponde ao rótulo (ou a algum apelido/
// variação conhecida) de uma coluna — ex: "Qtd" bate com a coluna "QDT".
function cellMatchesColumn(cellText, col) {
  const norm = normalize(cellText);
  if (!norm) return false;
  if (normalize(col.label) === norm) return true;
  if (normalize(col.key) === norm) return true;
  return (col.aliases || []).some((alias) => normalize(alias) === norm);
}
 
// Recebe um workbook já lido pelo XLSX (via array buffer no web ou base64 no
// nativo) e extrai o cabeçalho da RM + a tabela de itens. A linha de cabeçalho
// da tabela é encontrada pela linha que tiver o MAIOR número de colunas
// conhecidas batendo (em vez de depender de uma coluna específica como
// "Índice" — planilhas diferentes usam nomes diferentes, tipo "Nº").
export function parseWorkbook(workbook) {
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
 
  let headerRowIdx = -1;
  let bestMatchCount = 0;
  let colMap = {};
 
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    const rowColMap = {};
    row.forEach((cell, ci) => {
      for (const col of PARSE_COLUMNS) {
        if (rowColMap[col.key] !== undefined) continue; // já achou essa coluna nessa linha
        if (cellMatchesColumn(cell, col)) {
          rowColMap[col.key] = ci;
          break;
        }
      }
    });
    const matchCount = Object.keys(rowColMap).length;
    if (matchCount > bestMatchCount) {
      bestMatchCount = matchCount;
      headerRowIdx = r;
      colMap = rowColMap;
    }
  }
 
  const headerFound = bestMatchCount >= HEADER_ROW_MIN_MATCHES;
  if (!headerFound) headerRowIdx = -1;
 
  const header = emptyHeader();
  for (let r = 0; r < (headerRowIdx === -1 ? rows.length : headerRowIdx); r++) {
    rows[r].forEach((cell, ci) => {
      const norm = normalize(cell);
      if (HEADER_LABEL_MAP[norm]) {
        let val = "";
        for (let k = ci + 1; k < Math.min(ci + 4, rows[r].length); k++) {
          const candidate = rows[r][k];
          if (candidate !== undefined && candidate !== null && String(candidate).trim() !== "") {
            val = candidate instanceof Date ? formatDate(candidate) : String(candidate).trim();
            break;
          }
        }
        if (val) header[HEADER_LABEL_MAP[norm]] = val;
      }
    });
  }
 
  const items = [];
  if (headerRowIdx !== -1) {
    for (let r = headerRowIdx + 1; r < rows.length; r++) {
      const row = rows[r];
      if (row.every((c) => String(c).trim() === "")) continue;
      const item = {};
      PARSE_COLUMNS.forEach((col) => {
        const ci = colMap[col.key];
        item[col.key] = ci !== undefined ? String(row[ci] ?? "").trim() : "";
      });
      const missing = !item.niMaterial || !item.descricaoMaterial || !item.qdt;
      item.review = missing;
      item.reviewNote = missing ? "Campo obrigatório não encontrado (NI Material, Descrição ou QDT)." : "";
      items.push(item);
    }
  }
 
  return { header, items, headerFound };
}
 
