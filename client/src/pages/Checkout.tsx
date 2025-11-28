import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Truck, Store, Banknote, CreditCard, Check, Loader2, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
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
import type { OrderItem, SiteSettings } from "@shared/schema";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Ism kamida 2 ta belgi bo'lishi kerak"),
  customerPhone: z.string().min(9, "Telefon raqamini kiriting").regex(/^\+?[0-9]+$/, "Noto'g'ri telefon raqam"),
  customerTelegramId: z.string().optional(),
  customerAddress: z.string().min(5, "Manzilni kiriting"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  deliveryType: z.enum(["courier", "pickup"]),
  paymentType: z.enum(["cash", "card"]),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, navigate] = useLocation();
  const { items, subtotal, clearCart } = useCart();
  const { toast } = useToast();
  const [orderComplete, setOrderComplete] = useState<{ orderNumber: string } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const paginatedItems = items.slice(startIdx, endIdx);

  const deliveryPrice = 15000;
  const total = subtotal + deliveryPrice;

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Get telegramId from localStorage (saved from URL params in Home.tsx)
  const storedTelegramId = typeof window !== "undefined" ? localStorage.getItem("customerTelegramId") || "" : "";
  const initialTelegramId = storedTelegramId;

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "+998",
      customerTelegramId: storedTelegramId,
      customerAddress: "",
      latitude: undefined,
      longitude: undefined,
      deliveryType: "courier",
      paymentType: "cash",
    },
  });

  const handleGetLocation = () => {
    setGeoLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          form.setValue("latitude", latitude);
          form.setValue("longitude", longitude);
          form.setValue("customerAddress", `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          setGeoLoading(false);
          toast({ title: "📍 Joylashuvingiz aniqlab olindi" });
        },
        (error) => {
          setGeoLoading(false);
          toast({ title: "Xatolik", description: "Joyni aniqlab olib bo'lmadi", variant: "destructive" });
        }
      );
    } else {
      setGeoLoading(false);
      toast({ title: "Xatolik", description: "Geo API brauzeringizda qo'llab-quvvatlanmaydi", variant: "destructive" });
    }
  };

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
        categoryId: item.product.categoryId,
      }));

      // Get all unique categories from all items
      const categoriesSet = new Set<string>();
      items.forEach(item => {
        categoriesSet.add(item.product.categoryId);
      });
      const allCategories = Array.from(categoriesSet).join(",");
      const categoryId = allCategories || "elektronika";

      // Ensure customerTelegramId is from form, not URL params
      const finalTelegramId = data.customerTelegramId || initialTelegramId;
      console.log("Creating order with customerTelegramId:", finalTelegramId);

      const orderData = {
        orderNumber,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerTelegramId: finalTelegramId,
        customerAddress: data.customerAddress,
        latitude: data.latitude,
        longitude: data.longitude,
        subtotal,
        deliveryPrice: data.deliveryType === "pickup" ? 0 : deliveryPrice,
        discount: 0,
        total: data.deliveryType === "pickup" ? subtotal : total,
        items: JSON.stringify(orderItems),
        categoryId,
        deliveryType: data.deliveryType,
        paymentType: data.paymentType,
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
                          <div className="flex items-center justify-between mb-2">
                            <FormLabel>Manzil</FormLabel>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={handleGetLocation}
                              disabled={geoLoading}
                              data-testid="button-get-location"
                            >
                              <MapPin className="h-4 w-4 mr-2" />
                              {geoLoading ? "Aniqlanmoqda..." : "Joyni aniqla"}
                            </Button>
                          </div>
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
                                      {formatPrice(deliveryPrice)}
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
                    <div className="space-y-3">
                      {paginatedItems.map((item) => (
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

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between pt-3 border-t text-xs gap-2">
                        <span className="text-muted-foreground">
                          {startIdx + 1}-{Math.min(endIdx, items.length)} / {items.length}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            data-testid="button-prev-items"
                          >
                            <ChevronLeft className="h-3 w-3" />
                          </Button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 1))
                            .map((page) => (
                              <Button
                                key={page}
                                type="button"
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                data-testid={`button-page-${page}`}
                                className="h-7 w-7 p-0"
                              >
                                {page}
                              </Button>
                            ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            data-testid="button-next-items"
                          >
                            <ChevronRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Totals */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Mahsulotlar</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Yetkazish</span>
                        <span className={form.watch("deliveryType") === "pickup" ? "text-green-600" : ""}>
                          {form.watch("deliveryType") === "pickup"
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
