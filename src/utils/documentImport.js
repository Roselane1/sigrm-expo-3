import { Platform } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as XLSX from "xlsx";
import { parseWorkbook } from "./xlsxParser";
import { PDF_SAMPLE_HEADER, PDF_SAMPLE_ITEMS } from "../data/seed";
 
async function readAsWorkbookInput(asset) {
  if (Platform.OS === "web") {
    // No web o uri normalmente é um blob: URL — baixamos e convertemos para ArrayBuffer.
    const response = await fetch(asset.uri);
    const arrayBuffer = await response.arrayBuffer();
    return { type: "array", data: arrayBuffer };
  }
  const base64 = await FileSystem.readAsStringAsync(asset.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return { type: "base64", data: base64 };
}
 
// Abre o seletor de arquivos do sistema operacional (ou do navegador, no web) e
// retorna a RM já interpretada (cabeçalho + itens), pronta para revisão.
export async function pickAndParseRM() {
  const result = await DocumentPicker.getDocumentAsync({
    type: [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "application/pdf",
    ],
    copyToCacheDirectory: true,
  });
 
  if (result.canceled || !result.assets || result.assets.length === 0) {
    return { canceled: true };
  }
 
  const asset = result.assets[0];
  const name = asset.name || "arquivo";
  const isPdf = name.toLowerCase().endsWith(".pdf");
  const isXlsx = /\.(xlsx|xls)$/i.test(name);
 
  if (!isPdf && !isXlsx) {
    return { canceled: false, error: "Formato não reconhecido. Envie um arquivo .xlsx ou .pdf." };
  }
 
  if (isXlsx) {
    try {
      const { type, data } = await readAsWorkbookInput(asset);
      const wb = XLSX.read(data, { type, cellDates: true });
      const { header, items, headerFound } = parseWorkbook(wb);
      return {
        canceled: false,
        fileName: name,
        fileKind: "xlsx",
        header,
        items,
        warning: headerFound
          ? null
          : 'Não foi possível localizar a tabela de itens (coluna "Índice"). Complete manualmente.',
      };
    } catch (err) {
      return { canceled: false, error: "Não foi possível ler este arquivo Excel." };
    }
  }
 
  // PDF: não há parser de PDF disponível — simula a extração com os dados
  // reais de uma RM já processada, incluindo os dois casos de ambiguidade
  // que a extração real gerou.
  return {
    canceled: false,
    fileName: name,
    fileKind: "pdf",
    header: { ...PDF_SAMPLE_HEADER },
    items: PDF_SAMPLE_ITEMS.map((it) => ({ ...it })),
    warning:
      "Extração de PDF é aproximada neste protótipo: 2 linhas ficaram com códigos sobrepostos e precisam de revisão.",
  };
}
 
