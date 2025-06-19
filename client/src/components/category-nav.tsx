import { Link, useLocation } from "wouter";

export default function CategoryNav() {
  const [location] = useLocation();

  const categories = [
    { id: "tiles", name: "Tiles", path: "/comparison/tiles" },
    { id: "slabs", name: "Stone & Slabs", path: "/comparison/slabs" },
    { id: "lvt", name: "Vinyl & LVT", path: "/comparison/lvt" },
    { id: "hardwood", name: "Hardwood", path: "/comparison/hardwood" },
    { id: "heat", name: "Heating", path: "/comparison/heat" },
    { id: "carpet", name: "Carpet", path: "/comparison/carpet" }
  ];

  return (
    <nav className="bg-white shadow sticky top-0 z-50 border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-center space-x-6 text-sm font-semibold text-gray-700">
        {categories.map((category) => (
          <Link key={category.id} href={category.path}>
            <a 
              className={`hover:text-blue-600 transition-colors px-3 py-1 rounded ${
                location.includes(category.id) ? 'text-blue-600 bg-blue-50' : ''
              }`}
            >
              {category.name}
            </a>
          </Link>
        ))}
      </div>
    </nav>
  );
}