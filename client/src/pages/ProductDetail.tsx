import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Zap,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Minus,
  Plus,
  Heart,
  Share2,
  Check,
} from "lucide-react";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import type { Product, Review } from "@shared/schema";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", slug],
  });

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ["/api/reviews", product?.id],
    enabled: !!product?.id,
  });

  const { data: relatedProducts = [] } = useQuery<Product[]>({
    queryKey: [`/api/products?categoryId=${product?.categoryId}&limit=4`],
    enabled: !!product?.categoryId,
  });

  const handleAddToCart = async () => {
    if (!product) return;
    
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast({
        title: "Rang tanlang",
        description: "Iltimos, rangni tanlang",
        variant: "destructive",
      });
      return;
    }
    
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast({
        title: "O'lcham tanlang",
        description: "Iltimos, o'lchamni tanlang",
        variant: "destructive",
      });
      return;
    }

    try {
      await addToCart(product, quantity, selectedColor || undefined, selectedSize || undefined);
      toast({
        title: "Savatchaga qo'shildi",
        description: `${product.name} (${quantity} dona)`,
      });
    } catch (error) {
      toast({
        title: "Xatolik",
        description: "Mahsulotni qo'shishda xatolik yuz berdi",
        variant: "destructive",
      });
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    window.location.href = "/checkout";
  };

  if (isLoading) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (!product) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Mahsulot topilmadi</h1>
          <Link href="/products">
            <Button>Mahsulotlarga qaytish</Button>
          </Link>
        </div>
      </StoreLayout>
    );
  }

  const discount = product.oldPrice ? calculateDiscount(product.price, product.oldPrice) : 0;
  const images = product.images.length > 0 ? product.images : ["/placeholder.svg"];

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">Bosh sahifa</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/products" className="hover:text-foreground">Mahsulotlar</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full shadow-lg"
                    onClick={() => setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                    data-testid="button-prev-image"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full shadow-lg"
                    onClick={() => setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                    data-testid="button-next-image"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {discount > 0 && (
                  <Badge variant="destructive">-{discount}%</Badge>
                )}
                {product.isNew && (
                  <Badge className="bg-green-500 text-white">Yangi</Badge>
                )}
              </div>
            </div>
            
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? "border-primary" : "border-transparent"
                    }`}
                    data-testid={`button-thumbnail-${index}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>
              
              {/* Rating */}
              {product.rating && product.rating > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(product.rating || 0)
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-muted-foreground">
                    ({product.reviewCount || 0} sharh)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                {product.oldPrice && product.oldPrice > product.price && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.oldPrice)}
                  </span>
                )}
                {discount > 0 && (
                  <Badge variant="destructive">{discount}% chegirma</Badge>
                )}
              </div>
            </div>

            <Separator />

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium">
                  Rang: <span className="text-muted-foreground">{selectedColor || "Tanlang"}</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selectedColor === color
                          ? "border-primary ring-2 ring-primary ring-offset-2"
                          : "border-border"
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                      data-testid={`button-color-${color}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium">
                  O'lcham: <span className="text-muted-foreground">{selectedSize || "Tanlang"}</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSize(size)}
                      data-testid={`button-size-${size}`}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-3">
              <h3 className="font-medium">Miqdor</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    data-testid="button-quantity-decrease"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    data-testid="button-quantity-increase"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.stock > 0 ? `${product.stock} dona mavjud` : "Sotuvda yo'q"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                data-testid="button-add-to-cart"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Savatchaga qo'shish
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="flex-1"
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                data-testid="button-buy-now"
              >
                <Zap className="h-5 w-5 mr-2" />
                Bir bosishda xarid
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-4">
              <Button variant="ghost" size="sm" data-testid="button-wishlist">
                <Heart className="h-4 w-4 mr-2" />
                Sevimlilar
              </Button>
              <Button variant="ghost" size="sm" data-testid="button-share">
                <Share2 className="h-4 w-4 mr-2" />
                Ulashish
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Truck className="h-5 w-5 text-primary" />
                <div className="text-sm">
                  <p className="font-medium">Tez yetkazish</p>
                  <p className="text-muted-foreground">1-3 kun</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Shield className="h-5 w-5 text-primary" />
                <div className="text-sm">
                  <p className="font-medium">Kafolat</p>
                  <p className="text-muted-foreground">12 oy</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <RotateCcw className="h-5 w-5 text-primary" />
                <div className="text-sm">
                  <p className="font-medium">Qaytarish</p>
                  <p className="text-muted-foreground">14 kun</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: Description, Reviews */}
        <Tabs defaultValue="description" className="mt-12">
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0">
            <TabsTrigger
              value="description"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Tavsif
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Sharhlar ({reviews.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="py-6">
            <div className="prose dark:prose-invert max-w-none">
              {product.description ? (
                <p>{product.description}</p>
              ) : (
                <p className="text-muted-foreground">Tavsif mavjud emas</p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="py-6">
            {reviews.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Hozircha sharhlar yo'q</p>
                <Button variant="outline">Birinchi sharh qoldiring</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-medium">{review.customerName}</span>
                      </div>
                      {review.comment && <p className="text-sm">{review.comment}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-6">O'xshash mahsulotlar</h2>
            <ProductGrid 
              products={relatedProducts.filter((p) => p.id !== product.id).slice(0, 4)} 
            />
          </section>
        )}
      </div>
    </StoreLayout>
  );
}
