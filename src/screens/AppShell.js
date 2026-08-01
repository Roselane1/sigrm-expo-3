import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import {
  LayoutDashboard,
  ClipboardList,
  Plus,
  Settings,
  Bell,
  LogOut,
  XCircle,
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

// Barra lateral fixa, sempre visível (sem menu suspenso / gaveta que abre e fecha).
export default function AppShell() {
  const { user, logout, notifications, markAllNotificationsRead, toast } = useAppState();

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
