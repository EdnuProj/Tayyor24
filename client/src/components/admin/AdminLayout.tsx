import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Tag,
  ArrowLeft,
  Sun,
  Moon,
  Menu,
  LogOut,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "@/contexts/ThemeContext";
import { useState } from "react";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/products", icon: Package, label: "Mahsulotlar" },
  { href: "/admin/orders", icon: ShoppingCart, label: "Buyurtmalar" },
  { href: "/admin/customers", icon: Users, label: "Mijozlar" },
  { href: "/admin/promo-codes", icon: Tag, label: "Promokodlar" },
  { href: "/admin/rassilka", icon: Send, label: "Rassilka" },
  { href: "/admin/settings", icon: Settings, label: "Sozlamalar" },
];

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const Sidebar = () => (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive = location === item.href || 
          (item.href !== "/admin" && location.startsWith(item.href));
        
        return (
          <Link key={item.href} href={item.href}>
            <div
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              onClick={() => setSidebarOpen(false)}
              data-testid={`link-admin-${item.label.toLowerCase()}`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </div>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden lg:flex h-screen w-64 flex-col border-r bg-background">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <span className="text-sm font-bold text-primary-foreground">D</span>
          </div>
          <span className="font-semibold">Admin Panel</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <Sidebar />
        </div>
        <div className="border-t p-4 space-y-2">
          <Link href="/">
            <Button variant="outline" className="w-full" data-testid="button-back-to-store">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Do'konga qaytish
            </Button>
          </Link>
          <Button
            variant="outline"
            className="w-full text-destructive hover:text-destructive"
            onClick={() => {
              localStorage.removeItem("admin_logged_in");
              window.location.href = "/admin";
            }}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Chiqish
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          {/* Mobile Menu */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" data-testid="button-admin-menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetHeader className="h-16 flex items-center justify-center border-b">
                <SheetTitle className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                    <span className="text-sm font-bold text-primary-foreground">D</span>
                  </div>
                  Admin Panel
                </SheetTitle>
              </SheetHeader>
              <div className="p-4">
                <Sidebar />
              </div>
              <div className="absolute bottom-4 left-4 right-4 space-y-2">
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Do'konga qaytish
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full text-destructive hover:text-destructive"
                  onClick={() => {
                    localStorage.removeItem("admin_logged_in");
                    window.location.href = "/admin";
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Chiqish
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <h1 className="text-lg font-semibold flex-1">{title}</h1>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            data-testid="button-admin-theme"
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
