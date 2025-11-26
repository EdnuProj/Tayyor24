import { useState } from "react";
import { Filter, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import type { Category } from "@shared/schema";

export interface FilterState {
  search: string;
  categoryId: string | null;
  minPrice: number;
  maxPrice: number;
  brands: string[];
  isPopular: boolean;
  isNew: boolean;
  sortBy: "newest" | "price_asc" | "price_desc" | "popular";
}

interface ProductFiltersProps {
  categories: Category[];
  brands: string[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  maxPriceLimit?: number;
}

export function ProductFilters({
  categories,
  brands,
  filters,
  onFilterChange,
  maxPriceLimit = 10000000,
}: ProductFiltersProps) {
  const [priceRange, setPriceRange] = useState([filters.minPrice, filters.maxPrice || maxPriceLimit]);
  const [openSections, setOpenSections] = useState({
    category: true,
    price: true,
    brand: true,
    special: true,
  });

  const activeFilterCount = [
    filters.categoryId,
    filters.minPrice > 0,
    filters.maxPrice < maxPriceLimit,
    filters.brands.length > 0,
    filters.isPopular,
    filters.isNew,
  ].filter(Boolean).length;

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      search: "",
      categoryId: null,
      minPrice: 0,
      maxPrice: maxPriceLimit,
      brands: [],
      isPopular: false,
      isNew: false,
      sortBy: "newest",
    });
    setPriceRange([0, maxPriceLimit]);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Active Filter Count */}
      {activeFilterCount > 0 && (
        <div className="flex items-center justify-between">
          <Badge variant="secondary">
            {activeFilterCount} ta filtr
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground"
            data-testid="button-clear-filters"
          >
            <X className="h-4 w-4 mr-1" />
            Tozalash
          </Button>
        </div>
      )}

      {/* Category Filter */}
      <Collapsible open={openSections.category} onOpenChange={() => toggleSection("category")}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 font-medium hover-elevate rounded-md px-2">
          Kategoriya
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              openSections.category ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2">
          <div
            className={`flex items-center px-2 py-2 rounded-md cursor-pointer hover-elevate ${
              !filters.categoryId ? "bg-primary/10 text-primary" : ""
            }`}
            onClick={() => updateFilter("categoryId", null)}
            data-testid="filter-category-all"
          >
            <span className="text-sm">Barchasi</span>
          </div>
          {categories.map((category) => (
            <div
              key={category.id}
              className={`flex items-center px-2 py-2 rounded-md cursor-pointer hover-elevate ${
                filters.categoryId === category.id ? "bg-primary/10 text-primary" : ""
              }`}
              onClick={() => updateFilter("categoryId", category.id)}
              data-testid={`filter-category-${category.id}`}
            >
              <span className="text-sm">{category.name}</span>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Price Filter */}
      <Collapsible open={openSections.price} onOpenChange={() => toggleSection("price")}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 font-medium hover-elevate rounded-md px-2">
          Narx oralig'i
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              openSections.price ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 px-2 space-y-4">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            onValueCommit={(value) => {
              updateFilter("minPrice", value[0]);
              updateFilter("maxPrice", value[1]);
            }}
            min={0}
            max={maxPriceLimit}
            step={10000}
            className="w-full"
            data-testid="slider-price-range"
          />
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Min</Label>
              <Input
                type="number"
                value={priceRange[0]}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setPriceRange([value, priceRange[1]]);
                  updateFilter("minPrice", value);
                }}
                className="h-9 text-sm"
                data-testid="input-min-price"
              />
            </div>
            <span className="text-muted-foreground mt-5">—</span>
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Max</Label>
              <Input
                type="number"
                value={priceRange[1]}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setPriceRange([priceRange[0], value]);
                  updateFilter("maxPrice", value);
                }}
                className="h-9 text-sm"
                data-testid="input-max-price"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {formatPrice(priceRange[0])} — {formatPrice(priceRange[1])}
          </p>
        </CollapsibleContent>
      </Collapsible>

      {/* Brand Filter */}
      {brands.length > 0 && (
        <Collapsible open={openSections.brand} onOpenChange={() => toggleSection("brand")}>
          <CollapsibleTrigger className="flex w-full items-center justify-between py-2 font-medium hover-elevate rounded-md px-2">
            Brend
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                openSections.brand ? "rotate-180" : ""
              }`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 space-y-2">
            {brands.map((brand) => (
              <div key={brand} className="flex items-center gap-2 px-2">
                <Checkbox
                  id={`brand-${brand}`}
                  checked={filters.brands.includes(brand)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateFilter("brands", [...filters.brands, brand]);
                    } else {
                      updateFilter("brands", filters.brands.filter((b) => b !== brand));
                    }
                  }}
                  data-testid={`checkbox-brand-${brand}`}
                />
                <Label htmlFor={`brand-${brand}`} className="text-sm cursor-pointer">
                  {brand}
                </Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Special Filters */}
      <Collapsible open={openSections.special} onOpenChange={() => toggleSection("special")}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 font-medium hover-elevate rounded-md px-2">
          Maxsus
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              openSections.special ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2">
          <div className="flex items-center gap-2 px-2">
            <Checkbox
              id="popular"
              checked={filters.isPopular}
              onCheckedChange={(checked) => updateFilter("isPopular", !!checked)}
              data-testid="checkbox-popular"
            />
            <Label htmlFor="popular" className="text-sm cursor-pointer">
              Ommabop mahsulotlar
            </Label>
          </div>
          <div className="flex items-center gap-2 px-2">
            <Checkbox
              id="new"
              checked={filters.isNew}
              onCheckedChange={(checked) => updateFilter("isNew", !!checked)}
              data-testid="checkbox-new"
            />
            <Label htmlFor="new" className="text-sm cursor-pointer">
              Yangi mahsulotlar
            </Label>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );

  return (
    <>
      {/* Desktop Filters */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-20 space-y-4">
          <h2 className="font-semibold text-lg">Filtrlar</h2>
          <FilterContent />
        </div>
      </aside>

      {/* Mobile Filters */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="lg:hidden"
            data-testid="button-mobile-filters"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtrlar
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>Filtrlar</SheetTitle>
          </SheetHeader>
          <div className="mt-6 overflow-y-auto max-h-[calc(100vh-120px)] custom-scrollbar">
            <FilterContent />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
