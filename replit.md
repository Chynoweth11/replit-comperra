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
- **Supabase**: New primary authentication and database system replacing Firebase. Provides PostgreSQL-based data storage, user authentication, real-time subscriptions, and profile management. Utilized for all user accounts, authentication flows, profile storage, and lead management.
- **PostgreSQL**: Used through Supabase for persistent data storage, replacing both in-memory storage and Firebase for user profiles, leads, and all application data.
- **Airtable**: Previously used for lead capture (now migrated to Supabase).
- **Puppeteer**: Integrated into the enhanced scraping system for extracting JavaScript-loaded content and images from dynamic websites.
- **Fuse.js**: Used for implementing fuzzy search functionality, enhancing product search capabilities with typo tolerance.
- **geolib and geofire-common**: Packages used for efficient geographic queries and geohashing in the lead matching system.

## Recent Changes
- ✅ **August 6, 2025**: COMPLETED - Major Architecture Migration: Firebase to Supabase - Successfully implemented complete migration from Firebase to Supabase authentication and database system. Created new Supabase client configuration, authentication context with sign-up/sign-in/sign-out functionality, comprehensive profile management system with role-based access (customer/vendor/professional), new authentication pages with material specialty selection for business users, profile page with business information management, and full integration with existing UI components. Supabase provides PostgreSQL backend, real-time subscriptions, and simplified authentication flows. All new authentication routes active at /supabase-auth and /supabase-profile. Legacy Firebase system maintained for compatibility during transition period.
- ✅ **August 1, 2025**: COMPLETED - Full Profile Synchronization System and Article Management - Successfully implemented comprehensive profile synchronization across all platform systems (main profiles, Vendor Profile Management, Professional Matching), resolved "Article Not Found" errors by initializing sample buying guide articles for all material categories, enhanced Account Type selection to automatically create vendor/trade profiles when roles are selected, fixed all TypeScript compilation errors in profile components, articles API now serving 5 sample buying guides covering tiles, stone, hardwood, heating, and vinyl categories, Save Profile functionality working with automatic role-based business profile creation, system now maintains data integrity across all user management systems with seamless synchronization