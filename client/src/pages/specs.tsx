import Header from "@/components/header";
import Footer from "@/components/footer";
import { Link } from "wouter";

export default function Specs() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Specification Search</h1>
        <p className="text-gray-600 mb-8">One of the most technically useful tools on Comperra, the Specification Search feature allows users to filter and narrow down material selections using specific quantitative and qualitative product attributes.</p>
        
        <div className="prose max-w-none mb-8">
          <p>This functionality is especially helpful for users managing large-scale renovation or construction projects, where material compatibility and compliance are essential.</p>
          
          <h3>Specs available for filtering include:</h3>
          <ul>
            <li>Material size (length, width, thickness)</li>
            <li>Surface finish (matte, polished, textured, honed, etc.)</li>
            <li>Edge type (rectified, beveled, eased)</li>
            <li>Abrasion resistance ratings (such as PEI levels for tile)</li>
            <li>Slip resistance (often listed as DCOF or SCOF values)</li>
            <li>Water absorption percentages</li>
            <li>Acoustic ratings and underlayment thickness (for resilient flooring)</li>
            <li>Core construction type (especially relevant to vinyl and LVT products)</li>
            <li>Installation type (click-lock, glue-down, nail-down, floating)</li>
          </ul>
          
          <p>Comperra's specification filters are built for performance-based exploration and are not influenced by branding or marketing terms. All results are intended to give users a starting point for further product research, rather than definitive selection guidance.</p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
            <p className="text-yellow-800 font-medium">Important Notice</p>
            <p className="text-yellow-700 text-sm mt-1">We strongly recommend consulting product documentation and installation guides before making a purchase or beginning an install.</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Search by Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/comparison/tiles" className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <h4 className="font-semibold text-blue-600">Tile Specifications</h4>
              <p className="text-sm text-gray-600">PEI rating, slip resistance, water absorption</p>
            </Link>
            <Link href="/comparison/slabs" className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <h4 className="font-semibold text-blue-600">Slab Specifications</h4>
              <p className="text-sm text-gray-600">Thickness, edge options, material composition</p>
            </Link>
            <Link href="/comparison/lvt" className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <h4 className="font-semibold text-blue-600">LVT Specifications</h4>
              <p className="text-sm text-gray-600">Core type, wear layer, acoustic rating</p>
            </Link>
            <Link href="/comparison/heat" className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <h4 className="font-semibold text-blue-600">Heating Specifications</h4>
              <p className="text-sm text-gray-600">Voltage, coverage area, compatibility</p>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}