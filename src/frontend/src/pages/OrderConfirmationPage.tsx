import { Button } from "@/components/ui/button";
import { Link, useSearch } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

export default function OrderConfirmationPage() {
  const search = useSearch({ from: "/order-confirmation" });
  const orderId = (search as { orderId?: string }).orderId;

  return (
    <main className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md mx-auto text-center"
      >
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-3">
          Order Confirmed!
        </h1>
        <p className="text-muted-foreground mb-3">
          Thank you for your purchase. We'll send you a confirmation email
          shortly.
        </p>
        {orderId && (
          <div className="bg-secondary rounded-lg p-4 mb-8">
            <p className="text-sm text-muted-foreground">Order ID</p>
            <p className="font-bold text-lg text-primary">#{orderId}</p>
          </div>
        )}
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/catalog">
            <Button
              className="bg-orange hover:bg-orange-dark text-white border-0"
              data-ocid="confirmation.primary_button"
            >
              Continue Shopping
            </Button>
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
