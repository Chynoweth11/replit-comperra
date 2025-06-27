# Comperra - Building Materials Comparison Platform

<div align="center">
  <img src="https://via.placeholder.com/600x200/1e40af/ffffff?text=Comperra" alt="Comperra Logo" width="600"/>
  
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
  [![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)](https://firebase.google.com/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  
  **A comprehensive building materials research platform with AI-powered comparison tools**
</div>

## 🏗️ Overview

Comperra is an advanced building materials comparison platform that enables professionals and homeowners to research, compare, and source building materials across multiple categories. The platform features intelligent web scraping, comprehensive product specifications, and professional networking capabilities.

### Key Features

- **📊 Multi-Category Comparison**: Compare products across 7 categories (Tiles, Stone & Slabs, Vinyl & LVT, Hardwood, Heating, Carpet, Thermostats)
- **🔍 Advanced Product Search**: Fuzzy search with intelligent filtering and category-specific specifications
- **🤖 Intelligent Web Scraping**: Automated product data extraction from manufacturer websites using Puppeteer
- **👥 Professional Network**: Connect with contractors, suppliers, and industry professionals
- **📱 Lead Capture System**: Integrated Airtable-based lead management for pricing requests
- **🔥 Firebase Integration**: Persistent data storage and user authentication
- **📚 Expert Buying Guides**: Comprehensive guides for all material categories

## 🚀 Live Demo

Visit the live application: [Comperra Platform](https://your-deployment-url.replit.app)

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Wouter** for client-side routing
- **TailwindCSS** for styling
- **shadcn/ui** component library
- **TanStack Query** for data fetching
- **Framer Motion** for animations

### Backend
- **Express.js** with TypeScript
- **Firebase Firestore** for data persistence
- **Puppeteer** for dynamic web scraping
- **Cheerio** for HTML parsing
- **Drizzle ORM** for database management

### External Integrations
- **Airtable** for lead capture and CRM
- **Firebase Auth** for user management
- **Multiple vendor APIs** for product data

## 📁 Project Structure

```
comperra/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utility functions
│   │   └── context/       # React context providers
├── server/                # Express.js backend
│   ├── routes.ts          # API endpoints
│   ├── storage.ts         # Data storage abstraction
│   ├── scraper.ts         # Web scraping functionality
│   ├── firebase-storage.ts # Firebase integration
│   └── puppeteer-scraper.ts # Advanced scraping
├── shared/                # Shared TypeScript types
│   └── schema.ts          # Database schemas and types
└── docs/                  # Documentation files
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project (for authentication & database)
- Airtable account (for lead capture)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/comperra.git
cd comperra
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Airtable Integration
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_BASE_ID=your_base_id

# Application Settings
NODE_ENV=development
PORT=5000
```

### 4. Firebase Setup
1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Enable Authentication (Email/Password)
4. Add your domain to authorized domains
5. Copy your config values to the `.env` file

### 5. Airtable Setup
1. Create an Airtable base with these tables:
   - `Leads` (Name, Email, ZIP Code, Product Interest, Customer Type)
   - `Products` (for scraped product data)
2. Generate an API key from your Airtable account
3. Add the API key and base ID to your `.env` file

### 6. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 🎯 Core Features

### Product Comparison
- Side-by-side comparison of up to 5 products
- Category-specific technical specifications
- Advanced filtering and search capabilities
- Real-time data updates

### Web Scraping System
- **Puppeteer Integration**: Capture JavaScript-loaded content and images
- **Multi-vendor Support**: Daltile, MSI, Arizona Tile, Shaw, Mohawk, and more
- **Intelligent Categorization**: Automatic product classification
- **Specification Extraction**: Comprehensive technical data capture

### Professional Network
- Professional registration and verification
- Lead sharing and management
- Geographic proximity matching
- Service category specialization

### User Authentication
- Firebase-based secure authentication
- User dashboard with saved comparisons
- Quote tracking and history
- Account management

## 📊 API Endpoints

### Materials
- `GET /api/materials` - Get all materials with filtering
- `GET /api/materials/:id` - Get specific material
- `POST /api/materials` - Create new material

### Scraping
- `POST /api/scrape/single` - Scrape single product URL
- `POST /api/scrape/bulk` - Bulk scrape multiple URLs

### Lead Management
- `POST /api/save-lead` - Save pricing request lead
- `POST /api/sample-request` - Request product samples

### Content
- `GET /api/articles` - Get buying guides and articles
- `GET /api/brands` - Get manufacturer information

## 🎨 UI Components

The platform uses a comprehensive component library built with:
- **shadcn/ui** for base components
- **Custom components** for domain-specific functionality
- **Responsive design** for all screen sizes
- **Dark mode support** (optional)

Key components:
- `ComparisonTable` - Product comparison interface
- `CategoryFilterPanel` - Advanced filtering
- `ProductCard` - Product display cards
- `LeadCaptureModal` - Lead generation forms
- `ProfessionalNetwork` - Networking features

## 🔍 Material Categories

### Supported Categories
1. **Tiles** - Porcelain, ceramic, natural stone
2. **Stone & Slabs** - Quartz, granite, marble countertops
3. **Vinyl & LVT** - Luxury vinyl tile and plank
4. **Hardwood** - Solid and engineered wood flooring
5. **Heating** - Radiant floor heating systems
6. **Carpet** - Broadloom and carpet tiles
7. **Thermostats** - Smart and programmable controls

### Category-Specific Features
- Unique specification schemas for each category
- Specialized filtering options
- Category-appropriate pricing models
- Expert buying guides and recommendations

## 🧪 Testing

```bash
# Run frontend tests
npm run test:client

# Run backend tests
npm run test:server

# Run all tests
npm test
```

## 🚀 Deployment

### Replit Deployment (Recommended)
1. Import project to Replit
2. Configure environment variables in Replit Secrets
3. Use the "Deploy" button for automatic deployment

### Manual Deployment
```bash
# Build production version
npm run build

# Start production server
npm start
```

### Environment Variables for Production
Ensure all environment variables are configured in your production environment.

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use the existing component structure
- Write comprehensive tests for new features
- Update documentation for API changes

## 📋 Changelog

### Recent Updates
- **June 27, 2025**: Fixed TypeScript compilation errors for deployment
- **June 25, 2025**: Added Professional Network system
- **June 24, 2025**: Enhanced Puppeteer scraping integration
- **June 23, 2025**: Implemented Firebase authentication
- **June 22, 2025**: Enhanced specification frameworks

See [CHANGELOG.md](CHANGELOG.md) for complete version history.

## 🐛 Known Issues

- Some manufacturer websites may block automated scraping
- Large product catalogs may impact initial load times
- Mobile responsiveness being optimized for complex comparison tables

## 📞 Support

For support, feature requests, or bug reports:
- Email: support@comperra.com
- GitHub Issues: [Create an issue](https://github.com/yourusername/comperra/issues)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **shadcn/ui** for the component library
- **Puppeteer** team for web scraping capabilities
- **Firebase** for backend infrastructure
- **TailwindCSS** for styling framework
- Building materials industry professionals for domain expertise

---

<div align="center">
  <strong>Built with ❤️ for the building materials industry</strong>
</div>