import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Settings, Truck, Palette, MessageCircle, Loader2, Save, Plus, Trash2, Edit2, Upload, X } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SiteSettings, Category } from "@shared/schema";
import { useState } from "react";

const settingsSchema = z.object({
  siteName: z.string().min(1, "Sayt nomini kiriting"),
  logoUrl: z.string().optional(),
  heroImageUrl: z.string().optional(),
  primaryColor: z.string().optional(),
  deliveryPrice: z.coerce.number().min(0),
  freeDeliveryThreshold: z.coerce.number().min(0).optional(),
  telegramBotToken: z.string().optional(),
  telegramGroupId: z.string().optional(),
});

const categorySchema = z.object({
  name: z.string().min(2, "Kamida 2 ta belgi"),
  icon: z.string().optional(),
});

type SettingsForm = z.infer<typeof settingsSchema>;
type CategoryForm = z.infer<typeof categorySchema>;

export default function AdminSettings() {
  const { toast } = useToast();
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);

  const { data: settings, isLoading } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const form = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    values: settings ? {
      siteName: settings.siteName,
      logoUrl: settings.logoUrl || "",
      heroImageUrl: settings.heroImageUrl || "",
      primaryColor: settings.primaryColor || "#7c3aed",
      deliveryPrice: settings.deliveryPrice,
      freeDeliveryThreshold: settings.freeDeliveryThreshold || 500000,
      telegramBotToken: settings.telegramBotToken || "",
      telegramGroupId: settings.telegramGroupId || "",
    } : undefined,
  });

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      form.setValue("heroImageUrl", base64);
      setHeroPreview(base64);
      toast({ title: "Rasm yuklandi" });
    };
    reader.readAsDataURL(file);
  };

  const handleClearHeroImage = () => {
    form.setValue("heroImageUrl", "");
    setHeroPreview(null);
  };

  const categoryForm = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      icon: "",
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: SettingsForm) => {
      return apiRequest("PATCH", "/api/settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Sozlamalar saqlandi" });
    },
    onError: () => {
      toast({ title: "Xatolik yuz berdi", variant: "destructive" });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryForm) => {
      const slug = data.name.toLowerCase().replace(/\s+/g, '-');
      return apiRequest("POST", "/api/categories", { ...data, slug });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Kategoriya qo'shildi" });
      setCategoryDialogOpen(false);
      categoryForm.reset();
    },
    onError: () => {
      toast({ title: "Xatolik yuz berdi", variant: "destructive" });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async (data: CategoryForm & { id: string }) => {
      const slug = data.name.toLowerCase().replace(/\s+/g, '-');
      return apiRequest("PATCH", `/api/categories/${data.id}`, { ...data, slug });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Kategoriya yangilandi" });
      setCategoryDialogOpen(false);
      setEditingCategory(null);
      categoryForm.reset();
    },
    onError: () => {
      toast({ title: "Xatolik yuz berdi", variant: "destructive" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Kategoriya o'chirildi" });
    },
    onError: () => {
      toast({ title: "Xatolik yuz berdi", variant: "destructive" });
    },
  });

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    categoryForm.reset({
      name: category.name,
      icon: category.icon || "",
    });
    setCategoryDialogOpen(true);
  };

  const handleCategorySubmit = (data: CategoryForm) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ ...data, id: editingCategory.id });
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  const onSubmit = (data: SettingsForm) => {
    updateSettingsMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <AdminLayout title="Sozlamalar">
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Sozlamalar">
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            Umumiy
          </TabsTrigger>
          <TabsTrigger value="delivery">
            <Truck className="h-4 w-4 mr-2" />
            Yetkazish
          </TabsTrigger>
          <TabsTrigger value="categories">
            <Palette className="h-4 w-4 mr-2" />
            Kategoriyalar
          </TabsTrigger>
          <TabsTrigger value="telegram">
            <MessageCircle className="h-4 w-4 mr-2" />
            Telegram
          </TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* General Settings */}
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>Umumiy sozlamalar</CardTitle>
                  <CardDescription>Saytning asosiy sozlamalari</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="siteName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sayt nomi</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-site-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo URL</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://..." data-testid="input-logo-url" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="heroImageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hero rasm</FormLabel>
                        <div className="space-y-3">
                          {(heroPreview || field.value) && (
                            <div className="relative rounded-lg overflow-hidden bg-muted h-40">
                              <img
                                src={heroPreview || field.value}
                                alt="Hero preview"
                                className="w-full h-full object-cover"
                              />
                              <Button
                                type="button"
                                size="icon"
                                variant="destructive"
                                className="absolute top-2 right-2"
                                onClick={handleClearHeroImage}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <label className="flex-1">
                              <FormControl>
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleHeroImageUpload}
                                  className="cursor-pointer"
                                  data-testid="input-hero-image"
                                />
                              </FormControl>
                            </label>
                          </div>
                          <FormDescription>
                            Bosh sahifadagi hero rasm. Rasm fayli yuklang (PNG, JPG)
                          </FormDescription>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="primaryColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Asosiy rang (ixtiyoriy)</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input type="color" {...field} className="w-12 h-9 p-1" data-testid="input-primary-color" />
                          </FormControl>
                          <Input value={field.value} onChange={field.onChange} className="flex-1" />
                        </div>
                        <FormDescription>
                          Bo'sh qolsa, standart rang ishlatiladi
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={updateSettingsMutation.isPending}>
                    {updateSettingsMutation.isPending && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    <Save className="h-4 w-4 mr-2" />
                    Saqlash
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Delivery Settings */}
            <TabsContent value="delivery">
              <Card>
                <CardHeader>
                  <CardTitle>Yetkazib berish sozlamalari</CardTitle>
                  <CardDescription>Yetkazish narxi va bepul yetkazish chegarasi</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="deliveryPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Yetkazish narxi (so'm)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} data-testid="input-delivery-price" />
                        </FormControl>
                        <FormDescription>
                          Hozirgi narx: {formatPrice(field.value || 0)}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="freeDeliveryThreshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bepul yetkazish chegarasi (so'm)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} data-testid="input-free-delivery" />
                        </FormControl>
                        <FormDescription>
                          {formatPrice(field.value || 0)} dan yuqori xaridlarda bepul yetkazib beriladi
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={updateSettingsMutation.isPending}>
                    {updateSettingsMutation.isPending && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    <Save className="h-4 w-4 mr-2" />
                    Saqlash
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Categories */}
            <TabsContent value="categories">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Kategoriyalar</CardTitle>
                    <CardDescription>Mahsulot kategoriyalarini boshqaring</CardDescription>
                  </div>
                  <Button
                    type="button"
                    onClick={() => {
                      setEditingCategory(null);
                      categoryForm.reset({ name: "", icon: "" });
                      setCategoryDialogOpen(true);
                    }}
                    data-testid="button-add-category"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Qo'shish
                  </Button>
                </CardHeader>
                <CardContent>
                  {categories.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Hozircha kategoriyalar yo'q
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Icon</TableHead>
                          <TableHead>Nomi</TableHead>
                          <TableHead>Slug</TableHead>
                          <TableHead className="text-right">Amallar</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categories.map((category) => (
                          <TableRow key={category.id}>
                            <TableCell className="text-2xl">{category.icon || "📦"}</TableCell>
                            <TableCell className="font-medium">{category.name}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{category.slug}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditCategory(category)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => deleteCategoryMutation.mutate(category.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Telegram Settings */}
            <TabsContent value="telegram">
              <Card>
                <CardHeader>
                  <CardTitle>Telegram integratsiyasi</CardTitle>
                  <CardDescription>
                    Telegram bot orqali buyurtmalar haqida xabar olish
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="telegramBotToken"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bot Token</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="123456789:ABCDefGhIJKlmNoPQRsTUVwxyZ"
                            data-testid="input-bot-token"
                          />
                        </FormControl>
                        <FormDescription>
                          @BotFather dan olingan token
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="telegramChatId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chat ID</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="-1001234567890" data-testid="input-chat-id" />
                        </FormControl>
                        <FormDescription>
                          Guruh yoki kanal ID si (xabarlar shu yerga yuboriladi)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={updateSettingsMutation.isPending}>
                    {updateSettingsMutation.isPending && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    <Save className="h-4 w-4 mr-2" />
                    Saqlash
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </form>
        </Form>
      </Tabs>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Kategoriyani tahrirlash" : "Yangi kategoriya"}
            </DialogTitle>
          </DialogHeader>
          <Form {...categoryForm}>
            <form onSubmit={categoryForm.handleSubmit(handleCategorySubmit)} className="space-y-4">
              <FormField
                control={categoryForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomi</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Kategoriya nomi" data-testid="input-category-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={categoryForm.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon (emoji)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="📱" data-testid="input-category-icon" />
                    </FormControl>
                    <FormDescription>
                      Bitta emoji kiriting (masalan: 📱, 👕, 🏠)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCategoryDialogOpen(false)}>
                  Bekor qilish
                </Button>
                <Button
                  type="submit"
                  disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                  data-testid="button-save-category"
                >
                  {(createCategoryMutation.isPending || updateCategoryMutation.isPending) && (
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
