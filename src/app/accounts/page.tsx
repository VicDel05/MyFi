import { getAccounts } from "@/features/accounts/actions";
import { Header } from "@/components/layout/header";
import { CreateAccountDialog } from "@/features/accounts/components/create-account-dialog";
import { DeleteAccountButton } from "@/features/accounts/components/delete-account-button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Wallet, ShieldCheck } from "lucide-react";

export default async function AccountsPage() {
  const accounts = await getAccounts();
  const totalBalance = accounts.reduce(
    (acc, account) => acc + Number(account.currentBalance),
    0
  );

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header>
        <CreateAccountDialog />
      </Header>

      <main className="flex-1 p-6 max-w-6xl w-full mx-auto space-y-6">
        {/* Banner de Saldo Total */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-lg shadow-blue-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-blue-100 font-semibold">
              Patrimonio Disponible Consolidado
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold mt-1">
              {formatCurrency(totalBalance)}
            </div>
            <p className="text-xs text-blue-200 mt-1 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              Suma de saldos de todas tus cuentas activas
            </p>
          </div>
          <CreateAccountDialog />
        </div>

        {/* Listado de Cuentas */}
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
            Tus Cuentas ({accounts.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((acc) => (
              <Card key={acc.id} className="relative overflow-hidden">
                <div
                  className="h-1.5 w-full"
                  style={{ backgroundColor: acc.color || "#3b82f6" }}
                />
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: acc.color || "#3b82f6" }}
                    >
                      <Wallet className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">{acc.name}</CardTitle>
                      <CardDescription className="text-[11px] uppercase">
                        {acc.type} • {acc.currency}
                      </CardDescription>
                    </div>
                  </div>
                  <DeleteAccountButton id={acc.id} name={acc.name} />
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-zinc-400">Saldo Actual:</span>
                    <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                      {formatCurrency(Number(acc.currentBalance), acc.currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <span>Saldo inicial: {formatCurrency(Number(acc.initialBalance), acc.currency)}</span>
                    <span>Creada: {formatDate(acc.createdAt)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
