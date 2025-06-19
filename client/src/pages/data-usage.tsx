import Header from "@/components/header";
import Footer from "@/components/footer";

export default function DataUsage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Data Usage</h1>
        
        <div className="prose max-w-none">
          <div className="bg-white rounded-lg shadow p-8">
            <p className="text-gray-600 mb-6">Comperra is committed to transparency regarding how product and performance data is collected, verified, and used. Our Data Usage Policy outlines where our data comes from, how we process it, and what responsibilities we maintain as a platform that organizes product information.</p>

            <h2 className="text-2xl font-bold mb-4">1. Data Sources</h2>
            <ul className="text-gray-600 mb-6">
              <li>Manufacturer technical sheets and catalogs</li>
              <li>Publicly available product listings</li>
              <li>Direct vendor submissions</li>
              <li>User-generated or uploaded specifications</li>
              <li>AI-assisted scraping of material data</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">2. Data Structure and Use</h2>
            <p className="text-gray-600 mb-6">All data is standardized to allow fair comparisons. Our system parses product data fields such as dimensions, slip resistance, PEI rating, finish type, water absorption, install method, price per square foot, and more.</p>

            <h2 className="text-2xl font-bold mb-4">3. Updates and Corrections</h2>
            <p className="text-gray-600 mb-6">We actively monitor and revise product listings when corrections are submitted or discrepancies are found. Products marked "Verified" have been manually reviewed for formatting and completeness.</p>

            <h2 className="text-2xl font-bold mb-4">4. Responsibility and Limitations</h2>
            <p className="text-gray-600">While we strive to provide accurate data, materials may vary by batch, location, or distribution channel. Final spec verification is the responsibility of the purchaser or installer. Comperra does not assume liability for product misrepresentation by third parties.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}