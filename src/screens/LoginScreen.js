import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from "react-native";
import { COLORS } from "../theme/colors";
import { FONTS } from "../theme/fonts";
import { TextField } from "../components/Misc";
import Button from "../components/Button";
import { useAppState } from "../state/AppState";

export default function LoginScreen() {
  const { login } = useAppState();
  const [loginValue, setLoginValue] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!loginValue.trim() || !senha.trim()) {
      setError("Preencha login e senha.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await login(loginValue, senha);
    } catch (err) {
      setError(err.message || "Não foi possível entrar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.eyebrow}>SIGRM</Text>
          <Text style={styles.title}>Sistema Integrado de Gestão de Requisições de Materiais</Text>
          <Text style={styles.subtitle}>Entre com seu login e senha cadastrados pelo Administrador.</Text>

          <Text style={styles.label}>Login</Text>
          <TextField value={loginValue} onChangeText={setLoginValue} placeholder="Ex: wesley" style={{ marginBottom: 14 }} />

          <Text style={styles.label}>Senha</Text>
          <View style={{ marginBottom: 16 }}>
            <TextField value={senha} onChangeText={setSenha} placeholder="••••••••" secureTextEntry={!showSenha} />
            <Pressable onPress={() => setShowSenha((s) => !s)} style={styles.showBtn}>
              <Text style={styles.showBtnText}>{showSenha ? "ocultar" : "ver"}</Text>
            </Pressable>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Button variant="teal" onPress={handleSubmit} disabled={submitting} style={{ width: "100%" }}>
            {submitting ? "Entrando..." : "Entrar"}
          </Button>
          {submitting && <ActivityIndicator style={{ marginTop: 12 }} color={COLORS.teal} />}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.ink },
  scroll: { flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 28, width: "100%", maxWidth: 420 },
  eyebrow: { fontFamily: FONTS.mono, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: COLORS.muted, marginBottom: 6 },
  title: { fontFamily: FONTS.displayBold, fontSize: 21, color: COLORS.ink, marginBottom: 4 },
  subtitle: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.muted, marginBottom: 10 },
  fillLink: { color: COLORS.teal, fontFamily: FONTS.bodySemiBold, fontSize: 12, marginBottom: 18 },
  label: { fontSize: 12, fontFamily: FONTS.bodySemiBold, color: COLORS.muted, marginBottom: 5 },
  showBtn: { position: "absolute", right: 10, top: 10 },
  showBtnText: { color: COLORS.muted, fontSize: 11, fontFamily: FONTS.body },
  errorBox: { backgroundColor: COLORS.rustSoft, borderWidth: 1, borderColor: COLORS.rust + "55", borderRadius: 7, padding: 10, marginBottom: 14 },
  errorText: { color: COLORS.rust, fontSize: 12.5, fontFamily: FONTS.bodySemiBold },
});
