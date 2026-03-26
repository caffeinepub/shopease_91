import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";
import { useGetAllProducts, useGetCategories } from "../hooks/useQueries";

type SortOption = "name-asc" | "price-asc" | "price-desc";

const CAT_SKELETON_KEYS = ["cs1", "cs2", "cs3", "cs4"];
const PRODUCT_SKELETON_KEYS = [
  "ps1",
  "ps2",
  "ps3",
  "ps4",
  "ps5",
  "ps6",
  "ps7",
  "ps8",
];

export default function CatalogPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sort, setSort] = useState<SortOption>("name-asc");

  const { data: products, isLoading: productsLoading } = useGetAllProducts();
  const { data: categories, isLoading: catsLoading } = useGetCategories();

  const filtered = useMemo(() => {
    if (!products) return [];
    let result = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }
    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category === selectedCategory);
    }
    result.sort((a, b) => {
      if (sort === "price-asc") return Number(a.price) - Number(b.price);
      if (sort === "price-desc") return Number(b.price) - Number(a.price);
      return a.name.localeCompare(b.name);
    });
    return result;
  }, [products, search, selectedCategory, sort]);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-1">
          Product Catalog
        </h1>
        <p className="text-muted-foreground">Browse our full collection</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-ocid="catalog.search_input"
          />
        </div>
        <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
          <SelectTrigger className="w-full sm:w-48" data-ocid="catalog.select">
            <SlidersHorizontal className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Name A→Z</SelectItem>
            <SelectItem value="price-asc">Price Low→High</SelectItem>
            <SelectItem value="price-desc">Price High→Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("all")}
          className={selectedCategory === "all" ? "bg-navy text-white" : ""}
          data-ocid="catalog.tab"
        >
          All
        </Button>
        {catsLoading
          ? CAT_SKELETON_KEYS.map((key) => (
              <Skeleton key={key} className="h-8 w-20 rounded-md" />
            ))
          : categories?.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className={selectedCategory === cat ? "bg-navy text-white" : ""}
                data-ocid="catalog.tab"
              >
                {cat}
              </Button>
            ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">{filtered.length}</span>{" "}
          products
          {selectedCategory !== "all" && (
            <>
              {" "}
              in{" "}
              <Badge variant="secondary" className="ml-1">
                {selectedCategory}
              </Badge>
            </>
          )}
        </p>
      </div>

      {productsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {PRODUCT_SKELETON_KEYS.map((key) => (
            <div key={key} className="rounded-lg overflow-hidden shadow-card">
              <Skeleton className="aspect-[4/3] w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-full mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((product, i) => (
            <div
              key={product.id.toString()}
              data-ocid={`catalog.item.${i + 1}`}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20" data-ocid="catalog.empty_state">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No products found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </main>
  );
}
