import { prisma } from "@/lib/prisma";
import { DEFAULT_CATEGORIES } from "@/features/categories/default-categories";

export async function getOrCreateCurrentUser() {
  let user = await prisma.user.findFirst();

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "demo@myfi.app",
        name: "Usuario MyFi",
        currency: "MXN",
      },
    });

    // Crear categorías por defecto asociadas a la regla 50/30/20
    await prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map((cat) => ({
        userId: user!.id,
        name: cat.name,
        type: cat.type,
        macroGroup: cat.macroGroup ?? null,
        icon: cat.icon,
        color: cat.color,
      })),
    });

    // Crear 2 cuentas iniciales para agilizar el onboarding del usuario
    await prisma.account.createMany({
      data: [
        {
          userId: user.id,
          name: "Efectivo",
          type: "CASH",
          initialBalance: 1500,
          currentBalance: 1500,
          currency: "MXN",
          color: "#10b981",
        },
        {
          userId: user.id,
          name: "Cuenta Bancaria Principal",
          type: "BANK",
          initialBalance: 12000,
          currentBalance: 12000,
          currency: "MXN",
          color: "#3b82f6",
        },
      ],
    });
  }

  return user;
}
