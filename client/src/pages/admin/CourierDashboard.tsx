import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, Package } from "lucide-react";

export default function CourierDashboard() {
  const telegramId = new URLSearchParams(window.location.search).get("telegramId");

  const { data, isLoading } = useQuery({
    queryKey: [`/api/courier-dashboard/${telegramId}`],
    enabled: !!telegramId,
    queryFn: async () => {
      const res = await fetch(`/api/courier-dashboard/${telegramId}`);
      return res.json();
    },
  });

  if (isLoading) return <div className="p-4 text-center">Yuklanmoqda...</div>;
  if (!data?.courier) return <div className="p-4 text-center">Kuryer topilmadi</div>;

  const { courier, assignments } = data;
  const acceptedOrders = assignments?.filter((a: any) => a.status === "accepted") || [];

  return (
    <div className="p-4 space-y-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold" data-testid="heading-courier-dashboard">
          {courier.name}
        </h1>
      </div>

      <Card className="p-4 bg-primary text-white">
        <div className="flex items-center gap-3">
          <Wallet className="w-8 h-8" />
          <div>
            <p className="text-sm opacity-90">Balansi</p>
            <p className="text-3xl font-bold" data-testid="text-courier-balance">
              {courier.balance?.toLocaleString() || 0} so'm
            </p>
          </div>
        </div>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-3">Qabul Qilingan Buyurtmalar</h2>
        {acceptedOrders.length === 0 ? (
          <Card className="p-4 text-center text-secondary">
            Hech qanday buyurtma qabul qilinmagan
          </Card>
        ) : (
          <div className="space-y-2">
            {acceptedOrders.map((order: any) => (
              <Card key={order.id} className="p-3" data-testid={`card-order-${order.id}`}>
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  <span data-testid={`text-order-number-${order.id}`}>
                    #{order.orderId?.slice(0, 8) || "?"}
                  </span>
                  <Badge data-testid={`badge-order-status-${order.id}`}>
                    Qabul qilindi
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
