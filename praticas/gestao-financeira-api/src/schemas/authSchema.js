// ─────────────────────────────────────────────────────────────────────────────
// Autora: Elisa Nunes de Freitas
// Arquivo: src/schemas/authSchema.js
// Descrição: Schemas Zod para validação das rotas de autenticação (registro,
//            login, redefinição de senha, atualização de avatar e de nome).
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  username: z
    .string()
    .min(1, "O usuário é obrigatório")
    .regex(/^\S+$/, "O usuário não pode conter espaços"),
  password: z.string().min(4, "A senha deve ter pelo menos 4 caracteres"),
});

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const resetPasswordSchema = z.object({
  username: z.string().min(1),
  newPassword: z.string().min(4),
});

export const updateAvatarSchema = z.object({
  userId: z.string().min(1),
  avatarSeed: z.string().min(1),
  avatarBg: z.string().min(1),
});

export const updateNameSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(1, "O nome não pode estar vazio"),
});
