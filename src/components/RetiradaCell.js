import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { COLORS } from "../theme/colors";
import { FONTS } from "../theme/fonts";
import { TextField } from "./Misc";
import { parseNum } from "../utils/helpers";

export default function RetiradaCell({
  item,
  canManage,
  isFormOpen,
  onOpenForm,
  onCloseForm,
  qtdValue,
  quemValue,
  onQtdChange,
  onQuemChange,
  onConfirm,
  historyOpen,
  onToggleHistory,
}) {
  const retiradas = item.retiradas || [];
  const totalRetirado = retiradas.reduce((s, r) => s + r.quantidade, 0);
  const localizadaNum = parseNum(item.qdtLocalizada);
  const elegivel = localizadaNum > 0 && item.statusItem !== "cancelado";
  const completo = item.statusItem === "retirado";

  if (!elegivel && retiradas.length === 0) {
    return <Text style={{ color: COLORS.muted, fontSize: 12.5 }}>—</Text>;
  }

  return (
    <View style={{ minWidth: 120 }}>
      {retiradas.length > 0 && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
          <Text style={{ fontSize: 12, fontWeight: "600", color: completo ? COLORS.ink : COLORS.indigo }}>
            {totalRetirado}/{localizadaNum || "?"} {item.ubm}
          </Text>
          <Pressable onPress={onToggleHistory}>
            <Text style={{ color: COLORS.teal, fontSize: 11 }}>{historyOpen ? "ocultar" : "histórico"}</Text>
          </Pressable>
        </View>
      )}

      {historyOpen && retiradas.length > 0 && (
        <View style={styles.historyBox}>
          {retiradas.map((r) => (
            <Text key={r.id} style={styles.historyLine}>
              {r.data} · {r.quemRetira} · {r.quantidade} {item.ubm}
            </Text>
          ))}
        </View>
      )}

      {canManage && elegivel && !completo && (
        isFormOpen ? (
          <View style={{ gap: 4 }}>
            <TextField value={qtdValue} onChangeText={onQtdChange} placeholder="Quantidade" keyboardType="numeric" style={{ width: 110 }} />
            <TextField value={quemValue} onChangeText={onQuemChange} placeholder="Quem retira" style={{ width: 140 }} />
            <View style={{ flexDirection: "row", gap: 4 }}>
              <Pressable onPress={onConfirm} style={styles.smallBtnTeal}>
                <Text style={styles.smallBtnTealText}>Confirmar</Text>
              </Pressable>
              <Pressable onPress={onCloseForm} style={styles.smallBtnGhost}>
                <Text style={styles.smallBtnGhostText}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable onPress={onOpenForm} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ Registrar retirada</Text>
          </Pressable>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  historyBox: {
    borderLeftWidth: 2,
    borderLeftColor: COLORS.line,
    paddingLeft: 6,
    marginBottom: 6,
  },
  historyLine: {
    fontSize: 11,
    color: COLORS.muted,
    fontFamily: FONTS.body,
  },
  addBtn: {
    borderWidth: 1,
    borderColor: COLORS.teal + "55",
    borderRadius: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: "flex-start",
  },
  addBtnText: { color: COLORS.teal, fontSize: 11, fontFamily: FONTS.bodySemiBold },
  smallBtnTeal: { backgroundColor: COLORS.teal, borderRadius: 5, paddingVertical: 4, paddingHorizontal: 8 },
  smallBtnTealText: { color: "#fff", fontSize: 11, fontFamily: FONTS.bodySemiBold },
  smallBtnGhost: { borderWidth: 1, borderColor: COLORS.line, borderRadius: 5, paddingVertical: 4, paddingHorizontal: 8 },
  smallBtnGhostText: { color: COLORS.ink, fontSize: 11, fontFamily: FONTS.bodySemiBold },
});
