import { Link } from "wouter";
import { ShoppingCart, Heart, Star, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const discount = product.oldPrice ? calculateDiscount(product.price, product.oldPrice) : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart(product, 1);
      toast({
        title: "Savatchaga qo'shildi",
        description: product.name,
      });
    } catch (error) {
      toast({
        title: "Xatolik",
        description: "Mahsulotni qo'shishda xatolik yuz berdi",
        variant: "destructive",
      });
    }
  };

  return (
    <Link href={`/products/${product.slug}`}>
      <Card 
        className="group overflow-visible hover-elevate cursor-pointer h-full"
        data-testid={`card-product-${product.id}`}
      >
        <div className="relative aspect-square overflow-hidden rounded-t-lg bg-muted">
          {/* Product Image */}
          <img
            src={product.images[0] || "/placeholder.svg"}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount > 0 && (
              <Badge variant="destructive" className="text-xs">
                -{discount}%
              </Badge>
            )}
            {product.isNew && (
              <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                Yangi
              </Badge>
            )}
            {product.isPopular && (
              <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-xs">
                <Star className="h-3 w-3 mr-1" />
                Ommabop
              </Badge>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full shadow-md"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              data-testid={`button-wishlist-${product.id}`}
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>

          {/* Add to Cart Button */}
          <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              onClick={handleAddToCart}
              className="w-full shadow-lg"
              size="sm"
              data-testid={`button-add-to-cart-${product.id}`}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Savatchaga
            </Button>
          </div>

          {/* Out of Stock Overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Badge variant="secondary" className="text-sm">
                Sotuvda yo'q
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4 space-y-2">
          {/* Product Name */}
          <h3 className="font-medium line-clamp-2 text-sm leading-tight min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating && product.rating > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3 w-3 ${
                      star <= Math.round(product.rating || 0)
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                ({product.reviewCount || 0})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-lg font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>

          {/* Colors Preview */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {product.colors.slice(0, 4).map((color, index) => (
                <div
                  key={index}
                  className="h-4 w-4 rounded-full border border-border"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-xs text-muted-foreground">
                  +{product.colors.length - 4}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
