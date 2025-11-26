import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import type { CartItemWithProduct } from "@shared/schema";

interface CartItemProps {
  item: CartItemWithProduct;
}

export function CartItemComponent({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const { product } = item;

  return (
    <div 
      className="flex gap-4 py-4 border-b last:border-0"
      data-testid={`cart-item-${item.id}`}
    >
      {/* Product Image */}
      <div className="w-20 h-20 md:w-24 md:h-24 rounded-md overflow-hidden bg-muted shrink-0">
        <img
          src={product.images[0] || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0 space-y-1">
        <h3 className="font-medium text-sm md:text-base line-clamp-2">
          {product.name}
        </h3>
        
        {/* Variants */}
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {item.selectedColor && (
            <div className="flex items-center gap-1">
              <span>Rang:</span>
              <div
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: item.selectedColor }}
              />
            </div>
          )}
          {item.selectedSize && (
            <span>O'lcham: {item.selectedSize}</span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-semibold text-primary">
            {formatPrice(product.price)}
          </span>
          {product.oldPrice && product.oldPrice > product.price && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              data-testid={`button-decrease-${item.id}`}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-10 text-center font-medium text-sm">
              {item.quantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              disabled={item.quantity >= product.stock}
              data-testid={`button-increase-${item.id}`}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => removeItem(item.id)}
            data-testid={`button-remove-${item.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Line Total */}
      <div className="hidden sm:block text-right shrink-0">
        <span className="font-semibold">
          {formatPrice(product.price * item.quantity)}
        </span>
      </div>
    </div>
  );
}
