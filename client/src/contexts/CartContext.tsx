import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { getSessionId } from "@/lib/utils";
import type { CartItemWithProduct, Product } from "@shared/schema";

interface CartContextType {
  items: CartItemWithProduct[];
  isLoading: boolean;
  itemCount: number;
  subtotal: number;
  addToCart: (product: Product, quantity?: number, color?: string, size?: string, container?: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    setSessionId(getSessionId());
  }, []);

  const { data: items = [], isLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: [`/api/cart?sessionId=${sessionId}`],
    enabled: !!sessionId,
  });

  const addMutation = useMutation({
    mutationFn: async (data: { 
      productId: string; 
      quantity: number; 
      selectedColor?: string; 
      selectedSize?: string; 
      selectedContainer?: string;
    }) => {
      return apiRequest("POST", "/api/cart", { ...data, sessionId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/cart?sessionId=${sessionId}`] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      return apiRequest("PATCH", `/api/cart/${itemId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/cart?sessionId=${sessionId}`] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (itemId: string) => {
      return apiRequest("DELETE", `/api/cart/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/cart?sessionId=${sessionId}`] });
    },
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/cart/session/${sessionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/cart?sessionId=${sessionId}`] });
    },
  });

  const addToCart = useCallback(async (
    product: Product, 
    quantity = 1, 
    color?: string, 
    size?: string,
    container?: string
  ) => {
    await addMutation.mutateAsync({
      productId: product.id,
      quantity,
      selectedColor: color,
      selectedSize: size,
      selectedContainer: container,
    });
  }, [addMutation]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeMutation.mutateAsync(itemId);
    } else {
      await updateMutation.mutateAsync({ itemId, quantity });
    }
  }, [updateMutation, removeMutation]);

  const removeItem = useCallback(async (itemId: string) => {
    await removeMutation.mutateAsync(itemId);
  }, [removeMutation]);

  const clearCart = useCallback(async () => {
    await clearMutation.mutateAsync();
  }, [clearMutation]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => {
    let containerPrice = 0;
    if (item.selectedContainer) {
      const [, priceStr] = item.selectedContainer.split("|");
      containerPrice = priceStr ? parseInt(priceStr) : 0;
    }
    const itemPrice = item.product.price + containerPrice;
    return sum + itemPrice * item.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{
      items,
      isLoading,
      itemCount,
      subtotal,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
