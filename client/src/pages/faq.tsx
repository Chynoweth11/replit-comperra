import Header from "@/components/header";
import Footer from "@/components/footer";

export default function FAQ() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>
        <p className="text-gray-600 mb-8">Below are answers to common questions users ask about Comperra's platform, tools, and content.</p>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3">Does Comperra sell materials directly?</h3>
            <p className="text-gray-600">No. We are an informational and comparison platform. We do not manufacture, stock, or fulfill product orders.</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3">Where does your data come from?</h3>
            <p className="text-gray-600">Data is sourced from publicly available information, direct vendor submissions, and verified third-party documentation. All data is reviewed for accuracy, but users are encouraged to verify final specs with the product source.</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3">Can I trust the product comparisons?</h3>
            <p className="text-gray-600">Our comparisons are based on factual specifications and are not influenced by advertising. However, they are meant as informational tools, not purchasing advice.</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3">Can I submit a product or correction?</h3>
            <p className="text-gray-600">Yes. Use the submission form on our Contact page to request new entries or suggest edits.</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3">Do you offer professional services?</h3>
            <p className="text-gray-600">Not at this time. Comperra is a free-to-use platform for product research and educational exploration.</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3">How do I compare products?</h3>
            <p className="text-gray-600">Navigate to any category page, select the products you want to compare using the checkboxes, then click "Compare Selected" to see a detailed side-by-side comparison.</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3">Are prices guaranteed?</h3>
            <p className="text-gray-600">No, prices shown are estimates based on available data. Always verify pricing with the manufacturer or retailer before making a purchase.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}