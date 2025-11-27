import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Search,
  Eye,
  Phone,
  MapPin,
  Package,
  ChevronDown,
  Filter,
  Plus,
  Minus,
  X,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  formatPrice,
  orderStatusLabels,
  orderStatusColors,
  deliveryTypeLabels,
  paymentTypeLabels,
  generateOrderNumber,
} from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Order, OrderItem, Category, Product, Courier, CourierAssignment } from "@shared/schema";

const statusOptions = [
  { value: "new", label: "Yangi" },
  { value: "processing", label: "Jarayonda" },
  { value: "shipping", label: "Yo'lda" },
  { value: "delivered", label: "Yetkazildi" },
  { value: "cancelled", label: "Bekor qilindi" },
];

interface AssignmentWithInfo extends CourierAssignment {
  courier?: Courier | null;
  order?: Order | null;
}

export default function AdminOrders() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [selectedItems, setSelectedItems] = useState<Array<{ product: Product; quantity: number }>>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [deliveryType, setDeliveryType] = useState("courier");
  const [paymentType, setPaymentType] = useState("cash");
  const [createCourierId, setCreateCourierId] = useState<string>("");

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: couriers = [] } = useQuery<Courier[]>({
    queryKey: ["/api/couriers"],
  });

  const { data: assignments = [] } = useQuery<AssignmentWithInfo[]>({
    queryKey: ["/api/assignments"],
  });

  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((cat) => {
      map[cat.id] = cat.name;
    });
    return map;
  }, [categories]);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest("PATCH", `/api/orders/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Buyurtma holati yangilandi" });
    },
    onError: () => {
      toast({ title: "Xatolik yuz berdi", variant: "destructive" });
    },
  });

  const assignCourierMutation = useMutation({
    mutationFn: async ({ orderId, courierId }: { orderId: string; courierId: string }) => {
      return apiRequest("POST", `/api/orders/${orderId}/assign-courier`, { courierId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      toast({ title: "Kuryer belgilandi" });
    },
    onError: () => {
      toast({ title: "Xatolik yuz berdi", variant: "destructive" });
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const subtotal = selectedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      const deliveryPrice = deliveryType === "courier" ? 15000 : 0;
      const total = subtotal + deliveryPrice;

      const orderItems: OrderItem[] = selectedItems.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.images[0] || "",
        price: item.product.price,
        quantity: item.quantity,
        categoryId: item.product.categoryId,
      }));

      const orderRes = await apiRequest("POST", "/api/orders", {
        orderNumber: generateOrderNumber(),
        customerName,
        customerPhone,
        customerAddress,
        deliveryType,
        paymentType,
        status: "new",
        subtotal,
        deliveryPrice,
        discount: 0,
        total,
        items: JSON.stringify(orderItems),
        categoryId: "elektronika",
      });
      
      const order = (await orderRes.json()) as Order;

      // Assign to courier if selected
      if (createCourierId && deliveryType === "courier" && order.id) {
        try {
          const assignRes = await apiRequest("POST", `/api/orders/${order.id}/assign-courier`, {
            courierId: createCourierId,
          });
          await assignRes.json();
        } catch (assignError) {
          console.error("Courier assignment error:", assignError);
          // Continue even if assignment fails - order was created
        }
      }

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      toast({ title: "Buyurtma muvaffaqiyatli yaratildi" });
      setIsCreateOpen(false);
      setSelectedItems([]);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
      setProductSearch("");
      setCreateCourierId("");
    },
    onError: () => {
      toast({ title: "Xatolik yuz berdi", variant: "destructive" });
    },
  });

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.customerName.toLowerCase().includes(search.toLowerCase()) ||
      order.customerPhone.includes(search);
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getOrderItems = (order: Order): OrderItem[] => {
    try {
      return JSON.parse(order.items);
    } catch {
      return [];
    }
  };

  const getCourierForOrder = (orderId: string): Courier | null | undefined => {
    const assignment = assignments.find((a) => a.orderId === orderId);
    if (!assignment) return undefined;
    return assignment.courier;
  };

  const stats = {
    total: orders.length,
    new: orders.filter((o) => o.status === "new").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipping: orders.filter((o) => o.status === "shipping").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  return (
    <AdminLayout title="Buyurtmalar">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="cursor-pointer hover-elevate" onClick={() => setStatusFilter("all")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Jami</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover-elevate" onClick={() => setStatusFilter("new")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
            <p className="text-sm text-muted-foreground">Yangi</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover-elevate" onClick={() => setStatusFilter("processing")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.processing}</p>
            <p className="text-sm text-muted-foreground">Jarayonda</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover-elevate" onClick={() => setStatusFilter("shipping")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.shipping}</p>
            <p className="text-sm text-muted-foreground">Yo'lda</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover-elevate" onClick={() => setStatusFilter("delivered")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
            <p className="text-sm text-muted-foreground">Yetkazildi</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <CardTitle className="text-lg">Buyurtmalar ro'yxati</CardTitle>
          <div className="flex items-center gap-4 flex-wrap">
            <Button 
              onClick={() => setIsCreateOpen(true)}
              data-testid="button-create-order"
            >
              <Plus className="h-4 w-4 mr-2" />
              Yaratish
            </Button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Qidirish..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-[200px]"
                data-testid="input-search-orders"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Holat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barchasi</SelectItem>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Buyurtmalar topilmadi</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Buyurtma</TableHead>
                    <TableHead>Mijoz</TableHead>
                    <TableHead>Summa</TableHead>
                    <TableHead>To'lov</TableHead>
                    <TableHead>Kuryer</TableHead>
                    <TableHead>Holat</TableHead>
                    <TableHead>Sana</TableHead>
                    <TableHead className="text-right">Amallar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <p className="font-medium">#{order.orderNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {getOrderItems(order).length} ta mahsulot
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(order.total)}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{paymentTypeLabels[order.paymentType]}</p>
                        <p className="text-xs text-muted-foreground">
                          {deliveryTypeLabels[order.deliveryType]}
                        </p>
                      </TableCell>
                      <TableCell>
                        {order.deliveryType === "courier" ? (
                          <div className="flex items-center gap-2">
                            {getCourierForOrder(order.id) ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 animate-pulse">
                                ✅ {getCourierForOrder(order.id)?.name || "Kuryer"}
                              </Badge>
                            ) : (
                              <Select
                                value="select"
                                onValueChange={(courierId) => {
                                  if (courierId && courierId !== "select") {
                                    assignCourierMutation.mutate({ orderId: order.id, courierId });
                                  }
                                }}
                              >
                                <SelectTrigger className="w-[140px] h-8 text-xs">
                                  <SelectValue placeholder="Kuryer tanlang" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="select" disabled>Kuryer tanlang</SelectItem>
                                  {couriers.map((courier) => (
                                    <SelectItem key={courier.id} value={courier.id}>
                                      {courier.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">-</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Badge
                              className={`${orderStatusColors[order.status]} cursor-pointer`}
                            >
                              {orderStatusLabels[order.status]}
                              <ChevronDown className="h-3 w-3 ml-1" />
                            </Badge>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {statusOptions.map((opt) => (
                              <DropdownMenuItem
                                key={opt.value}
                                onClick={() =>
                                  updateStatusMutation.mutate({
                                    id: order.id,
                                    status: opt.value,
                                  })
                                }
                              >
                                {opt.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {order.createdAt
                          ? format(new Date(order.createdAt), "dd.MM.yyyy HH:mm")
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Order Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yangi Buyurtma Yaratish</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Product Selection */}
            <div className="space-y-3">
              <p className="font-medium">1. Mahsulotlarni tanlang</p>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Mahsulot qidirish..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="pl-10"
                  data-testid="input-product-search"
                />
              </div>
              <div className="border rounded-lg max-h-64 overflow-y-auto">
                {filteredProducts.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">Mahsulot topilmadi</div>
                ) : (
                  <div className="space-y-2 p-2">
                    {filteredProducts.map((product) => {
                      const isSelected = selectedItems.some((item) => item.product.id === product.id);
                      return (
                        <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg hover-elevate">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {product.images[0] && (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-10 h-10 rounded object-cover"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{product.name}</p>
                              <p className="text-xs text-muted-foreground">{formatPrice(product.price)}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant={isSelected ? "default" : "outline"}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedItems(selectedItems.filter((item) => item.product.id !== product.id));
                              } else {
                                setSelectedItems([...selectedItems, { product, quantity: 1 }]);
                              }
                            }}
                            data-testid={`button-select-product-${product.id}`}
                          >
                            {isSelected ? "Olib tashlash" : "Tanlash"}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Selected Items */}
            {selectedItems.length > 0 && (
              <div className="space-y-3">
                <p className="font-medium">2. Tanlangan mahsulotlar ({selectedItems.length})</p>
                <div className="space-y-2 border rounded-lg p-3">
                  {selectedItems.map((item, index) => (
                      <div key={`${item.product.id}-${index}`} className="flex items-center justify-between gap-3 p-2 bg-muted/50 rounded">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">{formatPrice(item.product.price)} x {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              if (item.quantity > 1) {
                                setSelectedItems(
                                  selectedItems.map((i) =>
                                    i.product.id === item.product.id ? { ...i, quantity: i.quantity - 1 } : i
                                  )
                                );
                              }
                            }}
                            data-testid={`button-decrease-qty-${item.product.id}`}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-sm">{item.quantity}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setSelectedItems(
                                selectedItems.map((i) =>
                                  i.product.id === item.product.id ? { ...i, quantity: i.quantity + 1 } : i
                                )
                              );
                            }}
                            data-testid={`button-increase-qty-${item.product.id}`}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <p className="font-medium text-sm min-w-20 text-right">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setSelectedItems(selectedItems.filter((i) => i.product.id !== item.product.id));
                            }}
                            data-testid={`button-remove-product-${item.product.id}`}
                            className="ml-2"
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  
                </div>
                <div className="flex justify-between font-semibold bg-primary/10 p-3 rounded-lg">
                  <span>Jami (Mahsulotlar):</span>
                  <span>{formatPrice(selectedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0))}</span>
                </div>
              </div>
            )}

            <Separator />

            {/* Customer Info */}
            <div className="space-y-3">
              <p className="font-medium">3. Mijoz Ma'lumotlari</p>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Ism</label>
                  <Input
                    placeholder="Mijoz ismi"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    data-testid="input-customer-name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Telefon</label>
                  <Input
                    placeholder="+998 XX XXX XX XX"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    data-testid="input-customer-phone"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Manzil</label>
                  <Input
                    placeholder="Yetkazish manzili"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    data-testid="input-customer-address"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Delivery & Payment */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Yetkazish turi</label>
                <Select value={deliveryType} onValueChange={setDeliveryType}>
                  <SelectTrigger data-testid="select-delivery-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="courier">Kuryer</SelectItem>
                    <SelectItem value="pickup">Olib ketish</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">To'lov turi</label>
                <Select value={paymentType} onValueChange={setPaymentType}>
                  <SelectTrigger data-testid="select-payment-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Naqd</SelectItem>
                    <SelectItem value="card">Karta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Courier Selection (if courier delivery) */}
            {deliveryType === "courier" && (
              <div>
                <label className="text-sm font-medium">Kuryer Tanlang (ixtiyoriy)</label>
                <Select value={createCourierId || "auto"} onValueChange={(val) => setCreateCourierId(val === "auto" ? "" : val)}>
                  <SelectTrigger data-testid="select-create-courier">
                    <SelectValue placeholder="Kuryer tanlang yoki avtomatik belgilansin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">🤖 Avtomatik belgilash</SelectItem>
                    {couriers.map((courier) => (
                      <SelectItem key={courier.id} value={courier.id}>
                        {courier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {createCourierId ? "✅ Tanlangan kuryerga yuboriladi" : "⏱️ 30 sekundda qabul qilmasa, hammaga yuboriladi"}
                </p>
              </div>
            )}

            {/* Total */}
            {selectedItems.length > 0 && (
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Mahsulotlar:</span>
                  <span>{formatPrice(selectedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Yetkazish:</span>
                  <span>{deliveryType === "courier" ? formatPrice(15000) : "Bepul"}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold text-lg text-green-700 dark:text-green-300">
                  <span>Jami:</span>
                  <span>
                    {formatPrice(
                      selectedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0) +
                        (deliveryType === "courier" ? 15000 : 0)
                    )}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="flex-1"
                data-testid="button-cancel-create"
              >
                Bekor qilish
              </Button>
              <Button
                onClick={() => createOrderMutation.mutate()}
                disabled={!customerName || !customerPhone || !customerAddress || selectedItems.length === 0 || createOrderMutation.isPending}
                className="flex-1"
                data-testid="button-submit-create-order"
              >
                {createOrderMutation.isPending ? "Yaratilmoqda..." : "Buyurtmani Yaratish"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Buyurtma #{selectedOrder?.orderNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Mijoz</p>
                  <p className="font-medium">{selectedOrder.customerName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Telefon</p>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`tel:${selectedOrder.customerPhone}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {selectedOrder.customerPhone}
                    </a>
                  </div>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-sm text-muted-foreground">Manzil</p>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <p className="font-medium">{selectedOrder.customerAddress}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Order Items */}
              <div className="space-y-3">
                <p className="font-medium">Mahsulotlar</p>
                <div className="space-y-2">
                  {getOrderItems(selectedOrder).map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-muted">
                        <img
                          src={item.productImage || "/placeholder.svg"}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.productName}</p>
                        <div className="flex gap-2 text-xs text-muted-foreground flex-wrap">
                          {item.categoryId && (
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                              {categoryMap[item.categoryId] || "Noma'lum"}
                            </span>
                          )}
                          {item.selectedColor && (
                            <span className="flex items-center gap-1">
                              Rang:
                              <span
                                className="w-3 h-3 rounded-full border"
                                style={{ backgroundColor: item.selectedColor }}
                              />
                            </span>
                          )}
                          {item.selectedSize && <span>O'lcham: {item.selectedSize}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} x {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Order Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mahsulotlar</span>
                  <span>{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Yetkazish</span>
                  <span>
                    {selectedOrder.deliveryPrice > 0
                      ? formatPrice(selectedOrder.deliveryPrice)
                      : "Bepul"}
                  </span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Chegirma</span>
                    <span>-{formatPrice(selectedOrder.discount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Jami</span>
                  <span className="text-lg text-primary">
                    {formatPrice(selectedOrder.total)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <a
                  href={`tel:${selectedOrder.customerPhone}`}
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Qo'ng'iroq qilish
                  </Button>
                </a>
                <Select
                  value={selectedOrder.status}
                  onValueChange={(value) =>
                    updateStatusMutation.mutate({
                      id: selectedOrder.id,
                      status: value,
                    })
                  }
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
