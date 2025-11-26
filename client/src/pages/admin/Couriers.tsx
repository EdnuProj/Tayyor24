import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { insertCourierSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Trash2, Plus, MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminCouriers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: couriers = [], isLoading } = useQuery({
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
      form.reset();
      toast({ title: "Kuryer qo'shildi" });
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

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await apiRequest("PATCH", `/api/couriers/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/couriers"] });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="heading-couriers">
          Kuryerlar Boshqaruvi
        </h1>
        <p className="text-secondary mt-2">Kuryerlarni qo'shish, o'zgartirish va boshqarish</p>
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
                    </div>

                    <div className="space-y-1 text-sm text-secondary">
                      <p data-testid={`text-courier-phone-${courier.id}`}>
                        📱 {courier.phone}
                      </p>
                      <p data-testid={`text-courier-telegram-${courier.id}`}>
                        💬 Telegram: {courier.telegramId}
                      </p>
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

                  <div className="flex gap-2">
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
    </div>
  );
}
