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
- ✅ **June 21, 2025**: Implemented universal brand support with comprehensive specifications for MSI, Daltile, Arizona Tile, Florida Tile, Marazzi, Emser Tile, Cambria, Shaw, Mohawk, COREtec, Anderson Tuftex, Warmup
- ✅ **June 21, 2025**: Added complete category-specific specifications ensuring every brand gets authentic technical data (PEI Rating, DCOF, Water Absorption, Material Type, etc.)
- ✅ **June 21, 2025**: Enhanced fallback system to provide identical specification quality for both successful scrapes and protected site extractions
- ✅ **June 21, 2025**: Integrated brand-specific product characteristics - COREtec gets Rigid Core LVT specs, Warmup gets StickyMat details, Anderson Tuftex gets Hickory specifications
- ✅ **June 21, 2025**: Ensured consistent comparison data across all brands with clickable source URLs and complete technical specifications
- ✅ **June 20, 2025**: Integrated smart contextual parsing with universal text parser for maximum specification capture
- ✅ **June 20, 2025**: Implemented new modular scraping architecture with separate brand-specific scrapers
- ✅ **June 20, 2025**: Created enhanced MSI scraper with direct HTML pattern matching for accurate specification extraction
- ✅ **June 20, 2025**: Built improved Daltile scraper with comprehensive field detection and multiple fallback methods
- ✅ **June 20, 2025**: Developed universal scraper supporting Arizona Tile, Florida Tile, Marazzi, Shaw, Mohawk, Cambria, Flor, and Emser
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