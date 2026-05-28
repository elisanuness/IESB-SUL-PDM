// ─────────────────────────────────────────────────────────────────────────────
// Autora: Elisa Nunes de Freitas
// Arquivo: src/schemas/categorySchema.js
// Descrição: Schemas Zod para validação das rotas de categorias (criação e
//            atualização). O schema de atualização é gerado via .partial().
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2),
  displayName: z.string().min(2),
  icon: z.string().min(1),
  background: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor hex inválida"),
  isIncome: z.boolean().optional(),
  userId: z.string().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();
