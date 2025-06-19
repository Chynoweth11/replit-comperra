import Header from "@/components/header";
import Footer from "@/components/footer";

export default function Cookies() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Cookies</h1>
        
        <div className="prose max-w-none">
          <div className="bg-white rounded-lg shadow p-8">
            <p className="text-gray-600 mb-6">Comperra uses cookies and similar tracking technologies to ensure our platform functions effectively and to enhance user experience. Our cookie policy is compliant with global data protection regulations and offers users control over their preferences.</p>

            <h2 className="text-2xl font-bold mb-4">1. What Are Cookies?</h2>
            <p className="text-gray-600 mb-6">Cookies are small text files placed on your device that allow us to remember user behavior, preferences, and login sessions. We use both session-based and persistent cookies.</p>

            <h2 className="text-2xl font-bold mb-4">2. Why We Use Cookies</h2>
            <ul className="text-gray-600 mb-6">
              <li>To remember user settings and filter preferences</li>
              <li>To measure usage patterns for site improvements</li>
              <li>To track performance of comparison features and tools</li>
              <li>To facilitate login sessions if accounts are in use</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">3. Types of Cookies Used</h2>
            <ul className="text-gray-600 mb-6">
              <li><strong>Essential Cookies:</strong> Required for site functionality</li>
              <li><strong>Analytics Cookies:</strong> Help track usage trends (e.g., Google Analytics)</li>
              <li><strong>Preference Cookies:</strong> Store region, language, and view settings</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">4. Cookie Controls</h2>
            <p className="text-gray-600 mb-6">You can manage or block cookies using browser settings. Additionally, Comperra allows users to accept or decline cookies through a visible banner on first visit.</p>

            <h2 className="text-2xl font-bold mb-4">5. Third-Party Services</h2>
            <p className="text-gray-600 mb-6">Some cookies originate from third-party platforms embedded on Comperra (e.g., YouTube, analytics). We do not control their scope but do provide disclosure.</p>

            <p className="text-gray-600">Full cookie controls and categories can be reviewed and managed from the Cookies Settings page on the site.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}