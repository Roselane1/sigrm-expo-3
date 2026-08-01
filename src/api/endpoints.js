import { apiFetch } from "./client";

export function login(loginValue, senha) {
  return apiFetch("/api/auth/login", { method: "POST", body: { login: loginValue, senha } });
}

export function listUsers(token) {
  return apiFetch("/api/users", { token });
}
export function createUser(token, user) {
  return apiFetch("/api/users", { method: "POST", body: user, token });
}
export function updateUser(token, id, patch) {
  return apiFetch(`/api/users/${id}`, { method: "PATCH", body: patch, token });
}
export function deleteUser(token, id) {
  return apiFetch(`/api/users/${id}`, { method: "DELETE", token });
}

export function listRequisicoes(token) {
  return apiFetch("/api/requisicoes", { token });
}
export function createRequisicaoApi(token, data) {
  return apiFetch("/api/requisicoes", { method: "POST", body: data, token });
}
export function updateRequisicaoApi(token, id, patch) {
  return apiFetch(`/api/requisicoes/${id}`, { method: "PATCH", body: patch, token });
}

export function listNotifications(token) {
  return apiFetch("/api/notifications", { token });
}
export function markAllNotificationsReadApi(token) {
  return apiFetch("/api/notifications/read-all", { method: "PATCH", token });
}
