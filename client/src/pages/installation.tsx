import Header from "@/components/header";
import Footer from "@/components/footer";

export default function Installation() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Installation Tips</h1>
        <p className="text-gray-600 mb-8">Correct installation is one of the most important factors affecting long-term performance and appearance of any surface material. In this section, Comperra shares general knowledge and considerations for preparing, handling, and installing common flooring and wall products.</p>
        
        <div className="prose max-w-none mb-8">
          <p>While installation techniques may vary depending on product type, job site conditions, or local code, we aim to offer clear foundational insights.</p>
          
          <h3>Topics include:</h3>
          <ul>
            <li>Substrate preparation and leveling</li>
            <li>Moisture testing and mitigation</li>
            <li>Underlayment and setting materials</li>
            <li>Expansion joints and perimeter spacing</li>
            <li>Correct orientation and layout</li>
            <li>Grout and adhesive curing times</li>
            <li>Environmental acclimation for wood and vinyl</li>
          </ul>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-6">
            <p className="text-blue-800 font-medium">Professional Guidance Notice</p>
            <p className="text-blue-700 text-sm mt-1">Our installation guidance is developed with input from trade professionals and technical manuals, but is not a substitute for manufacturer instructions or licensed contractor expertise. Always verify that your methods align with the most current product specifications and local building standards.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-600">Tile Installation</h3>
            
            <h4 className="font-semibold mb-2">Substrate Preparation</h4>
            <ul className="list-disc pl-6 mb-4 text-sm space-y-1">
              <li>Ensure substrate is clean, dry, and level</li>
              <li>Check for structural integrity and deflection</li>
              <li>Apply appropriate primer or membrane</li>
              <li>Install backer board in wet areas</li>
            </ul>
            
            <h4 className="font-semibold mb-2">Installation Process</h4>
            <ul className="list-disc pl-6 mb-4 text-sm space-y-1">
              <li>Plan layout and establish reference lines</li>
              <li>Use proper trowel size for adhesive</li>
              <li>Maintain consistent joint spacing</li>
              <li>Remove excess adhesive from joints</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-600">LVT Installation</h3>
            
            <h4 className="font-semibold mb-2">Acclimation</h4>
            <ul className="list-disc pl-6 mb-4 text-sm space-y-1">
              <li>Store flooring at job site 48 hours minimum</li>
              <li>Maintain temperature between 65-75°F</li>
              <li>Check moisture levels in substrate</li>
              <li>Allow planks to reach room temperature</li>
            </ul>
            
            <h4 className="font-semibold mb-2">Installation Method</h4>
            <ul className="list-disc pl-6 text-sm space-y-1">
              <li>Start installation parallel to longest wall</li>
              <li>Maintain 1/4" expansion gap at perimeter</li>
              <li>Stagger end joints by 6" minimum</li>
              <li>Use proper transition strips at doorways</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}