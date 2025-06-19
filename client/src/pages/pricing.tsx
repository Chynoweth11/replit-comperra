import Header from "@/components/header";
import Footer from "@/components/footer";

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Price Comparison</h1>
        <p className="text-gray-600 mb-8">Pricing is one of the most variable aspects of the building materials industry. Comperra provides a price comparison tool designed to show a general range of costs associated with similar materials, based on information that is either submitted by users, scraped from public listings, or provided directly by vendors.</p>
        
        <div className="prose max-w-none mb-8">
          <p>The price comparison view typically includes:</p>
          <ul>
            <li>Base price per square foot (as listed or submitted)</li>
            <li>Material specifications relevant to pricing (e.g., thickness, format, finish)</li>
            <li>Suggested use-case alignment (residential, commercial, indoor, outdoor)</li>
            <li>Visual or dimensional similarities to alternate options</li>
          </ul>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-6">
            <p className="text-red-800 font-medium">Important Pricing Disclaimer</p>
            <p className="text-red-700 text-sm mt-1">Prices shown are not fixed quotes. They reflect general estimates and are not inclusive of taxes, shipping, install costs, or region-specific markups. Comperra does not sell products, and we do not guarantee that listed prices will be honored by any vendor.</p>
          </div>
          
          <p>This tool should be used to develop awareness of market ranges and material tiers. If a material shows a lower cost alternative, it is not a recommendation—it is an informational match based on shared attributes. All purchase decisions should be validated with the original seller, distributor, or installer.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3 text-blue-600">Tile Pricing</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Ceramic Tile</span>
                <span className="font-semibold">$1-5/sq ft</span>
              </div>
              <div className="flex justify-between">
                <span>Porcelain Tile</span>
                <span className="font-semibold">$3-12/sq ft</span>
              </div>
              <div className="flex justify-between">
                <span>Natural Stone</span>
                <span className="font-semibold">$5-20/sq ft</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3 text-blue-600">LVT Pricing</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Standard LVT</span>
                <span className="font-semibold">$2-6/sq ft</span>
              </div>
              <div className="flex justify-between">
                <span>Rigid Core SPC</span>
                <span className="font-semibold">$3-8/sq ft</span>
              </div>
              <div className="flex justify-between">
                <span>Premium WPC</span>
                <span className="font-semibold">$4-10/sq ft</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3 text-blue-600">Heating Pricing</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Electric Mats</span>
                <span className="font-semibold">$5-15/sq ft</span>
              </div>
              <div className="flex justify-between">
                <span>Cable Systems</span>
                <span className="font-semibold">$3-8/sq ft</span>
              </div>
              <div className="flex justify-between">
                <span>Thermostats</span>
                <span className="font-semibold">$150-500 each</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}