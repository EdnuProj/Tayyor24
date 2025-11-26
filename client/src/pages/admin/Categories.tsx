import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, GripVertical, Loader2, ChevronLeft, ArrowRight } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { generateSlug } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Category } from "@shared/schema";

const categorySchema = z.object({
  name: z.string().min(2, "Kamida 2 ta belgi"),
  icon: z.string().optional(),
});

type CategoryForm = z.infer<typeof categorySchema>;

export default function AdminCategories() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const parentCategories = categories.filter(c => !c.parentId);
  const subcategories = selectedParentId ? categories.filter(c => c.parentId === selectedParentId) : [];

  const form = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      icon: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CategoryForm) => {
      const response = await apiRequest("POST", "/api/categories", {
        name: data.name,
        slug: generateSlug(data.name),
        icon: data.icon || "📦",
        order: selectedParentId ? subcategories.length : parentCategories.length,
        parentId: selectedParentId || null,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Kategoriya qo'shildi", variant: "default" });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      form.reset();
      setDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Xato yuz berdi", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      await apiRequest("DELETE", `/api/categories/${categoryId}`);
    },
    onSuccess: () => {
      toast({ title: "Kategoriya o'chirildi", variant: "default" });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    },
    onError: () => {
      toast({ title: "Xato yuz berdi", variant: "destructive" });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (reorderedCategories: Category[]) => {
      await apiRequest("POST", "/api/categories/reorder", {
        categories: reorderedCategories.map((c, idx) => ({
          id: c.id,
          order: idx,
        })),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    },
  });

  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: string) => {
    if (!draggedItem || draggedItem === targetId) return;

    // Sort by current order first (only display categories)
    const sorted = [...displayCategories].sort((a, b) => (a.order || 0) - (b.order || 0));
    
    const draggedIdx = sorted.findIndex((c) => c.id === draggedItem);
    const targetIdx = sorted.findIndex((c) => c.id === targetId);

    if (draggedIdx === -1 || targetIdx === -1) return;

    // Remove dragged item from its current position
    const newOrder = sorted.filter((_, idx) => idx !== draggedIdx);
    
    // Insert dragged item at target position
    const insertIdx = draggedIdx < targetIdx ? targetIdx - 1 : targetIdx;
    newOrder.splice(insertIdx, 0, sorted[draggedIdx]);

    reorderMutation.mutate(newOrder);
    setDraggedItem(null);
  };

  // Sort categories by order
  const sortedParentCategories = [...parentCategories].sort((a, b) => (a.order || 0) - (b.order || 0));
  const sortedSubcategories = [...subcategories].sort((a, b) => (a.order || 0) - (b.order || 0));
  const displayCategories = selectedParentId ? sortedSubcategories : sortedParentCategories;
  const currentParent = selectedParentId ? categories.find(c => c.id === selectedParentId) : null;

  return (
    <AdminLayout title="Kategoriyalar">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {selectedParentId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedParentId(null)}
              data-testid="button-back-categories"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Orqasi
            </Button>
          )}
          <h2 className="text-lg font-semibold">
            {selectedParentId ? `${currentParent?.name} - Kichik kategoriyalar` : `Kategoriyalar (${parentCategories.length})`}
          </h2>
        </div>
        <Button
          onClick={() => {
            setEditingCategory(null);
            form.reset();
            setDialogOpen(true);
          }}
          data-testid="button-add-category"
        >
          <Plus className="h-4 w-4 mr-2" />
          {selectedParentId ? "Kichik kategoriya qo'shish" : "Yangi kategoriya"}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-4 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded-md animate-pulse" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Kategoriyalar mavjud emas</p>
            </div>
          ) : (
            <div className="divide-y">
              {displayCategories.map((category) => (
                <div
                  key={category.id}
                  draggable={!selectedParentId}
                  onDragStart={() => !selectedParentId && handleDragStart(category.id)}
                  onDragOver={handleDragOver}
                  onDrop={() => !selectedParentId && handleDrop(category.id)}
                  className={`flex items-center gap-4 p-4 transition-colors ${!selectedParentId ? 'cursor-move' : ''} group ${
                    draggedItem === category.id ? "bg-muted opacity-50" : ""
                  }`}
                  data-testid={`category-item-${category.id}`}
                >
                  {!selectedParentId && (
                    <div className="relative">
                      <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      {/* Scroll to Top Button - Shows only on grip handle hover */}
                      <div className="absolute right-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center">
                        <button
                          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                          className="p-1.5 hover-elevate active-elevate-2 rounded-md"
                          title="Tepaga ko'tar"
                          data-testid={`button-scroll-top-category-${category.id}`}
                        >
                          <ChevronLeft className="h-4 w-4 rotate-90" />
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="text-2xl flex-shrink-0">{category.icon || "📦"}</div>
                  <div className="flex-1">
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-muted-foreground">{category.slug}</p>
                  </div>
                  {!selectedParentId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedParentId(category.id)}
                      data-testid={`button-view-subcategories-${category.id}`}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate(category.id)}
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-category-${category.id}`}
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-destructive" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Kategoriyani tahrirlash" : "Yangi kategoriya"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategoriya nomi</FormLabel>
                    <FormControl>
                      <Input placeholder="masalan: Elektronika" {...field} data-testid="input-category-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emoji yoki belgi</FormLabel>
                    <FormControl>
                      <Input placeholder="masalan: 📱" {...field} data-testid="input-category-icon" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Bekor qilish
                </Button>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-save-category">
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
