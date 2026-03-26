import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import {
  useGetAllProducts,
  useGetCart,
  useRemoveFromCart,
  useUpdateCartItem,
} from "../hooks/useQueries";

const SHIPPING_THRESHOLD = 500;
const SHIPPING_COST = 50;
const LOADING_KEYS = ["lk1", "lk2", "lk3"];

function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function CartPage() {
  const { data: cart, isLoading: cartLoading } = useGetCart();
  const { data: products, isLoading: productsLoading } = useGetAllProducts();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveFromCart();
  const { setCartCount } = useCart();

  const isLoading = cartLoading || productsLoading;

  const cartWithDetails =
    cart
      ?.map((item) => {
        const product = products?.find((p) => p.id === item.productId);
        return { ...item, product };
      })
      .filter((item) => item.product !== undefined) ?? [];

  const subtotal = cartWithDetails.reduce(
    (sum, item) => sum + Number(item.product!.price) * Number(item.quantity),
    0,
  );
  const shippingFree = subtotal >= SHIPPING_THRESHOLD;
  const shipping = shippingFree ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;

  const handleQuantityChange = (productId: bigint, newQty: number) => {
    if (newQty < 1) return;
    updateItem.mutate({ productId, quantity: BigInt(newQty) });
  };

  const handleRemove = (productId: bigint, name: string) => {
    removeItem.mutate(productId, {
      onSuccess: () => {
        const newCount = cartWithDetails.length - 1;
        setCartCount(Math.max(0, newCount));
        toast.success(`${name} removed from cart`);
      },
      onError: () => toast.error("Failed to remove item"),
    });
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-foreground mb-8">
        Shopping Cart
      </h1>

      {isLoading ? (
        <div className="space-y-4" data-ocid="cart.loading_state">
          {LOADING_KEYS.map((key) => (
            <Skeleton key={key} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : cartWithDetails.length === 0 ? (
        <div className="text-center py-20" data-ocid="cart.empty_state">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added anything yet
          </p>
          <Link to="/catalog">
            <Button
              className="bg-orange hover:bg-orange-dark text-white border-0"
              data-ocid="cart.primary_button"
            >
              Start Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartWithDetails.map((item, i) => (
              <div
                key={item.productId.toString()}
                className="flex gap-4 bg-card rounded-lg shadow-card p-4"
                data-ocid={`cart.item.${i + 1}`}
              >
                <img
                  src={
                    item.product!.imageUrl ||
                    `https://picsum.photos/seed/${item.productId}/120/90`
                  }
                  alt={item.product!.name}
                  className="w-20 h-20 object-cover rounded-md bg-secondary flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <Link
                    to="/product/$id"
                    params={{ id: item.productId.toString() }}
                  >
                    <h3 className="font-semibold hover:text-primary transition-colors truncate">
                      {item.product!.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {item.product!.category}
                  </p>
                  <p className="font-bold text-primary mt-1">
                    {formatINR(Number(item.product!.price))}
                  </p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      handleRemove(item.productId, item.product!.name)
                    }
                    className="text-destructive hover:text-destructive h-8 w-8"
                    data-ocid={`cart.delete_button.${i + 1}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center border border-border rounded-md">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        handleQuantityChange(
                          item.productId,
                          Number(item.quantity) - 1,
                        )
                      }
                      data-ocid="cart.button"
                    >
                      −
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">
                      {Number(item.quantity)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        handleQuantityChange(
                          item.productId,
                          Number(item.quantity) + 1,
                        )
                      }
                      data-ocid="cart.button"
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-card rounded-lg shadow-card p-6 h-fit">
            <h2 className="font-display text-xl font-bold mb-4">
              Order Summary
            </h2>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span
                  className={
                    shippingFree ? "text-green-600 font-medium" : "font-medium"
                  }
                >
                  {shippingFree ? "FREE" : formatINR(shipping)}
                </span>
              </div>
              {!shippingFree && (
                <p className="text-xs text-muted-foreground">
                  Add {formatINR(SHIPPING_THRESHOLD - subtotal)} more for free
                  shipping
                </p>
              )}
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between font-bold text-lg mb-6">
              <span>Total</span>
              <span className="text-primary">{formatINR(total)}</span>
            </div>
            <Link to="/checkout">
              <Button
                className="w-full bg-orange hover:bg-orange-dark text-white border-0 font-semibold"
                data-ocid="cart.primary_button"
              >
                Proceed to Checkout <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
