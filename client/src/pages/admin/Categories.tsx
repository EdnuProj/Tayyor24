import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, GripVertical, Loader2 } from "lucide-react";
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

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const form = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      icon: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CategoryForm) => {
      const response = await apiRequest("/api/categories", "POST", {
        name: data.name,
        slug: generateSlug(data.name),
        icon: data.icon || "📦",
        order: categories.length,
      });
      return response;
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
      await apiRequest(`/api/categories/${categoryId}`, "DELETE");
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
      await apiRequest("/api/categories/reorder", "POST", {
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

    // Sort by current order first
    const sorted = [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));
    
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
  const sortedCategories = [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <AdminLayout title="Kategoriyalar">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Kategoriyalar ({categories.length})</h2>
        <Button
          onClick={() => {
            setEditingCategory(null);
            form.reset();
            setDialogOpen(true);
          }}
          data-testid="button-add-category"
        >
          <Plus className="h-4 w-4 mr-2" />
          Yangi kategoriya
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
              {sortedCategories.map((category) => (
                <div
                  key={category.id}
                  draggable
                  onDragStart={() => handleDragStart(category.id)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(category.id)}
                  className={`flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-move ${
                    draggedItem === category.id ? "bg-muted opacity-50" : ""
                  }`}
                  data-testid={`category-item-${category.id}`}
                >
                  <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="text-2xl flex-shrink-0">{category.icon || "📦"}</div>
                  <div className="flex-1">
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-muted-foreground">{category.slug}</p>
                  </div>
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
