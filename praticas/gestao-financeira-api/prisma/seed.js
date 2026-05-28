// ─────────────────────────────────────────────────────────────────────────────
// Autora: Elisa Nunes de Freitas
// Arquivo: prisma/seed.js
// Descrição: Popula o banco com as 5 categorias padrão do sistema. A inserção
//            verifica existência antes de criar para ser idempotente (pode ser
//            executada múltiplas vezes sem duplicar registros).
//            Também cria o usuário padrão do professor com transações de exemplo.
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultCategories = [
  { name: "income",        displayName: "Receita",      icon: "payments",      background: "#1A7F4B", isIncome: true,  isDefault: true },
  { name: "food",          displayName: "Alimentação",  icon: "fastfood",      background: "#C0392B", isIncome: false, isDefault: true },
  { name: "transport",     displayName: "Transporte",   icon: "directions-car",background: "#2471A3", isIncome: false, isDefault: true },
  { name: "home",          displayName: "Moradia",      icon: "home",          background: "#B7770D", isIncome: false, isDefault: true },
  { name: "entertainment", displayName: "Lazer",        icon: "sports-esports",background: "#7D3C98", isIncome: false, isDefault: true },
];

async function main() {
  // ── Categorias padrão ────────────────────────────────────────────────────
  for (const c of defaultCategories) {
    const existing = await prisma.category.findFirst({
      where: { name: c.name, isDefault: true },
    });
    if (!existing) {
      await prisma.category.create({ data: c });
      console.log(`Categoria padrão criada: ${c.displayName}`);
    }
  }

  // ── Usuário padrão do professor ──────────────────────────────────────────
  let professor = await prisma.user.findUnique({
    where: { username: "professor-pdm" },
  });

  if (!professor) {
    professor = await prisma.user.create({
      data: {
        name:       "Marcelo Paiva",
        username:   "professor-pdm",
        password:   "12345",
        avatarSeed: "m04",
        avatarBg:   "d1d4f9",
      },
    });
    console.log(`Usuário padrão criado: ${professor.username}`);
  }

  // ── Categoria personalizada do professor (Viagens) ───────────────────────
  let catViagens = await prisma.category.findFirst({
    where: { name: "viagens", userId: professor.id },
  });

  if (!catViagens) {
    catViagens = await prisma.category.create({
      data: {
        name:        "viagens",
        displayName: "Viagens",
        icon:        "flight",
        background:  "#D35400",
        isIncome:    false,
        isDefault:   false,
        userId:      professor.id,
      },
    });
    console.log(`Categoria personalizada criada: ${catViagens.displayName}`);
  }

  // Busca as categorias padrão necessárias para as transações
  const catReceita = await prisma.category.findFirst({ where: { name: "income",  isDefault: true } });
  const catMoradia = await prisma.category.findFirst({ where: { name: "home",    isDefault: true } });

  // ── Transações de exemplo do professor ──────────────────────────────────
  // Verifica se já existem transações para não duplicar no re-seed
  const transacoesExistentes = await prisma.transaction.count({
    where: { userId: professor.id },
  });

  if (transacoesExistentes === 0) {
    await prisma.transaction.createMany({
      data: [
        {
          description: "Salário",
          value:       4578.94,
          date:        new Date("2026-05-04T12:00:00"),
          categoryId:  catReceita.id,
          userId:      professor.id,
        },
        {
          description: "Compras do Mês",
          value:       473.95,
          date:        new Date("2026-05-11T12:00:00"),
          categoryId:  catMoradia.id,
          userId:      professor.id,
        },
        {
          description: "Porto de Galinhas",
          value:       1680.00,
          date:        new Date("2026-05-22T12:00:00"),
          categoryId:  catViagens.id,
          userId:      professor.id,
        },
      ],
    });
    console.log("Transações de exemplo criadas para o professor.");
  }

  console.log("Seed concluído.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
