import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search, Tag, Trash2, Edit2, Loader2, Check, X } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
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
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { PromoCode } from "@shared/schema";

const promoCodeSchema = z.object({
  code: z.string().min(3, "Kamida 3 ta belgi").max(20).toUpperCase(),
  discountPercent: z.coerce.number().min(1, "1% dan kam bo'lmasligi kerak").max(100, "100% dan oshmasligi kerak"),
  usageLimit: z.coerce.number().optional(),
  isActive: z.boolean().default(true),
});

type PromoCodeForm = z.infer<typeof promoCodeSchema>;

export default function AdminPromoCodes() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);

  const { data: promoCodes = [], isLoading } = useQuery<PromoCode[]>({
    queryKey: ["/api/promo-codes"],
  });

  const form = useForm<PromoCodeForm>({
    resolver: zodResolver(promoCodeSchema),
    defaultValues: {
      code: "",
      discountPercent: 10,
      usageLimit: undefined,
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: PromoCodeForm) => {
      return apiRequest("POST", "/api/promo-codes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/promo-codes"] });
      toast({ title: "Promokod yaratildi" });
      setDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Xatolik yuz berdi", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: PromoCodeForm & { id: string }) => {
      return apiRequest("PATCH", `/api/promo-codes/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/promo-codes"] });
      toast({ title: "Promokod yangilandi" });
      setDialogOpen(false);
      setEditingCode(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Xatolik yuz berdi", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/promo-codes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/promo-codes"] });
      toast({ title: "Promokod o'chirildi" });
    },
    onError: () => {
      toast({ title: "Xatolik yuz berdi", variant: "destructive" });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return apiRequest("PATCH", `/api/promo-codes/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/promo-codes"] });
    },
    onError: () => {
      toast({ title: "Xatolik yuz berdi", variant: "destructive" });
    },
  });

  const handleEdit = (promo: PromoCode) => {
    setEditingCode(promo);
    form.reset({
      code: promo.code,
      discountPercent: promo.discountPercent,
      usageLimit: promo.usageLimit || undefined,
      isActive: promo.isActive,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (data: PromoCodeForm) => {
    if (editingCode) {
      updateMutation.mutate({ ...data, id: editingCode.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredCodes = promoCodes.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Promokodlar">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <CardTitle className="text-lg">Promokodlar</CardTitle>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Qidirish..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-[200px]"
                data-testid="input-search-promo"
              />
            </div>
            <Button
              onClick={() => {
                setEditingCode(null);
                form.reset();
                setDialogOpen(true);
              }}
              data-testid="button-add-promo"
            >
              <Plus className="h-4 w-4 mr-2" />
              Qo'shish
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredCodes.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Promokodlar topilmadi</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kod</TableHead>
                    <TableHead>Chegirma</TableHead>
                    <TableHead>Ishlatilgan</TableHead>
                    <TableHead>Limit</TableHead>
                    <TableHead>Holat</TableHead>
                    <TableHead className="text-right">Amallar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCodes.map((promo) => (
                    <TableRow key={promo.id}>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-sm">
                          {promo.code}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-primary">
                        {promo.discountPercent}%
                      </TableCell>
                      <TableCell>{promo.usageCount} marta</TableCell>
                      <TableCell>
                        {promo.usageLimit ? `${promo.usageLimit} marta` : "Limitisz"}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={promo.isActive}
                          onCheckedChange={(checked) =>
                            toggleActiveMutation.mutate({
                              id: promo.id,
                              isActive: checked,
                            })
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(promo)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deleteMutation.mutate(promo.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Promo Code Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCode ? "Promokodni tahrirlash" : "Yangi promokod"}
            </DialogTitle>
            <DialogDescription>
              Promokod bilan chegirma bering
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kod</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="CHEGIRMA20"
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        data-testid="input-promo-code"
                      />
                    </FormControl>
                    <FormDescription>
                      Faqat harflar va raqamlar
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discountPercent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chegirma foizi</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        {...field}
                        data-testid="input-discount-percent"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="usageLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ishlatish limiti (ixtiyoriy)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="Limitisz"
                        {...field}
                        value={field.value || ""}
                        data-testid="input-usage-limit"
                      />
                    </FormControl>
                    <FormDescription>
                      Bo'sh qoldirsa cheksiz ishlatiladi
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Faol</FormLabel>
                      <FormDescription>
                        Promokod ishlatilishi mumkinmi
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Bekor qilish
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-promo"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Saqlash
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
