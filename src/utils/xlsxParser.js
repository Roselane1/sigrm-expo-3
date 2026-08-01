import * as XLSX from "xlsx";
import { HEADER_LABEL_MAP, PARSE_COLUMNS, TABLE_HEADER_MATCH } from "../data/constants";
import { emptyHeader, normalize } from "./helpers";

// Recebe um workbook já lido pelo XLSX (via array buffer no web ou base64 no nativo)
// e extrai o cabeçalho da RM + a tabela de itens, localizando a linha de cabeçalho
// pela coluna "Índice" — mesma heurística usada no sistema web.
export function parseWorkbook(workbook) {
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

  let headerRowIdx = -1;
  let colMap = {};
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    for (let c = 0; c < row.length; c++) {
      if (TABLE_HEADER_MATCH.includes(normalize(row[c]))) {
        headerRowIdx = r;
        row.forEach((cell, ci) => {
          const norm = normalize(cell);
          const found = PARSE_COLUMNS.find((col) => normalize(col.label) === norm || normalize(col.key) === norm);
          if (found) colMap[found.key] = ci;
        });
        break;
      }
    }
    if (headerRowIdx !== -1) break;
  }

  const header = emptyHeader();
  for (let r = 0; r < (headerRowIdx === -1 ? rows.length : headerRowIdx); r++) {
    rows[r].forEach((cell, ci) => {
      const norm = normalize(cell);
      if (HEADER_LABEL_MAP[norm]) {
        const nextVal = rows[r][ci + 1];
        if (nextVal) header[HEADER_LABEL_MAP[norm]] = String(nextVal).trim();
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

  return { header, items, headerFound: headerRowIdx !== -1 };
}
