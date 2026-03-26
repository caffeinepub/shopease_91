import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Star, Tag, Truck } from "lucide-react";
import { motion } from "motion/react";
import ProductCard from "../components/ProductCard";
import { useGetFeaturedProducts } from "../hooks/useQueries";

const promos = [
  {
    icon: Truck,
    title: "Free Shipping",
    subtitle: "On orders over $50",
    bg: "bg-navy",
    text: "text-white",
  },
  {
    icon: Star,
    title: "New Arrivals",
    subtitle: "Fresh drops every week",
    bg: "bg-orange",
    text: "text-white",
  },
  {
    icon: Tag,
    title: "Member Discounts",
    subtitle: "Save up to 20% when you login",
    bg: "bg-secondary",
    text: "text-foreground",
  },
];

const SKELETON_KEYS = ["sk1", "sk2", "sk3", "sk4"];

export default function HomePage() {
  const { data: featured, isLoading } = useGetFeaturedProducts();

  return (
    <main>
      <section
        className="relative min-h-[520px] flex items-center justify-center overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.22 0.08 240) 0%, oklch(0.35 0.1 250) 60%, oklch(0.28 0.08 240) 100%)",
        }}
      >
        <img
          src="/assets/generated/hero-banner.dim_1200x500.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block bg-orange/20 text-orange border border-orange/30 rounded-full px-4 py-1 text-sm font-medium mb-4">
              🛍️ New Season, New Deals
            </span>
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-4 leading-tight">
              Shop the<span className="text-orange"> Best Deals</span>
            </h1>
            <p className="text-white/80 text-lg md:text-xl mb-8 max-w-xl mx-auto">
              Discover thousands of products at unbeatable prices. Free shipping
              on orders over $50.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/catalog">
                <Button
                  size="lg"
                  className="bg-orange hover:bg-orange-dark text-white border-0 text-base font-semibold px-8"
                  data-ocid="home.primary_button"
                >
                  Shop Now <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link to="/catalog">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 hover:text-white text-base px-8"
                  data-ocid="home.secondary_button"
                >
                  Browse Catalog
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {promos.map((promo, i) => (
            <motion.div
              key={promo.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.4 }}
              className={`${promo.bg} ${promo.text} rounded-lg p-6 flex items-center gap-4`}
            >
              <div className="bg-white/10 rounded-full p-3">
                <promo.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{promo.title}</h3>
                <p className="text-sm opacity-80">{promo.subtitle}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground">
              Featured Products
            </h2>
            <p className="text-muted-foreground mt-1">
              Handpicked selections just for you
            </p>
          </div>
          <Link to="/catalog">
            <Button
              variant="outline"
              className="hidden md:flex border-primary text-primary hover:bg-primary hover:text-white"
              data-ocid="home.link"
            >
              View All <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SKELETON_KEYS.map((key) => (
              <div key={key} className="rounded-lg overflow-hidden shadow-card">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : featured && featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((product) => (
              <motion.div
                key={product.id.toString()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div
            className="text-center py-16 text-muted-foreground"
            data-ocid="home.empty_state"
          >
            <p>No featured products yet. Check back soon!</p>
          </div>
        )}
      </section>
    </main>
  );
}
