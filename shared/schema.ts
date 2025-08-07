import { pgTable, text, serial, integer, decimal, boolean, json, bigserial, bigint, timestamp, uniqueIndex, uuid, numeric, geometry } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // tiles, slabs, lvt, hardwood, heat, carpet
  brand: text("brand").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  description: text("description"),
  specifications: json("specifications").notNull(), // JSON object with category-specific specs
  dimensions: text("dimensions"),
  inStock: boolean("in_stock").default(true),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content"), // Full article content
  imageUrl: text("image_url"),
  category: text("category").notNull(),
  readTime: integer("read_time").notNull(), // in minutes
  publishedAt: text("published_at").notNull(),
  slug: text("slug").notNull().unique(),
});

export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  website: text("website"),
  logoUrl: text("logo_url"),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name"),
  phone: text("phone"),
  zipCode: text("zip_code"),
  companyName: text("company_name"),
  role: text("role").notNull(), // 'vendor', 'trade', 'customer', 'homeowner'
  customerType: text("customer_type"), // 'homeowner', 'designer', 'architect', 'contractor', 'other'
  emailNotifications: boolean("email_notifications").default(true),
  smsNotifications: boolean("sms_notifications").default(false),
  newsletterSubscription: boolean("newsletter_subscription").default(true),
  profileComplete: boolean("profile_complete").default(false),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// ✅ Enhanced Scraped Products Table (with intelligent scraping improvements)
export const scrapedProducts = pgTable("scraped_products", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  url: text("url").notNull().unique(), // Unique scraped URL
  productTitle: text("product_title"),
  price: numeric("price", { precision: 10, scale: 2 }),
  imageUrl: text("image_url"),
  source: text("source"), // e.g., MSI, Daltile, etc.
  specs: json("specs"), // Flexible storage for all scraped specs like hardness, PEI, material, etc.
  productHash: text("product_hash"), // Optional hash for fuzzy deduplication
  scrapedAt: timestamp("scraped_at", { withTimezone: true }).defaultNow().notNull(),
  
  // Intelligent scraping metadata
  scrapingMethod: text("scraping_method"), // 'enhanced', 'simulation', 'intelligent'
  intelligenceScore: numeric("intelligence_score", { precision: 3, scale: 2 }), // 0.00-1.00
  specCount: integer("spec_count").default(0),
  category: text("category"), // Auto-detected category
});

// ✅ Favorites Table for "Heart" Feature (with intelligent scraping integration)
export const favorites = pgTable("favorites", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  userId: text("user_id").notNull(), // References auth.users(id)
  productId: bigint("product_id", { mode: "number" }).references(() => scrapedProducts.id, { onDelete: "cascade" }),
  materialId: integer("material_id").references(() => materials.id, { onDelete: "cascade" }), // For existing materials
  favoritedAt: timestamp("favorited_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueUserProduct: uniqueIndex("unique_user_product").on(table.userId, table.productId),
  uniqueUserMaterial: uniqueIndex("unique_user_material").on(table.userId, table.materialId),
}));

// ✅ Enhanced Profiles Table for All User Roles (with intelligent features)
export const profiles = pgTable("profiles", {
  id: text("id").primaryKey(), // UUID references auth.users(id)
  
  // Core user info
  email: text("email"),
  fullName: text("full_name"),
  phoneNumber: text("phone_number"),
  role: text("role").notNull(), // 'customer', 'vendor', 'professional'
  
  // Address fields
  zipCode: text("zip_code"),
  streetAddress: text("street_address"),
  city: text("city"),
  state: text("state"),
  
  // Optional fields for all roles
  socialLinks: text("social_links").array(),
  
  // Business-specific info (vendors/professionals only)
  businessName: text("business_name"),
  einNumber: text("ein_number"), // Required for business users
  licenseCertifications: text("license_certifications").array(), // filenames or document descriptions
  
  // Material specialties (vendors/trades) - Enhanced with intelligent categorization
  vendorCategories: text("vendor_categories").array(), // e.g., ['Tiles', 'Hardwood']
  professionalCategories: text("professional_categories").array(), // for trades
  
  // Intelligent scraping preferences
  preferredScrapingMethod: text("preferred_scraping_method").default("intelligent"), // 'enhanced', 'simulation', 'intelligent'
  autoSaveScrapedProducts: boolean("auto_save_scraped_products").default(true),
  
  // Service area and location
  serviceRadius: integer("service_radius").default(50),
  // location: geometry("location", { type: "point", mode: "xy", srid: 4326 }), // For geo-based search
  
  // Metadata
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const leads = pgTable("leads", {
  id: text("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  zipCode: text("zip_code").notNull(),
  materialCategory: text("material_category").notNull(),
  materialCategories: json("material_categories").notNull(),
  projectType: text("project_type"),
  projectDetails: text("project_details"),
  budget: integer("budget"),
  timeline: text("timeline"),
  requestType: text("request_type"), // 'pricing', 'sample'
  productSpecs: json("product_specs"),
  productUrl: text("product_url"),
  status: text("status").notNull().default('new'), // 'new', 'contacted', 'declined', 'completed'
  customerType: text("customer_type"),
  isLookingForPro: boolean("is_looking_for_pro"),
  professionalType: text("professional_type"), // 'vendor', 'trade', 'both'
  assignedTo: text("assigned_to").notNull(), // professional email
  professionalRole: text("professional_role").notNull(), // 'vendor', 'trade'
  distance: text("distance"),
  matchScore: integer("match_score"),
  matchedProfessionals: json("matched_professionals"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Note: Enhanced scraped_products and favorites tables defined above with intelligent scraping integration

// Material specifications schemas for different categories
export const tileSpecsSchema = z.object({
  peiRating: z.number().min(1).max(5),
  slipRating: z.string(), // COF value like "0.42"
  waterAbsorption: z.string(), // percentage like "< 0.5%"
  finish: z.string(),
  materialType: z.string(), // porcelain, ceramic, natural stone
});

export const slabSpecsSchema = z.object({
  thickness: z.string(), // "3cm", "2cm"
  warranty: z.string(),
  edgeOptions: z.array(z.string()),
  slabSize: z.string(),
  material: z.string(), // quartz, marble, granite, sintered stone
});

export const lvtSpecsSchema = z.object({
  wearLayer: z.string(), // "20 mil"
  coreType: z.string(), // "SPC", "WPC"
  waterproof: z.boolean(),
  installMethod: z.string(), // "floating", "glue-down"
  texture: z.string(),
});

export const hardwoodSpecsSchema = z.object({
  species: z.string(), // "Red Oak", "Maple"
  finishType: z.string(), // "Pre-finished", "Unfinished"
  plankWidth: z.string(),
  thickness: z.string(),
  construction: z.string(), // "Solid", "Engineered"
});

export const heatingSpecsSchema = z.object({
  voltage: z.string(), // "120V", "240V"
  coverage: z.string(), // "30 SF"
  features: z.array(z.string()),
  power: z.string(), // "240W"
  compatibility: z.array(z.string()),
});

export const carpetSpecsSchema = z.object({
  fiberType: z.string(), // "Nylon", "Polyester"
  stainResistance: z.string(), // "Excellent", "Good"
  pileHeight: z.string(),
  width: z.string(),
  trafficRating: z.string(),
});

export const thermostatSpecsSchema = z.object({
  deviceType: z.string(), // "Smart WiFi Thermostat"
  voltage: z.string(), // "120V/240V"
  loadCapacity: z.string(), // "15A"
  sensorType: z.string(), // "Floor/Air Sensor"
  smartFeatures: z.string(), // "WiFi Enabled"
  programmable: z.string(), // "Yes"
  displayType: z.string(), // "Color Touchscreen"
  installationType: z.string(), // "In-Wall Installation"
  ipRating: z.string(), // "IP65"
  color: z.string(), // "White"
  warranty: z.string(), // "3 Years"
});

export const insertMaterialSchema = createInsertSchema(materials).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertScrapedProductSchema = createInsertSchema(scrapedProducts).omit({
  id: true,
  scrapedAt: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  favoritedAt: true,
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
});

export const insertBrandSchema = createInsertSchema(brands).omit({
  id: true,
});

export type Material = typeof materials.$inferSelect;
export type InsertMaterial = z.infer<typeof insertMaterialSchema>;
export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Brand = typeof brands.$inferSelect;
export type InsertBrand = z.infer<typeof insertBrandSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type ScrapedProduct = typeof scrapedProducts.$inferSelect;
export type InsertScrapedProduct = z.infer<typeof insertScrapedProductSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;

export type TileSpecs = z.infer<typeof tileSpecsSchema>;
export type SlabSpecs = z.infer<typeof slabSpecsSchema>;
export type LVTSpecs = z.infer<typeof lvtSpecsSchema>;
export type HardwoodSpecs = z.infer<typeof hardwoodSpecsSchema>;
export type HeatingSpecs = z.infer<typeof heatingSpecsSchema>;
export type CarpetSpecs = z.infer<typeof carpetSpecsSchema>;
export type ThermostatSpecs = z.infer<typeof thermostatSpecsSchema>;

// Enhanced types are included above with the other types
