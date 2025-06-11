export default function Footer() {
  const footerSections = [
    {
      title: "Compare Materials",
      links: [
        { name: "All Categories", href: "#" },
        { name: "Brand Directory", href: "#" },
        { name: "Specification Search", href: "#" },
        { name: "Price Comparison", href: "#" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Buying Guides", href: "#" },
        { name: "Installation Tips", href: "#" },
        { name: "Video Reviews", href: "#" },
        { name: "FAQ", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Comperra", href: "#" },
        { name: "Contact Us", href: "#" },
        { name: "Careers", href: "#" },
        { name: "Press", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "#" },
        { name: "Terms of Service", href: "#" },
        { name: "Data Usage", href: "#" },
        { name: "Cookies", href: "#" },
      ],
    },
  ];

  const socialLinks = [
    { icon: "fab fa-twitter", href: "#" },
    { icon: "fab fa-linkedin", href: "#" },
    { icon: "fab fa-youtube", href: "#" },
    { icon: "fab fa-instagram", href: "#" },
  ];

  return (
    <footer className="bg-white border-t py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h5 className="font-semibold text-gray-900 mb-4">{section.title}</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="hover:text-royal transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <h1 className="text-xl font-bold text-royal mr-6">Comperra</h1>
            <p className="text-sm text-gray-600">© 2025 Comperra. All rights reserved.</p>
          </div>
          <div className="flex space-x-4">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                className="text-gray-400 hover:text-royal transition-colors"
              >
                <i className={`${social.icon} text-xl`}></i>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
