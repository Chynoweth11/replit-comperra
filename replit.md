# Comperra - Building Materials Comparison Platform

## Overview
Comperra is a comprehensive building materials comparison platform designed to allow users to compare products within specific material categories (Tiles, Stone & Slabs, Vinyl & LVT, Hardwood, Heating, Carpet, Thermostats). The platform ensures strict category separation, preventing cross-category comparison results. It aims to provide expert buying guides, facilitate lead capture for pricing requests, and offer robust product data acquisition through an enhanced web scraping system. The business vision is to become the go-to platform for professional-grade building material comparisons, providing detailed specifications and a streamlined user experience for consumers and professionals alike.

## User Preferences
- Non-technical audience: Use clear, everyday language without technical jargon
- Focus on building materials industry terminology and workflows
- Prioritize visual design and user experience
- Minimize clicks and simplify navigation between comparison features

## System Architecture
The Comperra platform is built with a React TypeScript frontend utilizing Wouter for routing, TailwindCSS for styling, and shadcn/ui for components, ensuring a luxurious and minimalistic UI. The backend is an Express.js server also written in TypeScript. Data is currently managed with in-memory storage for Material, Article, and Brand entities, transitioning towards a persistent database solution (PostgreSQL). Core architectural decisions include category-based product comparison with strict filtering, dynamic comparison systems that validate specifications using centralized field definitions, and a security-hardened comparison system with XSS protection. The system supports expert buying guides and a lead capture system. Product data acquisition is handled by an enhanced web scraping system capable of bulk and single product imports with sophisticated specification extraction. UI/UX emphasizes clear navigation, a professional aesthetic with consistent styling across components, and visually appealing elements like animated gradient backgrounds for category cards.

## External Dependencies
- **Airtable**: Used for lead capture, specifically integrating with a "Leads" table for pricing requests.
- **Firebase**: Utilized for authentication, user profile management, real-time lead status tracking, comprehensive review system, and potentially for product storage (though the system is moving towards PostgreSQL for primary data persistence). Includes Firebase Cloud Functions for geohashing optimization.
- **PostgreSQL**: Planned for persistent data storage, replacing in-memory storage for leads and user profiles, and for robust lead matching.
- **Puppeteer**: Integrated into the enhanced scraping system for extracting JavaScript-loaded content and images from dynamic websites.
- **Fuse.js**: Used for implementing fuzzy search functionality, enhancing product search capabilities with typo tolerance.
- **geolib and geofire-common**: Packages used for efficient geographic queries and geohashing in the lead matching system.