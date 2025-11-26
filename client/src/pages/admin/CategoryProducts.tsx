import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  ChevronLeft,
  Edit2,
  Trash2,
  Loader2,
  Package,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, generateSlug } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product, Category } from "@shared/schema";

const productSchema = z.object({
  name: z.string().min(2, "Kamida 2 ta belgi"),
  description: z.string().optional(),
  price: z.coerce.number().positive("Narx musbat bo'lishi kerak"),
  oldPrice: z.coerce.number().optional(),
  categoryId: z.string().min(1, "Kategoriyani tanlang"),
  brand: z.string().optional(),
  images: z.array(z.string()).min(1, "Kamida 1 ta rasm kerak"),
  colors: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  containers: z.array(z.string()).optional(),
  stock: z.coerce.number().min(0).default(0),
  isPopular: z.boolean().default(false),
  isNew: z.boolean().default(true),
});

type ProductForm = z.infer<typeof productSchema>;

export default function CategoryProducts() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageInput, setImageInput] = useState("");

  const { data: products = [], isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const category = categories.find(c => c.id === categoryId);
  const categoryProducts = products.filter(p => p.categoryId === categoryId);

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      oldPrice: undefined,
      categoryId: categoryId || "",
      brand: "",
      images: [],
      colors: [],
      sizes: [],
      containers: [],
      stock: 0,
      isPopular: false,
      isNew: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProductForm) => {
      const slug = generateSlug(data.name);
      return apiRequest("POST", "/api/products", { ...data, slug });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Mahsulot qo'shildi" });
      setDialogOpen(false);
      form.reset({
        ...form.getValues(),
        name: "",
        description: "",
        price: 0,
        oldPrice: undefined,
        brand: "",
        images: [],
        colors: [],
        sizes: [],
        containers: [],
        stock: 0,
      });
    },
    onError: () => {
      toast({ title: "Xatolik yuz berdi", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Mahsulot o'chirildi" });
    },
    onError: () => {
      toast({ title: "Xatolik yuz berdi", variant: "destructive" });
    },
  });

  const handleSubmit = (data: ProductForm) => {
    createMutation.mutate(data);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const current = form.getValues("images") || [];
        form.setValue("images", [...current, base64]);
        e.target.value = "";
      };
      reader.readAsDataURL(file);
    }
  };

  const addImage = () => {
    if (imageInput.trim()) {
      const current = form.getValues("images") || [];
      form.setValue("images", [...current, imageInput.trim()]);
      setImageInput("");
    }
  };

  const removeImage = (index: number) => {
    const current = form.getValues("images") || [];
    form.setValue("images", current.filter((_, i) => i !== index));
  };

  return (
    <AdminLayout title={category?.name || "Mahsulotlar"}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
            data-testid="button-back-products"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Orqasi
          </Button>
          <h2 className="text-lg font-semibold">
            {category?.icon} {category?.name} - Mahsulotlar ({categoryProducts.length})
          </h2>
        </div>
        <Button
          onClick={() => {
            setEditingProduct(null);
            form.reset({
              name: "",
              description: "",
              price: 0,
              oldPrice: undefined,
              categoryId: categoryId || "",
              brand: "",
              images: [],
              colors: [],
              sizes: [],
              containers: [],
              stock: 0,
              isPopular: false,
              isNew: true,
            });
            setDialogOpen(true);
          }}
          data-testid="button-add-product"
        >
          <Plus className="h-4 w-4 mr-2" />
          Mahsulot qo'shish
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loadingProducts ? (
            <div className="space-y-4 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded-md animate-pulse" />
              ))}
            </div>
          ) : categoryProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Bu kategoriyada mahsulot yo'q</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nomi</TableHead>
                    <TableHead>Narx</TableHead>
                    <TableHead>Brend</TableHead>
                    <TableHead>Qolgan</TableHead>
                    <TableHead className="text-right">Amallar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{formatPrice(product.price)}</TableCell>
                      <TableCell>{product.brand || "-"}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(product.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-product-${product.id}`}
                        >
                          {deleteMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yangi mahsulot - {category?.name}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mahsulot nomi</FormLabel>
                    <FormControl>
                      <Input placeholder="Mahsulot nomini kiriting" {...field} data-testid="input-product-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tavsif</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Mahsulot tavsifi" {...field} data-testid="input-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Narx (so'm)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} data-testid="input-price" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="oldPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Eski narx</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} value={field.value || ""} data-testid="input-old-price" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brend</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-brand" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qolgan (dona)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} data-testid="input-stock" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rasmlar</FormLabel>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          data-testid="input-image-file"
                        />
                        <Button type="button" onClick={() => document.querySelector('input[type="file"]')?.click()} variant="default" size="sm">
                          Yuklash
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="yoki URL kiriting"
                          value={imageInput}
                          onChange={(e) => setImageInput(e.target.value)}
                          data-testid="input-image-url"
                        />
                        <Button type="button" onClick={addImage} variant="outline" size="sm">
                          Qo'shish
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {field.value?.map((img, idx) => (
                          <div key={idx} className="relative">
                            <img src={img} alt={`Product ${idx}`} className="w-20 h-20 object-cover rounded-md" />
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute -top-2 -right-2 bg-destructive text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Bekor qilish
                </Button>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-save-product">
                  {createMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
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
