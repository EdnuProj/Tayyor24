import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Category } from "@shared/schema";

export default function Categories() {
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link key={category.id} href={`/products?category=${category.id}`}>
                <Card 
                  className="hover-elevate cursor-pointer h-full group"
                  data-testid={`card-category-${category.id}`}
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
              </Link>
            ))}
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
