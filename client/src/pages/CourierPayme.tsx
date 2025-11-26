import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Wallet,
  ArrowRightLeft,
  Zap,
  BarChart3,
  QrCode,
  Repeat2,
  Lock,
  FileText,
  CreditCard,
  ChevronRight,
  ArrowLeft,
  TrendingDown,
  TrendingUp,
  Package,
} from "lucide-react";

type TabType = "home" | "transfer" | "payments" | "qr" | "history" | "orders" | "settings";

const features = [
  {
    id: "balance",
    icon: Wallet,
    title: "Balansni Ko'rish",
    description: "UzCard, Humo, Visa, Mastercard",
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "transfer",
    icon: ArrowRightLeft,
    title: "Pul O'tkazmalar",
    description: "Karta → Karta, TaayyorCash ID orqali",
    color: "from-purple-500 to-purple-600",
  },
  {
    id: "payments",
    icon: Zap,
    title: "To'lovlar",
    description: "Elektr, gaz, suv, internet, mobil",
    color: "from-yellow-500 to-yellow-600",
  },
  {
    id: "business",
    icon: BarChart3,
    title: "TaayyorCash Business",
    description: "QR, terminali, invoice",
    color: "from-green-500 to-green-600",
  },
  {
    id: "qr",
    icon: QrCode,
    title: "QR orqali To'lov",
    description: "Scan & Pay",
    color: "from-pink-500 to-pink-600",
  },
  {
    id: "autopay",
    icon: Repeat2,
    title: "Avtomatik To'lovlar",
    description: "Oylik va haftalik to'lovlar",
    color: "from-cyan-500 to-cyan-600",
  },
  {
    id: "security",
    icon: Lock,
    title: "Xavfsizlik",
    description: "Fingerprint, Face ID, 3D Secure",
    color: "from-red-500 to-red-600",
  },
  {
    id: "history",
    icon: FileText,
    title: "To'lov Tarixi",
    description: "Kvitansiya va ma'lumotlar",
    color: "from-indigo-500 to-indigo-600",
  },
  {
    id: "subscriptions",
    icon: CreditCard,
    title: "Obunalar",
    description: "Netflix, YouTube va boshqalar",
    color: "from-orange-500 to-orange-600",
  },
  {
    id: "credit",
    icon: CreditCard,
    title: "Kredit To'lovlari",
    description: "Bank, mikroqarz, lizing",
    color: "from-teal-500 to-teal-600",
  },
];

interface Transaction {
  id: string;
  courierId: string;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  total: number;
  status: string;
}

interface Assignment {
  id: string;
  orderId: string;
  courierId: string;
  status: string;
  assignedAt: string;
  order?: Order;
}

export default function CourierPayme() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [telegramId, setTelegramId] = useState<string>("");
  const [courierBalance, setCourierBalance] = useState<number>(0);
  const [courierCard, setCourierCard] = useState<string>("");
  const [transferCard, setTransferCard] = useState<string>("");
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [orders, setOrders] = useState<Assignment[]>([]);
  const [acceptingOrderId, setAcceptingOrderId] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Assignment | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [rejectingOrderId, setRejectingOrderId] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("telegramId");
    if (id) setTelegramId(id);
    
    // Fetch courier data
    if (id) {
      fetchCourierData(id);
      
      // Auto-refresh every 5 seconds
      const interval = setInterval(() => {
        fetchCourierData(id);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, []);

  const fetchCourierData = async (id: string) => {
    try {
      const res = await fetch(`/api/courier-dashboard/${id}`);
      const data = await res.json();
      if (data.courier) {
        setCourierBalance(data.courier.balance || 0);
        setCourierCard(data.courier.cardNumber || "");
      }
      if (data.transactions) {
        setTransactions(data.transactions);
      }
      if (data.assignments) {
        // Show both pending orders (available) and this courier's accepted orders
        const filteredAssignments = data.assignments.filter((a: Assignment) => {
          // Pending orders available to accept
          if (a.status === "pending" && !a.courierId) {
            return true;
          }
          // Orders this courier has already accepted
          if (a.courierId === data.courier?.id) {
            return true;
          }
          return false;
        });
        setOrders(filteredAssignments);
      }
    } catch (error) {
      console.error("Failed to fetch courier data:", error);
    }
  };

  const handleAcceptOrder = async (orderId: string, assignmentId: string, assignment: Assignment) => {
    setAcceptingOrderId(orderId);
    try {
      const res = await fetch("/api/courier/accept-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          assignmentId,
          telegramId,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to accept order");
      }

      const data = await res.json();
      toast({
        title: "✅ Buyurtma qabul qilindi!",
        description: `Balans: ${data.newBalance.toLocaleString()} so'm`,
      });

      // Set selected order and show detail view
      setSelectedOrder(assignment);
      setCourierBalance(data.newBalance);
      setActiveTab("orders");
      
      // Refresh orders
      setTimeout(() => fetchCourierData(telegramId), 500);
    } catch (error: any) {
      toast({
        title: "❌ Xatolik",
        description: error.message || "Buyurtma qabul qilinmadi",
        variant: "destructive",
      });
    } finally {
      setAcceptingOrderId("");
    }
  };

  const handleUpdateOrderStatus = async (status: "accepted" | "shipping" | "delivered") => {
    if (!selectedOrder) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch("/api/courier/update-order-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrder.orderId,
          status,
        }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      // Update selected order status locally
      const newStatus = { ...selectedOrder, status };
      setSelectedOrder(newStatus);

      toast({
        title: "✅ Holat yangilandi!",
      });

      // Refresh orders data
      setTimeout(() => {
        fetchCourierData(telegramId);
      }, 500);
    } catch (error: any) {
      toast({
        title: "❌ Xatolik",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleRejectOrder = async (orderId: string, assignmentId: string) => {
    setRejectingOrderId(orderId);
    try {
      const res = await fetch("/api/courier/reject-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          assignmentId,
          telegramId,
        }),
      });

      if (!res.ok) throw new Error("Failed to reject order");

      toast({
        title: "❌ Buyurtma bekor qilingan!",
      });

      // Refresh orders
      setTimeout(() => fetchCourierData(telegramId), 500);
    } catch (error: any) {
      toast({
        title: "❌ Xatolik",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRejectingOrderId("");
    }
  };

  const handleTransfer = async () => {
    if (!transferCard || !transferAmount) {
      toast({ title: "❌ Hamma maydonlarni to'ldiring", variant: "destructive" });
      return;
    }
    
    const amount = parseInt(transferAmount);
    if (amount <= 0) {
      toast({ title: "❌ Noto'g'ri miqdor", variant: "destructive" });
      return;
    }

    if (amount > courierBalance) {
      toast({ title: "❌ Balans yetarli emas", description: `Sizda ${courierBalance} so'm bor`, variant: "destructive" });
      return;
    }

    setIsTransferring(true);
    try {
      const res = await fetch("/api/courier/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromTelegramId: telegramId,
          toCardNumber: transferCard,
          amount,
        }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Transfer failed");
      }
      
      const data = await res.json();
      toast({ 
        title: "✅ O'tkazma muvaffaqiyatli!",
        description: `${amount.toLocaleString()} so'm yuborildi. Yangi balans: ${(courierBalance - amount).toLocaleString()} so'm`
      });
      
      setTransferCard("");
      setTransferAmount("");
      
      // Refresh data and go to history
      setTimeout(() => {
        fetchCourierData(telegramId);
        setActiveTab("history");
      }, 500);
    } catch (error: any) {
      toast({ 
        title: "❌ Xatolik", 
        description: error.message || "O'tkazma amalga oshirilmadi",
        variant: "destructive"
      });
    } finally {
      setIsTransferring(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="space-y-4">
            {/* Balance Card */}
            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 border-0 text-white p-6">
              <p className="text-emerald-100 text-sm mb-2">Joriy Balans</p>
              <p className="text-4xl font-bold">{courierBalance.toLocaleString()}</p>
              <p className="text-emerald-100 text-sm mt-2">so'm</p>
              {courierCard && <p className="text-emerald-100 text-xs mt-2">💳 {courierCard}</p>}
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => setActiveTab("orders")}
                className="bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-lg text-center text-sm font-medium transition relative"
                data-testid="button-quick-orders"
              >
                <Package className="w-5 h-5 mx-auto mb-1" />
                Buyurtma
                {orders.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {orders.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("payments")}
                className="bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-lg text-center text-sm font-medium transition"
                data-testid="button-quick-payment"
              >
                <Zap className="w-5 h-5 mx-auto mb-1" />
                To'lov
              </button>
              <button
                onClick={() => setActiveTab("qr")}
                className="bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-lg text-center text-sm font-medium transition"
                data-testid="button-quick-qr"
              >
                <QrCode className="w-5 h-5 mx-auto mb-1" />
                QR
              </button>
              <button
                onClick={() => setActiveTab("transfer")}
                className="bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-lg text-center text-sm font-medium transition"
                data-testid="button-quick-transfer"
              >
                <ArrowRightLeft className="w-5 h-5 mx-auto mb-1" />
                O'tkazma
              </button>
            </div>

            {/* All Features */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Xizmatlar</h2>
              <div className="grid grid-cols-2 gap-2">
                {features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <button
                      key={feature.id}
                      onClick={() =>
                        setActiveTab(
                          feature.id as TabType | "home" | "transfer" | "payments" | "qr" | "history" | "settings"
                        )
                      }
                      className={`bg-gradient-to-br ${feature.color} text-white p-4 rounded-lg hover:shadow-lg transition text-left`}
                      data-testid={`button-feature-${feature.id}`}
                    >
                      <Icon className="w-6 h-6 mb-2" />
                      <p className="font-medium text-sm">{feature.title}</p>
                      <p className="text-xs opacity-90">{feature.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case "transfer":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Pul O'tkazmalar</h2>
            <Card className="bg-slate-800 border-slate-700 p-4 space-y-3">
              <div>
                <label className="text-sm text-slate-300">Qabul Qiluvchi Karta Raqami</label>
                <input
                  type="text"
                  placeholder="9860 1234 5678 9012"
                  value={transferCard}
                  onChange={(e) => setTransferCard(e.target.value)}
                  className="w-full bg-slate-700 border-slate-600 text-white p-2 rounded mt-1"
                  data-testid="input-transfer-account"
                />
              </div>
              <div>
                <label className="text-sm text-slate-300">Miqdor (so'm)</label>
                <input
                  type="number"
                  placeholder="10,000"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full bg-slate-700 border-slate-600 text-white p-2 rounded mt-1"
                  data-testid="input-transfer-amount"
                />
                <p className="text-xs text-slate-400 mt-1">Mavjud: {courierBalance.toLocaleString()} so'm</p>
              </div>
              <Button 
                onClick={handleTransfer}
                disabled={isTransferring}
                className="w-full bg-blue-600 hover:bg-blue-700" 
                data-testid="button-send-transfer"
              >
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                {isTransferring ? "O'tkazilmoqda..." : "O'tkazish"}
              </Button>
            </Card>
          </div>
        );

      case "payments":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Utilities & Services</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                "⚡ Elektr",
                "🔥 Gaz",
                "💧 Suv",
                "🌐 Internet",
                "📱 Mobil",
                "🚗 GIBDD",
                "🏛️ Soliq",
                "👨‍🎓 Ta'lim",
                "🎮 Steam/Pubg",
                "📺 Netflix",
              ].map((service) => (
                <button
                  key={service}
                  className="bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-lg transition"
                  data-testid={`button-service-${service}`}
                >
                  {service}
                </button>
              ))}
            </div>
          </div>
        );

      case "qr":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">QR orqali To'lov</h2>
            <Card className="bg-slate-800 border-slate-700 p-8 text-center">
              <QrCode className="w-32 h-32 mx-auto text-slate-400 mb-4" />
              <p className="text-slate-300 mb-4">QR kodini skanerlash uchun kamera ishga tushiladi</p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700" data-testid="button-open-camera">
                Kamera Ochish
              </Button>
            </Card>
          </div>
        );

      case "history":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">To'lov Tarixi</h2>
            {transactions.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700 p-4 text-center text-slate-400">
                Tranzaksiya yo'q
              </Card>
            ) : (
              transactions.map((tx) => {
                const isDebit = tx.type === "order_debit";
                return (
                  <Card
                    key={tx.id}
                    className={`border-slate-700 p-3 flex items-center justify-between ${
                      isDebit
                        ? "bg-red-950/30 border-red-800"
                        : "bg-green-950/30 border-green-800"
                    }`}
                    data-testid={`card-transaction-${tx.id}`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {isDebit ? (
                        <div className="p-2 bg-red-500/20 rounded-lg">
                          <TrendingDown className="w-5 h-5 text-red-400" />
                        </div>
                      ) : (
                        <div className="p-2 bg-green-500/20 rounded-lg">
                          <TrendingUp className="w-5 h-5 text-green-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{tx.description}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(tx.createdAt).toLocaleDateString("uz-UZ", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`font-bold text-right ${
                        isDebit ? "text-red-400" : "text-green-400"
                      }`}
                      data-testid={`text-amount-${tx.id}`}
                    >
                      {isDebit ? "-" : "+"}
                      {Math.abs(tx.amount).toLocaleString()}
                    </p>
                  </Card>
                );
              })
            )}
          </div>
        );

      case "orders":
        if (selectedOrder) {
          const isAccepted = selectedOrder.status === "accepted" || selectedOrder.status === "shipping" || selectedOrder.status === "delivered";
          const isShipping = selectedOrder.status === "shipping" || selectedOrder.status === "delivered";
          const isDelivered = selectedOrder.status === "delivered";
          
          // Get order details from assignment
          const order = (selectedOrder as any).order;
          const customerName = order?.customerName || "Noma'lum";
          const customerPhone = order?.customerPhone || "Noma'lum";
          const customerAddress = order?.customerAddress || "Noma'lum";
          const total = order?.total || 0;
          const orderNumber = order?.orderNumber || selectedOrder.orderId?.substring(0, 8);
          const latitude = order?.latitude || 41.299496;
          const longitude = order?.longitude || 69.240073;
          const categoryId = order?.categoryId || "elektronika";
          
          // Parse order items
          let orderItems: any[] = [];
          try {
            orderItems = JSON.parse(order?.items || "[]");
          } catch (e) {
            orderItems = [];
          }
          
          // Category name mapping
          const categoryNames: Record<string, string> = {
            "elektronika": "📱 Elektronika",
            "kiyim": "👕 Kiyim",
            "sport": "⚽ Sport",
            "oziq-ovqat": "🍔 Oziq-ovqat",
            "kitoblar": "📚 Kitoblar",
            "mebellar": "🪑 Mebellar"
          };
          const categoryName = categoryNames[categoryId] || `📦 ${categoryId}`;

          return (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Buyurtma Tafsilotlari</h2>
              <Card className="bg-slate-800 border-slate-700 p-4 space-y-3">
                <div>
                  <p className="text-slate-400 text-sm">Buyurtma ID</p>
                  <p className="text-white font-bold text-lg">#{orderNumber}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Kategoriya</p>
                  <p className="text-white font-semibold">{categoryName}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Mijoz</p>
                  <p className="text-white">{customerName}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Telefon</p>
                  <p className="text-white">{customerPhone}</p>
                </div>
                <div className="border-t border-slate-700 pt-3">
                  <p className="text-slate-400 text-sm mb-2">🛍️ Mahsulotlar</p>
                  <div className="space-y-2">
                    {orderItems.length > 0 ? (
                      orderItems.map((item: any, idx: number) => (
                        <div key={idx} className="bg-slate-700 p-2 rounded text-sm">
                          <div className="flex justify-between items-start">
                            <p className="text-white font-medium flex-1">{item.productName}</p>
                            <span className="text-slate-300 ml-2 whitespace-nowrap">x{item.quantity}</span>
                          </div>
                          <p className="text-slate-400 text-xs mt-1">
                            {(item.price * item.quantity).toLocaleString()} so'm
                            {item.selectedColor && <span> • {item.selectedColor}</span>}
                            {item.selectedSize && <span> • {item.selectedSize}</span>}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-sm">Mahsulot ma'lumotlari yo'q</p>
                    )}
                  </div>
                </div>
                <div className="border-t border-slate-700 pt-3">
                  <p className="text-slate-400 text-sm">Jami summa</p>
                  <p className="text-white font-bold text-lg">{total.toLocaleString()} so'm</p>
                </div>
                <div className="bg-slate-700 p-3 rounded">
                  <p className="text-slate-400 text-xs mb-2">📍 Manzil: {customerAddress}</p>
                  <iframe
                    src={`https://yandex.uz/map-widget/v1/?ll=${longitude},${latitude}&z=15&pt=${longitude},${latitude},pm2pm0`}
                    width="100%"
                    height="250"
                    frameBorder="0"
                    style={{ borderRadius: "8px" }}
                  ></iframe>
                </div>
                <div className="border-t border-slate-700 pt-3 space-y-2">
                  <p className="text-slate-400 text-sm">📊 Holati</p>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded text-sm font-medium ${!isAccepted ? "bg-yellow-500/20 text-yellow-400" : !isShipping ? "bg-blue-500/20 text-blue-400" : !isDelivered ? "bg-purple-500/20 text-purple-400" : "bg-green-500/20 text-green-400"}`}>
                      {!isAccepted ? "Yangi" : !isShipping ? "Qabul qilgan" : !isDelivered ? "Yo'lda" : "Yetkazildi"}
                    </span>
                  </div>
                </div>
              </Card>
              <div className="space-y-2">
                {!isDelivered && (
                  <Button
                    onClick={() => {
                      if (!isAccepted) {
                        handleUpdateOrderStatus("accepted");
                      } else if (!isShipping) {
                        handleUpdateOrderStatus("shipping");
                      } else {
                        handleUpdateOrderStatus("delivered");
                      }
                    }}
                    disabled={updatingStatus}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    data-testid="button-progress"
                  >
                    {updatingStatus ? "⏳ Yangilanmoqda..." : !isAccepted ? "✅ Qabul Qilish" : !isShipping ? "🚗 Yo'lda" : "📍 Yetkazildi"}
                  </Button>
                )}
                {isDelivered && (
                  <Button
                    onClick={() => setSelectedOrder(null)}
                    variant="outline"
                    className="w-full"
                    data-testid="button-close-detail"
                  >
                    ❌ Tafsilotdan Chiqish
                  </Button>
                )}
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Buyurtmalar</h2>
            {orders.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700 p-4 text-center text-slate-400">
                Yangi buyurtma yo'q
              </Card>
            ) : (
              orders.map((assignment) => {
                const isAccepted = assignment.courierId !== undefined && assignment.courierId !== null;
                const statusLabel = assignment.status === "pending" ? "Yangi" : 
                                   assignment.status === "accepted" ? "Qabul qilgan" :
                                   assignment.status === "shipping" ? "Yo'lda" :
                                   assignment.status === "delivered" ? "Yetkazildi" :
                                   assignment.status === "rejected" ? "Rad etilgan" : assignment.status;
                
                const statusColor = assignment.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                                   assignment.status === "accepted" ? "bg-blue-500/20 text-blue-400" :
                                   assignment.status === "shipping" ? "bg-purple-500/20 text-purple-400" :
                                   assignment.status === "delivered" ? "bg-green-500/20 text-green-400" :
                                   "bg-red-500/20 text-red-400";

                return (
                  <Card
                    key={assignment.id}
                    className="bg-slate-800 border-slate-700 p-4 space-y-3"
                    data-testid={`card-order-${assignment.orderId}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-lg text-white">#${assignment.orderId?.substring(0, 6) || 'N/A'}</p>
                        <p className="text-sm text-slate-300">{new Date(assignment.assignedAt).toLocaleDateString('uz-UZ')}</p>
                      </div>
                      <span className={`px-3 py-1 rounded text-xs font-medium ${statusColor}`}>
                        {statusLabel}
                      </span>
                    </div>
                    <div className="bg-slate-700 p-3 rounded space-y-1">
                      <p className="text-white font-medium">👤 Mijoz</p>
                      <p className="text-slate-200">Telefon: +998 33 020 60 00</p>
                      <p className="text-slate-300 text-sm mt-2">📍 Manzil</p>
                    </div>
                    {!isAccepted ? (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAcceptOrder(assignment.orderId, assignment.id, assignment)}
                          disabled={acceptingOrderId === assignment.orderId}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          data-testid={`button-accept-order-${assignment.orderId}`}
                        >
                          {acceptingOrderId === assignment.orderId ? "Qabul qilinmoqda..." : "✅ Qabul Qilish"}
                        </Button>
                        <Button
                          onClick={() => handleRejectOrder(assignment.orderId, assignment.id)}
                          disabled={rejectingOrderId === assignment.orderId}
                          variant="destructive"
                          className="flex-1"
                          data-testid={`button-reject-order-${assignment.orderId}`}
                        >
                          {rejectingOrderId === assignment.orderId ? "Bekor qilinmoqda..." : "❌ Bekor Qilish"}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setSelectedOrder(assignment)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        data-testid={`button-view-order-${assignment.orderId}`}
                      >
                        📋 Tafsilotlarni Ko'rish
                      </Button>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        );

      case "settings":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Sozlamalar</h2>
            <Card className="bg-slate-800 border-slate-700 p-4 space-y-3">
              <div className="flex justify-between items-center p-3 hover:bg-slate-700 rounded cursor-pointer">
                <span>Biometric Security (Fingerprint)</span>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
              <div className="flex justify-between items-center p-3 hover:bg-slate-700 rounded cursor-pointer">
                <span>Face ID</span>
                <input type="checkbox" className="w-4 h-4" />
              </div>
              <div className="flex justify-between items-center p-3 hover:bg-slate-700 rounded cursor-pointer">
                <span>3D Secure</span>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
              <div className="flex justify-between items-center p-3 hover:bg-slate-700 rounded cursor-pointer">
                <span>Daily Limit</span>
                <span className="text-sm text-slate-400">500,000 so'm</span>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        {activeTab !== "home" && (
          <button
            onClick={() => setActiveTab("home")}
            className="p-2 hover:bg-slate-700 rounded-lg transition"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        {activeTab === "home" && <div />}
        <h1 className="text-xl font-bold">TaayyorCash</h1>
        <div />
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
}
