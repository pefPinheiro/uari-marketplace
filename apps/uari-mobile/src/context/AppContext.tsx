import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  product: any;
  quantity: number;
}

interface AppContextType {
  cart: { [id: string]: CartItem };
  cartCount: number;
  addToCart: (product: any) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  
  activeProduct: any | null;
  setActiveProduct: (product: any | null) => void;
  
  activeStore: any | null;
  setActiveStore: (store: any | null) => void;
  
  activeOrder: any | null;
  setActiveOrder: (order: any | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<{ [id: string]: CartItem }>({});
  const [cartCount, setCartCount] = useState(0);
  const [activeProduct, setActiveProduct] = useState<any | null>(null);
  const [activeStore, setActiveStore] = useState<any | null>(null);
  const [activeOrder, setActiveOrder] = useState<any | null>(null);

  const addToCart = (product: any) => {
    setCart((prev) => {
      const updated = { ...prev };
      if (updated[product.id]) {
        updated[product.id].quantity += 1;
      } else {
        updated[product.id] = { product, quantity: 1 };
      }
      return updated;
    });
    setCartCount((c) => c + 1);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const updated = { ...prev };
      if (updated[productId]) {
        const qty = updated[productId].quantity;
        delete updated[productId];
        setCartCount((c) => Math.max(0, c - qty));
      }
      return updated;
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      const updated = { ...prev };
      if (updated[productId]) {
        const newQty = updated[productId].quantity + delta;
        if (newQty <= 0) {
          delete updated[productId];
        } else {
          updated[productId].quantity = newQty;
        }
        setCartCount((c) => Math.max(0, c + delta));
      }
      return updated;
    });
  };

  const clearCart = () => {
    setCart({});
    setCartCount(0);
  };

  return (
    <AppContext.Provider
      value={{
        cart,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        activeProduct,
        setActiveProduct,
        activeStore,
        setActiveStore,
        activeOrder,
        setActiveOrder
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return context;
}
