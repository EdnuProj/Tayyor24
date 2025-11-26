import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, orderStatusLabels, orderStatusColors } from "@/lib/utils";
import type { DashboardStats, Order, Product } from "@shared/schema";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: recentOrders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders?limit=5"],
  });

  const { data: topProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products?popular=true&limit=5"],
  });

  const statCards = [
    {
      title: "Jami buyurtmalar",
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      change: "+12%",
      changeType: "positive",
    },
    {
      title: "Jami daromad",
      value: formatPrice(stats?.totalRevenue || 0),
      icon: DollarSign,
      change: "+8%",
      changeType: "positive",
    },
    {
      title: "Mijozlar",
      value: stats?.totalCustomers || 0,
      icon: Users,
      change: "+23%",
      changeType: "positive",
    },
    {
      title: "Mahsulotlar",
      value: stats?.totalProducts || 0,
      icon: Package,
      change: "+5",
      changeType: "neutral",
    },
  ];

  return (
    <AdminLayout title="Dashboard">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-32" />
                </CardContent>
              </Card>
            ))
          : statCards.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    {stat.changeType === "positive" ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : null}
                    <span
                      className={
                        stat.changeType === "positive"
                          ? "text-green-500"
                          : "text-muted-foreground"
                      }
                    >
                      {stat.change}
                    </span>
                    <span className="text-muted-foreground ml-1">o'tgan oydan</span>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">So'nggi buyurtmalar</CardTitle>
              <CardDescription>Oxirgi 5 ta buyurtma</CardDescription>
            </div>
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm">
                Barchasi
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Hozircha buyurtmalar yo'q
              </p>
            ) : (
              <div className="space-y-4">
                {recentOrders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="space-y-1">
                      <p className="font-medium text-sm">#{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{order.customerName}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge className={orderStatusColors[order.status]}>
                        {orderStatusLabels[order.status]}
                      </Badge>
                      <p className="text-sm font-medium">{formatPrice(order.total)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Ommabop mahsulotlar</CardTitle>
              <CardDescription>Eng ko'p sotilganlar</CardDescription>
            </div>
            <Link href="/admin/products">
              <Button variant="ghost" size="sm">
                Barchasi
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Hozircha mahsulotlar yo'q
              </p>
            ) : (
              <div className="space-y-4">
                {topProducts.slice(0, 5).map((product, index) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                  >
                    <span className="text-lg font-bold text-muted-foreground w-6">
                      {index + 1}
                    </span>
                    <div className="w-12 h-12 rounded-md overflow-hidden bg-muted shrink-0">
                      <img
                        src={product.images[0] || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.stock} dona mavjud
                      </p>
                    </div>
                    <p className="font-semibold text-sm">{formatPrice(product.price)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Tezkor harakatlar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/admin/products/new">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Package className="h-5 w-5" />
                <span>Mahsulot qo'shish</span>
              </Button>
            </Link>
            <Link href="/admin/orders">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <ShoppingCart className="h-5 w-5" />
                <span>Buyurtmalar</span>
              </Button>
            </Link>
            <Link href="/admin/promo-codes">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <ArrowUpRight className="h-5 w-5" />
                <span>Promokod</span>
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Users className="h-5 w-5" />
                <span>Sozlamalar</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
