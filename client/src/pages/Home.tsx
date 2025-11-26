import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Truck, Shield, Clock, Gift, ChevronRight, ChevronLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product, Category, Advertisement, SiteSettings } from "@shared/schema";

export default function Home() {
  const [adIndex, setAdIndex] = useState(0);

  // Save Telegram ID from URL to localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const telegramId = params.get("telegramId");
    if (telegramId) {
      localStorage.setItem("customerTelegramId", telegramId);
      console.log("✅ Telegram ID saved:", telegramId);
    }
  }, []);

  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: advertisements = [] } = useQuery<Advertisement[]>({
    queryKey: ["/api/advertisements"],
  });

  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
  });

  useEffect(() => {
    if (advertisements.length === 0) return;
    const timer = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % advertisements.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [advertisements.length]);

  const features = [
    {
      icon: Truck,
      title: "Tez yetkazib berish",
      description: "1-3 kun ichida barcha shaharlarga",
    },
    {
      icon: Shield,
      title: "Sifat kafolati",
      description: "Barcha mahsulotlar sertifikatlangan",
    },
    {
      icon: Clock,
      title: "24/7 qo'llab-quvvatlash",
      description: "Doimo aloqadamiz",
    },
    {
      icon: Gift,
      title: "Maxsus takliflar",
      description: "Muntazam chegirmalar va aksiyalar",
    },
  ];

  // Get main categories (no parentId) sorted by order
  const mainCategories = categories
    .filter(c => !c.parentId)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // Get products for a specific category (5 products)
  const getProductsByCategory = (categoryId: string) => {
    return allProducts
      .filter(p => p.categoryId === categoryId)
      .slice(0, 5);
  };

  const heroImage = settings?.heroImageUrl;
  const primaryColor = settings?.primaryColor || "#8B5CF6";

  return (
    <StoreLayout>
      {/* Hero Section */}
      <section 
        className="relative py-12 sm:py-16 md:py-24 overflow-hidden"
        style={{
          backgroundImage: heroImage ? `linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%), url('${heroImage}')` : undefined,
          backgroundSize: heroImage ? "cover" : undefined,
          backgroundPosition: heroImage ? "center" : undefined,
          backgroundColor: heroImage ? undefined : `rgb(139, 92, 246, 0.1)`,
        }}
      >
        {!heroImage && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/20" />
        )}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center space-y-4 sm:space-y-6">
            <Badge variant="secondary" className="inline-block mb-2 sm:mb-4">
              Yangi kolleksiya keldi
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-white drop-shadow-lg">
              Sifatli mahsulotlar{" "}
              <span style={{ color: primaryColor }}>eng yaxshi narxlarda</span>
            </h1>
            <p className="text-base sm:text-lg text-white/90 max-w-xl mx-auto drop-shadow">
              Turli xil toifadagi mahsulotlarimiz bilan tanishing. Bepul yetkazib berish va ishonchli xarid tajribasi.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2">
              <Link href="/products" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="w-full" 
                  data-testid="button-hero-shop"
                  style={{ backgroundColor: primaryColor }}
                >
                  Xarid qilish
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/categories" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full bg-white/20 border-white/40 text-white hover:bg-white/30" data-testid="button-hero-categories">
                  Kategoriyalar
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Elements - Hidden on mobile to reduce clutter */}
        {!heroImage && (
          <>
            <div className="hidden sm:block absolute top-0 left-0 w-72 h-72 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" style={{ backgroundColor: `rgba(139, 92, 246, 0.1)` }} />
            <div className="hidden sm:block absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" style={{ backgroundColor: `rgba(139, 92, 246, 0.05)` }} />
          </>
        )}
      </section>

      {/* Advertisements Carousel */}
      {advertisements.length > 0 && (
        <section className="py-4 sm:py-6 md:py-12">
          <div className="container mx-auto px-4">
            <div className="relative rounded-lg overflow-hidden bg-gradient-to-r from-primary/10 to-accent/10">
              <div className="relative h-36 sm:h-40 md:h-48 lg:h-64 xl:h-80">
                <img
                  src={advertisements[adIndex]?.imageUrl}
                  alt={advertisements[adIndex]?.businessName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-3 sm:p-4 md:p-6">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2 line-clamp-1">
                    {advertisements[adIndex]?.businessName}
                  </h3>
                  <p className="text-white/90 text-xs sm:text-sm md:text-base mb-2 sm:mb-3 line-clamp-1 sm:line-clamp-2">
                    {advertisements[adIndex]?.description}
                  </p>
                  {advertisements[adIndex]?.contactPhone && (
                    <p className="text-white text-xs sm:text-sm font-medium">
                      {advertisements[adIndex]?.contactPhone}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Navigation */}
              <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-2 sm:left-3 md:left-4 right-2 sm:right-3 md:right-4 flex items-center justify-between gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="bg-white/20 hover:bg-white/30 text-white h-8 w-8 sm:h-9 sm:w-9"
                  onClick={() => setAdIndex((prev) => (prev - 1 + advertisements.length) % advertisements.length)}
                  data-testid="button-prev-ad"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex gap-1 sm:gap-2 flex-wrap justify-center">
                  {advertisements.map((_, idx) => (
                    <button
                      key={idx}
                      className={`h-1.5 sm:h-2 rounded-full transition-all ${
                        idx === adIndex ? "bg-white w-4 sm:w-6" : "bg-white/50 w-1.5 sm:w-2"
                      }`}
                      onClick={() => setAdIndex(idx)}
                      data-testid={`button-ad-${idx}`}
                    />
                  ))}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="bg-white/20 hover:bg-white/30 text-white h-8 w-8 sm:h-9 sm:w-9"
                  onClick={() => setAdIndex((prev) => (prev + 1) % advertisements.length)}
                  data-testid="button-next-ad"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-8 sm:py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Kategoriyalar</h2>
              <Link href="/categories">
                <Button variant="ghost" size="sm" data-testid="link-view-all-categories">
                  Barchasi
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
              {[...categories].sort((a, b) => (a.order || 0) - (b.order || 0)).slice(0, 6).map((category) => (
                <Link key={category.id} href={`/products?category=${category.id}`}>
                  <Card className="hover-elevate cursor-pointer h-full" data-testid={`card-category-${category.id}`}>
                    <CardContent className="p-3 sm:p-4 md:p-6 text-center space-y-1 sm:space-y-2">
                      <div className="w-10 sm:w-12 h-10 sm:h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-lg sm:text-2xl">
                        {category.icon || "📦"}
                      </div>
                      <h3 className="font-medium text-xs sm:text-sm line-clamp-2">{category.name}</h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Moved after categories */}
      <section className="py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-4">
          <Card className="bg-primary text-primary-foreground overflow-hidden">
            <CardContent className="p-6 sm:p-8 md:p-12 text-center relative">
              <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
                  Bugun xarid qiling va 20% chegirma oling
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-primary-foreground/80">
                  Birinchi buyurtmangizda maxsus chegirma. Promokod: YANGI20
                </p>
                <Link href="/products" className="inline-block">
                  <Button size="lg" variant="secondary" data-testid="button-cta-shop">
                    Hozir xarid qiling
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              {/* Decorative circles - Hidden on mobile */}
              <div className="hidden sm:block absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="hidden sm:block absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main Categories with Products */}
      {mainCategories.map((mainCategory, idx) => {
        const categoryProducts = getProductsByCategory(mainCategory.id);
        const isAlternate = idx % 2 === 1;
        
        return (
          <section 
            key={mainCategory.id} 
            className={`py-8 sm:py-12 md:py-16 ${isAlternate ? 'bg-muted/30' : ''}`}
          >
            <div className="container mx-auto px-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-2">
                <div className="flex items-center gap-3">
                  <div className="text-2xl sm:text-3xl">
                    {mainCategory.icon || "📦"}
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">{mainCategory.name}</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                      {categoryProducts.length} mahsulot
                    </p>
                  </div>
                </div>
                <Link href={`/products?category=${mainCategory.id}`}>
                  <Button variant="ghost" size="sm" data-testid={`link-view-category-${mainCategory.id}`}>
                    Barchasi
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <ProductGrid products={categoryProducts} isLoading={false} />
            </div>
          </section>
        );
      })}

      {/* Features */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 bg-transparent shadow-none">
                <CardContent className="p-4 sm:p-6 text-center space-y-2 sm:space-y-3">
                  <div className="w-12 sm:w-14 h-12 sm:h-14 mx-auto rounded-xl bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-6 sm:h-7 w-6 sm:w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm sm:text-base">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </StoreLayout>
  );
}
