/**
 * ─────────────────────────────────────────────────────────────
 *  Gestão Financeira · Elisa Nunes de Freitas
 *  api.js — Camada de acesso à API REST do backend.
 *  Centraliza todas as chamadas HTTP da aplicação.
 * ─────────────────────────────────────────────────────────────
 */

// URL base lida do ambiente; cai para o emulador Android por padrão
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:3000";

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  try {
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });

    if (!response.ok) {
      const text = await response.text();
      let errMsg = `HTTP ${response.status}`;
      try {
        const json = JSON.parse(text);
        errMsg = json.error ?? errMsg;
      } catch {}
      throw new Error(errMsg);
    }

    // 204 No Content não possui corpo; demais respostas retornam JSON
    return response.status === 204 ? null : response.json();
  } catch (err) {
    // Converte erros genéricos de rede em mensagem legível com a URL alvo
    if (err.message === "Network request failed" || err.message?.includes("fetch")) {
      throw new Error(
        `Sem conexão com o servidor.\n\nURL: ${url}\n\nVerifique se o backend está rodando (npm run dev) e tente novamente.`
      );
    }
    throw err;
  }
}

export const api = {
  // --- AUTH ---
  register: (data) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (data) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(data) }),

  resetPassword: (data) =>
    request("/auth/reset-password", { method: "PUT", body: JSON.stringify(data) }),

  updateAvatar: (data) =>
    request("/auth/update-avatar", { method: "PUT", body: JSON.stringify(data) }),

  updateName: (data) =>
    request("/auth/update-name", { method: "PUT", body: JSON.stringify(data) }),

  // --- CATEGORIES ---
  listCategories: (userId) =>
    request(`/categories${userId ? `?userId=${userId}` : ""}`),

  createCategory: (data) =>
    request("/categories", { method: "POST", body: JSON.stringify(data) }),

  updateCategory: (id, data) =>
    request(`/categories/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  deleteCategory: (id, transferCategoryId) =>
    request(`/categories/${id}`, {
      method: "DELETE",
      body: transferCategoryId ? JSON.stringify({ transferCategoryId }) : undefined,
    }),

  // --- TRANSACTIONS ---
  listTransactions: (userId) =>
    request(`/transactions${userId ? `?userId=${userId}` : ""}`),

  createTransaction: (data) =>
    request("/transactions", { method: "POST", body: JSON.stringify(data) }),

  updateTransaction: (id, data) =>
    request(`/transactions/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  deleteTransaction: (id) =>
    request(`/transactions/${id}`, { method: "DELETE" }),

  deleteUser: (username) =>
    request(`/auth/users/${username}`, { method: "DELETE" }),

  // Verifica se o servidor está acessível
  healthCheck: () =>
    request("/"),
};
