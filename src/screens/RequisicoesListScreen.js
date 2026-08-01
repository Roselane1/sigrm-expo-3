import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { Search as SearchIcon, ChevronRight } from "lucide-react-native";
import { COLORS } from "../theme/colors";
import { FONTS } from "../theme/fonts";
import Card from "../components/Card";
import Stamp from "../components/Stamp";
import Select from "../components/Select";
import { SectionTitle, EmptyState, TextField } from "../components/Misc";
import { REQ_STATUS_META, PRIORIDADE_META } from "../data/constants";
import { useAppState } from "../state/AppState";
 
export default function RequisicoesListScreen({ goTo }) {
  const { requisitions } = useAppState();
  const [filter, setFilter] = useState("todos");
  const [prioridadeFilter, setPrioridadeFilter] = useState("todas");
  const [search, setSearch] = useState("");
 
  const filtered = requisitions.filter((r) => {
    const matchStatus = filter === "todos" || r.status === filter;
    const matchPrioridade = prioridadeFilter === "todas" || r.prioridade === prioridadeFilter;
    const s = search.toLowerCase();
    const matchSearch =
      !s || r.code.toLowerCase().includes(s) || r.nomeObra.toLowerCase().includes(s) || r.solicitante.toLowerCase().includes(s);
    return matchStatus && matchPrioridade && matchSearch;
  });
 
  const statusOptions = [{ value: "todos", label: "Todos os status" }, ...Object.entries(REQ_STATUS_META).map(([k, m]) => ({ value: k, label: m.label }))];
  const prioridadeOptions = [{ value: "todas", label: "Todas as prioridades" }, ...Object.entries(PRIORIDADE_META).map(([k, m]) => ({ value: k, label: m.label }))];
 
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      <SectionTitle eyebrow="Fluxo" title="Requisições" />
 
      <View style={styles.filters}>
        <View style={{ flex: 1, minWidth: 180, position: "relative", justifyContent: "center" }}>
          <SearchIcon size={14} color={COLORS.muted} style={{ position: "absolute", left: 10, zIndex: 1 }} />
          <TextField value={search} onChangeText={setSearch} placeholder="Buscar código, obra..." style={{ paddingLeft: 30 }} />
        </View>
        <Select value={filter} onValueChange={setFilter} options={statusOptions} style={{ minWidth: 170 }} />
        <Select value={prioridadeFilter} onValueChange={setPrioridadeFilter} options={prioridadeOptions} style={{ minWidth: 170 }} />
      </View>
 
      {filtered.length === 0 ? (
        <Card><EmptyState label="Nenhuma requisição encontrada." /></Card>
      ) : (
        <View style={{ gap: 10 }}>
          {filtered.map((r) => {
            const itemsDone = r.items.filter((i) => ["localizado", "aguardando_retirada", "retirado"].includes(i.statusItem)).length;
            return (
              <Pressable key={r.id} onPress={() => goTo("detalhe", r.id)}>
                <Card>
                  <View style={styles.row}>
                    <View style={styles.infoWrap}>
                      <Text style={styles.code}>{r.code}</Text>
                      <Text style={styles.obra}>{r.nomeObra}</Text>
                      <Text style={styles.meta}>{r.solicitante} · {r.dataCriacao} · {itemsDone}/{r.items.length} localizados</Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      {r.prioridade ? <Stamp meta={PRIORIDADE_META[r.prioridade]} size="sm" /> : null}
                      <Stamp meta={REQ_STATUS_META[r.status]} size="sm" />
                      <ChevronRight size={15} color={COLORS.muted} />
                    </View>
                  </View>
                </Card>
              </Pressable>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}
 
const styles = StyleSheet.create({
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 18 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 },
  infoWrap: { flexShrink: 1, gap: 2 },
  code: { fontFamily: FONTS.mono, fontSize: 13, fontWeight: "600", color: COLORS.ink },
  obra: { fontFamily: FONTS.bodyMedium, fontSize: 13.5, color: COLORS.ink },
  meta: { fontFamily: FONTS.body, fontSize: 11.5, color: COLORS.muted },
});
