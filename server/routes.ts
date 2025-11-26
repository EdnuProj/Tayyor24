import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertProductSchema,
  insertCategorySchema,
  insertCartItemSchema,
  insertOrderSchema,
  insertPromoCodeSchema,
  insertReviewSchema,
  insertSiteSettingsSchema,
  insertAdvertisementSchema,
  insertNewsletterSchema,
  insertCourierSchema,
  insertCourierAssignmentSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // ========== PRODUCTS ==========
  app.get("/api/products", async (req, res) => {
    try {
      const { categoryId, popular, new: isNew, limit } = req.query;
      const products = await storage.getProducts({
        categoryId: categoryId as string,
        popular: popular === "true",
        new: isNew === "true",
        limit: limit ? parseInt(limit as string) : undefined,
      });
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:slugOrId", async (req, res) => {
    try {
      const { slugOrId } = req.params;
      let product = await storage.getProduct(slugOrId);
      if (!product) {
        product = await storage.getProductBySlug(slugOrId);
      }
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const data = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(data);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const product = await storage.updateProduct(id, req.body);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteProduct(id);
      if (!deleted) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // ========== CATEGORIES ==========
  app.get("/api/categories", async (_req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const category = await storage.getCategory(id);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch category" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const data = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(data);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  app.patch("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const category = await storage.updateCategory(id, req.body);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCategory(id);
      if (!deleted) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  // ========== CART ==========
  app.get("/api/cart", async (req, res) => {
    try {
      const { sessionId } = req.query;
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID required" });
      }
      const items = await storage.getCartItems(sessionId as string);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const data = insertCartItemSchema.parse(req.body);
      const item = await storage.addToCart(data);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to add to cart" });
    }
  });

  app.patch("/api/cart/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      const item = await storage.updateCartItem(id, quantity);
      if (!item) {
        return res.status(404).json({ error: "Cart item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.removeFromCart(id);
      if (!deleted) {
        return res.status(404).json({ error: "Cart item not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove from cart" });
    }
  });

  app.delete("/api/cart/session/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      await storage.clearCart(sessionId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to clear cart" });
    }
  });

  // ========== ORDERS ==========
  app.get("/api/orders", async (req, res) => {
    try {
      const { status, limit } = req.query;
      const orders = await storage.getOrders({
        status: status as string,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const data = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(data);

      // Send Telegram notification to admin and find couriers
      const settings = await storage.getSettings();
      if (settings.telegramBotToken && settings.telegramChatId) {
        const orderItems = JSON.parse(data.items || "[]");
        const itemsList = orderItems
          .map((item: any) => `• ${item.productName} x${item.quantity}`)
          .join("\n");

        const message = `
🆕 *Yangi Buyurtma*

📋 Raqam: #${order.orderNumber}
👤 Mijoz: ${order.customerName}
📱 Tel: ${order.customerPhone}
📍 Manzil: ${order.customerAddress}

*Mahsulotlar:*
${itemsList}

💰 Jami: ${order.total} so'm
💳 To'lov: ${order.paymentType === "cash" ? "Naqd" : "Karta"}
🚚 Yetkazish: ${order.deliveryType === "courier" ? "Kuryer" : "Olib ketish"}

Holati: Yangi
        `.trim();

        try {
          const telegramUrl = `https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`;
          await fetch(telegramUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: settings.telegramChatId,
              text: message,
              parse_mode: "Markdown",
            }),
          });
        } catch (telegramError) {
          console.error("Telegram notification failed:", telegramError);
        }

        // Send to eligible couriers if delivery is courier
        if (order.deliveryType === "courier") {
          try {
            const couriers = await storage.getCouriers(order.categoryId);
            const activeCouriers = couriers.filter((c) => c.isActive && c.telegramId);

            if (activeCouriers.length > 0) {
              // Create assignment
              const assignment = await storage.createAssignment({
                orderId: order.id,
                status: "pending",
              });

              // Send messages to couriers with buttons
              for (const courier of activeCouriers) {
                const courierMessage = `
🎯 *Yangi Buyurtma Mavjud*

📋 #${order.orderNumber}
👤 ${order.customerName} - ${order.customerPhone}
📍 ${order.customerAddress}

💰 ${order.total} so'm

Qabul qilamizmi?
                `.trim();

                const keyboard = {
                  inline_keyboard: [
                    [
                      {
                        text: "✅ Qabul qilish",
                        callback_data: `courier_accept_${order.id}_${courier.id}`,
                      },
                      {
                        text: "❌ Rad etish",
                        callback_data: `courier_reject_${order.id}_${courier.id}`,
                      },
                    ],
                  ],
                };

                await fetch(telegramUrl, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    chat_id: courier.telegramId,
                    text: courierMessage,
                    reply_markup: keyboard,
                    parse_mode: "Markdown",
                  }),
                });
              }

              // Set 15-second auto-assign timer
              setTimeout(async () => {
                const currentAssignment = await storage.getAssignment(order.id);
                if (currentAssignment && currentAssignment.status === "pending") {
                  await storage.updateAssignment(assignment.id, {
                    status: "auto_assigned",
                  });
                  console.log(`Auto-assigned order ${order.orderNumber}`);
                }
              }, 15000);
            }
          } catch (courierError) {
            console.error("Failed to send courier notifications:", courierError);
          }
        }
      }

      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.patch("/api/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const order = await storage.updateOrder(id, req.body);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to update order" });
    }
  });

  // ========== COURIERS ==========
  app.get("/api/couriers", async (req, res) => {
    try {
      const { categoryId } = req.query;
      const couriers = await storage.getCouriers(categoryId as string);
      res.json(couriers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch couriers" });
    }
  });

  app.get("/api/couriers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const courier = await storage.getCourier(id);
      if (!courier) {
        return res.status(404).json({ error: "Courier not found" });
      }
      res.json(courier);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch courier" });
    }
  });

  app.post("/api/couriers", async (req, res) => {
    try {
      const data = insertCourierSchema.parse(req.body);
      const courier = await storage.createCourier(data);
      res.status(201).json(courier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create courier" });
    }
  });

  app.patch("/api/couriers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const courier = await storage.updateCourier(id, req.body);
      if (!courier) {
        return res.status(404).json({ error: "Courier not found" });
      }
      res.json(courier);
    } catch (error) {
      res.status(500).json({ error: "Failed to update courier" });
    }
  });

  app.delete("/api/couriers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCourier(id);
      if (!deleted) {
        return res.status(404).json({ error: "Courier not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete courier" });
    }
  });

  app.patch("/api/couriers/:id/balance", async (req, res) => {
    try {
      const { id } = req.params;
      const { amount, type } = req.body; // type: "credit" or "debit"
      let courier;
      if (type === "credit") {
        courier = await storage.creditCourierBalance(id, amount);
      } else if (type === "debit") {
        courier = await storage.debitCourierBalance(id, amount);
      }
      if (!courier) {
        return res.status(404).json({ error: "Courier not found" });
      }
      res.json(courier);
    } catch (error) {
      res.status(500).json({ error: "Failed to update balance" });
    }
  });

  app.get("/api/courier-dashboard/:telegramId", async (req, res) => {
    try {
      const { telegramId } = req.params;
      const courier = await storage.getCourierByTelegramId(telegramId);
      if (!courier) {
        return res.status(404).json({ error: "Courier not found" });
      }
      const assignments = Array.from((storage as any).assignments?.values() || [])
        .filter((a: any) => a.courierId === courier.id);
      res.json({ courier, assignments });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard" });
    }
  });

  // Courier Assignment Callback (Telegram inline button callback)
  app.post("/api/telegram-callback", async (req, res) => {
    try {
      const { callback_query } = req.body;
      if (!callback_query) {
        return res.json({ ok: true }); // Telegram requires ok response
      }

      const { data, from } = callback_query;
      const telegramId = from?.id?.toString();

      // Parse callback data: courier_accept_orderId_courierId or courier_reject_orderId_courierId
      if (data?.startsWith("courier_")) {
        const [action, orderId, courierId] = data.replace("courier_", "").split("_");

        const assignment = await storage.getAssignment(orderId);
        if (assignment && assignment.status === "pending") {
          if (action === "accept") {
            await storage.updateAssignment(assignment.id, {
              courierId,
              status: "accepted",
            });
          } else if (action === "reject") {
            await storage.updateAssignment(assignment.id, {
              status: "rejected",
            });
          }
        }
      }

      res.json({ ok: true });
    } catch (error) {
      console.error("Telegram callback error:", error);
      res.json({ ok: true });
    }
  });

  // ========== CUSTOMERS ==========
  app.get("/api/customers", async (_req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer" });
    }
  });

  // ========== PROMO CODES ==========
  app.get("/api/promo-codes", async (_req, res) => {
    try {
      const codes = await storage.getPromoCodes();
      res.json(codes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch promo codes" });
    }
  });

  app.post("/api/promo-codes", async (req, res) => {
    try {
      const data = insertPromoCodeSchema.parse(req.body);
      const code = await storage.createPromoCode(data);
      res.status(201).json(code);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create promo code" });
    }
  });

  app.patch("/api/promo-codes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const code = await storage.updatePromoCode(id, req.body);
      if (!code) {
        return res.status(404).json({ error: "Promo code not found" });
      }
      res.json(code);
    } catch (error) {
      res.status(500).json({ error: "Failed to update promo code" });
    }
  });

  app.delete("/api/promo-codes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deletePromoCode(id);
      if (!deleted) {
        return res.status(404).json({ error: "Promo code not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete promo code" });
    }
  });

  app.post("/api/promo-codes/validate", async (req, res) => {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ valid: false, error: "Code required" });
      }

      const promo = await storage.getPromoCodeByCode(code);
      if (!promo) {
        return res.json({ valid: false, error: "Invalid code" });
      }

      if (!promo.isActive) {
        return res.json({ valid: false, error: "Code is not active" });
      }

      if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
        return res.json({ valid: false, error: "Code usage limit reached" });
      }

      res.json({
        valid: true,
        discountPercent: promo.discountPercent,
        code: promo.code,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to validate promo code" });
    }
  });

  // ========== REVIEWS ==========
  app.get("/api/reviews/:productId", async (req, res) => {
    try {
      const { productId } = req.params;
      const reviews = await storage.getReviews(productId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const data = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(data);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  // ========== SETTINGS ==========
  app.get("/api/settings", async (_req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.patch("/api/settings", async (req, res) => {
    try {
      const settings = await storage.updateSettings(req.body);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // ========== ADMIN STATS ==========
  app.get("/api/admin/stats", async (_req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // ========== ADVERTISEMENTS ==========
  app.get("/api/advertisements", async (req, res) => {
    try {
      const ads = await storage.getAdvertisements();
      res.json(ads);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch advertisements" });
    }
  });

  app.post("/api/admin/advertisements", async (req, res) => {
    try {
      const data = insertAdvertisementSchema.parse(req.body);
      const ad = await storage.createAdvertisement(data);
      res.status(201).json(ad);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create advertisement" });
    }
  });

  app.patch("/api/admin/advertisements/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertAdvertisementSchema.partial().parse(req.body);
      const ad = await storage.updateAdvertisement(id, data);
      res.json(ad);
    } catch (error) {
      res.status(500).json({ error: "Failed to update advertisement" });
    }
  });

  app.delete("/api/admin/advertisements/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteAdvertisement(id);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete advertisement" });
    }
  });

  // ========== NEWSLETTERS ==========
  app.get("/api/newsletters", async (req, res) => {
    try {
      const newsletters = await storage.getNewsletters();
      res.json(newsletters);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch newsletters" });
    }
  });

  app.post("/api/admin/send-newsletter", async (req, res) => {
    try {
      const { title, message, imageUrl } = req.body;
      if (!title || !message) {
        return res.status(400).json({ error: "Title and message required" });
      }

      const settings = await storage.getSettings();
      if (!settings.telegramBotToken || !settings.telegramChatId) {
        return res.status(400).json({ error: "Telegram bot not configured" });
      }

      const telegramMessage = `
📢 *${title}*

${message}
      `.trim();

      try {
        const telegramUrl = `https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`;
        await fetch(telegramUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: settings.telegramChatId,
            text: telegramMessage,
            parse_mode: "Markdown",
          }),
        });

        if (imageUrl) {
          const photoUrl = `https://api.telegram.org/bot${settings.telegramBotToken}/sendPhoto`;
          await fetch(photoUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: settings.telegramChatId,
              photo: imageUrl,
              caption: title,
              parse_mode: "Markdown",
            }),
          });
        }
      } catch (telegramError) {
        console.error("Telegram notification failed:", telegramError);
      }

      await storage.createNewsletter({ title, message, imageUrl: imageUrl || null });
      res.json({ success: true, message: "Newsletter sent successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to send newsletter" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
