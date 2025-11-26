import { Link } from "wouter";
import { ShoppingBag, ArrowLeft, Trash2 } from "lucide-react";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { CartItemComponent } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/CartContext";

export default function Cart() {
  const { items, isLoading, clearCart, itemCount } = useCart();

  if (isLoading) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
            <Skeleton className="h-80" />
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (items.length === 0) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="w-24 h-24 mx-auto rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2">Savatcha bo'sh</h1>
              <p className="text-muted-foreground">
                Hali hech qanday mahsulot qo'shilmagan. Mahsulotlarni ko'rib chiqing va sevimlilaringizni qo'shing.
              </p>
            </div>
            <Link href="/products">
              <Button size="lg" data-testid="button-continue-shopping">
                Xarid qilishni boshlash
              </Button>
            </Link>
          </div>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Savatcha</h1>
            <p className="text-muted-foreground mt-1">{itemCount} ta mahsulot</p>
          </div>
          <Button
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => clearCart()}
            data-testid="button-clear-cart"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Tozalash
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-lg">Mahsulotlar</CardTitle>
              </CardHeader>
              <CardContent className="divide-y">
                {items.map((item) => (
                  <CartItemComponent key={item.id} item={item} />
                ))}
              </CardContent>
            </Card>

            {/* Continue Shopping */}
            <Link href="/products" className="inline-flex items-center gap-2 mt-6 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Xaridni davom ettirish
            </Link>
          </div>

          {/* Summary */}
          <div>
            <CartSummary />
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
