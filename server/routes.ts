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
  // Auto-setup Telegram webhook on server start
  const setupTelegramWebhook = async () => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) return;
    
    try {
      const webhookUrl = `https://${process.env.REPLIT_DOMAINS || 'localhost'}/api/telegram-webhook`;
      const setWebhookUrl = `https://api.telegram.org/bot${botToken}/setWebhook`;
      
      const response = await fetch(setWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: webhookUrl, drop_pending_updates: false }),
      });
      
      if (response.ok) {
        console.log("✅ Telegram webhook configured at startup");
      }
    } catch (error) {
      console.log("ℹ️ Telegram webhook setup skipped at startup");
    }
  };

  // Setup webhook after a short delay
  setTimeout(setupTelegramWebhook, 2000);

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
      // Set default categoryId if not provided
      if (!data.categoryId) {
        data.categoryId = "elektronika";
      }
      const order = await storage.createOrder(data);

      // Send Telegram notification to group
      const settings = await storage.getSettings();
      if (settings.telegramBotToken && settings.telegramGroupId) {
        const telegramUrl = `https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`;
        
        // Send to group
        const orderItems = JSON.parse(data.items || "[]");
        const itemsList = orderItems
          .map((item: any) => `• ${item.productName} x${item.quantity}`)
          .join("\n");

        const message = `
📦 *BUYURTMA*

Raqam: #${order.orderNumber}
👤 Mijoz: ${order.customerName}
📞 Tel: ${order.customerPhone}
📍 Manzil: ${order.customerAddress}

🛍️ *Mahsulotlar:*
${itemsList}

💰 Jami: ${order.total} so'm
💳 To'lov: ${order.paymentType === "cash" ? "Naqd" : "Karta"}
🚚 Yetkazish: ${order.deliveryType === "courier" ? "Kuryer" : "Olib ketish"}

✅ Holati: Yangi
        `.trim();

        try {
          await fetch(telegramUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: settings.telegramGroupId,
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
            // Get ALL active couriers (no category filtering)
            const allCouriers = await storage.getCouriers("");
            const activeCouriers = allCouriers.filter((c) => c.isActive && c.telegramId);
            
            console.log(`Order ${order.orderNumber}: Sending to ${activeCouriers.length} active couriers`);

            // Always create assignment for pending orders
            const assignment = await storage.createAssignment({
              orderId: order.id,
              status: "pending",
            });
            
            console.log(`Created assignment ${assignment.id} for order ${order.orderNumber}, ${activeCouriers.length} active couriers found`);

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
                
                // Send notification to group about auto-assignment
                try {
                  const autoAssignMessage = `
🤖 *AVTOMATIK TAQSIMOT*

Buyurtma: #${order.orderNumber}
👤 Mijoz: ${order.customerName}
📞 Tel: ${order.customerPhone}
📍 Manzil: ${order.customerAddress}

💰 Jami: ${order.total} so'm

⚠️ 15 soniyada hech kim qabul qilmadi, avtomatik taqsimot amalga oshdi
                  `.trim();
                  
                  console.log("Sending auto-assign notification to group...");
                  const telegramResponse = await fetch(telegramUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      chat_id: settings.telegramGroupId,
                      text: autoAssignMessage,
                      parse_mode: "Markdown",
                    }),
                  });
                  
                  if (telegramResponse.ok) {
                    console.log("✅ Auto-assign notification sent to group successfully");
                  } else {
                    console.error("Auto-assign notification failed:", telegramResponse.status);
                  }
                } catch (autoAssignError) {
                  console.error("Failed to send auto-assign notification:", autoAssignError);
                }
              }
            }, 15000);
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
      
      const numAmount = parseInt(amount) || 0;
      if (numAmount <= 0) {
        return res.status(400).json({ error: "Amount must be greater than 0" });
      }

      let courier;
      if (type === "credit") {
        courier = await storage.creditCourierBalance(id, numAmount);
      } else if (type === "debit") {
        courier = await storage.debitCourierBalance(id, numAmount);
      }
      if (!courier) {
        return res.status(404).json({ error: "Courier not found" });
      }
      res.json(courier);
    } catch (error) {
      console.error("Balance update error:", error);
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
      
      // Get all assignments - both pending (available) and this courier's accepted orders
      const allAssignments = Array.from((storage as any).assignments?.values() || []);
      const assignments = allAssignments.filter((a: any) => {
        // Pending orders available for any courier to accept
        if (a.status === "pending" && !a.courierId) {
          return true;
        }
        // Orders this courier has accepted
        if (a.courierId === courier.id) {
          return true;
        }
        return false;
      });
      
      console.log(`Dashboard for courier ${courier.id}: ${assignments.length} assignments (${allAssignments.length} total)`);
      res.json({ courier, assignments });
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      res.status(500).json({ error: "Failed to fetch dashboard" });
    }
  });

  // Setup Telegram Bot Webhook
  app.post("/api/admin/setup-telegram-webhook", async (req, res) => {
    try {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (!botToken) {
        return res.status(400).json({ error: "Telegram bot token not configured" });
      }

      const webhookUrl = `https://${process.env.REPLIT_DOMAINS || 'localhost'}/api/telegram-webhook`;
      
      // Set webhook
      const setWebhookUrl = `https://api.telegram.org/bot${botToken}/setWebhook`;
      const webhookResponse = await fetch(setWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: webhookUrl,
          drop_pending_updates: false,
        }),
      });
      
      const webhookData = await webhookResponse.json();
      
      // Set bot commands
      const commandsUrl = `https://api.telegram.org/bot${botToken}/setMyCommands`;
      await fetch(commandsUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commands: [
            { command: "start", description: "Do'konni Ochish" },
            { command: "help", description: "Yordam" },
          ],
        }),
      });

      // Set bot info
      const botInfoUrl = `https://api.telegram.org/bot${botToken}/setMyDefaultAdministratorRights`;
      await fetch(botInfoUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rights: {
            is_anonymous: false,
            can_manage_chat: false,
            can_delete_messages: false,
            can_manage_voice_chats: false,
            can_restrict_members: false,
            can_promote_members: false,
            can_change_info: false,
            can_invite_users: true,
            can_pin_messages: false,
            can_manage_topics: false,
          },
          for_channels: false,
        }),
      });

      res.json({ 
        success: true, 
        message: "Telegram bot webhook configured successfully",
        webhookUrl,
        details: webhookData,
      });
    } catch (error) {
      console.error("Webhook setup error:", error);
      res.status(500).json({ error: "Failed to setup webhook" });
    }
  });

  // Telegram Webhook - Receives messages and callbacks from Telegram
  app.post("/api/telegram-webhook", async (req, res) => {
    try {
      const update = req.body;
      
      // Handle callback queries (button clicks)
      if (update.callback_query) {
        const { data, from, id: queryId } = update.callback_query;
        const telegramId = from?.id?.toString();

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
        return res.json({ ok: true });
      }

      // Handle text messages
      if (update.message) {
        const { text, chat, from } = update.message;
        const chatId = chat?.id?.toString();
        const botToken = process.env.TELEGRAM_BOT_TOKEN;

        if (!botToken) {
          return res.json({ ok: true });
        }

        // Handle /start command
        if (text === "/start") {
          // Save telegram user
          await (storage as any).createTelegramUser({
            telegramId: chatId,
            firstName: from?.first_name,
          });

          const baseDomain = process.env.REPLIT_DOMAINS || "do-kon.replit.dev";
          const baseUrl = `https://${baseDomain}`;
          
          // Check if this is a courier
          const courier = await storage.getCourierByTelegramId(chatId);
          
          if (courier) {
            // Courier app - TaayyorCash
            const courierAppUrl = `${baseUrl}/courier/payme?telegramId=${chatId}`;
            const inlineKeyboard = {
              inline_keyboard: [
                [{ text: "💳 TaayyorCash", web_app: { url: courierAppUrl } }],
              ],
            };

            const botUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
            await fetch(botUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: chatId,
                text: "*Xush Kelibsiz, Kuryer!* 🚚\n\nYour delivery dashboard",
                parse_mode: "Markdown",
                reply_markup: inlineKeyboard,
              }),
            });
          } else {
            // Regular customer app
            const inlineKeyboard = {
              inline_keyboard: [
                [{ text: "📱 Do'kon Ochish", web_app: { url: baseUrl } }],
              ],
            };

            const botUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
            await fetch(botUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: chatId,
                text: "*Do'kon-ga Xush Kelibsiz!* 🛍️\n\nMahsulotlarni ko'ring va buyurtma bering.",
                parse_mode: "Markdown",
                reply_markup: inlineKeyboard,
              }),
            });
          }

          return res.json({ ok: true });
        }

        // Handle category selection
        if (text && text.startsWith("/cat_")) {
          const categoryId = text.replace("/cat_", "");
          const products = await storage.getProducts({ categoryId });

          if (products.length === 0) {
            const botUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
            await fetch(botUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: chatId,
                text: "Bu kategoriyada mahsulot topilmadi.",
              }),
            });
            return res.json({ ok: true });
          }

          const siteUrl = process.env.SITE_URL || "https://do-kon.replit.dev";

          // Send first 5 products
          for (const product of products.slice(0, 5)) {
            const inlineBtn = {
              inline_keyboard: [
                [
                  {
                    text: "Saytda Ko'rish",
                    url: `${siteUrl}/product/${product.slug}`,
                  },
                ],
              ],
            };

            const botUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
            await fetch(botUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: chatId,
                text: `${product.name}\n\nNarx: ${product.price} so'm\n\n${product.description || ""}`,
                reply_markup: inlineBtn,
              }),
            });
          }

          return res.json({ ok: true });
        }

        // Fallback - show menu for any other message
        const siteUrl = process.env.REPLIT_DOMAINS 
          ? `https://${process.env.REPLIT_DOMAINS}`
          : "https://do-kon.replit.dev";
        
        const inlineKeyboard = {
          inline_keyboard: [
            [{ text: "📱 Do'kon Ochish", web_app: { url: siteUrl } }],
          ],
        };

        const botUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        await fetch(botUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "*Do'kon-ga Xush Kelibsiz!* 🛍️\n\nMahsulotlarni ko'ring va buyurtma bering.",
            parse_mode: "Markdown",
            reply_markup: inlineKeyboard,
          }),
        });

        return res.json({ ok: true });
      }

      res.json({ ok: true });
    } catch (error) {
      console.error("Telegram webhook error:", error);
      res.json({ ok: true });
    }
  });

  // Courier Assignment Callback (Telegram inline button callback) - Legacy, kept for compatibility
  app.post("/api/telegram-callback", async (req, res) => {
    try {
      const { callback_query } = req.body;
      if (!callback_query) {
        return res.json({ ok: true });
      }

      const { data, from } = callback_query;
      const telegramId = from?.id?.toString();

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

  // ========== COURIER DASHBOARD ==========
  app.get("/api/courier-dashboard/:telegramId", async (req, res) => {
    try {
      const { telegramId } = req.params;
      const courier = await storage.getCourierByTelegramId(telegramId);
      
      if (!courier) {
        return res.status(404).json({ error: "Courier not found" });
      }

      // Get all assignments - both pending (not assigned to any courier yet) and those assigned to this courier
      const allAssignments = Array.from((storage as any).assignments?.values?.() || []) as any[];
      
      console.log(`Dashboard: Got ${allAssignments.length} total assignments`);
      console.log(`Dashboard: Courier ID = ${courier.id}`);
      
      const assignments = allAssignments.filter((a) => {
        // Show pending assignments (not yet accepted by any courier)
        if (a.status === "pending" && !a.courierId) {
          console.log(`Dashboard: Including pending assignment ${a.id}`);
          return true;
        }
        // Show assignments accepted by this courier
        if (a.courierId === courier.id) {
          console.log(`Dashboard: Including courier's assignment ${a.id}`);
          return true;
        }
        return false;
      });

      console.log(`Dashboard: Filtered to ${assignments.length} assignments for courier`);

      const transactions = await (storage as any).getCourierTransactions(courier.id);

      res.json({
        courier,
        assignments,
        transactions,
      });
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      res.status(500).json({ error: "Failed to fetch courier dashboard" });
    }
  });

  app.post("/api/courier/topup", async (req, res) => {
    try {
      const { telegramId, amount } = req.body;
      if (!telegramId || !amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid request" });
      }

      const courier = await storage.getCourierByTelegramId(telegramId);
      if (!courier) {
        return res.status(404).json({ error: "Courier not found" });
      }

      const updated = await storage.creditCourierBalance(courier.id, amount);
      await (storage as any).createCourierTransaction(
        courier.id,
        amount,
        "topup_credit",
        `Topup: +${amount} so'm`
      );

      res.json({ success: true, newBalance: updated?.balance || 0 });
    } catch (error) {
      res.status(500).json({ error: "Failed to process topup" });
    }
  });

  app.post("/api/courier/accept-order", async (req, res) => {
    try {
      const { orderId, assignmentId, telegramId } = req.body;
      if (!orderId || !assignmentId || !telegramId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Get courier info
      const courier = await storage.getCourierByTelegramId(telegramId);
      if (!courier) {
        return res.status(404).json({ error: "Courier not found" });
      }

      // Update assignment to accepted
      const assignment = await storage.updateAssignment(assignmentId, {
        status: "accepted",
        courierId: courier.id,
      });

      // Get order info
      const order = await storage.getOrder(orderId);

      // Send notification to group
      const settings = await storage.getSettings();
      if (settings.telegramBotToken && settings.telegramGroupId && order) {
        const message = `
✅ *BUYURTMA OLIB OLINDI*

Buyurtma: #${order.orderNumber}
👤 Kuryer: ${courier.name}
📞 Telefon: ${courier.phone}
        `.trim();

        try {
          const telegramUrl = `https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`;
          await fetch(telegramUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: settings.telegramGroupId,
              text: message,
              parse_mode: "Markdown",
            }),
          });
        } catch (telegramError) {
          console.error("Telegram notification failed:", telegramError);
        }
      }

      res.json({ success: true, assignment });
    } catch (error) {
      console.error("Accept order error:", error);
      res.status(500).json({ error: "Failed to accept order" });
    }
  });

  app.post("/api/courier/reject-order", async (req, res) => {
    try {
      const { orderId, assignmentId, telegramId } = req.body;
      if (!orderId || !assignmentId || !telegramId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Get courier info
      const courier = await storage.getCourierByTelegramId(telegramId);
      if (!courier) {
        return res.status(404).json({ error: "Courier not found" });
      }

      // Update assignment to rejected
      await storage.updateAssignment(assignmentId, {
        status: "rejected",
      });

      // Update order status to rejected
      const order = await storage.updateOrder(orderId, { status: "rejected" });

      // Send notification to group
      const settings = await storage.getSettings();
      if (settings.telegramBotToken && settings.telegramGroupId && order) {
        const message = `
❌ *BUYURTMA BEKOR QILINGAN*

Buyurtma: #${order.orderNumber}
👤 Kuryer: ${courier.name}
Sababu: Redd etilgan
        `.trim();

        try {
          const telegramUrl = `https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`;
          await fetch(telegramUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: settings.telegramGroupId,
              text: message,
              parse_mode: "Markdown",
            }),
          });
        } catch (telegramError) {
          console.error("Telegram notification failed:", telegramError);
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Reject order error:", error);
      res.status(500).json({ error: "Failed to reject order" });
    }
  });

  app.post("/api/courier/update-order-status", async (req, res) => {
    try {
      const { orderId, status } = req.body;
      if (!orderId || !status) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Update order status
      const order = await storage.updateOrder(orderId, { status });
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Send notification to group
      const settings = await storage.getSettings();
      if (settings.telegramBotToken && settings.telegramGroupId) {
        let statusText = "";
        if (status === "accepted") statusText = "⏳ JARAYONDA";
        else if (status === "shipping") statusText = "🚗 YO'LDA";
        else if (status === "delivered") statusText = "✅ YETKAZILDI";

        if (statusText) {
          const message = `
${statusText}

Buyurtma: #${order.orderNumber}
Mijoz: ${order.customerName}
📞 ${order.customerPhone}

Jami: ${order.total} so'm
          `.trim();

          try {
            const telegramUrl = `https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`;
            await fetch(telegramUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: settings.telegramGroupId,
                text: message,
                parse_mode: "Markdown",
              }),
            });
          } catch (telegramError) {
            console.error("Telegram notification failed:", telegramError);
          }
        }
      }

      res.json({ success: true, order });
    } catch (error) {
      console.error("Update order status error:", error);
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  app.post("/api/courier/transfer", async (req, res) => {
    try {
      const { fromTelegramId, toCardNumber, amount } = req.body;
      if (!fromTelegramId || !toCardNumber || !amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid request" });
      }

      // Get sender courier
      const senderCourier = await storage.getCourierByTelegramId(fromTelegramId);
      if (!senderCourier) {
        return res.status(404).json({ error: "Sender courier not found" });
      }

      if (senderCourier.balance < amount) {
        return res.status(400).json({ error: "Insufficient balance" });
      }

      // Find receiver courier by card number
      const allCouriers = await storage.getCouriers();
      const receiverCourier = allCouriers.find((c) => c.cardNumber === toCardNumber);
      if (!receiverCourier) {
        return res.status(404).json({ error: "Receiver courier not found" });
      }

      // Process transfer
      const sender = await storage.debitCourierBalance(senderCourier.id, amount);
      const receiver = await storage.creditCourierBalance(receiverCourier.id, amount);

      // Record transactions with card details
      await (storage as any).createCourierTransaction(
        senderCourier.id,
        -amount,
        "order_debit",
        `${receiverCourier.name} - ${receiverCourier.cardNumber} ga ${amount} so'm o'tkazildi`
      );

      await (storage as any).createCourierTransaction(
        receiverCourier.id,
        amount,
        "topup_credit",
        `${senderCourier.name} - ${senderCourier.cardNumber} dan ${amount} so'm qabul qilingan`
      );

      res.json({ 
        success: true, 
        message: `O'tkazildi: ${receiverCourier.name} ga ${amount} so'm`,
        senderBalance: sender?.balance || 0,
        receiverBalance: receiver?.balance || 0
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to process transfer" });
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

      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (!botToken) {
        return res.status(400).json({ error: "Telegram bot token not configured" });
      }

      const telegramUsers = await (storage as any).getTelegramUsers();
      if (telegramUsers.length === 0) {
        return res.status(400).json({ error: "No users have started the bot yet" });
      }

      const telegramMessage = `
${title}

${message}
      `.trim();

      let sentCount = 0;
      for (const user of telegramUsers) {
        try {
          if (imageUrl) {
            const photoUrl = `https://api.telegram.org/bot${botToken}/sendPhoto`;
            const formData = new FormData();
            formData.append("chat_id", user.telegramId);
            formData.append("caption", `${title}\n\n${message}`);
            formData.append("parse_mode", "HTML");

            if (imageUrl.startsWith("data:")) {
              const base64Data = imageUrl.split(",")[1];
              const buffer = Buffer.from(base64Data, "base64");
              const blob = new Blob([buffer], { type: "image/jpeg" });
              formData.append("photo", blob, "image.jpg");
            } else {
              formData.append("photo", imageUrl);
            }

            const res = await fetch(photoUrl, {
              method: "POST",
              body: formData,
            });
            if (res.ok) sentCount++;
          } else {
            const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
            const res = await fetch(telegramUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: user.telegramId,
                text: telegramMessage,
                parse_mode: "HTML",
              }),
            });
            if (res.ok) sentCount++;
          }
        } catch (userError) {
          console.error(`Failed to send message to user ${user.telegramId}:`, userError);
        }
      }

      await storage.createNewsletter({ title, message, imageUrl: imageUrl || null });
      res.json({ 
        success: true, 
        message: `Newsletter sent to ${sentCount} out of ${telegramUsers.length} users`,
        sentCount,
        totalUsers: telegramUsers.length
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to send newsletter" });
    }
  });

  app.post("/api/admin/send-courier-rassilka", async (req, res) => {
    try {
      const { title, message, imageUrl } = req.body;
      if (!title || !message) {
        return res.status(400).json({ error: "Title and message required" });
      }

      const settings = await storage.getSettings();
      if (!settings.telegramBotToken) {
        return res.status(400).json({ error: "Telegram bot not configured" });
      }

      const couriers = await storage.getCouriers();
      const activeCouriers = couriers.filter((c) => c.isActive && c.telegramId);

      if (activeCouriers.length === 0) {
        return res.status(400).json({ error: "No active couriers found" });
      }

      const telegramMessage = `
📢 *${title}*

${message}
      `.trim();

      const telegramUrl = `https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`;
      const photoUrl = `https://api.telegram.org/bot${settings.telegramBotToken}/sendPhoto`;

      for (const courier of activeCouriers) {
        try {
          if (imageUrl) {
            const formData = new FormData();
            formData.append("chat_id", courier.telegramId);
            formData.append("caption", telegramMessage);
            formData.append("parse_mode", "Markdown");

            if (imageUrl.startsWith("data:")) {
              const base64Data = imageUrl.split(",")[1];
              const buffer = Buffer.from(base64Data, "base64");
              const blob = new Blob([buffer], { type: "image/jpeg" });
              formData.append("photo", blob, "image.jpg");
            } else {
              formData.append("photo", imageUrl);
            }

            await fetch(photoUrl, {
              method: "POST",
              body: formData,
            });
          } else {
            await fetch(telegramUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: courier.telegramId,
                text: telegramMessage,
                parse_mode: "Markdown",
              }),
            });
          }
        } catch (courierError) {
          console.error(`Failed to send message to courier ${courier.id}:`, courierError);
        }
      }

      res.json({ success: true, message: `Rassilka ${activeCouriers.length} ta kuryerga yuborildi` });
    } catch (error) {
      res.status(500).json({ error: "Failed to send courier rassilka" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
