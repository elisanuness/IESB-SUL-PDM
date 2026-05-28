/**
 * ─────────────────────────────────────────────────────────────
 *  Gestão Financeira · Elisa Nunes de Freitas
 *  GlobalState.jsx — Contexto global da aplicação.
 *  Gerencia autenticação, categorias e transações,
 *  expondo estado e ações para toda a árvore de componentes.
 * ─────────────────────────────────────────────────────────────
 */

import { createContext, useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../services/api";

export const MoneyContext = createContext();

const USER_STORAGE_KEY = "@gestao_financeira:user";

export default function GlobalState({ children }) {
  const [user, setUser]               = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError]             = useState(null);

  // Busca categorias e transações do servidor para o usuário ativo
  const refresh = useCallback(async (currentUser) => {
    const u = currentUser ?? user;
    if (!u) return;
    setLoading(true);
    setError(null);
    try {
      const [cats, txs] = await Promise.all([
        api.listCategories(u.id),
        api.listTransactions(u.id),
      ]);
      setCategories(cats);
      setTransactions(txs);
    } catch (e) {
      setError(e.message ?? "Falha ao carregar dados do servidor");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Recupera sessão persistida no AsyncStorage ao inicializar o app
  useEffect(() => {
    async function restoreSession() {
      try {
        const stored = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setUser(parsed);
          await refresh(parsed);
        }
      } catch {}
      finally {
        setAuthLoading(false);
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  // --- AUTH ---

  const login = useCallback(async (username, password) => {
    const userData = await api.login({ username, password });
    setUser(userData);
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    await refresh(userData);
    return userData;
  }, [refresh]);

  const register = useCallback(async (name, username, password) => {
    return api.register({ name, username, password });
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setTransactions([]);
    setCategories([]);
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
  }, []);

  const deleteAccount = useCallback(async () => {
    if (!user) throw new Error("Usuário não autenticado");
    await api.deleteUser(user.username);
    // Limpa o estado local após exclusão bem-sucedida no servidor
    setUser(null);
    setTransactions([]);
    setCategories([]);
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
  }, [user]);

  const resetPassword = useCallback(async (username, newPassword) => {
    return api.resetPassword({ username, newPassword });
  }, []);

  const updateAvatar = useCallback(async (avatarSeed, avatarBg) => {
    if (!user) return;
    await api.updateAvatar({ userId: user.id, avatarSeed, avatarBg });
    const updated = { ...user, avatarSeed, avatarBg };
    setUser(updated);
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
  }, [user]);

  const updateName = useCallback(async (name) => {
    if (!user) return;
    await api.updateName({ userId: user.id, name });
    const updated = { ...user, name };
    setUser(updated);
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
  }, [user]);

  // --- TRANSAÇÕES ---

  const addTransaction = useCallback(async (data) => {
    if (!user) throw new Error("Usuário não autenticado");
    const created = await api.createTransaction({ ...data, userId: user.id });
    setTransactions((prev) => [created, ...prev]);
    return created;
  }, [user]);

  const editTransaction = useCallback(async (id, data) => {
    if (!user) throw new Error("Usuário não autenticado");
    const updated = await api.updateTransaction(id, { ...data, userId: user.id });
    setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  }, [user]);

  const removeTransaction = useCallback(async (id) => {
    await api.deleteTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // --- CATEGORIAS ---

  const addCategory = useCallback(async (data) => {
    if (!user) throw new Error("Usuário não autenticado");
    const created = await api.createCategory({ ...data, userId: user.id });
    // Mantém a lista ordenada alfabeticamente após a inserção
    setCategories((prev) =>
      [...prev, created].sort((a, b) => a.displayName.localeCompare(b.displayName))
    );
    return created;
  }, [user]);

  const editCategory = useCallback(async (id, data) => {
    const updated = await api.updateCategory(id, data);
    setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  }, []);

  const removeCategory = useCallback(async (id, transferCategoryId) => {
    await api.deleteCategory(id, transferCategoryId);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    // Atualiza localmente as transações vinculadas à categoria excluída,
    // evitando um novo fetch ao servidor
    if (transferCategoryId) {
      setTransactions((prev) =>
        prev.map((t) =>
          t.category?.id === id
            ? { ...t, categoryId: transferCategoryId }
            : t
        )
      );
    }
  }, []);

  return (
    <MoneyContext.Provider
      value={{
        user,
        transactions,
        categories,
        loading,
        authLoading,
        error,
        refresh: () => refresh(user), // expõe refresh sem exigir que o consumidor passe o usuário

        login,
        register,
        logout,
        deleteAccount,
        resetPassword,
        updateAvatar,
        updateName,
        addTransaction,
        editTransaction,
        removeTransaction,
        addCategory,
        editCategory,
        removeCategory,
      }}
    >
      {children}
    </MoneyContext.Provider>
  );
}
