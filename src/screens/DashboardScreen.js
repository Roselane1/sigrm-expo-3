import React, { useMemo } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { COLORS } from "../theme/colors";
import { FONTS } from "../theme/fonts";
import Card from "../components/Card";
import Stamp from "../components/Stamp";
import { SectionTitle, EmptyState } from "../components/Misc";
import { REQ_STATUS_META, PRIORIDADE_META } from "../data/constants";
import { useAppState } from "../state/AppState";

export default function DashboardScreen({ goTo }) {
  const { requisitions, user } = useAppState();
  const { width } = useWindowDimensions();
  const isNarrow = width < 480;

  const counts = useMemo(() => {
    const c = { aberta: 0, em_atendimento: 0, aguardando_retirada: 0, finalizada: 0, finalizada_pendencias: 0, cancelada: 0 };
    requisitions.forEach((r) => c[r.status]++);
    return c;
  }, [requisitions]);

  const emAndamento = useMemo(
    () => requisitions.filter((r) => !["finalizada", "finalizada_pendencias", "cancelada"].includes(r.status)),
    [requisitions]
  );

  const cardWidth = isNarrow ? "48%" : 150;

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      <SectionTitle eyebrow={`Bem-vindo, ${user.name}`} title="Painel geral" />

      <View style={styles.statsRow}>
        {["aberta", "em_atendimento", "aguardando_retirada", "finalizada"].map((key) => {
          const meta = REQ_STATUS_META[key];
          const Icon = meta.icon;
          return (
            <Card key={key} style={{ width: cardWidth, marginBottom: 12 }}>
              <View style={styles.statHeader}>
                <Text style={styles.statLabel}>{meta.label}</Text>
                <View style={[styles.statIconWrap, { backgroundColor: meta.bg }]}>
                  <Icon size={14} color={meta.color} />
                </View>
              </View>
              <Text style={styles.statValue}>{counts[key]}</Text>
            </Card>
          );
        })}
      </View>

      <View style={styles.statsRow}>
        <Card style={{ width: isNarrow ? "48%" : 200, marginBottom: 20 }}>
          <Text style={styles.smallLabel}>Finalizadas com pendências</Text>
          <Text style={[styles.smallValue, { color: COLORS.rust }]}>{counts.finalizada_pendencias}</Text>
        </Card>
        <Card style={{ width: isNarrow ? "48%" : 200, marginBottom: 20 }}>
          <Text style={styles.smallLabel}>Canceladas</Text>
          <Text style={[styles.smallValue, { color: COLORS.rust }]}>{counts.cancelada}</Text>
        </Card>
      </View>

      <Card>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Requisições em andamento</Text>
          <Pressable onPress={() => goTo("requisicoes")} style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
            <Text style={styles.listLink}>Ver histórico completo</Text>
            <ChevronRight size={13} color={COLORS.teal} />
          </Pressable>
        </View>

        {emAndamento.length === 0 ? (
          <EmptyState label="Nenhuma requisição em andamento." />
        ) : (
          emAndamento.map((r) => (
            <Pressable key={r.id} onPress={() => goTo("detalhe", r.id)} style={styles.reqRow}>
              <View style={{ flexShrink: 1 }}>
                <Text style={styles.reqCode}>{r.code}</Text>
                <Text style={styles.reqObra}>{r.nomeObra}</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                {r.prioridade ? <Stamp meta={PRIORIDADE_META[r.prioridade]} size="sm" /> : null}
                <Stamp meta={REQ_STATUS_META[r.status]} size="sm" />
              </View>
            </Pressable>
          ))
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 4 },
  statHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  statLabel: { fontFamily: FONTS.mono, fontSize: 10.5, letterSpacing: 0.5, textTransform: "uppercase", color: COLORS.muted, flexShrink: 1 },
  statIconWrap: { width: 26, height: 26, borderRadius: 7, alignItems: "center", justifyContent: "center" },
  statValue: { fontFamily: FONTS.displayBold, fontSize: 26, color: COLORS.ink },
  smallLabel: { fontSize: 12.5, color: COLORS.muted, marginBottom: 4, fontFamily: FONTS.body },
  smallValue: { fontFamily: FONTS.displayBold, fontSize: 20 },
  listHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 },
  listTitle: { fontFamily: FONTS.displaySemiBold, fontSize: 15, color: COLORS.ink },
  listLink: { color: COLORS.teal, fontSize: 12.5, fontFamily: FONTS.bodySemiBold },
  reqRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    flexWrap: "wrap",
    gap: 8,
  },
  reqCode: { fontFamily: FONTS.mono, fontSize: 12, color: COLORS.muted },
  reqObra: { fontFamily: FONTS.bodyMedium, fontSize: 13.5, color: COLORS.ink },
});
