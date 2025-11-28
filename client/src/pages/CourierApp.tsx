import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Courier } from "@shared/schema";

interface CourierDashboardData {
  courier: Courier;
  assignments: any[];
}

export default function CourierApp() {
  const { toast } = useToast();
  const [telegramId, setTelegramId] = useState<string>("");

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
    refetchInterval: 1000,
    refetchIntervalInBackground: true,
  });

  const acceptOrderMutation = useMutation({
    mutationFn: async (assignment: any) => {
      const res = await fetch("/api/courier/accept-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: assignment.orderId,
          assignmentId: assignment.id,
          telegramId,
        }),
      });
      if (!res.ok) throw new Error("Failed to accept order");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "✅ Zakaz qabul qilindi" });
      setTimeout(() => refetch(), 100);
    },
    onError: () => {
      toast({
        title: "❌ Xatolik",
        description: "Zakazni qabul qilish muvaffaq bo'lmadi",
        variant: "destructive"
      });
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

  const { courier } = data;

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

      {/* Available Orders - Only show pending assignments without a courier */}
      {data?.assignments && data.assignments.filter((a: any) => a.status === "pending" && !a.courierId).length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">📦 Yangi Zakazlar ({data.assignments.filter((a: any) => a.status === "pending" && !a.courierId).length})</h2>
          <div className="space-y-2">
            {data.assignments
              .filter((a: any) => a.status === "pending" && !a.courierId)
              .map((assignment: any) => (
                <Card key={assignment.id} className="bg-blue-900/40 border-blue-700 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">
                        Zakaz #{assignment.orderId?.slice(0, 8) || assignment.id}
                      </p>
                      <p className="text-xs text-slate-300 mt-1">
                        💰 Yetkazish: 2,000 so'm
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        📍 {assignment.distance?.toFixed(1) || "?"} km
                      </p>
                      {assignment.order?.customerAddress && (
                        <p className="text-xs text-slate-400 mt-1">
                          📮 {assignment.order.customerAddress}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => acceptOrderMutation.mutate(assignment)}
                      disabled={acceptOrderMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap"
                      size="sm"
                      data-testid={`button-accept-order-${assignment.id}`}
                    >
                      {acceptOrderMutation.isPending ? "Jarayonda..." : "Qabul"}
                    </Button>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Accepted Orders */}
      {data?.assignments && data.assignments.filter((a: any) => a.courierId === courier.id).length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">✅ Mening Zakazlarim</h2>
          <div className="space-y-2">
            {data.assignments
              .filter((a: any) => a.courierId === courier.id)
              .map((assignment: any) => (
                <Card key={assignment.id} className="bg-emerald-900/40 border-emerald-700 p-4">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">
                      Zakaz #{assignment.orderId?.slice(0, 8) || assignment.id}
                    </p>
                    <p className={`text-xs mt-1 ${assignment.status === "delivered" ? "text-green-400" : "text-slate-300"}`}>
                      {assignment.status === "delivered" ? "✅ Yetkazildi" : "🚚 Yetkazishda"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      📍 {assignment.distance?.toFixed(1) || "?"} km
                    </p>
                    {assignment.order?.customerAddress && (
                      <p className="text-xs text-slate-400 mt-1">
                        📮 {assignment.order.customerAddress}
                      </p>
                    )}
                  </div>
                </Card>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
