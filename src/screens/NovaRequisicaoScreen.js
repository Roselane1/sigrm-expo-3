import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { Upload, FileSpreadsheet, FileText, AlertTriangle, CheckCircle2, Trash2, RotateCcw, ClipboardList, Info } from "lucide-react-native";
import { COLORS } from "../theme/colors";
import { FONTS } from "../theme/fonts";
import Card from "../components/Card";
import Stamp from "../components/Stamp";
import Button from "../components/Button";
import Select from "../components/Select";
import { SectionTitle, TextField } from "../components/Misc";
import { HEADER_FIELDS, PARSE_COLUMNS } from "../data/constants";
import { emptyHeader } from "../utils/helpers";
import { pickAndParseRM } from "../utils/documentImport";
import { useAppState } from "../state/AppState";

const PRIORIDADE_OPTIONS = [
  { value: "normal", label: "Normal" },
  { value: "medio", label: "Médio" },
  { value: "urgente", label: "Urgente" },
];

export default function NovaRequisicaoScreen({ goTo }) {
  const { createRequisicao } = useAppState();
  const [step, setStep] = useState("upload"); // upload | processing | preview
  const [fileName, setFileName] = useState("");
  const [fileKind, setFileKind] = useState("");
  const [header, setHeader] = useState(emptyHeader());
  const [items, setItems] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [prioridade, setPrioridade] = useState("normal");
  const [submitting, setSubmitting] = useState(false);

  const pendingReview = items.filter((it) => it.review).length;

  async function handlePick() {
    setStep("processing");
    setWarnings([]);
    const result = await pickAndParseRM();
    if (result.canceled) {
      setStep("upload");
      return;
    }
    if (result.error) {
      setWarnings([result.error]);
      setStep("upload");
      return;
    }
    setFileName(result.fileName);
    setFileKind(result.fileKind);
    setHeader(result.header);
    setItems(result.items.map((it, i) => ({ ...it, _id: "it" + i, statusItem: "nao_iniciado", qdtLocalizada: "" })));
    if (result.warning) setWarnings([result.warning]);
    setStep("preview");
  }

  function updateHeaderField(key, value) {
    setHeader((h) => ({ ...h, [key]: value }));
  }
  function updateItem(id, key, value) {
    setItems((prev) => prev.map((it) => (it._id === id ? { ...it, [key]: value } : it)));
  }
  function resolveReview(id) {
    setItems((prev) => prev.map((it) => (it._id === id ? { ...it, review: false, reviewNote: "" } : it)));
  }
  function removeItem(id) {
    setItems((prev) => prev.filter((it) => it._id !== id));
  }
  function reset() {
    setStep("upload");
    setFileName("");
    setFileKind("");
    setHeader(emptyHeader());
    setItems([]);
    setWarnings([]);
    setPrioridade("normal");
  }
  async function confirm() {
    setSubmitting(true);
    try {
      await createRequisicao({ ...header, items, prioridade });
      reset();
      goTo("requisicoes");
    } catch (err) {
      setWarnings([err.message || "Não foi possível criar a requisição. Tente novamente."]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
      <SectionTitle eyebrow="SIGRM · RF001" title="Importar requisição de materiais" />

      {step === "upload" && (
        <Pressable onPress={handlePick} style={styles.dropzone}>
          <Upload size={28} color={COLORS.teal} />
          <Text style={styles.dropzoneTitle}>Toque para selecionar o arquivo da RM</Text>
          <Text style={styles.dropzoneHint}>Aceita .xlsx e .pdf</Text>
        </Pressable>
      )}

      {step === "processing" && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 30 }}>
          <ActivityIndicator color={COLORS.teal} />
          <Text style={{ color: COLORS.muted, fontFamily: FONTS.body }}>Lendo arquivo...</Text>
        </View>
      )}

      {warnings.length > 0 && step !== "processing" && (
        <View style={styles.warningBox}>
          <Info size={15} color="#7A5714" />
          <Text style={styles.warningText}>{warnings.join(" ")}</Text>
        </View>
      )}

      {step === "preview" && (
        <View>
          <View style={styles.fileRow}>
            {fileKind === "pdf" ? <FileText size={16} color={COLORS.muted} /> : <FileSpreadsheet size={16} color={COLORS.muted} />}
            <Text style={styles.fileName}>{fileName}</Text>
            <Stamp meta={{ label: `${items.length} itens lidos`, color: COLORS.blue, bg: COLORS.blueSoft, icon: ClipboardList }} size="sm" />
            {pendingReview > 0 && (
              <Stamp meta={{ label: `${pendingReview} para revisar`, color: COLORS.amber, bg: COLORS.amberSoft, icon: AlertTriangle }} size="sm" />
            )}
          </View>

          <Card style={{ marginBottom: 16 }}>
            <Text style={styles.cardTitle}>Dados da requisição</Text>
            <View style={styles.headerGrid}>
              {HEADER_FIELDS.map((f) => (
                <View key={f.key} style={{ minWidth: 150, flexGrow: 1 }}>
                  <Text style={styles.fieldLabel}>{f.label}</Text>
                  <TextField value={header[f.key]} onChangeText={(v) => updateHeaderField(f.key, v)} />
                </View>
              ))}
            </View>
            <View style={{ marginTop: 12, maxWidth: 220 }}>
              <Text style={styles.fieldLabel}>Categoria de prioridade</Text>
              <Select value={prioridade} onValueChange={setPrioridade} options={PRIORIDADE_OPTIONS} />
            </View>
          </Card>

          <View style={{ gap: 10, marginBottom: 16 }}>
            {items.map((it) => (
              <Card key={it._id} style={{ backgroundColor: it.review ? COLORS.amberSoft : COLORS.surface }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  {it.review ? <AlertTriangle size={14} color={COLORS.amber} /> : <CheckCircle2 size={14} color={COLORS.teal} />}
                  <Text style={{ flex: 1, fontFamily: FONTS.bodySemiBold, fontSize: 12.5 }}>Item {it.indice || "—"}</Text>
                  <Pressable onPress={() => removeItem(it._id)}>
                    <Trash2 size={14} color={COLORS.rust} />
                  </Pressable>
                </View>
                {PARSE_COLUMNS.map((col) => (
                  <View key={col.key} style={{ marginBottom: 6 }}>
                    <Text style={styles.itemColLabel}>{col.label}</Text>
                    <TextField
                      value={it[col.key] || ""}
                      onChangeText={(v) => {
                        updateItem(it._id, col.key, v);
                        if (it.review && v) resolveReview(it._id);
                      }}
                      style={{ paddingVertical: 6 }}
                    />
                  </View>
                ))}
              </Card>
            ))}
          </View>

          <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
            <Button variant="teal" icon={ClipboardList} onPress={confirm} disabled={items.length === 0 || submitting}>
              {submitting ? "Criando..." : "Confirmar e criar requisição"}
            </Button>
            <Button variant="ghost" icon={RotateCcw} onPress={reset} disabled={submitting}>Cancelar importação</Button>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  dropzone: {
    borderWidth: 2,
    borderColor: COLORS.line,
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 50,
    alignItems: "center",
    backgroundColor: COLORS.surface,
    maxWidth: 560,
    gap: 8,
  },
  dropzoneTitle: { fontFamily: FONTS.bodySemiBold, fontSize: 14.5, color: COLORS.ink },
  dropzoneHint: { fontFamily: FONTS.body, fontSize: 12.5, color: COLORS.muted },
  warningBox: {
    flexDirection: "row",
    gap: 9,
    backgroundColor: COLORS.amberSoft,
    borderWidth: 1,
    borderColor: COLORS.amber + "55",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    maxWidth: 720,
  },
  warningText: { flex: 1, fontSize: 12.5, color: "#7A5714", fontFamily: FONTS.body },
  fileRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" },
  fileName: { fontFamily: FONTS.mono, fontSize: 12.5, color: COLORS.muted },
  cardTitle: { fontFamily: FONTS.displaySemiBold, fontSize: 14, marginBottom: 12, color: COLORS.ink },
  headerGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  fieldLabel: { fontSize: 11, fontFamily: FONTS.bodySemiBold, color: COLORS.muted, marginBottom: 4 },
  itemColLabel: { fontSize: 10, textTransform: "uppercase", color: COLORS.muted, fontFamily: FONTS.mono, marginBottom: 2 },
});
