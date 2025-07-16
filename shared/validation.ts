import { z } from "zod";

// Enhanced validation schemas for data integrity
export const MaterialValidationSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters").max(200, "Product name too long"),
  category: z.enum(["tiles", "slabs", "lvt", "hardwood", "heat", "carpet", "thermostats"], {
    errorMap: () => ({ message: "Invalid category" })
  }),
  brand: z.string().min(1, "Brand is required").max(100, "Brand name too long"),
  price: z.union([
    z.string().regex(/^\d+(\.\d{1,2})?$/, "Price must be a valid decimal"),
    z.number().min(0, "Price must be positive")
  ]).transform(val => typeof val === 'string' ? val : val.toString()),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  description: z.string().max(1000, "Description too long").optional(),
  specifications: z.record(z.string(), z.any()).refine(
    (specs) => Object.keys(specs).length > 0,
    "At least one specification is required"
  ),
  dimensions: z.string().min(1, "Dimensions are required").max(50, "Dimensions too long"),
  sourceUrl: z.string().url("Source URL must be valid").optional(),
  createdAt: z.string().datetime("Invalid date format"),
  updatedAt: z.string().datetime("Invalid date format")
});

export const ScrapingValidationSchema = z.object({
  url: z.string().url("Must be a valid URL").refine(
    (url) => {
      const allowedDomains = [
        'msi-stone.com', 'daltile.com', 'bedrosians.com', 'shaw.com', 
        'mohawkgroup.com', 'cambria.com', 'arizonatile.com', 'emser.com',
        'floridatile.com', 'warmup.com', 'coretecfloors.com'
      ];
      return allowedDomains.some(domain => url.includes(domain));
    },
    "URL must be from a supported manufacturer"
  )
});

export const LeadValidationSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  customerEmail: z.string().email("Invalid email format"),
  customerPhone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone format").optional(),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format"),
  materialCategory: z.string().min(1, "Material category is required"),
  materialCategories: z.array(z.string()).min(1, "At least one material category required"),
  projectType: z.string().max(200, "Project type too long").optional(),
  projectDetails: z.string().max(2000, "Project details too long").optional(),
  budget: z.number().min(0, "Budget must be positive").optional(),
  timeline: z.string().max(100, "Timeline too long").optional(),
  requestType: z.enum(["pricing", "sample"], { errorMap: () => ({ message: "Invalid request type" }) }).optional(),
  customerType: z.string().max(50, "Customer type too long").optional(),
  isLookingForPro: z.boolean().optional()
});

export const UserValidationSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long").optional(),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone format").optional(),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format").optional(),
  companyName: z.string().max(200, "Company name too long").optional(),
  role: z.enum(["vendor", "trade", "customer", "homeowner"], {
    errorMap: () => ({ message: "Invalid role" })
  }),
  customerType: z.string().max(50, "Customer type too long").optional()
});

// Duplicate detection helpers
export const generateProductHash = (name: string, brand: string, category: string): string => {
  const normalized = `${name.toLowerCase().trim()}-${brand.toLowerCase().trim()}-${category.toLowerCase().trim()}`;
  return Buffer.from(normalized).toString('base64');
};

export const validateAndCleanSpecifications = (specs: Record<string, any>, category: string): Record<string, any> => {
  const cleaned: Record<string, any> = {};
  
  // Remove empty values and template variables
  Object.entries(specs).forEach(([key, value]) => {
    if (value && 
        typeof value === 'string' && 
        value.trim() !== '' && 
        value !== 'N/A' && 
        !value.includes('{{') &&
        !value.includes('}}') &&
        value.length > 1) {
      cleaned[key] = value.trim();
    }
  });
  
  // Ensure required fields exist
  if (!cleaned['Brand']) cleaned['Brand'] = 'Unknown';
  if (!cleaned['Product URL']) cleaned['Product URL'] = '';
  
  return cleaned;
};

// Enhanced error handling
export class ValidationError extends Error {
  constructor(public field: string, public message: string) {
    super(`Validation failed for ${field}: ${message}`);
    this.name = 'ValidationError';
  }
}

export const validateMaterial = (data: any) => {
  try {
    return MaterialValidationSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new ValidationError(firstError.path.join('.'), firstError.message);
    }
    throw error;
  }
};

export const validateLead = (data: any) => {
  try {
    return LeadValidationSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new ValidationError(firstError.path.join('.'), firstError.message);
    }
    throw error;
  }
};

export const validateUser = (data: any) => {
  try {
    return UserValidationSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new ValidationError(firstError.path.join('.'), firstError.message);
    }
    throw error;
  }
};