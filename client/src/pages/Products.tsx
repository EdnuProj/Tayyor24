import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal } from "lucide-react";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductFilters, type FilterState } from "@/components/products/ProductFilters";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Product, Category } from "@shared/schema";

const defaultFilters: FilterState = {
  search: "",
  categoryId: null,
  minPrice: 0,
  maxPrice: 10000000,
  brands: [],
  isPopular: false,
  isNew: false,
  sortBy: "newest",
};

export default function Products() {
  const [location] = useLocation();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [searchInput, setSearchInput] = useState("");

  // Parse URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    const category = params.get("category");
    const filter = params.get("filter");
    
    if (category) {
      setFilters((prev) => ({ ...prev, categoryId: category }));
    }
    if (filter === "popular") {
      setFilters((prev) => ({ ...prev, isPopular: true }));
    }
    if (filter === "new") {
      setFilters((prev) => ({ ...prev, isNew: true }));
    }
  }, [location]);

  const { data: products = [], isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Extract unique brands from products
  const brands = useMemo(() => {
    const brandSet = new Set<string>();
    products.forEach((p) => {
      if (p.brand) brandSet.add(p.brand);
    });
    return Array.from(brandSet).sort();
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower) ||
          p.brand?.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (filters.categoryId) {
      result = result.filter((p) => p.categoryId === filters.categoryId);
    }

    // Price filter
    result = result.filter(
      (p) => p.price >= filters.minPrice && p.price <= filters.maxPrice
    );

    // Brand filter
    if (filters.brands.length > 0) {
      result = result.filter((p) => p.brand && filters.brands.includes(p.brand));
    }

    // Special filters
    if (filters.isPopular) {
      result = result.filter((p) => p.isPopular);
    }
    if (filters.isNew) {
      result = result.filter((p) => p.isNew);
    }

    // Sort
    switch (filters.sortBy) {
      case "price_asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "popular":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "newest":
      default:
        result.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
    }

    return result;
  }, [products, filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchInput }));
  };

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mahsulotlar</h1>
          <p className="text-muted-foreground">
            {filteredProducts.length} ta mahsulot topildi
          </p>
        </div>

        {/* Search and Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center">
          <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto sm:flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Mahsulot qidirish..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
                data-testid="input-product-search"
              />
            </div>
            <Button type="submit" data-testid="button-search">
              Qidirish
            </Button>
          </form>

          <div className="flex gap-2 w-full sm:w-auto">
            <ProductFilters
              categories={categories}
              brands={brands}
              filters={filters}
              onFilterChange={setFilters}
            />

            <Select
              value={filters.sortBy}
              onValueChange={(value: FilterState["sortBy"]) =>
                setFilters((prev) => ({ ...prev, sortBy: value }))
              }
            >
              <SelectTrigger className="w-[180px]" data-testid="select-sort">
                <SelectValue placeholder="Saralash" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Eng yangi</SelectItem>
                <SelectItem value="price_asc">Arzon → Qimmat</SelectItem>
                <SelectItem value="price_desc">Qimmat → Arzon</SelectItem>
                <SelectItem value="popular">Ommabop</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters Sidebar - Hidden on mobile */}
          <div className="hidden lg:block">
            <ProductFilters
              categories={categories}
              brands={brands}
              filters={filters}
              onFilterChange={setFilters}
            />
          </div>

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            <ProductGrid products={filteredProducts} isLoading={loadingProducts} />
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
