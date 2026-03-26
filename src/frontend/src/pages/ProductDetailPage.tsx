import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Package, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import { useGetProduct } from "../hooks/useQueries";
import { useAddToCart } from "../hooks/useQueries";

function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function ProductDetailPage() {
  const { id } = useParams({ from: "/product/$id" });
  const productId = BigInt(id);
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = useGetProduct(productId);
  const addToCart = useAddToCart();
  const { incrementCart } = useCart();

  const handleAddToCart = () => {
    if (!product) return;
    addToCart.mutate(
      { productId: product.id, quantity: BigInt(quantity) },
      {
        onSuccess: () => {
          incrementCart(quantity);
          toast.success(`${product.name} added to cart!`);
        },
        onError: () => toast.error("Failed to add to cart"),
      },
    );
  };

  const imageUrl = product?.imageUrl?.trim()
    ? product.imageUrl
    : `https://picsum.photos/seed/${id}/600/450`;

  return (
    <main className="container mx-auto px-4 py-8">
      <Link
        to="/catalog"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        data-ocid="product.link"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Catalog
      </Link>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-1/2" />
          </div>
        </div>
      ) : !product ? (
        <div className="text-center py-20" data-ocid="product.error_state">
          <h2 className="text-2xl font-semibold mb-2">Product Not Found</h2>
          <Link to="/catalog">
            <Button>Browse Catalog</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image */}
          <div className="rounded-xl overflow-hidden shadow-card bg-secondary aspect-square">
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <Badge variant="secondary" className="w-fit mb-3">
              {product.category}
            </Badge>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              {product.name}
            </h1>
            <p className="text-3xl font-bold text-primary mb-4">
              {formatINR(Number(product.price))}
            </p>

            <div className="flex items-center gap-2 mb-4">
              <Package className="w-4 h-4 text-muted-foreground" />
              {Number(product.stock) > 0 ? (
                <span className="text-sm text-green-600 font-medium">
                  In Stock ({Number(product.stock)} available)
                </span>
              ) : (
                <span className="text-sm text-destructive font-medium">
                  Out of Stock
                </span>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed mb-8">
              {product.description}
            </p>

            {Number(product.stock) > 0 && (
              <div className="flex items-center gap-4">
                {/* Quantity selector */}
                <div className="flex items-center border border-border rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="h-10 w-10"
                    data-ocid="product.button"
                  >
                    −
                  </Button>
                  <span className="w-10 text-center font-medium">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setQuantity((q) => Math.min(Number(product.stock), q + 1))
                    }
                    className="h-10 w-10"
                    data-ocid="product.button"
                  >
                    +
                  </Button>
                </div>

                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={addToCart.isPending}
                  className="flex-1 bg-orange hover:bg-orange-dark text-white border-0 font-semibold"
                  data-ocid="product.primary_button"
                >
                  <ShoppingCart className="mr-2 w-5 h-5" />
                  {addToCart.isPending ? "Adding..." : "Add to Cart"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
