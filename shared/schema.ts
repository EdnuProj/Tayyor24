import { pgTable, text, varchar, integer, real, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Categories
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon"),
  latitude: real("latitude"),
  longitude: real("longitude"),
});

export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Products
export const products = pgTable("products", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  price: real("price").notNull(),
  oldPrice: real("old_price"),
  categoryId: varchar("category_id").notNull(),
  brand: text("brand"),
  images: text("images").array().notNull(),
  colors: text("colors").array(),
  sizes: text("sizes").array(),
  containers: text("containers").array(),
  stock: integer("stock").notNull().default(0),
  rating: real("rating").default(0),
  reviewCount: integer("review_count").default(0),
  isPopular: boolean("is_popular").default(false),
  isNew: boolean("is_new").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Cart Items
export const cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey(),
  sessionId: varchar("session_id").notNull(),
  productId: varchar("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  selectedColor: text("selected_color"),
  selectedSize: text("selected_size"),
  selectedContainer: text("selected_container"),
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true });
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;

// Couriers
export const couriers = pgTable("couriers", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  telegramId: text("telegram_id").notNull().unique(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  categoryId: varchar("category_id"),
  balance: real("balance").notNull().default(10000),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCourierSchema = createInsertSchema(couriers).omit({ id: true, createdAt: true });
export type InsertCourier = z.infer<typeof insertCourierSchema>;
export type Courier = typeof couriers.$inferSelect;

// Courier Assignments
export const courierAssignments = pgTable("courier_assignments", {
  id: varchar("id").primaryKey(),
  orderId: varchar("order_id").notNull(),
  courierId: varchar("courier_id"),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected, auto_assigned
  assignedAt: timestamp("assigned_at").defaultNow(),
});

export const insertCourierAssignmentSchema = createInsertSchema(courierAssignments).omit({ id: true, assignedAt: true });
export type InsertCourierAssignment = z.infer<typeof insertCourierAssignmentSchema>;
export type CourierAssignment = typeof courierAssignments.$inferSelect;

// Orders
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerAddress: text("customer_address").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  deliveryType: text("delivery_type").notNull(), // courier, pickup
  paymentType: text("payment_type").notNull(), // cash, card
  status: text("status").notNull().default("new"), // new, processing, shipping, delivered, cancelled
  subtotal: real("subtotal").notNull(),
  deliveryPrice: real("delivery_price").notNull().default(0),
  discount: real("discount").notNull().default(0),
  total: real("total").notNull(),
  promoCode: text("promo_code"),
  items: text("items").notNull(), // JSON string of order items
  categoryId: varchar("category_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export interface OrderWithAssignment extends Order {
  assignment?: CourierAssignment;
}

// Order Items (for display)
export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  categoryId?: string;
}

// Customers
export const customers = pgTable("customers", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  address: text("address"),
  totalOrders: integer("total_orders").notNull().default(0),
  totalSpent: real("total_spent").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true });
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

// Promo Codes
export const promoCodes = pgTable("promo_codes", {
  id: varchar("id").primaryKey(),
  code: text("code").notNull().unique(),
  discountPercent: integer("discount_percent").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  usageLimit: integer("usage_limit"),
  usageCount: integer("usage_count").notNull().default(0),
});

export const insertPromoCodeSchema = createInsertSchema(promoCodes).omit({ id: true });
export type InsertPromoCode = z.infer<typeof insertPromoCodeSchema>;
export type PromoCode = typeof promoCodes.$inferSelect;

// Reviews
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey(),
  productId: varchar("product_id").notNull(),
  customerName: text("customer_name").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

// Advertisements
export const advertisements = pgTable("advertisements", {
  id: varchar("id").primaryKey(),
  businessName: text("business_name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  contactPhone: text("contact_phone"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAdvertisementSchema = createInsertSchema(advertisements).omit({ id: true, createdAt: true });
export type InsertAdvertisement = z.infer<typeof insertAdvertisementSchema>;
export type Advertisement = typeof advertisements.$inferSelect;

// Newsletter/Rassilka Messages
export const newsletters = pgTable("newsletters", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNewsletterSchema = createInsertSchema(newsletters).omit({ id: true, createdAt: true });
export type InsertNewsletter = z.infer<typeof insertNewsletterSchema>;
export type Newsletter = typeof newsletters.$inferSelect;

// Site Settings
export const siteSettings = pgTable("site_settings", {
  id: varchar("id").primaryKey(),
  logoUrl: text("logo_url"),
  heroImageUrl: text("hero_image_url"),
  siteName: text("site_name").notNull().default("Do'kon"),
  primaryColor: text("primary_color").default("#7c3aed"),
  deliveryPrice: real("delivery_price").notNull().default(15000),
  freeDeliveryThreshold: real("free_delivery_threshold").default(500000),
  telegramBotToken: text("telegram_bot_token"),
  telegramGroupId: text("telegram_group_id"),
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettings).omit({ id: true });
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type SiteSettings = typeof siteSettings.$inferSelect;

// Telegram Users (Bot users)
export const telegramUsers = pgTable("telegram_users", {
  id: varchar("id").primaryKey(),
  telegramId: text("telegram_id").notNull().unique(),
  firstName: text("first_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTelegramUserSchema = createInsertSchema(telegramUsers).omit({ id: true, createdAt: true });
export type InsertTelegramUser = z.infer<typeof insertTelegramUserSchema>;
export type TelegramUser = typeof telegramUsers.$inferSelect;

// Users (Admin)
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("admin"),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Statistics types
export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  newOrdersCount: number;
  recentOrders: Order[];
  topProducts: Array<{ product: Product; salesCount: number }>;
  salesByDay: Array<{ date: string; total: number }>;
}

// Cart with product details
export interface CartItemWithProduct extends CartItem {
  product: Product;
}
