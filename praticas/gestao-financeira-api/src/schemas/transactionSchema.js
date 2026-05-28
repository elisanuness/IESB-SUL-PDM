// ─────────────────────────────────────────────────────────────────────────────
// Autora: Elisa Nunes de Freitas
// Arquivo: src/schemas/transactionSchema.js
// Descrição: Schemas Zod para validação das rotas de transações (criação e
//            atualização). O campo `date` usa z.coerce.date() para aceitar
//            tanto strings ISO quanto objetos Date.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";

export const createTransactionSchema = z.object({
  description: z.string().min(1),
  value: z.number().positive(),
  date: z.coerce.date(),
  categoryId: z.string().min(1),
  userId: z.string().min(1),
});

export const updateTransactionSchema = z.object({
  description: z.string().min(1).optional(),
  value: z.number().positive().optional(),
  date: z.coerce.date().optional(),
  categoryId: z.string().min(1).optional(),
  userId: z.string().min(1).optional(),
});
