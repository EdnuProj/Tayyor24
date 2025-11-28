import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Courier } from "@shared/schema";

export default function CourierLogin() {
  const [, setLocation] = useLocation();
  const [selectedCourierIdInput, setSelectedCourierIdInput] = useState("");

  const { data: couriers = [] } = useQuery<Courier[]>({
    queryKey: ["/api/couriers"],
  });

  const handleSelectCourier = (telegramId: string | number) => {
    setLocation(`/courier/dashboard?telegramId=${telegramId}`);
  };

  const handleDirectLogin = () => {
    if (selectedCourierIdInput.trim()) {
      handleSelectCourier(selectedCourierIdInput);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">🚚 Kuryer Paneli</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Courier List */}
          {couriers.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-3">Quyidagi kuryer'lardan birini tanlang:</p>
              <div className="space-y-2">
                {couriers.map((courier) => (
                  <Button
                    key={courier.id}
                    onClick={() => handleSelectCourier(courier.telegramId)}
                    variant="outline"
                    className="w-full justify-start"
                    data-testid={`button-select-courier-${courier.id}`}
                  >
                    <div className="text-left">
                      <p className="font-medium">{courier.name}</p>
                      <p className="text-xs text-muted-foreground">{courier.phone}</p>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Manual Entry */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-3">Yoki Telegram ID'ni qo'l bilan kiriting:</p>
            <div className="flex gap-2">
              <Input
                placeholder="Telegram ID"
                value={selectedCourierIdInput}
                onChange={(e) => setSelectedCourierIdInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleDirectLogin()}
                data-testid="input-courier-telegram-id"
              />
              <Button
                onClick={handleDirectLogin}
                data-testid="button-courier-login"
              >
                Kirish
              </Button>
            </div>
          </div>

          {/* Info */}
          <p className="text-xs text-muted-foreground text-center">
            Telegram ID'ingizni @BotFather'dan olib olishingiz mumkin
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
