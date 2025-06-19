import Header from "@/components/header";
import Footer from "@/components/footer";

export default function Brands() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Brand Directory</h1>
        <p className="text-gray-600 mb-8">While Comperra does not promote or guarantee any brand or vendor, we provide factual, structured summaries of suppliers, manufacturers, and product origin sources that appear in our comparison system.</p>
        
        <div className="prose max-w-none mb-8">
          <p>The Brand Directory is designed to help users understand where products come from, what kinds of materials are typically offered by a given source, and whether any specific compliance or sustainability data is available.</p>
          
          <p>The directory may include:</p>
          <ul>
            <li>Company type (manufacturer, distributor, fabricator, importer)</li>
            <li>Geographic coverage (regional, national, global)</li>
            <li>Product categories carried</li>
            <li>Documented certifications (e.g., sustainability, safety, slip resistance)</li>
            <li>Availability of technical resources (warranties, installation manuals, cut sheets)</li>
          </ul>
          
          <p>This section is presented to inform—not to rank, rate, or endorse. All content is sourced from publicly available information, and we do not guarantee accuracy beyond what is disclosed in official documentation. Users are encouraged to verify specifics with the manufacturer or distributor directly when making final selections.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-3 text-blue-600">Daltile</h3>
            <p className="text-gray-600 mb-2">Type: Manufacturer</p>
            <p className="text-gray-600 mb-2">Categories: Tiles, Stone</p>
            <p className="text-gray-600 mb-4">Coverage: National</p>
            <p className="text-sm text-gray-500">Leading tile manufacturer with extensive porcelain and ceramic collections</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-3 text-blue-600">Shaw Floors</h3>
            <p className="text-gray-600 mb-2">Type: Manufacturer</p>
            <p className="text-gray-600 mb-2">Categories: Hardwood, Carpet, LVT</p>
            <p className="text-gray-600 mb-4">Coverage: Global</p>
            <p className="text-sm text-gray-500">Major flooring manufacturer with residential and commercial lines</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-3 text-blue-600">MSI</h3>
            <p className="text-gray-600 mb-2">Type: Distributor</p>
            <p className="text-gray-600 mb-2">Categories: Tiles, Slabs, Stone</p>
            <p className="text-gray-600 mb-4">Coverage: National</p>
            <p className="text-sm text-gray-500">Premier distributor of flooring, countertops, and decorative surfaces</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}