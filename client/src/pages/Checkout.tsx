import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Truck, Store, Banknote, CreditCard, Check, Loader2 } from "lucide-react";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { formatPrice, generateOrderNumber, getSessionId } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { OrderItem } from "@shared/schema";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Ism kamida 2 ta belgi bo'lishi kerak"),
  customerPhone: z.string().min(9, "Telefon raqamini kiriting").regex(/^\+?[0-9]+$/, "Noto'g'ri telefon raqam"),
  customerAddress: z.string().min(5, "Manzilni kiriting"),
  deliveryType: z.enum(["courier", "pickup"]),
  paymentType: z.enum(["cash", "card"]),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, navigate] = useLocation();
  const { items, subtotal, clearCart } = useCart();
  const { toast } = useToast();
  const [orderComplete, setOrderComplete] = useState<{ orderNumber: string } | null>(null);

  const deliveryPrice = 15000;
  const freeDeliveryThreshold = 500000;
  const isFreeDelivery = subtotal >= freeDeliveryThreshold;
  const actualDeliveryPrice = isFreeDelivery ? 0 : deliveryPrice;
  const total = subtotal + actualDeliveryPrice;

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "+998",
      customerAddress: "",
      deliveryType: "courier",
      paymentType: "cash",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: CheckoutForm) => {
      const orderNumber = generateOrderNumber();
      const orderItems: OrderItem[] = items.map((item) => ({
        productId: item.productId,
        productName: item.product.name,
        productImage: item.product.images[0] || "",
        price: item.product.price,
        quantity: item.quantity,
        selectedColor: item.selectedColor || undefined,
        selectedSize: item.selectedSize || undefined,
      }));

      const orderData = {
        orderNumber,
        ...data,
        subtotal,
        deliveryPrice: data.deliveryType === "pickup" ? 0 : actualDeliveryPrice,
        discount: 0,
        total: data.deliveryType === "pickup" ? subtotal : total,
        items: JSON.stringify(orderItems),
        status: "new",
      };

      const res = await apiRequest("POST", "/api/orders", orderData);
      return res.json();
    },
    onSuccess: (data) => {
      clearCart();
      setOrderComplete({ orderNumber: data.orderNumber });
    },
    onError: () => {
      toast({
        title: "Xatolik",
        description: "Buyurtma berishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CheckoutForm) => {
    createOrderMutation.mutate(data);
  };

  if (items.length === 0 && !orderComplete) {
    navigate("/cart");
    return null;
  }

  if (orderComplete) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2">Buyurtma qabul qilindi!</h1>
              <p className="text-muted-foreground">
                Buyurtma raqamingiz: <span className="font-semibold text-foreground">{orderComplete.orderNumber}</span>
              </p>
            </div>
            <Card>
              <CardContent className="p-4 text-sm space-y-2">
                <p>Tez orada siz bilan bog'lanamiz va buyurtmangizni tasdiqlaymiz.</p>
                <p className="text-muted-foreground">
                  Agar savollaringiz bo'lsa, biz bilan bog'laning: +998 90 123 45 67
                </p>
              </CardContent>
            </Card>
            <Button onClick={() => navigate("/")} data-testid="button-go-home">
              Bosh sahifaga qaytish
            </Button>
          </div>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-8">Buyurtma berish</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Checkout Form */}
              <div className="lg:col-span-2 space-y-4 lg:space-y-6">
                {/* Contact Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Aloqa ma'lumotlari</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ism familiya</FormLabel>
                          <FormControl>
                            <Input placeholder="Ismingizni kiriting" {...field} data-testid="input-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefon raqam</FormLabel>
                          <FormControl>
                            <Input placeholder="+998 90 123 45 67" {...field} data-testid="input-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customerAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Manzil</FormLabel>
                          <FormControl>
                            <Input placeholder="To'liq manzilingizni kiriting" {...field} data-testid="input-address" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Delivery Type */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Yetkazib berish usuli</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="deliveryType"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                            >
                              <Label
                                htmlFor="courier"
                                className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                                  field.value === "courier"
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50"
                                }`}
                              >
                                <RadioGroupItem value="courier" id="courier" />
                                <div className="flex items-center gap-3">
                                  <Truck className="h-5 w-5 text-primary" />
                                  <div>
                                    <p className="font-medium">Kuryer orqali</p>
                                    <p className="text-sm text-muted-foreground">
                                      {isFreeDelivery ? "Bepul" : formatPrice(deliveryPrice)}
                                    </p>
                                  </div>
                                </div>
                              </Label>
                              <Label
                                htmlFor="pickup"
                                className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                                  field.value === "pickup"
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50"
                                }`}
                              >
                                <RadioGroupItem value="pickup" id="pickup" />
                                <div className="flex items-center gap-3">
                                  <Store className="h-5 w-5 text-primary" />
                                  <div>
                                    <p className="font-medium">O'zim olib ketaman</p>
                                    <p className="text-sm text-muted-foreground">Bepul</p>
                                  </div>
                                </div>
                              </Label>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Payment Type */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">To'lov usuli</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="paymentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                            >
                              <Label
                                htmlFor="cash"
                                className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                                  field.value === "cash"
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50"
                                }`}
                              >
                                <RadioGroupItem value="cash" id="cash" />
                                <div className="flex items-center gap-3">
                                  <Banknote className="h-5 w-5 text-primary" />
                                  <div>
                                    <p className="font-medium">Naqd pul</p>
                                    <p className="text-sm text-muted-foreground">Yetkazib berishda</p>
                                  </div>
                                </div>
                              </Label>
                              <Label
                                htmlFor="card"
                                className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                                  field.value === "card"
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50"
                                }`}
                              >
                                <RadioGroupItem value="card" id="card" />
                                <div className="flex items-center gap-3">
                                  <CreditCard className="h-5 w-5 text-primary" />
                                  <div>
                                    <p className="font-medium">Karta orqali</p>
                                    <p className="text-sm text-muted-foreground">Click / Payme</p>
                                  </div>
                                </div>
                              </Label>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div>
                <Card className="sticky top-20 lg:top-20">
                  <CardHeader>
                    <CardTitle className="text-lg">Buyurtma</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Items */}
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {items.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="w-14 h-14 rounded-md overflow-hidden bg-muted shrink-0">
                            <img
                              src={item.product.images[0] || "/placeholder.svg"}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                            <p className="text-xs text-muted-foreground">{item.quantity} x {formatPrice(item.product.price)}</p>
                          </div>
                          <p className="text-sm font-medium shrink-0">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Totals */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Mahsulotlar</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Yetkazish</span>
                        <span className={form.watch("deliveryType") === "pickup" || isFreeDelivery ? "text-green-600" : ""}>
                          {form.watch("deliveryType") === "pickup" || isFreeDelivery
                            ? "Bepul"
                            : formatPrice(deliveryPrice)}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between items-baseline">
                      <span className="font-semibold">Jami</span>
                      <span className="text-xl font-bold text-primary">
                        {formatPrice(form.watch("deliveryType") === "pickup" ? subtotal : total)}
                      </span>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={createOrderMutation.isPending}
                      data-testid="button-place-order"
                    >
                      {createOrderMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Yuborilmoqda...
                        </>
                      ) : (
                        "Buyurtma berish"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </StoreLayout>
  );
}
