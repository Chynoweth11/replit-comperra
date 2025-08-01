import Header from "@/components/header";
import Footer from "@/components/footer";
import { Link } from "wouter";

export default function BuyingGuides() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Buying Guides</h1>
        <p className="text-gray-600 mb-8">Comperra's Buying Guides are intended to provide educational insight into the selection, specification, and usage of common surface materials.</p>
        
        <div className="prose max-w-none mb-8">
          <p>Each guide is researched and written to help users better understand:</p>
          <ul>
            <li>How materials differ by composition, appearance, and performance</li>
            <li>What specs or ratings actually mean in practical terms</li>
            <li>Which conditions might affect installation success</li>
            <li>How to balance aesthetics with function and longevity</li>
            <li>What maintenance practices are typically associated with each material type</li>
          </ul>
          
          <p>These guides are not promotional or sales-driven. They are developed using a blend of independent material testing results, contractor interviews, installer feedback, and product documentation. We avoid generalizations and do not make guarantees regarding lifespan, performance, or compatibility, as these factors are heavily dependent on environmental conditions, usage habits, and install quality.</p>
          
          <p>Comperra's goal is to make technical information more readable, practical, and user-focused—so that whether you're installing luxury vinyl in a vacation rental or choosing stone slabs for a commercial counter, you feel confident about your options and understand the trade-offs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-3 text-blue-600">Tile Buying Guide</h3>
            <p className="text-gray-600 mb-4">Everything you need to know about selecting the right tiles for your project</p>
            <Link href="/article/1" className="text-blue-600 hover:underline">Read Guide →</Link>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-3 text-blue-600">Quartz Slab Guide</h3>
            <p className="text-gray-600 mb-4">Comprehensive guide to engineered quartz countertops and surfaces</p>
            <Link href="/article/2" className="text-blue-600 hover:underline">Read Guide →</Link>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-3 text-blue-600">LVT Selection Guide</h3>
            <p className="text-gray-600 mb-4">Professional insights on luxury vinyl tile and plank flooring</p>
            <Link href="/article/6" className="text-blue-600 hover:underline">Read Guide →</Link>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-3 text-blue-600">Hardwood Guide</h3>
            <p className="text-gray-600 mb-4">Expert advice on solid and engineered hardwood flooring</p>
            <Link href="/article/5" className="text-blue-600 hover:underline">Read Guide →</Link>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-3 text-blue-600">Heating Systems Guide</h3>
            <p className="text-gray-600 mb-4">Complete guide to radiant floor heating options</p>
            <Link href="/article/4" className="text-blue-600 hover:underline">Read Guide →</Link>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-3 text-blue-600">Carpet Guide</h3>
            <p className="text-gray-600 mb-4">Professional guidance on carpet selection and specifications</p>
            <Link href="/article/3" className="text-blue-600 hover:underline">Read Guide →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}