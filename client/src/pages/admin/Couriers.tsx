import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { insertCourierSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Trash2, Plus, MapPin, DollarSign, Truck } from "lucide-react";
import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function AdminCouriers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCourier, setSelectedCourier] = useState<any>(null);
  const [balanceAmount, setBalanceAmount] = useState<string>("");

  const { data: couriers = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/couriers"],
    queryFn: async () => {
      const res = await fetch("/api/couriers");
      return res.json();
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      return res.json();
    },
  });

  const form = useForm({
    resolver: zodResolver(insertCourierSchema),
    defaultValues: {
      name: "",
      phone: "",
      telegramId: "",
      cardNumber: "",
      categoryId: "",
      latitude: undefined,
      longitude: undefined,
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/couriers", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/couriers"] });
      setTimeout(() => refetch(), 100);
      form.reset();
      toast({ title: "Kuryer qo'shildi - Balansi: 10,000 so'm" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/couriers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/couriers"] });
      toast({ title: "Kuryer o'chirildi" });
    },
  });

  const balanceMutation = useMutation({
    mutationFn: async ({ id, amount, type }: { id: string; amount: number; type: string }) => {
      const res = await apiRequest("PATCH", `/api/couriers/${id}/balance`, { amount, type });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/couriers"] });
      // Update selected courier with new balance - data IS the courier object
      setSelectedCourier(data);
      setBalanceAmount("");
      toast({ title: "✅ Balansi yangilandi", description: `Yangi balans: ${data?.balance?.toLocaleString() || 0} so'm` });
      // Refresh courier list after 300ms
      setTimeout(() => refetch(), 300);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await apiRequest("PATCH", `/api/couriers/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/couriers"] });
    },
  });

  const stats = {
    total: couriers.length,
    active: couriers.filter((c: any) => c.isActive).length,
    totalBalance: couriers.reduce((sum: number, c: any) => sum + c.balance, 0),
  };

  return (
    <AdminLayout title="Kuryerlar Boshqaruvi">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Jami kuryerlar</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <Truck className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Faol kuryerlar</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{(stats.totalBalance / 1000).toFixed(0)}k</p>
              <p className="text-sm text-muted-foreground">Jami balans</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Courier Form */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Yangi Kuryer Qo'shish</h2>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => createMutation.mutate(data))}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kuryer Ismi</FormLabel>
                    <FormControl>
                      <Input placeholder="Ism va familiya" {...field} data-testid="input-courier-name" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon Raqami</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+998901234567"
                        {...field}
                        data-testid="input-courier-phone"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telegramId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telegram ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123456789"
                        {...field}
                        data-testid="input-courier-telegram"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Karta Raqami</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="9860 1234 5678 9012"
                        {...field}
                        data-testid="input-courier-card"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategoriya (ixtiyoriy)</FormLabel>
                    <Select value={field.value || ""} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger data-testid="select-courier-category">
                          <SelectValue placeholder="Kategoriya tanlang" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat: any) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              disabled={createMutation.isPending}
              data-testid="button-add-courier"
            >
              <Plus className="w-4 h-4 mr-2" />
              {createMutation.isPending ? "Qo'shilmoqda..." : "Kuryer Qo'shish"}
            </Button>
          </form>
        </Form>
      </Card>

      {/* Couriers List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Kuryerlar Ro'yxati</h2>
        {isLoading ? (
          <div className="text-center py-8 text-secondary">Yuklanmoqda...</div>
        ) : couriers.length === 0 ? (
          <Card className="p-6 text-center text-secondary">Hech qanday kuryer qo'shilmagan</Card>
        ) : (
          <div className="grid gap-4">
            {couriers.map((courier: any) => (
              <Card key={courier.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg" data-testid={`text-courier-name-${courier.id}`}>
                        {courier.name}
                      </h3>
                      <Badge
                        variant={courier.isActive ? "default" : "secondary"}
                        data-testid={`badge-courier-status-${courier.id}`}
                      >
                        {courier.isActive ? "Faol" : "Nofaol"}
                      </Badge>
                      <Badge variant="outline" data-testid={`badge-courier-balance-${courier.id}`}>
                        💰 {courier.balance?.toLocaleString() || 0} so'm
                      </Badge>
                    </div>

                    <div className="space-y-1 text-sm text-secondary">
                      <p data-testid={`text-courier-phone-${courier.id}`}>
                        📱 {courier.phone}
                      </p>
                      <p data-testid={`text-courier-telegram-${courier.id}`}>
                        💬 Telegram: {courier.telegramId}
                      </p>
                      {courier.cardNumber && (
                        <p data-testid={`text-courier-card-${courier.id}`}>
                          💳 {courier.cardNumber}
                        </p>
                      )}
                      {courier.categoryId && (
                        <p data-testid={`text-courier-category-${courier.id}`}>
                          📂 Kategoriya: {categories.find((c: any) => c.id === courier.categoryId)?.name}
                        </p>
                      )}
                      {courier.latitude && courier.longitude && (
                        <p
                          className="flex items-center gap-1"
                          data-testid={`text-courier-location-${courier.id}`}
                        >
                          <MapPin className="w-3 h-3" />
                          {courier.latitude.toFixed(4)}, {courier.longitude.toFixed(4)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCourier(courier)}
                      data-testid={`button-manage-balance-${courier.id}`}
                    >
                      <DollarSign className="w-4 h-4 mr-1" />
                      Balansi
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateStatusMutation.mutate({
                          id: courier.id,
                          isActive: !courier.isActive,
                        })
                      }
                      data-testid={`button-toggle-courier-${courier.id}`}
                    >
                      {courier.isActive ? "O'chirish" : "Yoqish"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMutation.mutate(courier.id)}
                      data-testid={`button-delete-courier-${courier.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Balance Management Modal */}
      <Dialog open={!!selectedCourier} onOpenChange={(open) => {
        if (!open) {
          setSelectedCourier(null);
          setBalanceAmount("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Balansi Boshqarish: {selectedCourier?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Hozirgi Balansi</p>
              <p className="text-2xl font-bold" data-testid="text-current-balance">
                {selectedCourier?.balance?.toLocaleString() || 0} so'm
              </p>
            </div>
            <Input
              type="number"
              placeholder="Miqdor kiriting"
              value={balanceAmount}
              onChange={(e) => setBalanceAmount(e.target.value)}
              data-testid="input-balance-amount"
            />
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() =>
                  balanceMutation.mutate({
                    id: selectedCourier?.id,
                    amount: parseInt(balanceAmount) || 0,
                    type: "credit",
                  })
                }
                disabled={balanceMutation.isPending || !balanceAmount}
                data-testid="button-credit-balance"
              >
                ➕ Qo'shish
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() =>
                  balanceMutation.mutate({
                    id: selectedCourier?.id,
                    amount: parseInt(balanceAmount) || 0,
                    type: "debit",
                  })
                }
                disabled={balanceMutation.isPending || !balanceAmount}
                data-testid="button-debit-balance"
              >
                ➖ Yechish
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCourier(null);
                setBalanceAmount("");
              }}
              data-testid="button-close-balance-modal"
            >
              Yopish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
