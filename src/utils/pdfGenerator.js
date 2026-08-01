import { HEADER_FIELDS, ITEM_STATUS_META, PRIORIDADE_META, REQ_STATUS_META } from "../data/constants";

// Monta um PDF 1.4 básico "na mão", usando apenas fontes padrão (Helvetica/Courier).
// Não depende de nenhuma biblioteca de PDF (nenhuma está disponível/garantida em
// todas as plataformas), então isso funciona igual no navegador, Android e futuro desktop.

function pdfEscapeText(value) {
  let s = "";
  const str = String(value ?? "");
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    if (c > 255) c = 63; // caractere fora do WinAnsi vira "?"
    s += String.fromCharCode(c);
  }
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function padCol(value, width) {
  const str = String(value ?? "");
  return str.length > width ? str.slice(0, width) : str.padEnd(width, " ");
}

function buildRequisicaoPdfLines(req) {
  const lines = [];
  lines.push({ text: `${req.code} - ${req.nomeObra}`, font: "F1", size: 15 });
  lines.push({
    text: `Status: ${REQ_STATUS_META[req.status].label}${req.prioridade ? "   Prioridade: " + PRIORIDADE_META[req.prioridade].label : ""}`,
    font: "F2",
    size: 9,
  });
  lines.push({ text: "", font: "F2", size: 6 });
  HEADER_FIELDS.forEach((f) => {
    lines.push({ text: `${f.label}: ${req[f.key] || "-"}`, font: "F3", size: 9 });
  });
  lines.push({ text: "", font: "F2", size: 6 });
  lines.push({
    text: padCol("Material", 44) + padCol("Qtd Sol.", 12) + padCol("Qtd Loc.", 12) + padCol("UBM", 6) + padCol("Status", 18),
    font: "F1",
    size: 8,
  });
  req.items.forEach((it) => {
    const matTxt = `${it.descricaoMaterial} (${it.niMaterial})`;
    lines.push({
      text:
        padCol(matTxt, 44) +
        padCol(it.qdt, 12) +
        padCol(it.qdtLocalizada || "-", 12) +
        padCol(it.ubm, 6) +
        padCol(ITEM_STATUS_META[it.statusItem].label, 18),
      font: "F3",
      size: 8,
    });
  });
  return lines;
}

function paginateLines(lines, perPage) {
  const pages = [];
  for (let i = 0; i < lines.length; i += perPage) pages.push(lines.slice(i, i + perPage));
  return pages.length ? pages : [[]];
}

// Retorna um Uint8Array com o PDF completo.
export function buildRequisicaoPdfBytes(req) {
  const lines = buildRequisicaoPdfLines(req);
  const pages = paginateLines(lines, 44);
  const P = pages.length;

  const objs = [];
  objs[0] = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
  const kids = [];
  for (let p = 0; p < P; p++) kids.push(`${6 + 2 * p} 0 R`);
  objs[1] = `2 0 obj\n<< /Type /Pages /Kids [${kids.join(" ")}] /Count ${P} >>\nendobj\n`;
  objs[2] = `3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n`;
  objs[3] = `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n`;
  objs[4] = `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>\nendobj\n`;

  pages.forEach((pageLines, p) => {
    const pageNum = 6 + 2 * p;
    const contentNum = 7 + 2 * p;
    let stream = "BT\n";
    pageLines.forEach((line, idx) => {
      stream += `/${line.font} ${line.size} Tf\n`;
      stream += idx === 0 ? `50 740 Td\n` : `0 -13 Td\n`;
      stream += `(${pdfEscapeText(line.text)}) Tj\n`;
    });
    stream += "ET";
    const streamBody = stream + "\n";
    objs[contentNum - 1] = `${contentNum} 0 obj\n<< /Length ${streamBody.length} >>\nstream\n${streamBody}endstream\nendobj\n`;
    objs[pageNum - 1] = `${pageNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents ${contentNum} 0 R >>\nendobj\n`;
  });

  let pdf = "%PDF-1.4\n";
  const offsets = [];
  for (let i = 0; i < objs.length; i++) {
    offsets.push(pdf.length);
    pdf += objs[i];
  }
  const xrefStart = pdf.length;
  const totalObjs = objs.length;
  pdf += `xref\n0 ${totalObjs + 1}\n0000000000 65535 f \n`;
  offsets.forEach((off) => {
    pdf += String(off).padStart(10, "0") + " 00000 n \n";
  });
  pdf += `trailer\n<< /Size ${totalObjs + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  const bytes = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i++) bytes[i] = pdf.charCodeAt(i) & 0xff;
  return bytes;
}

const B64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

// Conversor de bytes -> base64 escrito na mão, para não depender de btoa
// (nem sempre disponível no runtime JS do React Native).
export function bytesToBase64(bytes) {
  let result = "";
  const len = bytes.length;
  for (let i = 0; i < len; i += 3) {
    const b1 = bytes[i];
    const b2 = i + 1 < len ? bytes[i + 1] : 0;
    const b3 = i + 2 < len ? bytes[i + 2] : 0;
    result += B64_CHARS[b1 >> 2];
    result += B64_CHARS[((b1 & 3) << 4) | (b2 >> 4)];
    result += i + 1 < len ? B64_CHARS[((b2 & 15) << 2) | (b3 >> 6)] : "=";
    result += i + 2 < len ? B64_CHARS[b3 & 63] : "=";
  }
  return result;
}
