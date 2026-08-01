import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { buildRequisicaoPdfBytes, bytesToBase64 } from "./pdfGenerator";

// Gera o PDF da requisição e entrega ao usuário da forma correta para cada plataforma:
// - Web: dispara o download direto no navegador (via Blob), funciona por clique/toque.
// - Android/iOS: salva o arquivo e abre a folha de compartilhar/salvar nativa do aparelho.
export async function exportRequisicaoPdf(req) {
  const bytes = buildRequisicaoPdfBytes(req);
  const fileName = `${req.code}.pdf`;

  if (Platform.OS === "web") {
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return { ok: true };
  }

  const base64 = bytesToBase64(bytes);
  const fileUri = FileSystem.cacheDirectory + fileName;
  await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(fileUri, { mimeType: "application/pdf", dialogTitle: `Salvar ${fileName}` });
  }
  return { ok: true, uri: fileUri };
}
