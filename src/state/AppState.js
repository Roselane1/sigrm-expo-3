import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as api from "../api/endpoints";

const AppStateContext = createContext(null);
const TOKEN_KEY = "sigrm.token";
const USER_KEY = "sigrm.user";

export function AppStateProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [restoringSession, setRestoringSession] = useState(true);

  const [users, setUsers] = useState([]);
  const [requisitions, setRequisitions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const loadAllData = useCallback(async (tk) => {
    setLoadingData(true);
    try {
      const [reqs, us, notifs] = await Promise.all([
        api.listRequisicoes(tk),
        api.listUsers(tk),
        api.listNotifications(tk),
      ]);
      setRequisitions(reqs);
      setUsers(us);
      setNotifications(notifs);
    } catch (err) {
      showToast(err.message || "Não foi possível carregar os dados.");
    } finally {
      setLoadingData(false);
    }
  }, [showToast]);

  // Tenta restaurar a sessão salva ao abrir o app.
  useEffect(() => {
    (async () => {
      try {
        const [savedToken, savedUser] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY),
        ]);
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          await loadAllData(savedToken);
        }
      } catch {
        // sessão não pôde ser restaurada — segue para a tela de login
      } finally {
        setRestoringSession(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (loginValue, senha) => {
      const result = await api.login(loginValue, senha); // lança erro se falhar — a tela trata
      setToken(result.token);
      setUser(result.user);
      await AsyncStorage.setItem(TOKEN_KEY, result.token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(result.user));
      await loadAllData(result.token);
      return result.user;
    },
    [loadAllData]
  );

  const logout = useCallback(async () => {
    setUser(result.user);
    setToken(result.token);
    setUsers([]);
    setRequisitions([]);
    setNotifications([]);
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  }, []);

  const refreshRequisicoes = useCallback(async () => {
    if (!token) return;
    const reqs = await api.listRequisicoes(token);
    setRequisitions(reqs);
  }, [token]);

  const updateRequisicao = useCallback(
    async (updated) => {
      try {
        const saved = await api.updateRequisicaoApi(token, updated.id, updated);
        setRequisitions((prev) => prev.map((r) => (r.id === saved.id ? saved : r)));
        return saved;
      } catch (err) {
        showToast(err.message || "Não foi possível salvar a alteração.");
        throw err;
      }
    },
    [token, showToast]
  );

  const createRequisicao = useCallback(
    async (data) => {
      const created = await api.createRequisicaoApi(token, data);
      setRequisitions((prev) => [created, ...prev]);
      showToast(`${created.code} criada e enviada para a Logística.`);
      return created;
    },
    [token, showToast]
  );

  const markAllNotificationsRead = useCallback(async () => {
    try {
      const notifs = await api.markAllNotificationsReadApi(token);
      setNotifications(notifs);
    } catch {
      // falha silenciosa — não é crítico
    }
  }, [token]);

  const addUser = useCallback(
    async (u) => {
      const created = await api.createUser(token, u);
      setUsers((prev) => [...prev, created]);
      return created;
    },
    [token]
  );
  const updateUser = useCallback(
    async (id, patch) => {
      const saved = await api.updateUser(token, id, patch);
      setUsers((prev) => prev.map((x) => (x.id === saved.id ? saved : x)));
      return saved;
    },
    [token]
  );
  const removeUser = useCallback(
    async (id) => {
      await api.deleteUser(token, id);
      setUsers((prev) => prev.filter((x) => x.id !== id));
    },
    [token]
  );

  const value = {
    user,
    token,
    restoringSession,
    login,
    logout,
    users,
    addUser,
    updateUser,
    removeUser,
    requisitions,
    updateRequisicao,
    createRequisicao,
    refreshRequisicoes,
    notifications,
    markAllNotificationsRead,
    loadingData,
    toast,
    showToast,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState deve ser usado dentro de AppStateProvider");
  return ctx;
}
