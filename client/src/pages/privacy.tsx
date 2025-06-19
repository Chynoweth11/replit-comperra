import Header from "@/components/header";
import Footer from "@/components/footer";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        
        <div className="prose max-w-none">
          <div className="bg-white rounded-lg shadow p-8">
            <p className="text-gray-600 mb-6">Comperra is committed to protecting the privacy and data integrity of its users. This Privacy Policy outlines the types of information we collect, how it is used, the legal basis for processing, and the rights and controls available to our users. Our policy is structured to meet and exceed compliance with applicable data protection regulations, including the General Data Protection Regulation (GDPR), California Consumer Privacy Act (CCPA), and other international privacy laws where applicable.</p>

            <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
            <ul className="text-gray-600 mb-6">
              <li><strong>Personal Information:</strong> Name, email address, and contact details provided through forms or account sign-up.</li>
              <li><strong>Technical Data:</strong> IP address, browser type, operating system, device identifiers.</li>
              <li><strong>Usage Data:</strong> Pages visited, time spent on site, click patterns, and interactions with comparison tools.</li>
              <li><strong>Cookies and Tracking Technologies:</strong> As described in our Cookies Policy.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">2. How We Use Information</h2>
            <ul className="text-gray-600 mb-6">
              <li>To operate and improve our platform</li>
              <li>To analyze usage trends and improve user experience</li>
              <li>To respond to user requests or inquiries</li>
              <li>To provide relevant content and recommendations</li>
              <li>To ensure platform integrity and security</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">3. Data Sharing</h2>
            <p className="text-gray-600 mb-6">We do not sell personal data. We may share limited anonymized or aggregated data with service providers strictly for operational needs such as analytics, hosting, and performance monitoring.</p>

            <h2 className="text-2xl font-bold mb-4">4. User Rights</h2>
            <p className="text-gray-600 mb-6">Users may request access, correction, deletion, or export of their personal data. Requests can be submitted via our contact page. Where required by law, we honor opt-out requests from data collection.</p>

            <h2 className="text-2xl font-bold mb-4">5. Data Security</h2>
            <p className="text-gray-600 mb-6">Comperra uses secure servers, encrypted connections, and access controls to safeguard user data.</p>

            <h2 className="text-2xl font-bold mb-4">6. Data Retention</h2>
            <p className="text-gray-600 mb-6">Personal data is retained only as long as necessary to fulfill the purpose it was collected for. Anonymized data may be retained for analytics.</p>

            <h2 className="text-2xl font-bold mb-4">7. Contact</h2>
            <p className="text-gray-600">For questions related to this policy, email support@comperra.com</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}