import { useState } from "react";
import { Link } from "wouter";
import { Tag, Truck, Check } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CartSummaryProps {
  deliveryPrice?: number;
  freeDeliveryThreshold?: number;
}

export function CartSummary({
  deliveryPrice = 15000,
  freeDeliveryThreshold = 500000,
}: CartSummaryProps) {
  const { subtotal, itemCount } = useCart();
  const { toast } = useToast();
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);

  const isFreeDelivery = subtotal >= freeDeliveryThreshold;
  const actualDeliveryPrice = isFreeDelivery ? 0 : deliveryPrice;
  const discountAmount = appliedPromo ? (subtotal * appliedPromo.discount) / 100 : 0;
  const total = subtotal + actualDeliveryPrice - discountAmount;

  const promoMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await apiRequest("POST", "/api/promo-codes/validate", { code });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.valid) {
        setAppliedPromo({ code: promoCode, discount: data.discountPercent });
        toast({
          title: "Promokod qo'llanildi",
          description: `${data.discountPercent}% chegirma`,
        });
      } else {
        toast({
          title: "Xatolik",
          description: "Promokod noto'g'ri yoki muddati tugagan",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Xatolik",
        description: "Promokodni tekshirishda xatolik yuz berdi",
        variant: "destructive",
      });
    },
  });

  const handleApplyPromo = () => {
    if (promoCode.trim()) {
      promoMutation.mutate(promoCode.trim());
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoCode("");
  };

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle className="text-lg">Buyurtma xulosasi</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Free Delivery Progress */}
        {!isFreeDelivery && (
          <div className="space-y-2 p-3 rounded-md bg-muted/50">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="h-4 w-4 text-primary" />
              <span>
                Bepul yetkazib berish uchun yana{" "}
                <span className="font-semibold text-primary">
                  {formatPrice(freeDeliveryThreshold - subtotal)}
                </span>
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${Math.min((subtotal / freeDeliveryThreshold) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Promo Code */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Tag className="h-4 w-4" />
            Promokod
          </div>
          {appliedPromo ? (
            <div className="flex items-center justify-between p-2 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  {appliedPromo.code} ({appliedPromo.discount}%)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removePromo}
                className="h-7 text-xs"
              >
                Bekor qilish
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Promokodni kiriting"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                className="flex-1"
                data-testid="input-promo-code"
              />
              <Button
                variant="secondary"
                onClick={handleApplyPromo}
                disabled={!promoCode.trim() || promoMutation.isPending}
                data-testid="button-apply-promo"
              >
                Qo'llash
              </Button>
            </div>
          )}
        </div>

        <Separator />

        {/* Summary Lines */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Mahsulotlar ({itemCount} ta)
            </span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          {appliedPromo && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Chegirma ({appliedPromo.discount}%)</span>
              <span>-{formatPrice(discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Yetkazib berish</span>
            <span className={isFreeDelivery ? "text-green-600" : ""}>
              {isFreeDelivery ? "Bepul" : formatPrice(actualDeliveryPrice)}
            </span>
          </div>
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between items-baseline">
          <span className="font-semibold">Jami</span>
          <span className="text-xl font-bold text-primary">{formatPrice(total)}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Link href="/checkout" className="w-full">
          <Button 
            className="w-full" 
            size="lg"
            disabled={itemCount === 0}
            data-testid="button-checkout"
          >
            Buyurtma berish
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
