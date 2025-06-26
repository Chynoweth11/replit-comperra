import { useLocation, Link } from "wouter";
import Header from "@/components/header";
import Hero from "@/components/hero";
import CategoryGrid from "@/components/category-grid";
import ArticlesSection from "@/components/articles-section";
import Footer from "@/components/footer";
import SEOHead from "@/components/seo-head";

export default function Home() {
  const [, navigate] = useLocation();

  const handleCategorySelect = (category: string) => {
    navigate(`/comparison/${category}`);
  };

  const handleStartComparing = () => {
    navigate("/comparison/tiles");
  };

  const handleBrowseCategories = () => {
    navigate("/categories");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title="Comperra - Smart Building Materials Comparison Platform"
        description="Compare tiles, stone, vinyl, hardwood, heating systems, and carpet with detailed specifications and pricing. Make informed building material decisions with expert guides."
        keywords="building materials comparison, tiles, stone slabs, vinyl flooring, hardwood, radiant heating, carpet, construction materials, building supplies"
      />
      <Header />
      <Hero onBrowseClick={handleBrowseCategories} onStartComparing={handleStartComparing} />
      <CategoryGrid onCategorySelect={handleCategorySelect} />
      
      {/* All Categories Educational Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              All Categories
            </h2>
            
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="text-xl leading-relaxed mb-6">
                The All Categories section of Comperra is your entry point to exploring the wide spectrum of surface materials used in modern construction, renovation, and design. Our goal is to give users a complete overview of what materials are available, how they are typically used, and what attributes differentiate one product type from another.
              </p>
              
              <p className="mb-6">
                The category layout is structured to align with common industry standards and homeowner needs. It includes but is not limited to:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tiles</h3>
                  <p className="text-gray-600">
                    Often used for floors, walls, and backsplashes. Subtypes include porcelain, ceramic, mosaic, and glass tiles.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Stone & Slabs</h3>
                  <p className="text-gray-600">
                    Natural and engineered surfaces typically used for countertops, wall cladding, and flooring. May include granite, marble, travertine, and quartz-based products.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Vinyl & LVT</h3>
                  <p className="text-gray-600">
                    Engineered resilient flooring made for durability and water resistance. Available in multiple construction types like SPC (stone polymer core) and WPC (wood polymer core).
                  </p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Hardwood Flooring</h3>
                  <p className="text-gray-600">
                    Ranges from solid to engineered boards. Known for its aesthetic warmth and long-term maintenance considerations.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Thermostats</h3>
                  <p className="text-gray-600">
                    Smart and programmable thermostats for radiant heating control, featuring Wi-Fi connectivity, sensor types, and energy optimization.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Carpet</h3>
                  <p className="text-gray-600">
                    Textured textile flooring, available in broadloom and modular tile forms. Differentiated by fiber type, pile height, and usage suitability.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Heating Systems</h3>
                  <p className="text-gray-600">
                    Underlayment heating systems, such as electric heat mats and programmable thermostats, often used in tile-based installations for added comfort.
                  </p>
                </div>
              </div>
              
              <p className="text-gray-700 leading-relaxed">
                Each category offers filterable specs, comparison capabilities, and educational content to help users evaluate products based on technical fit, aesthetic preference, and functional use-case—without bias or endorsement. Our team continually refines each category to keep pace with material innovation and evolving construction trends.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Professional Network Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Connect with Trusted Professionals
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Find qualified contractors, installers, and suppliers in your area. Get quotes and hire with confidence.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center flex flex-col h-full">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4 min-h-[3.5rem] flex items-center justify-center">For Homeowners, Builders, Architects and Designers</h3>
              <p className="text-slate-600 mb-6 flex-grow">
                Get connected with qualified professionals for your building material projects
              </p>
              <Link href="/professionals">
                <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Find Professionals Near Me
                </button>
              </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8 text-center flex flex-col h-full">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4 min-h-[3.5rem] flex items-center justify-center">For Professionals</h3>
              <p className="text-slate-600 mb-6 flex-grow">
                Join our network to receive qualified leads and grow your business
              </p>
              <Link href="/professionals">
                <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Join Professional Network
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <ArticlesSection />
      <Footer />
    </div>
  );
}
