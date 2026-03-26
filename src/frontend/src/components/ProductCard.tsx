import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "../backend.d";
import { useCart } from "../context/CartContext";
import { useAddToCart } from "../hooks/useQueries";

function getImageUrl(product: Product): string {
  if (product.imageUrl && product.imageUrl.trim() !== "")
    return product.imageUrl;
  return `https://picsum.photos/seed/${product.id}/400/300`;
}

function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function ProductCard({ product }: { product: Product }) {
  const addToCart = useAddToCart();
  const { incrementCart } = useCart();
  const inStock = Number(product.stock) > 0;

  const handleAddToCart = () => {
    addToCart.mutate(
      { productId: product.id, quantity: BigInt(1) },
      {
        onSuccess: () => {
          incrementCart(1);
          toast.success(`${product.name} added to cart!`);
        },
        onError: () => toast.error("Failed to add to cart"),
      },
    );
  };

  return (
    <div className="group bg-card rounded-lg shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden flex flex-col">
      <Link
        to="/product/$id"
        params={{ id: product.id.toString() }}
        className="block overflow-hidden"
      >
        <div className="aspect-[4/3] overflow-hidden bg-secondary">
          <img
            src={getImageUrl(product)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link to="/product/$id" params={{ id: product.id.toString() }}>
            <h3 className="font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          <Badge
            variant="secondary"
            className="shrink-0 text-xs bg-secondary text-secondary-foreground"
          >
            {product.category}
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-1">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-xl font-bold text-primary">
            {formatINR(Number(product.price))}
          </span>
          {inStock ? (
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={addToCart.isPending}
              className="bg-orange hover:bg-orange-dark text-white border-0"
              data-ocid="catalog.add_button"
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              Add
            </Button>
          ) : (
            <Badge variant="destructive" className="text-xs">
              Out of Stock
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
