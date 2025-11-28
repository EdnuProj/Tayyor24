import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wallet, Plus, TrendingDown, TrendingUp, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Courier } from "@shared/schema";

interface Transaction {
  id: string;
  courierId: string;
  amount: number;
  type: string;
  description: string;
  orderId: string | null;
  createdAt: string;
}

interface CourierDashboardData {
  courier: Courier;
  transactions: Transaction[];
  assignments: any[];
}

export default function CourierApp() {
  const { toast } = useToast();
  const [telegramId, setTelegramId] = useState<string>("");
  const [topupAmount, setTopupAmount] = useState<string>("");
  const [showTopup, setShowTopup] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("telegramId");
    if (id) setTelegramId(id);
  }, []);

  const { data, isLoading, refetch } = useQuery({
    queryKey: [`/api/courier-dashboard/${telegramId}`],
    enabled: !!telegramId,
    queryFn: async () => {
      const res = await fetch(`/api/courier-dashboard/${telegramId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<CourierDashboardData>;
    },
    refetchInterval: 1000, // Poll every 1 second for real-time order updates
    refetchIntervalInBackground: true, // Continue polling even if tab is not focused
  });

  const topupMutation = useMutation({
    mutationFn: async (amount: number) => {
      const res = await fetch("/api/courier/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegramId, amount }),
      });
      if (!res.ok) throw new Error("Topup failed");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "✅ Pul to'plandi", description: `${topupAmount} so'm qo'shildi` });
      setTopupAmount("");
      setShowTopup(false);
      refetch();
    },
    onError: () => {
      toast({ title: "❌ Xatolik", description: "Topup amalga oshirilmadi", variant: "destructive" });
    },
  });

  const acceptOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await fetch(`/api/courier/accept-order/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegramId }),
      });
      if (!res.ok) throw new Error("Failed to accept order");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "✅ Zakaz qabul qilindi" });
      refetch(); // Immediately refetch to update list for all couriers
    },
    onError: () => {
      toast({ title: "❌ Xatolik", description: "Zakazni qabul qilish muvaffaq bo'lmadi", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Yuklanmoqda...</p>
      </div>
    );
  }

  if (!data?.courier) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Kuryer topilmadi</p>
      </div>
    );
  }

  const { courier, transactions = [] } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-slate-400">Kuryer Paneli</p>
          <h1 className="text-2xl font-bold">{courier.name}</h1>
        </div>
        <button
          onClick={() => {
            window.location.href = "https://t.me/";
          }}
          className="p-2 hover:bg-slate-700 rounded-lg transition"
          title="Chiqish"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Balance Card */}
      <Card className="mb-6 bg-gradient-to-br from-emerald-500 to-emerald-600 border-0 text-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-emerald-100 text-sm mb-2">Joriy Balans</p>
            <p className="text-4xl font-bold mb-1">
              {(courier.balance || 0).toLocaleString()}
            </p>
            <p className="text-emerald-100 text-xs">so'm</p>
          </div>
          <Wallet className="w-12 h-12 opacity-50" />
        </div>
      </Card>

      {/* Topup Button */}
      <div className="mb-6">
        {!showTopup ? (
          <Button
            onClick={() => setShowTopup(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Balans To'ldirish
          </Button>
        ) : (
          <Card className="bg-slate-800 border-slate-700 p-4 space-y-3">
            <Input
              type="number"
              placeholder="Miqdor kiriting (so'm)"
              value={topupAmount}
              onChange={(e) => setTopupAmount(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              data-testid="input-topup-amount"
            />
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  const amount = parseInt(topupAmount);
                  if (!amount || amount <= 0) {
                    toast({ title: "❌ Noto'g'ri miqdor", variant: "destructive" });
                    return;
                  }
                  topupMutation.mutate(amount);
                }}
                disabled={topupMutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                data-testid="button-confirm-topup"
              >
                {topupMutation.isPending ? "Jo'natilmoqda..." : "Tasdiqlash"}
              </Button>
              <Button
                onClick={() => {
                  setShowTopup(false);
                  setTopupAmount("");
                }}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300"
                data-testid="button-cancel-topup"
              >
                Bekor qilish
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Available Orders */}
      {data?.assignments && data.assignments.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">📦 Yangi Zakazlar</h2>
          <div className="space-y-2">
            {data.assignments.map((assignment: any) => (
              <Card key={assignment.id} className="bg-blue-900/40 border-blue-700 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">
                      Zakaz #{assignment.orderId?.slice(0, 8) || assignment.id}
                    </p>
                    <p className="text-xs text-slate-300 mt-1">
                      💰 {assignment.estimatedEarnings?.toLocaleString() || "0"} so'm
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      📍 {assignment.distance?.toFixed(1) || "?"} km
                    </p>
                  </div>
                  <Button
                    onClick={() => assignment.orderId && acceptOrderMutation.mutate(assignment.orderId)}
                    disabled={acceptOrderMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap"
                    size="sm"
                    data-testid={`button-accept-order-${assignment.id}`}
                  >
                    {acceptOrderMutation.isPending ? "Jarayonda..." : "Qabul qilish"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Transactions History */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Tranzaksiya Tarixi</h2>
        {transactions.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700 p-4 text-center text-slate-400">
            Tranzaksiya yo'q
          </Card>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => {
              const isDebit = tx.amount < 0;
              return (
                <Card
                  key={tx.id}
                  className="bg-slate-800 border-slate-700 p-4 flex items-center justify-between"
                  data-testid={`card-transaction-${tx.id}`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {isDebit ? (
                      <div className="p-2 bg-red-500/20 rounded-lg">
                        <TrendingDown className="w-5 h-5 text-red-400" />
                      </div>
                    ) : (
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{tx.description}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(tx.createdAt).toLocaleDateString("uz-UZ", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`font-bold text-right ${
                      isDebit ? "text-red-400" : "text-green-400"
                    }`}
                    data-testid={`text-amount-${tx.id}`}
                  >
                    {isDebit ? "-" : "+"}
                    {Math.abs(tx.amount).toLocaleString()}
                  </p>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
