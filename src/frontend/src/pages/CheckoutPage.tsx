import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import {
  useGetAllProducts,
  useGetCart,
  usePlaceOrder,
} from "../hooks/useQueries";

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

const SHIPPING_THRESHOLD = 500;
const SHIPPING_COST = 50;

function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { data: cart } = useGetCart();
  const { data: products } = useGetAllProducts();
  const placeOrder = usePlaceOrder();
  const { setCartCount } = useCart();

  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

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

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!form.name.trim()) newErrors.name = "Full name is required";
    if (!form.email.trim() || !form.email.includes("@"))
      newErrors.email = "Valid email is required";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.state.trim()) newErrors.state = "State is required";
    if (!form.zip.trim()) newErrors.zip = "PIN code is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const fullAddress = `${form.address}, ${form.city}, ${form.state} ${form.zip}`;
    placeOrder.mutate(
      {
        name: form.name,
        email: form.email,
        address: fullAddress,
        phone: form.phone,
      },
      {
        onSuccess: (orderId) => {
          setCartCount(0);
          toast.success("Order placed successfully!");
          void navigate({
            to: "/order-confirmation",
            search: { orderId: orderId.toString() },
          });
        },
        onError: (err) => toast.error(err.message || "Failed to place order"),
      },
    );
  };

  const handleChange =
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-foreground mb-8">
        Checkout
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-lg shadow-card p-6">
              <h2 className="font-semibold text-lg mb-4">
                Contact Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={handleChange("name")}
                    placeholder="Rahul Sharma"
                    autoComplete="name"
                    data-ocid="checkout.input"
                  />
                  {errors.name && (
                    <p
                      className="text-xs text-destructive"
                      data-ocid="checkout.error_state"
                    >
                      {errors.name}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange("email")}
                    placeholder="rahul@example.com"
                    autoComplete="email"
                    data-ocid="checkout.input"
                  />
                  {errors.email && (
                    <p
                      className="text-xs text-destructive"
                      data-ocid="checkout.error_state"
                    >
                      {errors.email}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange("phone")}
                    placeholder="+91 98765 43210"
                    autoComplete="tel"
                    data-ocid="checkout.input"
                  />
                  {errors.phone && (
                    <p
                      className="text-xs text-destructive"
                      data-ocid="checkout.error_state"
                    >
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg shadow-card p-6">
              <h2 className="font-semibold text-lg mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    value={form.address}
                    onChange={handleChange("address")}
                    placeholder="123, MG Road"
                    autoComplete="street-address"
                    data-ocid="checkout.input"
                  />
                  {errors.address && (
                    <p
                      className="text-xs text-destructive"
                      data-ocid="checkout.error_state"
                    >
                      {errors.address}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5 sm:col-span-1 col-span-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={form.city}
                      onChange={handleChange("city")}
                      placeholder="Mumbai"
                      autoComplete="address-level2"
                      data-ocid="checkout.input"
                    />
                    {errors.city && (
                      <p
                        className="text-xs text-destructive"
                        data-ocid="checkout.error_state"
                      >
                        {errors.city}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={form.state}
                      onChange={handleChange("state")}
                      placeholder="MH"
                      autoComplete="address-level1"
                      data-ocid="checkout.input"
                    />
                    {errors.state && (
                      <p
                        className="text-xs text-destructive"
                        data-ocid="checkout.error_state"
                      >
                        {errors.state}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="zip">PIN Code</Label>
                    <Input
                      id="zip"
                      value={form.zip}
                      onChange={handleChange("zip")}
                      placeholder="400001"
                      autoComplete="postal-code"
                      data-ocid="checkout.input"
                    />
                    {errors.zip && (
                      <p
                        className="text-xs text-destructive"
                        data-ocid="checkout.error_state"
                      >
                        {errors.zip}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-card rounded-lg shadow-card p-6 h-fit">
            <h2 className="font-display text-xl font-bold mb-4">
              Order Summary
            </h2>
            <div className="space-y-3 mb-4">
              {cartWithDetails.map((item) => (
                <div
                  key={item.productId.toString()}
                  className="flex justify-between text-sm"
                >
                  <span className="text-muted-foreground truncate max-w-[180px]">
                    {item.product!.name} × {Number(item.quantity)}
                  </span>
                  <span className="font-medium ml-2">
                    {formatINR(
                      Number(item.product!.price) * Number(item.quantity),
                    )}
                  </span>
                </div>
              ))}
            </div>
            <Separator className="my-3" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className={shippingFree ? "text-green-600" : ""}>
                  {shippingFree ? "FREE" : formatINR(shipping)}
                </span>
              </div>
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between font-bold text-lg mb-6">
              <span>Total</span>
              <span className="text-primary">{formatINR(total)}</span>
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full bg-orange hover:bg-orange-dark text-white border-0 font-semibold"
              disabled={placeOrder.isPending || cartWithDetails.length === 0}
              data-ocid="checkout.submit_button"
            >
              {placeOrder.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Placing
                  Order...
                </>
              ) : (
                "Place Order"
              )}
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
}
