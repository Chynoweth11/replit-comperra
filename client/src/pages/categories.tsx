import Header from "@/components/header";
import Footer from "@/components/footer";

export default function Categories() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">All Categories</h1>
        <p className="text-gray-600 mb-8">The All Categories section of Comperra is your entry point to exploring the wide spectrum of surface materials used in modern construction, renovation, and design. Our goal is to give users a complete overview of what materials are available, how they are typically used, and what attributes differentiate one product type from another.</p>
        
        <div className="prose max-w-none mb-8">
          <p>The category layout is structured to align with common industry standards and homeowner needs. It includes but is not limited to:</p>
          <ul>
            <li><strong>Tiles:</strong> Often used for floors, walls, and backsplashes. Subtypes include porcelain, ceramic, mosaic, and glass tiles.</li>
            <li><strong>Stone & Slabs:</strong> Natural and engineered surfaces typically used for countertops, wall cladding, and flooring. May include granite, marble, travertine, and quartz-based products.</li>
            <li><strong>Vinyl & LVT:</strong> Engineered resilient flooring made for durability and water resistance. Available in multiple construction types like SPC (stone polymer core) and WPC (wood polymer core).</li>
            <li><strong>Hardwood Flooring:</strong> Ranges from solid to engineered boards. Known for its aesthetic warmth and long-term maintenance considerations.</li>
            <li><strong>Carpet:</strong> Textured textile flooring, available in broadloom and modular tile forms. Differentiated by fiber type, pile height, and usage suitability.</li>
            <li><strong>Heating Systems:</strong> Underlayment heating systems, such as electric heat mats and programmable thermostats, often used in tile-based installations for added comfort.</li>
          </ul>
          <p>Each category offers filterable specs, comparison capabilities, and educational content to help users evaluate products based on technical fit, aesthetic preference, and functional use-case—without bias or endorsement. Our team continually refines each category to keep pace with material innovation and evolving construction trends.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-3 text-blue-600">Tiles</h3>
            <p className="text-gray-600 mb-4">Porcelain, ceramic, mosaic, and glass tiles for floors, walls, and backsplashes</p>
            <a href="/comparison/tiles" className="text-blue-600 hover:underline">Browse Tiles →</a>
          </div>
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-3 text-blue-600">Stone & Slabs</h3>
            <p className="text-gray-600 mb-4">Natural and engineered stone surfaces for countertops and flooring</p>
            <a href="/comparison/slabs" className="text-blue-600 hover:underline">Browse Slabs →</a>
          </div>
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-3 text-blue-600">Vinyl & LVT</h3>
            <p className="text-gray-600 mb-4">Luxury vinyl tile and plank flooring with waterproof construction</p>
            <a href="/comparison/lvt" className="text-blue-600 hover:underline">Browse LVT →</a>
          </div>
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-3 text-blue-600">Hardwood</h3>
            <p className="text-gray-600 mb-4">Solid and engineered hardwood flooring in various species and finishes</p>
            <a href="/comparison/hardwood" className="text-blue-600 hover:underline">Browse Hardwood →</a>
          </div>
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-3 text-blue-600">Heating Systems</h3>
            <p className="text-gray-600 mb-4">Electric radiant heating mats and systems for comfort flooring</p>
            <a href="/comparison/heat" className="text-blue-600 hover:underline">Browse Heating →</a>
          </div>
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-3 text-blue-600">Carpet</h3>
            <p className="text-gray-600 mb-4">Broadloom and modular carpet tiles in various fibers and styles</p>
            <a href="/comparison/carpet" className="text-blue-600 hover:underline">Browse Carpet →</a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}