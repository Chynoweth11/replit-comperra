import Header from "@/components/header";
import Footer from "@/components/footer";

export default function Press() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Press</h1>
        
        <div className="prose max-w-none">
          <div className="bg-white rounded-lg shadow p-8">
            <p className="text-lg text-gray-600 mb-8">Comperra is reshaping how surface materials are researched and compared. Our platform is used by designers, builders, and informed consumers seeking clarity in a cluttered materials market.</p>
            
            <h2 className="text-2xl font-bold mb-4">Media Inquiries</h2>
            <p className="text-gray-600 mb-6">If you are a journalist, blogger, or editor interested in covering the platform, please reach out to <a href="mailto:press@comperra.com" className="text-blue-600 hover:underline">press@comperra.com</a>. We are happy to provide official bios, brand assets, screenshots, or usage statistics.</p>
            
            <p className="text-gray-600 mb-6">We also consider requests for interviews, speaking engagements, and content collaborations.</p>
            
            <h2 className="text-2xl font-bold mb-4">About Comperra</h2>
            <p className="text-gray-600 mb-6">Comperra is a comprehensive building materials comparison platform that provides unbiased, specification-based comparisons across multiple material categories. Our platform serves architects, contractors, designers, and homeowners with transparent data and educational resources.</p>
            
            <h2 className="text-2xl font-bold mb-4">Key Features</h2>
            <ul className="text-gray-600 mb-6">
              <li>Multi-category material comparison (tiles, stone, vinyl, hardwood, heating, carpet)</li>
              <li>Specification-based filtering and search</li>
              <li>Expert buying guides and installation resources</li>
              <li>Price comparison tools</li>
              <li>Brand directory and vendor information</li>
            </ul>
            
            <h2 className="text-2xl font-bold mb-4">Platform Statistics</h2>
            <div className="bg-gray-100 rounded-lg p-6 my-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">1000+</div>
                  <div className="text-sm text-gray-600">Products Listed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">6</div>
                  <div className="text-sm text-gray-600">Material Categories</div>
                </div>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
            <p className="text-gray-600 mb-2">For all media inquiries and press requests:</p>
            <p className="text-gray-600 mb-2"><strong>Email:</strong> <a href="mailto:press@comperra.com" className="text-blue-600 hover:underline">press@comperra.com</a></p>
            <p className="text-gray-600"><strong>Response Time:</strong> Within 1–2 business days</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}