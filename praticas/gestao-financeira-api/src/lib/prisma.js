// ─────────────────────────────────────────────────────────────────────────────
// Autora: Elisa Nunes de Freitas
// Arquivo: src/lib/prisma.js
// Descrição: Exporta uma instância singleton do PrismaClient. Centralizar aqui
//            evita que múltiplas importações abram conexões desnecessárias.
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
