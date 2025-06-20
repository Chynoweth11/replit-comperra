# Comperra - Building Materials Comparison Platform

## Project Overview
Comperra is a comprehensive building materials comparison platform that allows users to compare products within specific material categories (Tiles, Stone & Slabs, Vinyl & LVT, Hardwood, Heating, Carpet) with strict category separation and no cross-category results.

## Key Features
- **Category-based Product Comparison**: Users can browse and compare materials within specific categories
- **Strict Category Filtering**: Each category shows only relevant materials with no cross-contamination
- **Product Detail Views**: Individual product pages with comprehensive specifications
- **Side-by-side Comparison**: Multi-product comparison with detailed spec tables
- **Expert Buying Guides**: 6 comprehensive guides covering all material categories with professional insights
- **Lead Capture System**: Airtable-integrated lead capture for pricing requests
- **Enhanced Web Scraping System**: Improved bulk and single product import with better specification extraction from manufacturer websites
- **Dynamic Comparison System**: Category-aware filtering, comparison tables, and specification validation using centralized field definitions
- **Security Hardened**: XSS-protected comparison system with proper HTML escaping

## Architecture
- **Frontend**: React with TypeScript, Wouter routing, TailwindCSS, shadcn/ui components
- **Backend**: Express.js with TypeScript
- **Data Storage**: In-memory storage with Material, Article, and Brand entities
- **External Integrations**: Airtable for lead capture, web scraping for product data
- **Package Management**: npm with comprehensive UI component library

## Recent Changes
- ✅ **June 20, 2025**: Built AI-powered universal specification extractor for thousands of brands and hundreds of thousands of products
- ✅ **June 20, 2025**: Implemented 5-phase intelligent extraction: content identification, pattern recognition, comprehensive field mapping, category-specific logic, and validation
- ✅ **June 20, 2025**: Added multi-pattern regex recognition with fallback chains for maximum specification capture across any website structure
- ✅ **June 20, 2025**: Enhanced field extraction with proper label/value separation to prevent contamination (e.g., Color = "YesCommercial Light")
- ✅ **June 20, 2025**: Added structured table parsing with regex fallbacks for accurate specification extraction
- ✅ **June 20, 2025**: Implemented field cleaning logic to remove boolean prefixes and common label suffixes
- ✅ **June 20, 2025**: Added comprehensive universal scraper with systematic field extraction for all categories and brands
- ✅ **June 20, 2025**: Implemented CATEGORY_FIELDS structure with complete field definitions for tiles, slabs, LVT, hardwood, heating, and carpet
- ✅ **June 20, 2025**: Enhanced scraper prioritizes universal extraction before falling back to brand-specific methods
- ✅ **June 20, 2025**: Implemented enhanced universal scraper with full page HTML text extraction and comprehensive regex patterns for hidden specifications
- ✅ **June 20, 2025**: Added deep text scanning capabilities using textMatch() function for extracting scattered specs from all page content
- ✅ **June 20, 2025**: Added category-specific field extraction (PEI, DCOF, Janka rating, coverage area, fiber type, etc.) for all manufacturers
- ✅ **June 20, 2025**: Implemented fallback text scanning with advanced regex patterns for missing specifications
- ✅ **June 20, 2025**: Enhanced image and price extraction with multiple fallback methods across all scraper functions
- ✅ **June 20, 2025**: Integrated Airtable direct saving for all scraped products with comprehensive specifications
- ✅ **June 20, 2025**: Enhanced scraper with automatic Airtable backup for product data preservation
- ✅ **June 20, 2025**: Added dual-save functionality - local storage + Airtable for complete data redundancy
- ✅ **June 20, 2025**: Implemented enhanced bulk scraping with progress tracking and Airtable integration
- ✅ **June 20, 2025**: Upgraded scraping system with full six-category support and enhanced specification templates
- ✅ **June 20, 2025**: Added category-specific spec templates (Tiles, Stone & Slabs, Vinyl & LVT, Hardwood, Heating, Carpet)
- ✅ **June 20, 2025**: Enhanced brand detection for Marazzi and Flor manufacturers
- ✅ **June 20, 2025**: Implemented template-based specification mapping for consistent data extraction
- ✅ **June 20, 2025**: Added Product URL tracking in all scraped results for full traceability
- ✅ **June 20, 2025**: Fixed comparison page synchronization - Clear All now properly updates main table checkboxes
- ✅ **June 20, 2025**: Made "Add to Compare" button functional in product detail pages with real-time state updates
- ✅ **June 20, 2025**: Enhanced product detail pages with comprehensive specifications under Technical Specifications section
- ✅ **June 20, 2025**: Added "Request Samples" buttons alongside all "Get Pricing" buttons with lead capture integration
- ✅ **June 19, 2025**: Fixed search engine with fuzzy matching, category filtering, and cross-category comparison validation
- ✅ **June 19, 2025**: Enhanced comparison system with proper specification field mapping and error handling
- ✅ **June 19, 2025**: Implemented centralized material specifications system with category-specific field definitions
- ✅ **June 19, 2025**: Enhanced product scraping system with improved specification extraction using cheerio selectors
- ✅ **June 19, 2025**: Enhanced comparison page with upgraded table component showing category-specific specifications
- ✅ **June 19, 2025**: Fixed comparison system functionality - selection, navigation, and side-by-side comparison now working perfectly
- ✅ **June 19, 2025**: Expanded product database with 38 authentic materials across all categories from major manufacturers
- ✅ **June 19, 2025**: Added FuzzySearchBar component for enhanced product search on comparison pages
- ✅ **June 19, 2025**: Implemented fuzzy search with Fuse.js for better brand and product matching with typos
- ✅ **June 19, 2025**: Added "Apply Filters" and "Clear All" buttons to category filter panel for better user control
- ✅ **June 19, 2025**: Integrated user-provided category images - authentic tile patterns, stone countertops, vinyl planks, hardwood installation, thermostat, and carpet texture
- ✅ **June 19, 2025**: Removed icon stamps from category cards and replaced with animated gradient backgrounds
- ✅ **June 19, 2025**: Fixed category grid alignment issues with flexbox layout and equal height cards
- ✅ **June 19, 2025**: Fixed Select.Item validation error in filter dropdowns by using non-empty values
- ✅ **June 19, 2025**: Improved comparison table layout with full-width display and removed sticky columns
- ✅ **June 19, 2025**: Aligned category grid layout with consistent card design and animated images
- ✅ **June 19, 2025**: Implemented category-specific filtering system with proper schema-based filters
- ✅ **June 19, 2025**: Removed category navigation from comparison pages - now only shows on homepage
- ✅ **June 19, 2025**: Fixed heating system dimensions to show coverage in square feet instead of watts
- ✅ **June 19, 2025**: Fixed ProductCompare component errors and improved localStorage integration
- ✅ **June 19, 2025**: Rebuilt product comparison page with localStorage integration and side-by-side tables
- ✅ **June 19, 2025**: Fixed article navigation - "Read Full Guide" buttons now work properly
- ✅ **June 19, 2025**: Added 6 comprehensive expert buying guides with detailed content
- ✅ **June 19, 2025**: Enhanced article schema to support full-length guide content
- ✅ **June 19, 2025**: Fixed critical XSS vulnerability in comparison table innerHTML usage
- ✅ **June 19, 2025**: Created complete static page structure (14 pages total)
- ✅ **June 19, 2025**: Added comprehensive legal pages (privacy, terms, cookies, data usage)
- ✅ **June 19, 2025**: Built category navigation and brand directory pages
- ✅ **June 19, 2025**: Implemented buying guides, installation tips, FAQ, and contact forms
- ✅ **June 19, 2025**: Fixed critical security vulnerability by removing hard-coded Airtable API key
- ✅ **June 19, 2025**: Implemented secure environment variable storage for API credentials
- ✅ **June 19, 2025**: Restored lead capture functionality with robust error handling
- ✅ **January 20, 2025**: Added Airtable-based lead capture system with secure API integration
- ✅ **January 20, 2025**: Enhanced comparison table with URL scraping and CSV upload functionality
- ✅ **January 20, 2025**: Implemented spec filtering controls and floating comparison bar

## User Preferences
- Non-technical audience: Use clear, everyday language without technical jargon
- Focus on building materials industry terminology and workflows
- Prioritize visual design and user experience
- Minimize clicks and simplify navigation between comparison features

## Technical Specifications
- **Category System**: tiles, slabs, lvt, hardwood, heat, carpet
- **Lead Capture**: Name, email, ZIP code, product interest → Airtable "Leads" table
- **Scraping Support**: Daltile, MSI, Arizona Tile, Florida Tile, AKDO, Shaw, Mohawk, Cambria
- **API Endpoints**: /api/materials, /api/save-lead, /api/scrape/single, /api/scrape/bulk
- **Comparison Features**: Multi-select, spec filtering, URL scraping, CSV bulk import

## Deployment Configuration
- Workflow: "Start application" runs `npm run dev`
- Server binding: 0.0.0.0 for Replit compatibility
- Port: 5000 (Express backend with Vite frontend integration)
- Environment: Airtable API key configured for lead capture

## Navigation Structure
- `/` - Homepage with category grid and hero section
- `/comparison/:category` - Category-specific product comparison
- `/product/:id` - Individual product detail view
- `/compare` - Multi-product side-by-side comparison
- `/admin/import` - Bulk data import interface

## Data Models
- **Material**: Product information with category-specific specifications
- **Article**: Educational content and guides
- **Brand**: Manufacturer information and metadata
- **Lead**: Captured user information for pricing requests

## Current Status
The platform is fully functional with comprehensive comparison features, lead capture integration, and bulk data import capabilities. All routing, filtering, and comparison functionality is operational with strict category separation maintained.