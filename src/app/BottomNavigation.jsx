import { Grid, Headphones, Heart, Home, User } from "lucide-react";
import { motion } from "motion/react";
import { Link, useLocation } from "react-router";

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Grid, label: "Shop", href: "/products" },
  { icon: Headphones, label: "Support", href: "/support" },
  { icon: Heart, label: "Wishlist", href: "/wishlist" },
];

export default function BottomNavigation({ onOpenProfile }) {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 flex items-center justify-around bg-white/80 dark:bg-[#0a0a0c]/80 backdrop-blur-2xl border-t border-black/5 dark:border-white/5 pb-[env(safe-area-inset-bottom)] pt-1 md:hidden">
      {navItems.map((item) => {
        const isActive = location.pathname === item.href;
        
        return (
          <Link
            key={item.label}
            to={item.href}
            className={`relative flex flex-col items-center justify-center w-16 h-14 transition-colors duration-300 ${
              isActive 
                ? "text-emerald-600 dark:text-emerald-400" 
                : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="bottom-nav-indicator"
                className="absolute top-0 w-8 h-1 bg-emerald-600 dark:bg-emerald-400 rounded-b-full"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <item.icon className="w-5 h-5 mb-1" strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium tracking-wide">
              {item.label}
            </span>
          </Link>
        );
      })}

      {/* Profile Button triggers the Drawer Panel instead of a route */}
      <button
        onClick={onOpenProfile}
        className="relative flex flex-col items-center justify-center w-16 h-14 transition-colors duration-300 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white focus:outline-none"
      >
        <User className="w-5 h-5 mb-1" strokeWidth={2} />
        <span className="text-[10px] font-medium tracking-wide">Profile</span>
      </button>
    </nav>
  );
}