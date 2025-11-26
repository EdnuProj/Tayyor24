import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Edit2, Trash2, MoreHorizontal, Image as ImageIcon, Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Advertisement } from "@shared/schema";

const bannerSchema = z.object({
  businessName: z.string().min(2, "Kompaniya nomi kerak"),
  description: z.string().min(5, "Tavsif kerak"),
  imageUrl: z.string().url("To'g'ri rasm URL kerak"),
  contactPhone: z.string().optional(),
  isActive: z.boolean().default(true),
});

type BannerForm = z.infer<typeof bannerSchema>;

export default function AdminBanners() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Advertisement | null>(null);
  const [imageInput, setImageInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: banners = [], isLoading } = useQuery<Advertisement[]>({
    queryKey: ["/api/advertisements"],
  });

  const form = useForm<BannerForm>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      businessName: "",
      description: "",
      imageUrl: "",
      contactPhone: "",
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: BannerForm) => {
      return apiRequest("POST", "/api/admin/advertisements", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/advertisements"] });
      toast({ title: "Banner qo'shildi" });
      setDialogOpen(false);
      form.reset();
      if (fileInputRef.current) fileInputRef.current.value = "";
      setImageInput("");
    },
    onError: () => {
      toast({ title: "Xatolik yuz berdi", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: BannerForm & { id: string }) => {
      return apiRequest("PATCH", `/api/admin/advertisements/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/advertisements"] });
      toast({ title: "Banner yangilandi" });
      setDialogOpen(false);
      setEditingBanner(null);
      form.reset();
      if (fileInputRef.current) fileInputRef.current.value = "";
      setImageInput("");
    },
    onError: () => {
      toast({ title: "Xatolik yuz berdi", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/advertisements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/advertisements"] });
      toast({ title: "Banner o'chirildi" });
    },
    onError: () => {
      toast({ title: "Xatolik yuz berdi", variant: "destructive" });
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setImageInput(base64);
        form.setValue("imageUrl", base64);
        e.target.value = "";
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (data: BannerForm) => {
    if (editingBanner) {
      updateMutation.mutate({ ...data, id: editingBanner.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredBanners = banners.filter((b) =>
    b.businessName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Reklamalar/Bannerlar">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <CardTitle className="text-lg">Bannerlar ro'yxati</CardTitle>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Qidirish..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-[200px]"
                data-testid="input-search-banners"
              />
            </div>
            <Button
              onClick={() => {
                setEditingBanner(null);
                form.reset();
                setImageInput("");
                setDialogOpen(true);
              }}
              data-testid="button-add-banner"
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
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filteredBanners.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Bannerlar topilmadi</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rasm</TableHead>
                    <TableHead>Kompaniya nomi</TableHead>
                    <TableHead>Tavsif</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Holat</TableHead>
                    <TableHead className="text-right">Amallar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBanners.map((banner) => (
                    <TableRow key={banner.id}>
                      <TableCell>
                        <div className="w-16 h-16 rounded-md overflow-hidden bg-muted">
                          <img
                            src={banner.imageUrl}
                            alt={banner.businessName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{banner.businessName}</TableCell>
                      <TableCell className="max-w-xs truncate text-sm">{banner.description}</TableCell>
                      <TableCell className="text-sm">{banner.contactPhone || "-"}</TableCell>
                      <TableCell>
                        {banner.isActive ? (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Faol</span>
                        ) : (
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">O'chiq</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingBanner(banner);
                                form.reset(banner);
                                setImageInput(banner.imageUrl);
                                setDialogOpen(true);
                              }}
                            >
                              <Edit2 className="h-4 w-4 mr-2" />
                              Tahrirlash
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteMutation.mutate(banner.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              O'chirish
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Banner Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBanner ? "Bannerni tahrirlash" : "Yangi banner"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kompaniya nomi</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-business-name" />
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
                      <Textarea rows={3} {...field} data-testid="input-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon (ixtiyoriy)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="+998..." data-testid="input-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Rasm</FormLabel>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  data-testid="input-image-file"
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                />
                {imageInput && (
                  <div className="w-32 h-32 rounded-md overflow-hidden bg-muted">
                    <img src={imageInput} alt="preview" className="w-full h-full object-cover" />
                  </div>
                )}
                {form.formState.errors.imageUrl && (
                  <p className="text-sm text-destructive">{form.formState.errors.imageUrl.message}</p>
                )}
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Faol</FormLabel>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Bekor qilish
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-banner"
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
