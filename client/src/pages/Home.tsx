import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Truck, Shield, Clock, Gift, ChevronRight, ChevronLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product, Category, Advertisement } from "@shared/schema";

export default function Home() {
  const [adIndex, setAdIndex] = useState(0);

  const { data: featuredProducts = [], isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products?popular=true&limit=8"],
  });

  const { data: newProducts = [], isLoading: loadingNew } = useQuery<Product[]>({
    queryKey: ["/api/products?new=true&limit=4"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: advertisements = [] } = useQuery<Advertisement[]>({
    queryKey: ["/api/advertisements"],
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

  return (
    <StoreLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/20 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="mb-4">
              Yangi kolleksiya keldi
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Sifatli mahsulotlar{" "}
              <span className="text-primary">eng yaxshi narxlarda</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Turli xil toifadagi mahsulotlarimiz bilan tanishing. 
              Bepul yetkazib berish va ishonchli xarid tajribasi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button size="lg" className="w-full sm:w-auto" data-testid="button-hero-shop">
                  Xarid qilish
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/categories">
                <Button size="lg" variant="outline" className="w-full sm:w-auto" data-testid="button-hero-categories">
                  Kategoriyalar
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      </section>

      {/* Advertisements Carousel */}
      {advertisements.length > 0 && (
        <section className="py-6 md:py-12">
          <div className="container mx-auto px-4">
            <div className="relative rounded-lg overflow-hidden bg-gradient-to-r from-primary/10 to-accent/10">
              <div className="relative h-40 sm:h-48 md:h-64 lg:h-80">
                <img
                  src={advertisements[adIndex]?.imageUrl}
                  alt={advertisements[adIndex]?.businessName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-6">
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                    {advertisements[adIndex]?.businessName}
                  </h3>
                  <p className="text-white/90 text-sm md:text-base mb-4 line-clamp-2">
                    {advertisements[adIndex]?.description}
                  </p>
                  {advertisements[adIndex]?.contactPhone && (
                    <p className="text-white text-sm font-medium">
                      ☎️ {advertisements[adIndex]?.contactPhone}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Navigation */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <Button
                  size="icon"
                  variant="ghost"
                  className="bg-white/20 hover:bg-white/30 text-white"
                  onClick={() => setAdIndex((prev) => (prev - 1 + advertisements.length) % advertisements.length)}
                  data-testid="button-prev-ad"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="flex gap-2">
                  {advertisements.map((_, idx) => (
                    <button
                      key={idx}
                      className={`h-2 rounded-full transition-all ${
                        idx === adIndex ? "bg-white w-6" : "bg-white/50 w-2"
                      }`}
                      onClick={() => setAdIndex(idx)}
                      data-testid={`button-ad-${idx}`}
                    />
                  ))}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="bg-white/20 hover:bg-white/30 text-white"
                  onClick={() => setAdIndex((prev) => (prev + 1) % advertisements.length)}
                  data-testid="button-next-ad"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold">Kategoriyalar</h2>
              <Link href="/categories">
                <Button variant="ghost" data-testid="link-view-all-categories">
                  Barchasi
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((category) => (
                <Link key={category.id} href={`/products?category=${category.id}`}>
                  <Card className="hover-elevate cursor-pointer h-full" data-testid={`card-category-${category.id}`}>
                    <CardContent className="p-6 text-center space-y-2">
                      <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                        {category.icon || "📦"}
                      </div>
                      <h3 className="font-medium text-sm">{category.name}</h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Ommabop mahsulotlar</h2>
              <p className="text-muted-foreground mt-1">Eng ko'p sotilgan mahsulotlarimiz</p>
            </div>
            <Link href="/products?filter=popular">
              <Button variant="ghost" data-testid="link-view-all-popular">
                Barchasi
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <ProductGrid products={featuredProducts} isLoading={loadingProducts} />
        </div>
      </section>

      {/* Features */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 bg-transparent shadow-none">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-xl bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      {newProducts.length > 0 && (
        <section className="py-12 md:py-16 bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <Badge className="mb-2">Yangi</Badge>
                <h2 className="text-2xl md:text-3xl font-bold">Yangi mahsulotlar</h2>
              </div>
              <Link href="/products?filter=new">
                <Button variant="ghost" data-testid="link-view-all-new">
                  Barchasi
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <ProductGrid products={newProducts} isLoading={loadingNew} />
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <Card className="bg-primary text-primary-foreground overflow-hidden">
            <CardContent className="p-8 md:p-12 text-center relative">
              <div className="max-w-2xl mx-auto space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Bugun xarid qiling va 20% chegirma oling
                </h2>
                <p className="text-primary-foreground/80 text-lg">
                  Birinchi buyurtmangizda maxsus chegirma. Promokod: YANGI20
                </p>
                <Link href="/products">
                  <Button size="lg" variant="secondary" data-testid="button-cta-shop">
                    Hozir xarid qiling
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
            </CardContent>
          </Card>
        </div>
      </section>
    </StoreLayout>
  );
}
