"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCategory } from "../actions";
import { Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function CreateCategoryDialog() {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [macroGroup, setMacroGroup] = React.useState<"NEEDS" | "WANTS" | "SAVINGS_DEBT">("NEEDS");
  const [color, setColor] = React.useState("#3b82f6");

  const colors = ["#3b82f6", "#10b981", "#ef4444", "#f59e0b", "#8b5cf6", "#ec4899", "#64748b"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Ingresa un nombre para la categoría");
      return;
    }

    setIsPending(true);
    try {
      const res = await createCategory({
        name: name.trim(),
        type,
        macroGroup: type === "EXPENSE" ? macroGroup : undefined,
        color,
      });

      if (!res.success) {
        setError(res.error || "Error al crear la categoría");
      } else {
        setIsOpen(false);
        setName("");
        router.refresh();
      }
    } catch {
      setError("Error inesperado al guardar la categoría");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
      >
        <Plus className="h-4 w-4" />
        Nueva Categoría
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Crear Categoría Personalizada"
        description="Adapta tus categorías para clasificar mejor tus ingresos o gastos."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Nombre de la Categoría
            </label>
            <Input
              type="text"
              placeholder="Ej. Mascotas, Gimnasio, Cursos..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Tipo
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full h-10 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <option value="EXPENSE">Gasto</option>
                <option value="INCOME">Ingreso</option>
              </select>
            </div>

            {type === "EXPENSE" && (
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Regla 50/30/20
                </label>
                <select
                  value={macroGroup}
                  onChange={(e) => setMacroGroup(e.target.value as any)}
                  className="w-full h-10 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <option value="NEEDS">50% Necesidades</option>
                  <option value="WANTS">30% Deseos</option>
                  <option value="SAVINGS_DEBT">20% Ahorro / Deuda</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Color
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
              Guardar Categoría
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
