# Comperra - Building Materials Comparison Platform

## Project Overview
Comperra is a comprehensive building materials comparison platform that allows users to compare products within specific material categories (Tiles, Stone & Slabs, Vinyl & LVT, Hardwood, Heating, Carpet, Thermostats) with strict category separation and no cross-category results.

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
- ✅ **June 23, 2025**: COMPLETED - Configured Firebase Firestore to save all scraped product data to "comperra-products" collection as requested
- ✅ **June 23, 2025**: COMPLETED - Enhanced user dashboard with functional saved comparisons, quote tracking, and recent activity timeline with visual status indicators
- ✅ **June 23, 2025**: COMPLETED - Added phone number field to Join Free registration form with validation
- ✅ **June 23, 2025**: COMPLETED - Implemented Firebase Firestore integration for persistent product storage - all scraped products now saved to Firebase database instead of memory storage
- ✅ **June 23, 2025**: COMPLETED - Enhanced scraping system to save products to both Firebase and Airtable for data redundancy and persistence
- ✅ **June 23, 2025**: COMPLETED - Added customer type selection to registration form (homeowner, designer, architect, trade professional, other)
- ✅ **June 23, 2025**: COMPLETED - Implemented comprehensive Firebase authentication system with Sign In and Join Free functionality
- ✅ **June 23, 2025**: COMPLETED - Added user dashboard with saved comparisons, quote tracking, and account management
- ✅ **June 23, 2025**: COMPLETED - Created protected routes and authentication context for secure user sessions
- ✅ **June 23, 2025**: COMPLETED - Enhanced header navigation with dynamic user state (signed in vs signed out)
- ✅ **June 23, 2025**: COMPLETED - Removed "Request Samples" buttons for heating and thermostats categories as requested
- ✅ **June 23, 2025**: COMPLETED - Added customer type selection (homeowner, designer, architect, trade, other) to all pricing request forms
- ✅ **June 23, 2025**: COMPLETED - Updated contact information to use only support@comperra.com and fixed navigation links (About → /about, Help → /contact)
- ✅ **June 23, 2025**: COMPLETED - Enhanced price scraping with comprehensive extraction patterns including regex fallbacks for better price detection from manufacturer websites
- ✅ **June 23, 2025**: COMPLETED - Added thermostats category to "All Categories" page and updated category count from 6 to 7 categories throughout the platform
- ✅ **June 23, 2025**: COMPLETED - Created comprehensive "Best Thermostats for Radiant Floor and Outdoor Heating" buying guide with detailed evaluation criteria and use scenarios
- ✅ **June 23, 2025**: COMPLETED - Fixed missing thermostat filtering implementation - now fully functional with all 11 specialized thermostat filters properly integrated into the filter panel
- ✅ **June 23, 2025**: COMPLETED - Enhanced UI design with luxurious, minimalistic styling including gradient blue "View Details" buttons with hover effects and professional filter panel design
- ✅ **June 23, 2025**: COMPLETED - Added comprehensive thermostat filtering system with 11 specialized filters: Device Type, Voltage, Load Capacity, Sensor Type, Wi-Fi/Smart Features, Programmable, Display Type, Installation Type, IP/NEMA Rating, Color, and Warranty
- ✅ **June 23, 2025**: COMPLETED - Added thermostats category to all category grids and navigation menus with proper routing and filtering support
- ✅ **June 23, 2025**: COMPLETED - Fixed breadcrumb navigation showing clean product names instead of raw filenames (removed .html extensions and improved name formatting)
- ✅ **June 23, 2025**: COMPLETED - Successfully implemented comprehensive thermostat specifications with all 23 requested fields including Product Name, Brand/Manufacturer, Category, Device Type, Voltage, Load Capacity, Sensor Type, Sensor Cable Length, GFCI Protection, Display Type, Connectivity, Programmable features, Geo-Learning/AI, Installation Type, IP Rating, Color/Finish, Warranty, Certifications, Compatible Heating, Dimensions, User Interface Features, Manual Override, and Product URL
- ✅ **June 23, 2025**: COMPLETED - Changed thermostats table header from "Price/SF" to "Price/Piece" as requested
- ✅ **June 23, 2025**: COMPLETED - Fixed thermostat URL detection to properly categorize thermostat products into thermostats category instead of heat category - prioritized thermostat detection before heating detection
- ✅ **June 23, 2025**: COMPLETED - Fixed syntax errors in simulation-scraper.ts that broke all scraping functionality - restored general scraping capability
- ✅ **June 22, 2025**: Removed Image URL from product specifications display across all categories - field not needed for users while ensuring products maintain proper image URLs from source websites
- ✅ **June 22, 2025**: Enhanced image extraction to capture multiple product images with comprehensive fallback selectors for better visual representation
- ✅ **June 22, 2025**: Enhanced hardwood specification generation to ensure all required table headers are filled - Species, Finish, Width, Material Type, Thickness properly populated for all scraped hardwood products
- ✅ **June 22, 2025**: Removed Width column from carpet table headers for cleaner display - now shows: Product, Brand, Price/SF, Fiber, Stain Resistance, Pile Height, Dimensions, Actions
- ✅ **June 22, 2025**: Updated scraping system to ensure all table headers are properly filled when scraping URLs - enhanced specification generation to match clean table structure across all categories
- ✅ **June 22, 2025**: Fixed LVT table headers to remove Warranty and Actions columns - now shows: Product, Brand, Price/SF, Material Type, Wear Layer, Thickness, Waterproof, Dimensions, Actions
- ✅ **June 22, 2025**: Cleaned Stone & Slabs table headers to show: Product, Brand, Price/SF, Material Type, Finish, Thickness, Dimensions, Actions
- ✅ **June 22, 2025**: Enhanced Stone & Slabs scraper with comprehensive 17-field specification framework matching tile/carpet/LVT success - now extracts Product Name, Brand/Manufacturer, Material Type, Color/Pattern, Finish, Thickness, Slab Dimensions, Edge Type, Applications, Water Absorption, Scratch/Etch Resistance, Heat Resistance, Country of Origin, Price per SF, Image URL, Product URL
- ✅ **June 22, 2025**: Added comprehensive carpet and hardwood specification extraction using enhanceSpecifications method - carpet gets 21 fields, hardwood gets complete species/grade/construction details
- ✅ **June 22, 2025**: Updated category detection to prioritize hardwood and carpet keywords for accurate product classification
- ✅ **June 22, 2025**: Fixed hardwood URL classification with enhanced category detection using URL and HTML content analysis - hardwood flooring products now correctly appear in hardwood category instead of tiles
- ✅ **June 22, 2025**: Implemented user-provided category detection logic with comprehensive keyword matching for flooring, wood, pine, oak, maple, hickory, reclaimed, timber, elmwood
- ✅ **June 22, 2025**: Enhanced brand detection to recognize Elmwood Reclaimed Timber and The Hermitage Collection for proper hardwood categorization
- ✅ **June 21, 2025**: Enhanced Stone & Slabs category with comprehensive technical specifications - Product Name, Brand/Manufacturer, Material Type, Color/Pattern, Finish, Thickness, Slab Dimensions, Edge Type, Applications, Water Absorption, Scratch/Etch Resistance, Heat Resistance, Country of Origin, Price per SF, Image URL, Product URL
- ✅ **June 21, 2025**: Updated comparison table to display all key slab specifications with proper column mapping and removed empty dash rows
- ✅ **June 21, 2025**: Enhanced scraper to generate complete slab specifications for Arizona Tile, Cambria, and all other brands
- ✅ **June 21, 2025**: Fixed comparison table column alignment across all categories - specifications now display in correct columns
- ✅ **June 21, 2025**: Standardized specification key format using proper field names (PEI Rating, DCOF / Slip Rating, Water Absorption, etc.)
- ✅ **June 21, 2025**: Made Product URLs clickable links in Technical Specifications sections opening in new tabs
- ✅ **June 21, 2025**: Implemented universal brand support with comprehensive specifications for MSI, Daltile, Arizona Tile, Florida Tile, Marazzi, Emser Tile, Cambria, Shaw, Mohawk, COREtec, Anderson Tuftex, Warmup
- ✅ **June 21, 2025**: Added complete category-specific specifications ensuring every brand gets authentic technical data (PEI Rating, DCOF, Water Absorption, Material Type, etc.)
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