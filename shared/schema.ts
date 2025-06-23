import { pgTable, text, serial, integer, decimal, boolean, json } from "drizzle-orm/pg-core";
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

export const insertMaterialSchema = createInsertSchema(materials).omit({
  id: true,
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

export type TileSpecs = z.infer<typeof tileSpecsSchema>;
export type SlabSpecs = z.infer<typeof slabSpecsSchema>;
export type LVTSpecs = z.infer<typeof lvtSpecsSchema>;
export type HardwoodSpecs = z.infer<typeof hardwoodSpecsSchema>;
export type HeatingSpecs = z.infer<typeof heatingSpecsSchema>;
export type CarpetSpecs = z.infer<typeof carpetSpecsSchema>;
export type ThermostatSpecs = z.infer<typeof thermostatSpecsSchema>;
