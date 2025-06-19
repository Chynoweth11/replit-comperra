import Header from "@/components/header";
import Footer from "@/components/footer";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        
        <div className="prose max-w-none">
          <div className="bg-white rounded-lg shadow p-8">
            <p className="text-gray-600 mb-6">These Terms of Service ("Terms") govern your access to and use of the Comperra platform and associated services. By accessing or using the site, you agree to be bound by these Terms. If you do not agree, you should not use Comperra.</p>

            <h2 className="text-2xl font-bold mb-4">1. Acceptable Use</h2>
            <p className="text-gray-600 mb-3">You agree not to:</p>
            <ul className="text-gray-600 mb-6">
              <li>Scrape, replicate, or redistribute data for commercial purposes</li>
              <li>Introduce malicious software or attempt unauthorized access</li>
              <li>Use Comperra to mislead, impersonate, or harass others</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">2. Intellectual Property</h2>
            <p className="text-gray-600 mb-6">All content, comparison tools, and software provided through Comperra are the property of Comperra or its licensors and are protected by copyright, trademark, and other applicable laws. You may not reuse or modify platform components without written permission.</p>

            <h2 className="text-2xl font-bold mb-4">3. User Content</h2>
            <p className="text-gray-600 mb-6">Users who submit product data, reviews, or other content grant Comperra a non-exclusive, royalty-free license to use, display, and distribute the content within the platform for informational purposes.</p>

            <h2 className="text-2xl font-bold mb-4">4. Disclaimers</h2>
            <ul className="text-gray-600 mb-6">
              <li>The platform is provided "as is" without warranties of any kind</li>
              <li>Comperra does not guarantee the accuracy of third-party data</li>
              <li>Any reliance on material information is at the user's discretion</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">5. Limitation of Liability</h2>
            <p className="text-gray-600 mb-6">Comperra shall not be liable for indirect, incidental, or consequential damages resulting from use of the site, including reliance on published product data.</p>

            <h2 className="text-2xl font-bold mb-4">6. Governing Law</h2>
            <p className="text-gray-600">These Terms are governed by and construed in accordance with the laws of the State of Arizona, United States.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}