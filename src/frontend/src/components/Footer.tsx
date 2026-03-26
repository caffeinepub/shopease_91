import { Link } from "@tanstack/react-router";
import { Store } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  return (
    <footer className="bg-navy text-white/70 mt-16">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Store className="w-5 h-5 text-orange" />
              <span className="font-display text-lg font-bold text-white">
                ShopEase
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              Your one-stop shop for premium products at great prices. Quality
              you can trust, delivered fast.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/catalog"
                  className="hover:text-white transition-colors"
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">
                  Cart
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li>Free shipping on orders over $50</li>
              <li>30-day returns policy</li>
              <li>Secure checkout</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 text-center text-sm">
          © {year}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange hover:text-orange-light transition-colors"
          >
            caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
