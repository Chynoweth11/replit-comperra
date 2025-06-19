import Header from "@/components/header";
import Footer from "@/components/footer";
import { Link } from "wouter";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">About Comperra</h1>
        
        <div className="prose max-w-none">
          <div className="bg-white rounded-lg shadow p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">About Comperra</h2>
            <p className="text-gray-600 mb-6">Comperra was built to bring clarity and trust to the building materials selection process. Whether you're renovating a home, managing a commercial build-out, or simply exploring design possibilities, Comperra empowers you with unbiased data and meaningful comparisons.</p>

            <h2 className="text-2xl font-bold mb-4">Our Approach</h2>
            <p className="text-gray-600 mb-6">We believe in making construction data accessible. No paywalls. No brand prioritization. No sales pressure. Our tools are designed to support smarter decision-making through transparency, education, and simplicity.</p>

            <h2 className="text-2xl font-bold mb-4">Our Team</h2>
            <p className="text-gray-600 mb-6">Our team comes from diverse backgrounds—design, construction, technology, and product development. Together, we are dedicated to building a platform that respects both industry professionals and homeowners alike.</p>

            <h2 className="text-2xl font-bold mb-4">Our Values</h2>
            <ul className="text-gray-600 mb-6">
              <li className="mb-2"><strong>Transparency:</strong> We provide clear, factual information without commercial influence</li>
              <li className="mb-2"><strong>Education:</strong> We focus on helping users understand materials and make informed decisions</li>
              <li className="mb-2"><strong>Neutrality:</strong> We do not promote or endorse specific brands or products</li>
              <li className="mb-2"><strong>Accessibility:</strong> Our platform is free to use with no barriers to information</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="text-gray-600">Questions, feedback, or collaboration ideas? We welcome all forms of outreach. Visit our <Link href="/contact" className="text-blue-600 hover:underline">contact page</Link> to get in touch.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}