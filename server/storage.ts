import {
  type User,
  type InsertUser,
  type Product,
  type InsertProduct,
  type Category,
  type InsertCategory,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type Customer,
  type InsertCustomer,
  type PromoCode,
  type InsertPromoCode,
  type Review,
  type InsertReview,
  type SiteSettings,
  type InsertSiteSettings,
  type CartItemWithProduct,
  type DashboardStats,
  type Advertisement,
  type InsertAdvertisement,
  type Newsletter,
  type InsertNewsletter,
  type Courier,
  type InsertCourier,
  type CourierAssignment,
  type InsertCourierAssignment,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Products
  getProducts(filters?: {
    categoryId?: string;
    popular?: boolean;
    new?: boolean;
    limit?: number;
  }): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;

  // Cart
  getCartItems(sessionId: string): Promise<CartItemWithProduct[]>;
  getCartItem(id: string): Promise<CartItem | undefined>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: string): Promise<boolean>;
  clearCart(sessionId: string): Promise<boolean>;

  // Orders
  getOrders(filters?: { status?: string; limit?: number }): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, data: Partial<InsertOrder>): Promise<Order | undefined>;

  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerByPhone(phone: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, data: Partial<InsertCustomer>): Promise<Customer | undefined>;

  // Promo Codes
  getPromoCodes(): Promise<PromoCode[]>;
  getPromoCode(id: string): Promise<PromoCode | undefined>;
  getPromoCodeByCode(code: string): Promise<PromoCode | undefined>;
  createPromoCode(promo: InsertPromoCode): Promise<PromoCode>;
  updatePromoCode(id: string, data: Partial<InsertPromoCode>): Promise<PromoCode | undefined>;
  deletePromoCode(id: string): Promise<boolean>;
  incrementPromoUsage(id: string): Promise<void>;

  // Reviews
  getReviews(productId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Advertisements
  getAdvertisements(): Promise<Advertisement[]>;
  getAdvertisement(id: string): Promise<Advertisement | undefined>;
  createAdvertisement(ad: InsertAdvertisement): Promise<Advertisement>;
  updateAdvertisement(id: string, data: Partial<InsertAdvertisement>): Promise<Advertisement | undefined>;
  deleteAdvertisement(id: string): Promise<boolean>;

  // Newsletters
  getNewsletters(): Promise<Newsletter[]>;
  createNewsletter(newsletter: InsertNewsletter): Promise<Newsletter>;

  // Settings
  getSettings(): Promise<SiteSettings>;
  updateSettings(data: Partial<InsertSiteSettings>): Promise<SiteSettings>;

  // Couriers
  getCouriers(categoryId?: string): Promise<Courier[]>;
  getCourier(id: string): Promise<Courier | undefined>;
  getCourierByTelegramId(telegramId: string): Promise<Courier | undefined>;
  createCourier(courier: InsertCourier): Promise<Courier>;
  updateCourier(id: string, data: Partial<InsertCourier>): Promise<Courier | undefined>;
  deleteCourier(id: string): Promise<boolean>;

  // Courier Assignments
  createAssignment(assignment: InsertCourierAssignment): Promise<CourierAssignment>;
  getAssignment(orderId: string): Promise<CourierAssignment | undefined>;
  updateAssignment(id: string, data: Partial<InsertCourierAssignment>): Promise<CourierAssignment | undefined>;

  // Dashboard Stats
  getDashboardStats(): Promise<DashboardStats>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private products: Map<string, Product>;
  private categories: Map<string, Category>;
  private cartItems: Map<string, CartItem>;
  private orders: Map<string, Order>;
  private customers: Map<string, Customer>;
  private promoCodes: Map<string, PromoCode>;
  private reviews: Map<string, Review>;
  private advertisements: Map<string, Advertisement>;
  private newsletters: Map<string, Newsletter>;
  private settings: SiteSettings;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.categories = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.customers = new Map();
    this.promoCodes = new Map();
    this.reviews = new Map();
    this.advertisements = new Map();
    this.newsletters = new Map();
    this.settings = {
      id: "default",
      logoUrl: null,
      siteName: "Do'kon",
      primaryColor: "#7c3aed",
      deliveryPrice: 15000,
      freeDeliveryThreshold: 500000,
      telegramBotToken: null,
      telegramChatId: null,
    };

    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Categories
    const categories = [
      { name: "Elektronika", slug: "elektronika", icon: "📱" },
      { name: "Kiyim-kechak", slug: "kiyim-kechak", icon: "👕" },
      { name: "Uy-ro'zg'or", slug: "uy-rozgor", icon: "🏠" },
      { name: "Sport", slug: "sport", icon: "⚽" },
      { name: "Go'zallik", slug: "gozallik", icon: "💄" },
      { name: "Bolalar", slug: "bolalar", icon: "🧸" },
    ];

    categories.forEach((cat) => {
      const id = randomUUID();
      this.categories.set(id, { ...cat, id });
    });

    // Get category IDs
    const catIds = Array.from(this.categories.keys());

    // Products
    const products = [
      {
        name: "iPhone 15 Pro Max 256GB",
        slug: "iphone-15-pro-max-256gb",
        description: "Apple iPhone 15 Pro Max, A17 Pro chipset, titanium dizayn, professional kamera tizimi",
        price: 16500000,
        oldPrice: 18000000,
        categoryId: catIds[0],
        brand: "Apple",
        images: ["https://images.unsplash.com/photo-1696446702183-cbd53f2cf2b3?w=800"],
        colors: ["#1a1a2e", "#c4b5a0", "#f5f5f7"],
        sizes: null,
        stock: 25,
        rating: 4.8,
        reviewCount: 156,
        isPopular: true,
        isNew: true,
      },
      {
        name: "Samsung Galaxy S24 Ultra",
        slug: "samsung-galaxy-s24-ultra",
        description: "Samsung flagman smartfoni, AI imkoniyatlari, S Pen bilan",
        price: 15900000,
        oldPrice: null,
        categoryId: catIds[0],
        brand: "Samsung",
        images: ["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800"],
        colors: ["#1a1a1a", "#e5e1d8", "#4a4a4a"],
        sizes: null,
        stock: 18,
        rating: 4.7,
        reviewCount: 89,
        isPopular: true,
        isNew: false,
      },
      {
        name: "AirPods Pro 2",
        slug: "airpods-pro-2",
        description: "Apple AirPods Pro 2, aktiv shovqinni bostirish, adaptiv audio",
        price: 3200000,
        oldPrice: 3500000,
        categoryId: catIds[0],
        brand: "Apple",
        images: ["https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800"],
        colors: null,
        sizes: null,
        stock: 50,
        rating: 4.9,
        reviewCount: 234,
        isPopular: true,
        isNew: false,
      },
      {
        name: "Erkaklar uchun klassik ko'ylak",
        slug: "erkaklar-klassik-koylak",
        description: "100% paxta, klassik dizayn, barcha mavsumlar uchun mos",
        price: 299000,
        oldPrice: 450000,
        categoryId: catIds[1],
        brand: "Zara",
        images: ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800"],
        colors: ["#ffffff", "#1a1a2e", "#87ceeb"],
        sizes: ["S", "M", "L", "XL", "XXL"],
        stock: 120,
        rating: 4.5,
        reviewCount: 67,
        isPopular: false,
        isNew: true,
      },
      {
        name: "Ayollar uchun yozgi libos",
        slug: "ayollar-yozgi-libos",
        description: "Yengil, qulay, yozgi kunlar uchun ideal",
        price: 389000,
        oldPrice: null,
        categoryId: catIds[1],
        brand: "H&M",
        images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800"],
        colors: ["#ff6b6b", "#4ecdc4", "#ffe66d"],
        sizes: ["XS", "S", "M", "L"],
        stock: 85,
        rating: 4.3,
        reviewCount: 45,
        isPopular: true,
        isNew: true,
      },
      {
        name: "Smart soat - Galaxy Watch 6",
        slug: "galaxy-watch-6",
        description: "Samsung Galaxy Watch 6, salomatlikni kuzatish, uzoq batareya",
        price: 4500000,
        oldPrice: 5200000,
        categoryId: catIds[0],
        brand: "Samsung",
        images: ["https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800"],
        colors: ["#1a1a1a", "#f5f5f7", "#d4af37"],
        sizes: ["40mm", "44mm"],
        stock: 30,
        rating: 4.6,
        reviewCount: 78,
        isPopular: true,
        isNew: false,
      },
      {
        name: "Uy jihozlari to'plami",
        slug: "uy-jihozlari-toplami",
        description: "5 qismli oshxona anjomlar to'plami, nerjaveyushchaya stal",
        price: 850000,
        oldPrice: 1200000,
        categoryId: catIds[2],
        brand: "Tefal",
        images: ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800"],
        colors: null,
        sizes: null,
        stock: 40,
        rating: 4.4,
        reviewCount: 112,
        isPopular: false,
        isNew: false,
      },
      {
        name: "Yoga gilamlari Premium",
        slug: "yoga-gilamlari-premium",
        description: "Ekologik toza, sirpanmaydigan, 6mm qalinlik",
        price: 189000,
        oldPrice: null,
        categoryId: catIds[3],
        brand: "Nike",
        images: ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800"],
        colors: ["#4a4a4a", "#ff6b6b", "#4ecdc4", "#ffe66d"],
        sizes: null,
        stock: 75,
        rating: 4.7,
        reviewCount: 89,
        isPopular: true,
        isNew: true,
      },
    ];

    products.forEach((prod) => {
      const id = randomUUID();
      this.products.set(id, { ...prod, id, createdAt: new Date() } as Product);
    });

    // Promo Codes
    const promoCodes = [
      { code: "YANGI20", discountPercent: 20, isActive: true, usageLimit: 100, usageCount: 45 },
      { code: "CHEGIRMA10", discountPercent: 10, isActive: true, usageLimit: null, usageCount: 120 },
      { code: "VIP30", discountPercent: 30, isActive: false, usageLimit: 50, usageCount: 50 },
    ];

    promoCodes.forEach((promo) => {
      const id = randomUUID();
      this.promoCodes.set(id, { ...promo, id } as PromoCode);
    });

    // Advertisements
    const advertisements = [
      {
        businessName: "Leziz Restoran",
        description: "O'zbekcha taomlarning eng yaxshi joy. Har kunlik yangi taomlar",
        imageUrl: "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800",
        contactPhone: "+998-90-123-45-67",
        isActive: true,
      },
      {
        businessName: "Ustun Kiyim Do'koni",
        description: "Zamonaviy va klassik kiyimlarning katta assortimenti",
        imageUrl: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800",
        contactPhone: "+998-91-234-56-78",
        isActive: true,
      },
      {
        businessName: "Tech Store",
        description: "Eng yangi elektronika va gadjetlar. Muddatli to'lov mavjud",
        imageUrl: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800",
        contactPhone: "+998-93-345-67-89",
        isActive: true,
      },
      {
        businessName: "Spa va Saloon",
        description: "Professional xizmat. Soch, tun, manikyur, pedikir",
        imageUrl: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800",
        contactPhone: "+998-94-456-78-90",
        isActive: true,
      },
      {
        businessName: "Avtomobil Servisi",
        description: "Barcha modellar uchun ta'mirlash va to'qimalar",
        imageUrl: "https://images.unsplash.com/photo-1486262715619-67b519e0abe8?w=800",
        contactPhone: "+998-95-567-89-01",
        isActive: true,
      },
      {
        businessName: "O'quv Markazi",
        description: "Ingliz tili, kompyuter va boshqa fanlarni o'rganish",
        imageUrl: "https://images.unsplash.com/photo-1427504494785-cacee5b3c1e0?w=800",
        contactPhone: "+998-96-678-90-12",
        isActive: true,
      },
    ];

    advertisements.forEach((ad) => {
      const id = randomUUID();
      this.advertisements.set(id, { ...ad, id, createdAt: new Date() } as Advertisement);
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((u) => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, role: "admin" };
    this.users.set(id, user);
    return user;
  }

  // Products
  async getProducts(filters?: {
    categoryId?: string;
    popular?: boolean;
    new?: boolean;
    limit?: number;
  }): Promise<Product[]> {
    let products = Array.from(this.products.values());

    if (filters?.categoryId) {
      products = products.filter((p) => p.categoryId === filters.categoryId);
    }
    if (filters?.popular) {
      products = products.filter((p) => p.isPopular);
    }
    if (filters?.new) {
      products = products.filter((p) => p.isNew);
    }
    if (filters?.limit) {
      products = products.slice(0, filters.limit);
    }

    return products.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find((p) => p.slug === slug);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const newProduct: Product = { ...product, id, createdAt: new Date() } as Product;
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: string, data: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    const updated = { ...product, ...data };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async updateCategory(id: string, data: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    const updated = { ...category, ...data };
    this.categories.set(id, updated);
    return updated;
  }

  async deleteCategory(id: string): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Cart
  async getCartItems(sessionId: string): Promise<CartItemWithProduct[]> {
    const items = Array.from(this.cartItems.values()).filter(
      (item) => item.sessionId === sessionId
    );
    
    return items.map((item) => {
      const product = this.products.get(item.productId);
      return { ...item, product: product! };
    }).filter((item) => item.product);
  }

  async getCartItem(id: string): Promise<CartItem | undefined> {
    return this.cartItems.get(id);
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existing = Array.from(this.cartItems.values()).find(
      (i) =>
        i.sessionId === item.sessionId &&
        i.productId === item.productId &&
        i.selectedColor === item.selectedColor &&
        i.selectedSize === item.selectedSize
    );

    if (existing) {
      existing.quantity += item.quantity;
      this.cartItems.set(existing.id, existing);
      return existing;
    }

    const id = randomUUID();
    const newItem: CartItem = { ...item, id };
    this.cartItems.set(id, newItem);
    return newItem;
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem | undefined> {
    const item = this.cartItems.get(id);
    if (!item) return undefined;
    item.quantity = quantity;
    this.cartItems.set(id, item);
    return item;
  }

  async removeFromCart(id: string): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(sessionId: string): Promise<boolean> {
    const itemsToDelete = Array.from(this.cartItems.entries())
      .filter(([_, item]) => item.sessionId === sessionId)
      .map(([id]) => id);
    
    itemsToDelete.forEach((id) => this.cartItems.delete(id));
    return true;
  }

  // Orders
  async getOrders(filters?: { status?: string; limit?: number }): Promise<Order[]> {
    let orders = Array.from(this.orders.values());

    if (filters?.status) {
      orders = orders.filter((o) => o.status === filters.status);
    }

    orders.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    if (filters?.limit) {
      orders = orders.slice(0, filters.limit);
    }

    return orders;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    return Array.from(this.orders.values()).find((o) => o.orderNumber === orderNumber);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const newOrder: Order = { ...order, id, createdAt: new Date() } as Order;
    this.orders.set(id, newOrder);

    // Update or create customer
    let customer = await this.getCustomerByPhone(order.customerPhone);
    if (customer) {
      await this.updateCustomer(customer.id, {
        totalOrders: customer.totalOrders + 1,
        totalSpent: customer.totalSpent + order.total,
        address: order.customerAddress,
      });
    } else {
      await this.createCustomer({
        name: order.customerName,
        phone: order.customerPhone,
        address: order.customerAddress,
        totalOrders: 1,
        totalSpent: order.total,
      });
    }

    return newOrder;
  }

  async updateOrder(id: string, data: Partial<InsertOrder>): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    const updated = { ...order, ...data };
    this.orders.set(id, updated);
    return updated;
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values()).sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getCustomerByPhone(phone: string): Promise<Customer | undefined> {
    return Array.from(this.customers.values()).find((c) => c.phone === phone);
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const id = randomUUID();
    const newCustomer: Customer = { ...customer, id, createdAt: new Date() } as Customer;
    this.customers.set(id, newCustomer);
    return newCustomer;
  }

  async updateCustomer(id: string, data: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (!customer) return undefined;
    const updated = { ...customer, ...data };
    this.customers.set(id, updated);
    return updated;
  }

  // Promo Codes
  async getPromoCodes(): Promise<PromoCode[]> {
    return Array.from(this.promoCodes.values());
  }

  async getPromoCode(id: string): Promise<PromoCode | undefined> {
    return this.promoCodes.get(id);
  }

  async getPromoCodeByCode(code: string): Promise<PromoCode | undefined> {
    return Array.from(this.promoCodes.values()).find(
      (p) => p.code.toLowerCase() === code.toLowerCase()
    );
  }

  async createPromoCode(promo: InsertPromoCode): Promise<PromoCode> {
    const id = randomUUID();
    const newPromo: PromoCode = { ...promo, id, usageCount: 0 } as PromoCode;
    this.promoCodes.set(id, newPromo);
    return newPromo;
  }

  async updatePromoCode(id: string, data: Partial<InsertPromoCode>): Promise<PromoCode | undefined> {
    const promo = this.promoCodes.get(id);
    if (!promo) return undefined;
    const updated = { ...promo, ...data };
    this.promoCodes.set(id, updated);
    return updated;
  }

  async deletePromoCode(id: string): Promise<boolean> {
    return this.promoCodes.delete(id);
  }

  async incrementPromoUsage(id: string): Promise<void> {
    const promo = this.promoCodes.get(id);
    if (promo) {
      promo.usageCount = (promo.usageCount || 0) + 1;
      this.promoCodes.set(id, promo);
    }
  }

  // Reviews
  async getReviews(productId: string): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter((r) => r.productId === productId)
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = randomUUID();
    const newReview: Review = { ...review, id, createdAt: new Date() } as Review;
    this.reviews.set(id, newReview);

    // Update product rating
    const reviews = await this.getReviews(review.productId);
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const product = await this.getProduct(review.productId);
    if (product) {
      await this.updateProduct(product.id, {
        rating: avgRating,
        reviewCount: reviews.length,
      });
    }

    return newReview;
  }

  // Advertisements
  async getAdvertisements(): Promise<Advertisement[]> {
    return Array.from(this.advertisements.values())
      .filter((ad) => ad.isActive)
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
  }

  async getAdvertisement(id: string): Promise<Advertisement | undefined> {
    return this.advertisements.get(id);
  }

  async createAdvertisement(ad: InsertAdvertisement): Promise<Advertisement> {
    const id = randomUUID();
    const newAd: Advertisement = { ...ad, id, createdAt: new Date() } as Advertisement;
    this.advertisements.set(id, newAd);
    return newAd;
  }

  async updateAdvertisement(id: string, data: Partial<InsertAdvertisement>): Promise<Advertisement | undefined> {
    const ad = this.advertisements.get(id);
    if (!ad) return undefined;
    const updated = { ...ad, ...data };
    this.advertisements.set(id, updated);
    return updated;
  }

  async deleteAdvertisement(id: string): Promise<boolean> {
    return this.advertisements.delete(id);
  }

  // Newsletters
  async getNewsletters(): Promise<Newsletter[]> {
    return Array.from(this.newsletters.values())
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
  }

  async createNewsletter(newsletter: InsertNewsletter): Promise<Newsletter> {
    const id = randomUUID();
    const newNewsletter: Newsletter = { ...newsletter, id, createdAt: new Date() } as Newsletter;
    this.newsletters.set(id, newNewsletter);
    return newNewsletter;
  }

  // Settings
  async getSettings(): Promise<SiteSettings> {
    return this.settings;
  }

  async updateSettings(data: Partial<InsertSiteSettings>): Promise<SiteSettings> {
    this.settings = { ...this.settings, ...data };
    return this.settings;
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const orders = Array.from(this.orders.values());
    const products = Array.from(this.products.values());
    const customers = Array.from(this.customers.values());

    const totalRevenue = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total, 0);

    const newOrdersCount = orders.filter((o) => o.status === "new").length;

    const recentOrders = orders
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5);

    const topProducts = products
      .filter((p) => p.isPopular)
      .slice(0, 5)
      .map((p) => ({ product: p, salesCount: Math.floor(Math.random() * 100) + 10 }));

    // Generate mock sales by day
    const salesByDay = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toISOString().split("T")[0],
        total: Math.floor(Math.random() * 5000000) + 1000000,
      };
    }).reverse();

    return {
      totalOrders: orders.length,
      totalRevenue,
      totalCustomers: customers.length,
      totalProducts: products.length,
      newOrdersCount,
      recentOrders,
      topProducts,
      salesByDay,
    };
  }
}

export const storage = new MemStorage();
