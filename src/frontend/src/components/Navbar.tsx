import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Menu, ShoppingCart, Store, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCart } from "../hooks/useQueries";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount, setCartCount } = useCart();
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const { data: cart } = useGetCart();

  useEffect(() => {
    if (cart) {
      const total = cart.reduce((sum, item) => sum + Number(item.quantity), 0);
      setCartCount(total);
    }
  }, [cart, setCartCount]);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/catalog", label: "Catalog" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-navy shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2" data-ocid="nav.link">
            <Store className="w-6 h-6 text-orange" />
            <span className="font-display text-xl font-bold text-white tracking-tight">
              ShopEase
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-white/80 hover:text-white font-medium transition-colors"
                activeProps={{ className: "text-white font-semibold" }}
                data-ocid="nav.link"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/cart" className="relative" data-ocid="nav.link">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
              >
                <ShoppingCart className="w-5 h-5" />
              </Button>
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-orange text-white text-xs rounded-full border-0">
                  {cartCount > 99 ? "99+" : cartCount}
                </Badge>
              )}
            </Link>

            {identity ? (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/admin">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/80 hover:text-white hover:bg-white/10"
                  >
                    Admin
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clear}
                  className="border-white/30 text-white hover:bg-white/10 hover:text-white"
                  data-ocid="nav.button"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={login}
                disabled={isLoggingIn}
                className="hidden md:flex bg-orange hover:bg-orange-dark text-white border-0"
                data-ocid="nav.button"
              >
                {isLoggingIn ? "Signing in..." : "Login"}
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white hover:bg-white/10"
              onClick={() => setMenuOpen(!menuOpen)}
              data-ocid="nav.toggle"
            >
              {menuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-white/80 hover:text-white font-medium py-2 transition-colors"
                  onClick={() => setMenuOpen(false)}
                  data-ocid="nav.link"
                >
                  {link.label}
                </Link>
              ))}
              {identity ? (
                <>
                  <Link
                    to="/admin"
                    className="text-white/80 hover:text-white font-medium py-2"
                    onClick={() => setMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      clear();
                      setMenuOpen(false);
                    }}
                    className="border-white/30 text-white hover:bg-white/10 w-fit"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={() => {
                    login();
                    setMenuOpen(false);
                  }}
                  disabled={isLoggingIn}
                  className="bg-orange hover:bg-orange-dark text-white border-0 w-fit"
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
