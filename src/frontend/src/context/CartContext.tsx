import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

interface CartContextType {
  cartCount: number;
  setCartCount: (count: number) => void;
  incrementCart: (amount?: number) => void;
  decrementCart: (amount?: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartCount, setCartCount] = useState(0);

  const incrementCart = useCallback((amount = 1) => {
    setCartCount((prev) => prev + amount);
  }, []);

  const decrementCart = useCallback((amount = 1) => {
    setCartCount((prev) => Math.max(0, prev - amount));
  }, []);

  return (
    <CartContext.Provider
      value={{ cartCount, setCartCount, incrementCart, decrementCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
