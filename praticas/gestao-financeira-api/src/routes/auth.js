// ─────────────────────────────────────────────────────────────────────────────
// Autora: Elisa Nunes de Freitas
// Arquivo: src/routes/auth.js
// Descrição: Roteador de autenticação — cadastro, login, redefinição de senha,
//            atualização de avatar e nome, e exclusão de conta com cascata.
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
  updateAvatarSchema,
  updateNameSchema,
} from "../schemas/authSchema.js";

const router = Router();

// POST /auth/register — cadastrar novo usuário
router.post("/register", async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({
      where: { username: data.username },
    });
    if (existing) {
      return res.status(400).json({ error: "Este nome de usuário já está em uso." });
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        username: data.username,
        password: data.password,
        avatarSeed: data.username,
        avatarBg: "b6e3f4",
      },
      select: { id: true, name: true, username: true, avatarSeed: true, avatarBg: true },
    });

    res.status(201).json(user);
  } catch (e) { next(e); }
});

// POST /auth/login — autenticar usuário
router.post("/login", async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: { username: data.username, password: data.password },
      select: { id: true, name: true, username: true, avatarSeed: true, avatarBg: true },
    });

    if (!user) {
      return res.status(401).json({ error: "Usuário ou senha incorretos." });
    }

    res.json(user);
  } catch (e) { next(e); }
});

// PUT /auth/reset-password — redefinir senha pelo username
router.put("/reset-password", async (req, res, next) => {
  try {
    const data = resetPasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { username: data.username },
    });
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    await prisma.user.update({
      where: { username: data.username },
      data: { password: data.newPassword },
    });

    res.json({ message: "Senha atualizada com sucesso!" });
  } catch (e) { next(e); }
});

// PUT /auth/update-avatar — atualizar avatar do usuário
router.put("/update-avatar", async (req, res, next) => {
  try {
    const data = updateAvatarSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    await prisma.user.update({
      where: { id: data.userId },
      data: { avatarSeed: data.avatarSeed, avatarBg: data.avatarBg },
    });

    res.json({ message: "Avatar atualizado com sucesso!" });
  } catch (e) { next(e); }
});

// DELETE /auth/users/:username — excluir conta e todos os dados vinculados ao usuário
router.delete("/users/:username", async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    // Ordem obrigatória por causa das foreign keys:
    // transações dependem de categorias e de usuário;
    // categorias customizadas dependem de usuário
    await prisma.$transaction([
      prisma.transaction.deleteMany({ where: { userId: user.id } }),
      prisma.category.deleteMany({ where: { userId: user.id } }),
      prisma.user.delete({ where: { username } }),
    ]);

    res.status(204).send();
  } catch (e) { next(e); }
});

// PUT /auth/update-name — atualizar nome de exibição do usuário
router.put("/update-name", async (req, res, next) => {
  try {
    const data = updateNameSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    await prisma.user.update({
      where: { id: data.userId },
      data: { name: data.name.trim() },
    });

    res.json({ message: "Nome atualizado com sucesso!" });
  } catch (e) { next(e); }
});

export default router;
