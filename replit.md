# Comperra - Building Materials Comparison Platform

## Project Overview
Comperra is a comprehensive building materials comparison platform that allows users to compare products within specific material categories (Tiles, Stone & Slabs, Vinyl & LVT, Hardwood, Heating, Carpet) with strict category separation and no cross-category results.

## Key Features
- **Category-based Product Comparison**: Users can browse and compare materials within specific categories
- **Strict Category Filtering**: Each category shows only relevant materials with no cross-contamination
- **Product Detail Views**: Individual product pages with comprehensive specifications
- **Side-by-side Comparison**: Multi-product comparison with detailed spec tables
- **Lead Capture System**: Airtable-integrated lead capture for pricing requests
- **Web Scraping System**: Bulk and single product import from manufacturer websites
- **Enhanced Comparison Tools**: URL scraping, CSV upload, spec filtering, floating comparison bar

## Architecture
- **Frontend**: React with TypeScript, Wouter routing, TailwindCSS, shadcn/ui components
- **Backend**: Express.js with TypeScript
- **Data Storage**: In-memory storage with Material, Article, and Brand entities
- **External Integrations**: Airtable for lead capture, web scraping for product data
- **Package Management**: npm with comprehensive UI component library

## Recent Changes
- ✅ **January 20, 2025**: Added Airtable-based lead capture system with secure API integration
- ✅ **January 20, 2025**: Enhanced comparison table with URL scraping and CSV upload functionality
- ✅ **January 20, 2025**: Implemented spec filtering controls and floating comparison bar
- ✅ **January 20, 2025**: Added "Get Pricing" buttons for direct lead capture on products
- ✅ **January 20, 2025**: Created comprehensive comparison enhancement features

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