import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, useWindowDimensions } from "react-native";
import {
  LayoutDashboard,
  ClipboardList,
  Plus,
  Settings,
  Bell,
  LogOut,
  XCircle,
  RefreshCw,
} from "lucide-react-native";
import { COLORS } from "../theme/colors";
import { FONTS } from "../theme/fonts";
import { ROLES } from "../data/constants";
import { useAppState } from "../state/AppState";
 
import DashboardScreen from "./DashboardScreen";
import RequisicoesListScreen from "./RequisicoesListScreen";
import RequisicaoDetalheScreen from "./RequisicaoDetalheScreen";
import NovaRequisicaoScreen from "./NovaRequisicaoScreen";
import AdministracaoScreen from "./AdministracaoScreen";
 
const COMPACT_BREAKPOINT = 700;
 
// Barra lateral fixa, sempre visível (sem menu suspenso / gaveta que abre e fecha).
// Em telas estreitas (celular) ela fica mais fina, só com os ícones.
export default function AppShell() {
  const { user, logout, notifications, markAllNotificationsRead, toast, refreshAll, refreshing } = useAppState();
  const { width } = useWindowDimensions();
  const compact = width < COMPACT_BREAKPOINT;
 
  const [view, setView] = useState("dashboard");
  const [selectedReqId, setSelectedReqId] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
 
  function goTo(v, reqId) {
    setView(v);
    if (reqId) setSelectedReqId(reqId);
  }
 
  const navItems = [
    { key: "dashboard", label: "Painel", icon: LayoutDashboard },
    { key: "requisicoes", label: "Requisições", icon: ClipboardList },
    ...(user.role === "tecnico" ? [{ key: "nova", label: "Nova requisição", icon: Plus }] : []),
    ...(user.role === "administrador" ? [{ key: "administracao", label: "Administração", icon: Settings }] : []),
  ];
 
  const unread = notifications.some((n) => !n.read);
 
  function renderScreen() {
    if (view === "dashboard") return <DashboardScreen goTo={goTo} />;
    if (view === "requisicoes") return <RequisicoesListScreen goTo={goTo} />;
    if (view === "nova" && user.role === "tecnico") return <NovaRequisicaoScreen goTo={goTo} />;
    if (view === "administracao" && user.role === "administrador") return <AdministracaoScreen />;
    if (view === "detalhe" && selectedReqId) return <RequisicaoDetalheScreen reqId={selectedReqId} onBack={() => goTo("requisicoes")} />;
    return <DashboardScreen goTo={goTo} />;
  }
 
  return (
    <View style={styles.root}>
      <View style={styles.body}>
        <View style={[styles.sidebar, { width: compact ? 68 : 220, padding: compact ? 10 : 16 }]}>
          <View style={[styles.sidebarHeader, compact && { justifyContent: "center", marginBottom: 16 }]}>
            {!compact && (
              <View>
                <Text style={styles.sidebarEyebrow}>SIGRM</Text>
                <Text style={styles.sidebarTitle}>Gestão de{"\n"}Requisições</Text>
              </View>
            )}
            {compact && <Text style={styles.sidebarEyebrowCompact}>SIGRM</Text>}
            {!compact && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Pressable onPress={refreshAll} disabled={refreshing} style={styles.bellBtn}>
                  <RefreshCw size={14} color="#fff" />
                </Pressable>
                {user.role === "logistica" && (
              <View>
                <Pressable
                  onPress={() => {
                    setNotifOpen((o) => !o);
                    if (!notifOpen) markAllNotificationsRead();
                  }}
                  style={styles.bellBtn}
                >
                  <Bell size={15} color="#fff" />
                  {unread && <View style={styles.bellDot} />}
                </Pressable>
                {notifOpen && (
                  <View style={styles.notifDropdown}>
                    <Text style={styles.notifTitle}>Notificações</Text>
                    <ScrollView style={{ maxHeight: 280 }}>
                      {notifications.length === 0 ? (
                        <Text style={styles.notifEmpty}>Nenhuma notificação ainda.</Text>
                      ) : (
                        notifications.map((n) => (
                          <View key={n.id} style={styles.notifItem}>
                            {n.type === "cancelamento" ? (
                              <XCircle size={14} color={COLORS.rust} />
                            ) : (
                              <ClipboardList size={14} color={COLORS.teal} />
                            )}
                            <View style={{ flex: 1 }}>
                              <Text style={styles.notifItemTitle}>
                                {n.type === "cancelamento" ? "Requisição cancelada" : "Nova requisição recebida"}
                              </Text>
                              <Text style={styles.notifItemMeta}>{n.code} · {n.obra}</Text>
                              <Text style={styles.notifItemTime}>{n.time}</Text>
                            </View>
                          </View>
                        ))
                      )}
                    </ScrollView>
                  </View>
                )}
              </View>
                )}
              </View>
            )}
          </View>
 
          {compact && (
            <Pressable onPress={refreshAll} disabled={refreshing} style={[styles.bellBtn, { alignSelf: "center", marginBottom: 8 }]}>
              <RefreshCw size={14} color="#fff" />
            </Pressable>
          )}
 
          {compact && user.role === "logistica" && (
            <Pressable
              onPress={() => {
                setNotifOpen((o) => !o);
                if (!notifOpen) markAllNotificationsRead();
              }}
              style={[styles.bellBtn, { alignSelf: "center", marginBottom: 14 }]}
            >
              <Bell size={15} color="#fff" />
              {unread && <View style={styles.bellDot} />}
            </Pressable>
          )}
 
          <View style={{ gap: 3, marginBottom: 20 }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = view === item.key;
              return (
                <Pressable
                  key={item.key}
                  onPress={() => goTo(item.key)}
                  style={[styles.navItem, compact && styles.navItemCompact, active && styles.navItemActive]}
                >
                  <Icon size={16} color={active ? "#fff" : "#C4CBC3"} />
                  {!compact && <Text style={[styles.navItemText, active && { color: "#fff" }]}>{item.label}</Text>}
                </Pressable>
              );
            })}
          </View>
 
          <View style={styles.sidebarFooter}>
            <View style={[{ flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 10 }, compact && { justifyContent: "center" }]}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{(user.name || "?").slice(0, 1).toUpperCase()}</Text>
              </View>
              {!compact && (
                <View>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userRole}>{ROLES[user.role]?.label || "—"}</Text>
                </View>
              )}
            </View>
            <Pressable onPress={logout} style={[styles.logoutBtn, compact && { justifyContent: "center", paddingHorizontal: 0 }]}>
              <LogOut size={13} color="#C4CBC3" />
              {!compact && <Text style={styles.logoutText}>Sair</Text>}
            </Pressable>
          </View>
        </View>
 
        <View style={styles.main}>
          <View style={[styles.mainInner, compact && { padding: 12 }]}>{renderScreen()}</View>
        </View>
      </View>
 
      {toast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}
    </View>
  );
}
 
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.paper },
  body: { flex: 1, flexDirection: "row" },
  sidebar: { backgroundColor: COLORS.ink },
  sidebarHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 },
  sidebarEyebrow: { fontFamily: FONTS.mono, fontSize: 10.5, letterSpacing: 1.5, color: "#9FB0A6", textTransform: "uppercase" },
  sidebarEyebrowCompact: { fontFamily: FONTS.mono, fontSize: 9.5, letterSpacing: 1, color: "#9FB0A6", textTransform: "uppercase" },
  sidebarTitle: { fontFamily: FONTS.displayBold, fontSize: 16, color: "#fff", lineHeight: 20 },
  bellBtn: { width: 30, height: 30, borderRadius: 7, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  bellDot: { position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.amber, borderWidth: 1.5, borderColor: COLORS.ink },
  notifDropdown: { position: "absolute", top: 36, right: 0, width: 240, backgroundColor: "#fff", borderRadius: 10, zIndex: 60, shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 10, overflow: "hidden" },
  notifTitle: { padding: 12, fontSize: 12, fontWeight: "700", color: COLORS.ink, borderBottomWidth: 1, borderBottomColor: COLORS.line },
  notifEmpty: { padding: 16, fontSize: 12.5, color: COLORS.muted },
  notifItem: { flexDirection: "row", gap: 8, padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.line },
  notifItemTitle: { fontSize: 12.5, color: COLORS.ink, fontFamily: FONTS.bodyMedium },
  notifItemMeta: { fontSize: 11.5, color: COLORS.muted, fontFamily: FONTS.mono },
  notifItemTime: { fontSize: 10.5, color: COLORS.muted },
  navItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9, paddingHorizontal: 10, borderRadius: 7 },
  navItemCompact: { justifyContent: "center", paddingHorizontal: 0 },
  navItemActive: { backgroundColor: "rgba(255,255,255,0.1)" },
  navItemText: { fontFamily: FONTS.bodyMedium, fontSize: 13, color: "#C4CBC3" },
  sidebarFooter: { marginTop: "auto", paddingTop: 14, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.12)" },
  avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.teal, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  userName: { fontSize: 12.5, fontWeight: "600", color: "#fff", fontFamily: FONTS.bodySemiBold },
  userRole: { fontSize: 11, color: "#9FB0A6" },
  logoutBtn: { flexDirection: "row", alignItems: "center", gap: 7, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", borderRadius: 7, paddingVertical: 7, paddingHorizontal: 10 },
  logoutText: { color: "#C4CBC3", fontSize: 12.5, fontFamily: FONTS.body },
  main: { flex: 1, minWidth: 0 },
  mainInner: { flex: 1, padding: 20 },
  toast: { position: "absolute", bottom: 24, left: "50%", transform: [{ translateX: -100 }], backgroundColor: COLORS.ink, paddingVertical: 11, paddingHorizontal: 20, borderRadius: 8, maxWidth: 320 },
  toastText: { color: "#fff", fontSize: 13.5, fontFamily: FONTS.bodyMedium },
});
 
