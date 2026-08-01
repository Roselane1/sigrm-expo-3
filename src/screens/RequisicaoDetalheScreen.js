import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Modal, ActivityIndicator, Alert } from "react-native";
import { ChevronLeft, CheckCircle2, XCircle, Info, Printer, Download, Trash2 } from "lucide-react-native";
import { COLORS } from "../theme/colors";
import { FONTS } from "../theme/fonts";
import Card from "../components/Card";
import Stamp from "../components/Stamp";
import Button from "../components/Button";
import Select from "../components/Select";
import { TextField } from "../components/Misc";
import RetiradaCell from "../components/RetiradaCell";
import { HEADER_FIELDS, REQ_STATUS_META, ITEM_STATUS_META, PRIORIDADE_META } from "../data/constants";
import { parseNum, today } from "../utils/helpers";
import { withDerivedStatus, updateItemQdtLocalizada, addRetirada, allItemsRetirado } from "../utils/requisicaoLogic";
import { exportRequisicaoPdf } from "../utils/exportPdf";
import { useAppState } from "../state/AppState";

const BULK_OPTIONS = [
  { value: "em_localizacao", label: "Em localização" },
  { value: "aguardando_retirada", label: "Aguardando retirada" },
];

export default function RequisicaoDetalheScreen({ reqId, onBack }) {
  const { user, requisitions, updateRequisicao } = useAppState();
  const req = requisitions.find((r) => r.id === reqId);

  const [selected, setSelected] = useState(new Set());
  const [bulkStatus, setBulkStatus] = useState("em_localizacao");
  const [confirmCancelReq, setConfirmCancelReq] = useState(false);
  const [retiradaOpenId, setRetiradaOpenId] = useState(null);
  const [retiradaQtd, setRetiradaQtd] = useState("");
  const [retiradaQuem, setRetiradaQuem] = useState("");
  const [historyOpenId, setHistoryOpenId] = useState(null);
  const [exporting, setExporting] = useState(false);

  if (!req) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Requisição não encontrada.</Text>
      </View>
    );
  }

  const locked = req.status === "finalizada" || req.status === "finalizada_pendencias" || req.status === "cancelada";
  const isLogistica = user.role === "logistica";
  const isTecnico = user.role === "tecnico";
  const canFinalizar = (isLogistica || user.role === "administrador" || user.role === "planejamento") && req.status === "aguardando_retirada";
  const podeFinalizarAgora = canFinalizar && allItemsRetirado(req.items);

  function toggleSelect(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function applyItems(items) {
    updateRequisicao(withDerivedStatus(req, items, locked));
  }

  function handleQdtLocalizadaChange(itemId, value) {
    const items = req.items.map((it) => (it._id === itemId ? updateItemQdtLocalizada(it, value) : it));
    applyItems(items);
  }

  function handleFieldChange(itemId, field, value) {
    const items = req.items.map((it) => (it._id === itemId ? { ...it, [field]: value } : it));
    applyItems(items);
  }

  function applyBulkStatus() {
    const items = req.items.map((it) => (selected.has(it._id) ? { ...it, statusItem: bulkStatus } : it));
    applyItems(items);
    setSelected(new Set());
  }

  function cancelItem(itemId) {
    const items = req.items.map((it) => (it._id === itemId ? { ...it, statusItem: "cancelado" } : it));
    applyItems(items);
  }

  function confirmRetirada(itemId) {
    const updatedItem = addRetirada(req.items.find((it) => it._id === itemId), retiradaQtd, retiradaQuem);
    if (!updatedItem) return;
    const items = req.items.map((it) => (it._id === itemId ? updatedItem : it));
    applyItems(items);
    setRetiradaOpenId(null);
    setRetiradaQtd("");
    setRetiradaQuem("");
  }

  function finalizarRequisicao() {
    const hasCancelado = req.items.some((i) => i.statusItem === "cancelado");
    updateRequisicao({ ...req, status: hasCancelado ? "finalizada_pendencias" : "finalizada", dataFinalizacao: today() });
  }

  function cancelarRequisicao() {
    updateRequisicao({ ...req, status: "cancelada" });
    setConfirmCancelReq(false);
  }

  async function handleExport() {
    setExporting(true);
    try {
      await exportRequisicaoPdf(req);
    } catch (e) {
      Alert.alert("Erro ao gerar PDF", "Não foi possível gerar o arquivo. Tente novamente.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
      <Pressable onPress={onBack} style={styles.backBtn}>
        <ChevronLeft size={15} color={COLORS.muted} />
        <Text style={styles.backText}>Voltar</Text>
      </Pressable>

      <View style={styles.headerRow}>
        <Text style={styles.code}>{req.code}</Text>
        <Stamp meta={REQ_STATUS_META[req.status]} />
        {req.prioridade ? <Stamp meta={PRIORIDADE_META[req.prioridade]} /> : null}
      </View>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{req.nomeObra}</Text>
        <Button variant="ghost" icon={Printer} onPress={handleExport} disabled={exporting}>
          {exporting ? "Gerando..." : "Exportar PDF"}
        </Button>
      </View>

      <Card style={{ marginBottom: 18 }}>
        <View style={styles.headerGrid}>
          {HEADER_FIELDS.map((f) => (
            <View key={f.key} style={styles.headerField}>
              <Text style={styles.headerLabel}>{f.label}</Text>
              <Text style={styles.headerValue}>{req[f.key] || "—"}</Text>
            </View>
          ))}
        </View>
      </Card>

      <View style={styles.actionsRow}>
        {podeFinalizarAgora && (
          <Button variant="teal" icon={CheckCircle2} onPress={finalizarRequisicao}>Finalizar (confirmar retirada)</Button>
        )}
        {canFinalizar && !podeFinalizarAgora && (
          <View style={styles.infoInline}>
            <Info size={13} color={COLORS.muted} />
            <Text style={styles.infoText}>Ainda há itens aguardando retirada.</Text>
          </View>
        )}
        {isTecnico && req.status === "aberta" && !confirmCancelReq && (
          <Button variant="danger" icon={XCircle} onPress={() => setConfirmCancelReq(true)}>Cancelar requisição</Button>
        )}
        {isTecnico && req.status === "aberta" && confirmCancelReq && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <Text style={{ fontSize: 12.5, color: COLORS.rust }}>Confirma o cancelamento?</Text>
            <Button variant="danger" onPress={cancelarRequisicao}>Sim, cancelar</Button>
            <Button variant="ghost" onPress={() => setConfirmCancelReq(false)}>Voltar</Button>
          </View>
        )}
      </View>

      {!locked && (
        <View style={styles.infoInline}>
          <Info size={13} color={COLORS.muted} />
          <Text style={styles.infoText}>O status da requisição é atualizado automaticamente conforme o status dos itens.</Text>
        </View>
      )}

      {isLogistica && !locked && selected.size > 0 && (
        <Card style={{ backgroundColor: COLORS.tealSoft, borderColor: COLORS.teal + "55", marginBottom: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <Text style={{ fontSize: 12.5, fontWeight: "600", color: COLORS.teal }}>{selected.size} selecionado(s)</Text>
            <Select value={bulkStatus} onValueChange={setBulkStatus} options={BULK_OPTIONS} style={{ minWidth: 160 }} />
            <Button variant="teal" onPress={applyBulkStatus}>Aplicar status</Button>
            <Button variant="ghost" onPress={() => setSelected(new Set())}>Limpar</Button>
          </View>
        </Card>
      )}

      <View style={{ gap: 10 }}>
        {req.items.map((it) => {
          const meta = ITEM_STATUS_META[it.statusItem];
          const canEditLogistica = isLogistica && !locked && it.statusItem !== "cancelado";
          const canEditTecnico = isTecnico && req.status === "aberta" && it.statusItem !== "cancelado";
          const cancelado = it.statusItem === "cancelado";

          return (
            <Card key={it._id} style={{ opacity: cancelado ? 0.6 : 1 }}>
              <View style={styles.itemTopRow}>
                {isLogistica && !locked && !cancelado && (
                  <Pressable onPress={() => toggleSelect(it._id)} style={[styles.checkbox, selected.has(it._id) && styles.checkboxChecked]}>
                    {selected.has(it._id) && <CheckCircle2 size={13} color="#fff" />}
                  </Pressable>
                )}
                <View style={{ flex: 1 }}>
                  {canEditTecnico ? (
                    <TextField value={it.descricaoMaterial} onChangeText={(v) => handleFieldChange(it._id, "descricaoMaterial", v)} style={{ marginBottom: 4 }} />
                  ) : (
                    <Text style={styles.itemName}>{it.descricaoMaterial}</Text>
                  )}
                  <Text style={styles.itemCode}>NI Material: {it.niMaterial || "—"}</Text>
                </View>
                {isTecnico && !locked && !cancelado && (
                  <Pressable onPress={() => cancelItem(it._id)}>
                    <Trash2 size={15} color={COLORS.rust} />
                  </Pressable>
                )}
              </View>

              <View style={styles.itemFieldsRow}>
                <View style={styles.itemField}>
                  <Text style={styles.itemFieldLabel}>Qtd</Text>
                  {canEditTecnico ? (
                    <TextField value={it.qdt} onChangeText={(v) => handleFieldChange(it._id, "qdt", v)} keyboardType="numeric" style={{ width: 60 }} />
                  ) : (
                    <Text style={styles.itemFieldValue}>{it.qdt}</Text>
                  )}
                </View>
                <View style={styles.itemField}>
                  <Text style={styles.itemFieldLabel}>Ubm</Text>
                  <Text style={styles.itemFieldValue}>{it.ubm || "—"}</Text>
                </View>
                <View style={styles.itemField}>
                  <Text style={styles.itemFieldLabel}>Nº de OS</Text>
                  <Text style={styles.itemFieldValue}>{it.os || "—"}</Text>
                </View>
                <View style={styles.itemField}>
                  <Text style={styles.itemFieldLabel}>Referência</Text>
                  <Text style={styles.itemFieldValue}>{it.refFornecedor || "—"}</Text>
                </View>
                <View style={styles.itemField}>
                  <Text style={styles.itemFieldLabel}>Reserva</Text>
                  <Text style={styles.itemFieldValue}>{it.reserva || "—"}</Text>
                </View>
                <View style={styles.itemField}>
                  <Text style={styles.itemFieldLabel}>Item</Text>
                  <Text style={styles.itemFieldValue}>{it.item || "—"}</Text>
                </View>
              </View>

              <View style={styles.itemFieldsRow}>
                <View style={styles.itemField}>
                  <Text style={styles.itemFieldLabel}>Qtd. localizada</Text>
                  {canEditLogistica ? (
                    <TextField value={it.qdtLocalizada} onChangeText={(v) => handleQdtLocalizadaChange(it._id, v)} keyboardType="numeric" style={{ width: 80 }} />
                  ) : (
                    <Text style={styles.itemFieldValue}>{it.qdtLocalizada || "—"}</Text>
                  )}
                </View>
              </View>

              <View style={{ marginTop: 8 }}>
                <Text style={styles.itemFieldLabel}>Status</Text>
                <Stamp meta={meta} size="sm" />
              </View>

              <View style={{ marginTop: 10 }}>
                <Text style={styles.itemFieldLabel}>Retirada</Text>
                <RetiradaCell
                  item={it}
                  canManage={isLogistica && !locked}
                  isFormOpen={retiradaOpenId === it._id}
                  onOpenForm={() => { setRetiradaOpenId(it._id); setRetiradaQtd(""); setRetiradaQuem(""); }}
                  onCloseForm={() => setRetiradaOpenId(null)}
                  qtdValue={retiradaQtd}
                  quemValue={retiradaQuem}
                  onQtdChange={setRetiradaQtd}
                  onQuemChange={setRetiradaQuem}
                  onConfirm={() => confirmRetirada(it._id)}
                  historyOpen={historyOpenId === it._id}
                  onToggleHistory={() => setHistoryOpenId(historyOpenId === it._id ? null : it._id)}
                />
              </View>

              <View style={{ marginTop: 10 }}>
                <Text style={styles.itemFieldLabel}>Nº de NT</Text>
                <Text style={{ color: COLORS.muted, fontSize: 12.5 }}>{it.obs || "—"}</Text>
              </View>
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  backBtn: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 14 },
  backText: { color: COLORS.muted, fontFamily: FONTS.bodySemiBold, fontSize: 13 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 6 },
  code: { fontFamily: FONTS.mono, fontSize: 14, fontWeight: "700", color: COLORS.ink },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  title: { fontFamily: FONTS.displaySemiBold, fontSize: 20, color: COLORS.ink, flexShrink: 1 },
  headerGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  headerField: { minWidth: 140, flexGrow: 1 },
  headerLabel: { color: COLORS.muted, fontSize: 11, marginBottom: 2, fontFamily: FONTS.body },
  headerValue: { fontFamily: FONTS.bodyMedium, fontSize: 13, color: COLORS.ink },
  actionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10, alignItems: "center" },
  infoInline: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 14 },
  infoText: { fontSize: 12, color: COLORS.muted, fontFamily: FONTS.body },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 1.5, borderColor: COLORS.line, alignItems: "center", justifyContent: "center", marginRight: 10, marginTop: 2 },
  checkboxChecked: { backgroundColor: COLORS.teal, borderColor: COLORS.teal },
  itemTopRow: { flexDirection: "row", alignItems: "flex-start" },
  itemName: { fontFamily: FONTS.bodyMedium, fontSize: 13.5, color: COLORS.ink },
  itemCode: { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.muted, marginTop: 2 },
  itemFieldsRow: { flexDirection: "row", gap: 20, marginTop: 10, flexWrap: "wrap" },
  itemField: { gap: 3 },
  itemFieldLabel: { fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.4, color: COLORS.muted, fontFamily: FONTS.mono, marginBottom: 3 },
  itemFieldValue: { fontSize: 13, color: COLORS.ink, fontFamily: FONTS.body },
});
