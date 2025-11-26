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
} from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Order, OrderItem, Category } from "@shared/schema";

const statusOptions = [
  { value: "new", label: "Yangi" },
  { value: "processing", label: "Jarayonda" },
  { value: "shipping", label: "Yo'lda" },
  { value: "delivered", label: "Yetkazildi" },
  { value: "cancelled", label: "Bekor qilindi" },
];

export default function AdminOrders() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
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
