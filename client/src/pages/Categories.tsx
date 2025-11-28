import { Link, useNavigate } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Category } from "@shared/schema";

export default function Categories() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    setDialogOpen(true);
  };

  const handleConfirm = () => {
    if (selectedCategory) {
      setDialogOpen(false);
      window.scrollTo(0, 0);
      navigate(`/products?category=${selectedCategory.id}`);
    }
  };

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">Bosh sahifa</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Kategoriyalar</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Kategoriyalar</h1>
          <p className="text-muted-foreground">
            Barcha kategoriyalarimizni ko'rib chiqing
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-lg" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Hozircha kategoriyalar mavjud emas</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...categories].sort((a, b) => (a.order || 0) - (b.order || 0)).map((category) => (
                <div
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  data-testid={`card-category-${category.id}`}
                >
                  <Card 
                    className="hover-elevate cursor-pointer h-full group"
                  >
                    <CardContent className="p-8 text-center space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                        {category.icon || "📦"}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{category.name}</h3>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* Confirmation Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <span className="text-2xl">{selectedCategory?.icon || "📦"}</span>
                    {selectedCategory?.name} mahsulotlari
                  </DialogTitle>
                  <DialogDescription>
                    Ushbu kategoriyada mavjud bo'lgan barcha mahsulotlarni ko'rasizmi?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    data-testid="button-cancel-category"
                  >
                    Bekor qilish
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    data-testid="button-confirm-category"
                  >
                    Mahsulotlarni ko'rish
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </StoreLayout>
  );
}
