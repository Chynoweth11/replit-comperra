import { useLocation } from "wouter";

export default function Footer() {
  const [, navigate] = useLocation();

  return (
    <footer className="bg-gray-800 text-white py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Comperra</h3>
            <p className="text-gray-300 text-sm mb-4">
              Professional building materials comparison platform for smarter decision-making.
            </p>
            <button 
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
              onClick={() => navigate("/")}
            >
              Get Started
            </button>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigate("/compare")} className="text-gray-300 hover:text-white text-left">Compare Materials</button></li>
              <li><button onClick={() => navigate("/categories")} className="text-gray-300 hover:text-white text-left">All Categories</button></li>
              <li><button onClick={() => navigate("/brands")} className="text-gray-300 hover:text-white text-left">Brand Directory</button></li>
              <li><button onClick={() => navigate("/vendors")} className="text-gray-300 hover:text-white text-left">Vendor Directory</button></li>
              <li><button onClick={() => navigate("/specs")} className="text-gray-300 hover:text-white text-left">Specification Search</button></li>
              <li><button onClick={() => navigate("/pricing")} className="text-gray-300 hover:text-white text-left">Price Comparison</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigate("/buying-guides")} className="text-gray-300 hover:text-white text-left">Buying Guides</button></li>
              <li><button onClick={() => navigate("/installation")} className="text-gray-300 hover:text-white text-left">Installation Tips</button></li>
              <li><button onClick={() => navigate("/faq")} className="text-gray-300 hover:text-white text-left">FAQ</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigate("/about")} className="text-gray-300 hover:text-white text-left">About Comperra</button></li>
              <li><button onClick={() => navigate("/contact")} className="text-gray-300 hover:text-white text-left">Contact Us</button></li>
              <li><button onClick={() => navigate("/press")} className="text-gray-300 hover:text-white text-left">Press</button></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2025 Comperra. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <button onClick={() => navigate("/privacy")} className="text-gray-400 hover:text-white text-sm">Privacy Policy</button>
              <button onClick={() => navigate("/terms")} className="text-gray-400 hover:text-white text-sm">Terms of Service</button>
              <button onClick={() => navigate("/data-usage")} className="text-gray-400 hover:text-white text-sm">Data Usage</button>
              <button onClick={() => navigate("/cookies")} className="text-gray-400 hover:text-white text-sm">Cookies</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
