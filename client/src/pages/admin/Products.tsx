import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  MoreHorizontal,
  Package,
  Loader2,
  X,
  ImagePlus,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Skeleton } from "@/components/ui/skeleton";
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

export default function AdminProducts() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageInput, setImageInput] = useState("");
  const [colorInput, setColorInput] = useState("");
  const [sizeInput, setSizeInput] = useState("");
  const [containerInput, setContainerInput] = useState("");
  const [selectedParentCategoryId, setSelectedParentCategoryId] = useState<string | null>(null);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Organize categories: parent and subcategories
  const parentCategories = categories.filter(c => !c.parentId);
  const getSubcategories = (parentId: string) => categories.filter(c => c.parentId === parentId);

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

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      oldPrice: undefined,
      categoryId: "",
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
      form.reset();
    },
    onError: () => {
      toast({ title: "Xatolik yuz berdi", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ProductForm & { id: string }) => {
      const slug = generateSlug(data.name);
      return apiRequest("PATCH", `/api/products/${data.id}`, { ...data, slug });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Mahsulot yangilandi" });
      setDialogOpen(false);
      setEditingProduct(null);
      form.reset();
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

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    // Find parent category for this product's category
    const selectedCat = categories.find(c => c.id === product.categoryId);
    if (selectedCat?.parentId) {
      setSelectedParentCategoryId(selectedCat.parentId);
    } else {
      setSelectedParentCategoryId(null);
    }
    form.reset({
      name: product.name,
      description: product.description || "",
      price: product.price,
      oldPrice: product.oldPrice || undefined,
      categoryId: product.categoryId,
      brand: product.brand || "",
      images: product.images,
      colors: product.colors || [],
      sizes: product.sizes || [],
      containers: product.containers || [],
      stock: product.stock,
      isPopular: product.isPopular || false,
      isNew: product.isNew || false,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (data: ProductForm) => {
    if (editingProduct) {
      updateMutation.mutate({ ...data, id: editingProduct.id });
    } else {
      createMutation.mutate(data);
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

  const addColor = () => {
    if (colorInput.trim()) {
      const current = form.getValues("colors") || [];
      form.setValue("colors", [...current, colorInput.trim()]);
      setColorInput("");
    }
  };

  const removeColor = (index: number) => {
    const current = form.getValues("colors") || [];
    form.setValue("colors", current.filter((_, i) => i !== index));
  };

  const addSize = () => {
    if (sizeInput.trim()) {
      const current = form.getValues("sizes") || [];
      form.setValue("sizes", [...current, sizeInput.trim()]);
      setSizeInput("");
    }
  };

  const removeSize = (index: number) => {
    const current = form.getValues("sizes") || [];
    form.setValue("sizes", current.filter((_, i) => i !== index));
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Mahsulotlar">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <CardTitle className="text-lg">Mahsulotlar ro'yxati</CardTitle>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Qidirish..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-[200px]"
                data-testid="input-search-products"
              />
            </div>
            <Button
              onClick={() => {
                setEditingProduct(null);
                form.reset({ containers: [] });
                setDialogOpen(true);
              }}
              data-testid="button-add-product"
            >
              <Plus className="h-4 w-4 mr-2" />
              Qo'shish
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Mahsulotlar topilmadi</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mahsulot</TableHead>
                    <TableHead>Kategoriya</TableHead>
                    <TableHead>Narx</TableHead>
                    <TableHead>Stok</TableHead>
                    <TableHead>Holat</TableHead>
                    <TableHead className="text-right">Amallar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const category = categories.find((c) => c.id === product.categoryId);
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-md overflow-hidden bg-muted">
                              <img
                                src={product.images[0] || "/placeholder.svg"}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              {product.brand && (
                                <p className="text-xs text-muted-foreground">{product.brand}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{category?.name || "-"}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{formatPrice(product.price)}</p>
                            {product.oldPrice && (
                              <p className="text-xs text-muted-foreground line-through">
                                {formatPrice(product.oldPrice)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.stock > 0 ? "secondary" : "destructive"}>
                            {product.stock} dona
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {product.isNew && <Badge variant="outline">Yangi</Badge>}
                            {product.isPopular && <Badge variant="outline">Ommabop</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(product)}>
                                <Edit2 className="h-4 w-4 mr-2" />
                                Tahrirlash
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => deleteMutation.mutate(product.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                O'chirish
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Mahsulotni tahrirlash" : "Yangi mahsulot"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Nomi</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-product-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Kategoriya</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value);
                        const selected = categories.find(c => c.id === value);
                        if (selected?.parentId) {
                          setSelectedParentCategoryId(selected.parentId);
                        } else {
                          setSelectedParentCategoryId(null);
                        }
                      }} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Tanlang" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* Parent categories */}
                          {parentCategories.map((cat) => {
                            const subs = getSubcategories(cat.id);
                            return (
                              <div key={cat.id}>
                                <SelectItem value={cat.id}>
                                  {cat.name}
                                </SelectItem>
                                {subs.length > 0 && subs.map((sub) => (
                                  <SelectItem key={sub.id} value={sub.id} className="pl-8">
                                    └─ {sub.name}
                                  </SelectItem>
                                ))}
                              </div>
                            );
                          })}
                        </SelectContent>
                      </Select>
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
                      <FormLabel>Eski narx (ixtiyoriy)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          value={field.value || ""} 
                          data-testid="input-old-price" 
                        />
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
                      <FormLabel>Stok miqdori</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} data-testid="input-stock" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Tavsif</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field} data-testid="input-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Images */}
                <div className="col-span-2 space-y-2">
                  <FormLabel>Rasmlar (Kamida 1 ta)</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      data-testid="input-image-file"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(form.watch("images") || []).map((img, i) => (
                      <div key={i} className="relative group">
                        <img src={img} alt="" className="w-16 h-16 rounded-md object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {form.formState.errors.images && (
                    <p className="text-sm text-destructive">{form.formState.errors.images.message}</p>
                  )}
                </div>

                {/* Containers */}
                <div className="col-span-2 space-y-2">
                  <FormLabel>Idishlar/Turlar</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Masalan: 10 dona, 500ml, 1kg"
                      value={containerInput}
                      onChange={(e) => setContainerInput(e.target.value)}
                      data-testid="input-container"
                    />
                    <Button type="button" variant="secondary" size="sm" onClick={() => {
                      if (containerInput.trim()) {
                        const current = form.getValues("containers") || [];
                        form.setValue("containers", [...current, containerInput.trim()]);
                        setContainerInput("");
                      }
                    }}>
                      Qo'shish
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(form.watch("containers") || []).map((container, i) => (
                      <Badge key={i} variant="secondary" className="gap-2">
                        {container}
                        <button
                          type="button"
                          onClick={() => {
                            const current = form.getValues("containers") || [];
                            form.setValue("containers", current.filter((_, idx) => idx !== i));
                          }}
                          className="ml-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div className="space-y-2">
                  <FormLabel>Ranglar</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={colorInput || "#000000"}
                      onChange={(e) => setColorInput(e.target.value)}
                      className="w-12 h-9 p-1"
                    />
                    <Button type="button" variant="secondary" size="sm" onClick={addColor}>
                      Qo'shish
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(form.watch("colors") || []).map((color, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => removeColor(i)}
                        className="w-6 h-6 rounded-full border-2 border-border hover:opacity-70"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Sizes */}
                <div className="space-y-2">
                  <FormLabel>O'lchamlar</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      placeholder="XS, S, M..."
                      value={sizeInput}
                      onChange={(e) => setSizeInput(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="button" variant="secondary" size="sm" onClick={addSize}>
                      Qo'shish
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(form.watch("sizes") || []).map((size, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => removeSize(i)}
                      >
                        {size} <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="col-span-2 flex gap-4">
                  <FormField
                    control={form.control}
                    name="isNew"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="!mt-0">Yangi mahsulot</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isPopular"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="!mt-0">Ommabop</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Bekor qilish
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-product"
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
