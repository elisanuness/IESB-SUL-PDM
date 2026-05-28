// ─────────────────────────────────────────────────────────────────────────────
// Autora: Elisa Nunes de Freitas
// Arquivo: src/middlewares/errorHandler.js
// Descrição: Middleware central de erros do Express. Intercepta tudo que cair
//            em next(err) e devolve JSON padronizado conforme o tipo de erro.
// ─────────────────────────────────────────────────────────────────────────────

// A assinatura de 4 parâmetros é obrigatória para o Express reconhecer
// esta função como middleware de erro (mesmo que `next` não seja usado).
export function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === "ZodError") {
    return res.status(400).json({ error: "Dados inválidos", details: err.issues });
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "JSON inválido no corpo da requisição" });
  }
  // P2025 — registro não encontrado no banco
  if (err.code === "P2025") {
    return res.status(404).json({ error: "Recurso não encontrado" });
  }
  // P2002 — violação de unique constraint
  if (err.code === "P2002") {
    return res.status(409).json({ error: "Registro duplicado" });
  }
  // P2003 — foreign key inválida (referência inexistente)
  if (err.code === "P2003") {
    return res.status(400).json({ error: "Referência inválida (FK não existe)" });
  }

  res.status(500).json({ error: "Erro interno do servidor" });
}
