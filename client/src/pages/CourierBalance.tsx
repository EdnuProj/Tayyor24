import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Wallet } from "lucide-react";

interface CourierDashboardData {
  courier: {
    id: string;
    name: string;
    balance: number;
  };
}

export default function CourierBalance() {
  const [telegramId, setTelegramId] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("telegramId");
    if (id) setTelegramId(id);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: [`/api/courier-dashboard/${telegramId}`],
    enabled: !!telegramId,
    queryFn: async () => {
      const res = await fetch(`/api/courier-dashboard/${telegramId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<CourierDashboardData>;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin mb-4 w-8 h-8 border-4 border-emerald-200 border-t-white rounded-full mx-auto"></div>
          <p>Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!data?.courier) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-lg">Kuryer topilmadi</p>
        </div>
      </div>
    );
  }

  const { courier } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-sm">
        {/* Courier Name */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">{courier.name}</h1>
          <p className="text-emerald-100 text-sm">Kuryer Paneli</p>
        </div>

        {/* Balance Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center shadow-2xl">
          <div className="flex justify-center mb-4">
            <Wallet className="w-16 h-16 text-emerald-100" />
          </div>

          <p className="text-emerald-100 text-sm mb-2">Joriy Balans</p>
          <p className="text-5xl font-bold mb-1">
            {(courier.balance || 0).toLocaleString()}
          </p>
          <p className="text-emerald-100 text-lg">so'm</p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-3 mt-8">
          <button
            onClick={() => (window.location.href = "/courier/dashboard")}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 rounded-lg p-4 text-center transition"
            data-testid="button-go-dashboard"
          >
            <p className="text-sm font-medium">📊 Panel</p>
          </button>
          <button
            onClick={() => (window.location.href = "/courier/payme")}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 rounded-lg p-4 text-center transition"
            data-testid="button-go-taayyorcash"
          >
            <p className="text-sm font-medium">💳 TaayyorCash</p>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-emerald-100 text-xs">
          <p>Do'kon Delivery System</p>
        </div>
      </div>
    </div>
  );
}
