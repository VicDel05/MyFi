"use client";

import * as React from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteAccount } from "../actions";
import { useRouter } from "next/navigation";

export function DeleteAccountButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de desactivar la cuenta "${name}"? Sus transacciones históricas se conservarán.`)) {
      return;
    }
    setIsPending(true);
    try {
      await deleteAccount(id);
      router.refresh();
    } catch {
      alert("Error al desactivar la cuenta");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      title="Desactivar cuenta"
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin text-red-600" /> : <Trash2 className="h-4 w-4" />}
    </button>
  );
}
