"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createAccount } from "../actions";
import { Plus, Wallet, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function CreateAccountDialog() {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<"CASH" | "BANK" | "SAVINGS" | "CREDIT" | "OTHER">("BANK");
  const [initialBalance, setInitialBalance] = React.useState("0");
  const [color, setColor] = React.useState("#3b82f6");

  const colors = [
    "#3b82f6", // Azul
    "#10b981", // Esmeralda
    "#8b5cf6", // Violeta
    "#f59e0b", // Ámbar
    "#ec4899", // Rosa
    "#06b6d4", // Cian
    "#64748b", // Pizarra
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Ingresa un nombre para la cuenta");
      return;
    }

    setIsPending(true);
    try {
      const res = await createAccount({
        name: name.trim(),
        type,
        initialBalance: parseFloat(initialBalance) || 0,
        currency: "MXN",
        color,
      });

      if (!res.success) {
        setError(res.error || "Error al crear la cuenta");
      } else {
        setIsOpen(false);
        setName("");
        setInitialBalance("0");
        router.refresh();
      }
    } catch {
      setError("Error inesperado al guardar la cuenta");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Nueva Cuenta
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Crear Cuenta Financiera"
        description="Agrega una fuente de dinero para registrar transacciones y controlar tus saldos."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Nombre de la Cuenta
            </label>
            <Input
              type="text"
              placeholder="Ej. Nómina BBVA, Efectivo, Ahorro Nu..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Tipo de Cuenta
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full h-10 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <option value="BANK">Bancaria / Débito</option>
                <option value="CASH">Efectivo</option>
                <option value="SAVINGS">Cuenta de Ahorro</option>
                <option value="CREDIT">Tarjeta de Crédito</option>
                <option value="OTHER">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Saldo Inicial ($)
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Color Distintivo
            </label>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full transition-transform ${
                    color === c ? "scale-125 ring-2 ring-zinc-950 ring-offset-2 dark:ring-white" : "opacity-80 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="p-2.5 text-xs text-red-700 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Guardar Cuenta
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
