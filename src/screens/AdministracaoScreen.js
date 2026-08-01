import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { Plus, Trash2, CheckCircle2, XCircle } from "lucide-react-native";
import { COLORS } from "../theme/colors";
import { FONTS } from "../theme/fonts";
import Card from "../components/Card";
import Stamp from "../components/Stamp";
import Button from "../components/Button";
import Select from "../components/Select";
import { SectionTitle, TextField } from "../components/Misc";
import { ROLES } from "../data/constants";
import { useAppState } from "../state/AppState";

function emptyUserForm() {
  return { nome: "", login: "", senha: "", perfil: "tecnico" };
}

const ROLE_OPTIONS = Object.entries(ROLES).map(([k, r]) => ({ value: k, label: r.label }));

export default function AdministracaoScreen() {
  const { users, addUser, updateUser, removeUser, user: currentUser } = useAppState();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyUserForm());
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function startEdit(u) {
    setEditingId(u.id);
    // Senha fica em branco ao editar — o servidor nunca devolve a senha
    // (fica guardada como hash). Deixe em branco pra manter a atual, ou
    // preencha pra redefinir.
    setForm({ nome: u.nome, login: u.login, senha: "", perfil: u.perfil });
    setShowForm(true);
    setError("");
  }
  function startNew() {
    setEditingId(null);
    setForm(emptyUserForm());
    setShowForm(true);
    setError("");
  }

  async function handleSubmit() {
    if (!form.nome.trim() || !form.login.trim() || (!editingId && !form.senha.trim())) {
      setError(editingId ? "Preencha nome e login." : "Preencha nome, login e senha.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      if (editingId) {
        const patch = { nome: form.nome.trim(), login: form.login.trim(), perfil: form.perfil };
        if (form.senha.trim()) patch.senha = form.senha.trim(); // só redefine se preenchida
        await updateUser(editingId, patch);
      } else {
        await addUser({ nome: form.nome.trim(), login: form.login.trim(), senha: form.senha.trim(), perfil: form.perfil });
      }
      setShowForm(false);
      setForm(emptyUserForm());
      setEditingId(null);
    } catch (err) {
      setError(err.message || "Não foi possível salvar o usuário.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleAtivo(u) {
    try {
      await updateUser(u.id, { ativo: u.ativo === false ? true : false });
    } catch (err) {
      // o toast global já mostra o erro via updateUser, se aplicável
    }
  }

  async function handleRemove(id) {
    try {
      await removeUser(id);
    } catch (err) {
      setError(err.message || "Não foi possível remover o usuário.");
    }
  }

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
      <SectionTitle
        eyebrow="Sistema"
        title="Administração de usuários"
        right={<Button variant="teal" icon={Plus} onPress={startNew}>{showForm ? "Fechar" : "Novo usuário"}</Button>}
      />

      {showForm && (
        <Card style={{ marginBottom: 18 }}>
          <View style={styles.formGrid}>
            <View style={{ minWidth: 160, flexGrow: 1 }}>
              <Text style={styles.label}>Nome</Text>
              <TextField value={form.nome} onChangeText={(v) => setForm({ ...form, nome: v })} placeholder="Nome completo" />
            </View>
            <View style={{ minWidth: 160, flexGrow: 1 }}>
              <Text style={styles.label}>Login</Text>
              <TextField value={form.login} onChangeText={(v) => setForm({ ...form, login: v })} placeholder="Ex: wesley" />
            </View>
            <View style={{ minWidth: 160, flexGrow: 1 }}>
              <Text style={styles.label}>{editingId ? "Nova senha (opcional)" : "Senha"}</Text>
              <TextField value={form.senha} onChangeText={(v) => setForm({ ...form, senha: v })} placeholder={editingId ? "Deixe em branco para manter" : "Senha"} />
            </View>
            <View style={{ minWidth: 160, flexGrow: 1 }}>
              <Text style={styles.label}>Perfil</Text>
              <Select value={form.perfil} onValueChange={(v) => setForm({ ...form, perfil: v })} options={ROLE_OPTIONS} />
            </View>
          </View>
          {error ? <Text style={{ color: COLORS.rust, fontSize: 12.5, marginTop: 10 }}>{error}</Text> : null}
          <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
            <Button variant="primary" onPress={handleSubmit} disabled={submitting}>
              {submitting ? "Salvando..." : editingId ? "Salvar alterações" : "Cadastrar usuário"}
            </Button>
            <Button variant="ghost" onPress={() => { setShowForm(false); setEditingId(null); setError(""); }} disabled={submitting}>Cancelar</Button>
          </View>
        </Card>
      )}

      <View style={{ gap: 10 }}>
        {users.map((u) => (
          <Card key={u.id} style={{ opacity: u.ativo === false ? 0.55 : 1 }}>
            <View style={styles.userRow}>
              <View style={{ flex: 1, minWidth: 160 }}>
                <Text style={styles.userName}>{u.nome}</Text>
                <Text style={styles.userMeta}>{u.login} · {ROLES[u.perfil]?.label}</Text>
              </View>
              <Stamp
                meta={u.ativo === false ? { label: "Inativo", color: COLORS.rust, bg: COLORS.rustSoft, icon: XCircle } : { label: "Ativo", color: COLORS.teal, bg: COLORS.tealSoft, icon: CheckCircle2 }}
                size="sm"
              />
            </View>
            <View style={styles.userActions}>
              <Pressable onPress={() => startEdit(u)}><Text style={styles.actionLink}>Editar</Text></Pressable>
              <Pressable onPress={() => toggleAtivo(u)}>
                <Text style={styles.actionLinkMuted}>{u.ativo === false ? "Ativar" : "Desativar"}</Text>
              </Pressable>
              {u.id !== currentUser.id && (
                <Pressable onPress={() => handleRemove(u.id)}>
                  <Trash2 size={14} color={COLORS.rust} />
                </Pressable>
              )}
            </View>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  formGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  label: { fontSize: 11.5, fontFamily: FONTS.bodySemiBold, color: COLORS.muted, marginBottom: 4 },
  userRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 10 },
  userName: { fontFamily: FONTS.bodySemiBold, fontSize: 13.5, color: COLORS.ink },
  userMeta: { fontFamily: FONTS.mono, fontSize: 11.5, color: COLORS.muted, marginTop: 2 },
  userActions: { flexDirection: "row", gap: 16, alignItems: "center" },
  actionLink: { color: COLORS.ink, fontSize: 12, fontFamily: FONTS.bodySemiBold },
  actionLinkMuted: { color: COLORS.muted, fontSize: 12, fontFamily: FONTS.bodySemiBold },
});
