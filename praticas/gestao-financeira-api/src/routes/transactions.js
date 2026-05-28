// ─────────────────────────────────────────────────────────────────────────────
// Autora: Elisa Nunes de Freitas
// Arquivo: src/routes/transactions.js
// Descrição: Roteador de transações — listagem por usuário (com categoria
//            expandida), criação, atualização e exclusão.
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import {
  createTransactionSchema,
  updateTransactionSchema,
} from "../schemas/transactionSchema.js";

const router = Router();

// GET /transactions?userId=xxx — lista transações do usuário com categoria expandida
router.get("/", async (req, res, next) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "O userId é obrigatório para listar transações." });
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { date: "desc" },
    });

    res.json(transactions);
  } catch (e) { next(e); }
});

// POST /transactions — cria nova transação
router.post("/", async (req, res, next) => {
  try {
    const data = createTransactionSchema.parse(req.body);
    const transaction = await prisma.transaction.create({
      data,
      include: { category: true },
    });
    res.status(201).json(transaction);
  } catch (e) { next(e); }
});

// PUT /transactions/:id — atualiza transação existente
router.put("/:id", async (req, res, next) => {
  try {
    const data = updateTransactionSchema.parse(req.body);
    const transaction = await prisma.transaction.update({
      where: { id: req.params.id },
      data,
      include: { category: true },
    });
    res.json(transaction);
  } catch (e) { next(e); }
});

// DELETE /transactions/:id — exclui transação
router.delete("/:id", async (req, res, next) => {
  try {
    await prisma.transaction.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e) { next(e); }
});

export default router;
