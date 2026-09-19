import { z } from "zod";

export const createDebtSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  creditor: z.string().min(2, "El acreedor debe tener al menos 2 caracteres").max(100),
  initialAmount: z.coerce.number().positive("El monto inicial debe ser mayor a 0"),
  currentBalance: z.coerce.number().min(0, "El saldo no puede ser negativo"),
  interestRate: z.coerce.number().min(0).max(100).optional().nullable(),
  minimumPayment: z.coerce.number().min(0).optional().nullable(),
  dueDate: z.string().optional().nullable(),
});

export type CreateDebtInput = z.infer<typeof createDebtSchema>;

export const recordPaymentSchema = z.object({
  debtId: z.string().min(1, "Debes seleccionar una deuda"),
  accountId: z.string().min(1, "Debes seleccionar una cuenta de origen"),
  amount: z.coerce.number().positive("El monto del abono debe ser mayor a 0"),
  paymentDate: z.string().optional(),
  notes: z.string().max(200).optional().nullable(),
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
