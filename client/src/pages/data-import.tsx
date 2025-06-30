import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";

interface ImportResult {
  message: string;
  scraped: number;
  saved: number;
  totalUrls: number;
  validUrls?: number;
  invalidUrls?: number;
  skippedUrls?: string[];
  products?: Array<{
    name: string;
    brand: string;
    category: string;
    sourceUrl: string;
  }>;
}

interface PreviewUrl {
  url: string;
  category: string;
}

export default function DataImport() {
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();
  const [isScrapingBulk, setIsScrapingBulk] = useState(false);
  const [isScrapingSingle, setIsScrapingSingle] = useState(false);
  const [singleUrl, setSingleUrl] = useState("");
  const [urlList, setUrlList] = useState("");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<PreviewUrl[]>([]);
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('bulk');
  const [showNavigationOptions, setShowNavigationOptions] = useState(false);
  const { toast } = useToast();

  // Navigation helper functions
  const navigateToComparison = () => {
    setLocation('/compare');
    setShowNavigationOptions(false);
  };

  const navigateToCategory = (category: string) => {
    setLocation(`/comparison/${category}`);
    setShowNavigationOptions(false);
  };

  const navigateToAllProducts = () => {
    setLocation('/comparison/all');
    setShowNavigationOptions(false);
  };

  const resetForm = () => {
    setResult(null);
    setShowNavigationOptions(false);
    setProgress(0);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScrapingBulk(true);
    setProgress(0);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('urlFile', file);

      const response = await fetch('/api/scrape/bulk', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data: ImportResult = await response.json();
      setResult(data);
      setProgress(100);
      
      toast({
        title: "Import Complete",
        description: `Successfully imported ${data.saved} products from ${data.totalUrls} URLs`,
      });
    } catch (error) {
      console.error('Bulk scraping error:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import products. Please check your file format.",
        variant: "destructive",
      });
    } finally {
      setIsScrapingBulk(false);
    }
  };

  const handleTextUpload = async () => {
    if (!urlList.trim()) {
      toast({
        title: "No URLs provided",
        description: "Please enter product URLs in the text area",
        variant: "destructive",
      });
      return;
    }

    setIsScrapingBulk(true);
    setProgress(0);
    setResult(null);

    try {
      // Parse URLs from text input
      const urls = urlList
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0 && url.startsWith('http'));

      if (urls.length === 0) {
        throw new Error('No valid URLs found. Please ensure URLs start with http:// or https://');
      }

      // Use the new bulk URLs endpoint
      const response = await fetch('/api/scrape/bulk-urls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process URLs');
      }

      const data: ImportResult = await response.json();
      setResult(data);
      setProgress(100);
      
      // Invalidate React Query cache to refresh all product listings
      await queryClient.invalidateQueries({ 
        queryKey: ["/api/materials"] 
      });
      
      // Show success message and navigation options
      setShowNavigationOptions(true);
      setUrlList(""); // Clear the input area
      
      toast({
        title: "Import Complete",
        description: `Successfully imported ${data.saved} products from ${data.validUrls || data.totalUrls} URLs${data.invalidUrls ? `. ${data.invalidUrls} invalid URLs skipped.` : ''}`,
      });
    } catch (error) {
      console.error('Bulk scraping error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to import products from URL list.";
      toast({
        title: "Import Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsScrapingBulk(false);
    }
  };

  const handleSingleUrl = async () => {
    if (!singleUrl.trim()) {
      toast({
        title: "No URL provided",
        description: "Please enter a product URL",
        variant: "destructive",
      });
      return;
    }

    setIsScrapingSingle(true);

    try {
      const response = await fetch('/api/scrape/single', {
        method: 'POST',
        body: JSON.stringify({ url: singleUrl }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Product Added",
          description: `Successfully imported: ${data.product.name} - Category: ${data.product.category}`,
        });
        setSingleUrl("");
        
        // Invalidate React Query cache to refresh materials data
        await queryClient.invalidateQueries({ 
          queryKey: ["/api/materials"] 
        });
      } else {
        throw new Error(data.message || "Failed to scrape product");
      }
    } catch (error) {
      console.error('Single scraping error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to import product from URL.";
      toast({
        title: "Import Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsScrapingSingle(false);
    }
  };

  // Category detection function based on URL analysis
  const detectCategoryFromUrl = (url: string): string => {
    const urlLower = url.toLowerCase();
    
    // Thermostat detection (check first for compound terms)
    if (urlLower.includes('thermostat') || urlLower.includes('thermostats') || 
        urlLower.includes('temperature-control') || urlLower.includes('heating-control')) {
      return 'thermostats';
    }
    
    // Carpet detection (including carpet tiles)
    if (urlLower.includes('carpet') || urlLower.includes('rug') || 
        urlLower.includes('commercial-carpet') || urlLower.includes('carpet-tile')) {
      return 'carpet';
    }
    
    // Hardwood detection
    if (urlLower.includes('hardwood') || urlLower.includes('wood-flooring') || 
        urlLower.includes('engineered-wood') || urlLower.includes('solid-wood') ||
        urlLower.includes('oak') || urlLower.includes('maple') || urlLower.includes('hickory') ||
        urlLower.includes('pine') || urlLower.includes('reclaimed') || urlLower.includes('timber')) {
      return 'hardwood';
    }
    
    // LVT/Vinyl detection
    if (urlLower.includes('vinyl') || urlLower.includes('lvt') || 
        urlLower.includes('luxury-vinyl') || urlLower.includes('lvp') ||
        urlLower.includes('resilient') || urlLower.includes('waterproof-plank')) {
      return 'lvt';
    }
    
    // Heating system detection
    if (urlLower.includes('heating') || urlLower.includes('radiant') || 
        urlLower.includes('heat-mat') || urlLower.includes('floor-heating') ||
        urlLower.includes('underfloor')) {
      return 'heat';
    }
    
    // Stone & Slabs detection (quartz, granite, marble, etc.)
    if (urlLower.includes('slab') || urlLower.includes('countertop') ||
        urlLower.includes('quartz') || urlLower.includes('granite') || 
        urlLower.includes('marble') || urlLower.includes('travertine') ||
        urlLower.includes('limestone') || urlLower.includes('slate') ||
        urlLower.includes('natural-stone') || urlLower.includes('engineered-stone')) {
      return 'slabs';
    }
    
    // Default to tiles for ceramic, porcelain, etc.
    return 'tiles';
  };

  // Helper functions for category display
  const getCategoryDisplayName = (category: string): string => {
    const categoryNames: Record<string, string> = {
      'tiles': 'Tiles',
      'slabs': 'Stone & Slabs', 
      'lvt': 'Vinyl & LVT',
      'hardwood': 'Hardwood',
      'heat': 'Heating',
      'carpet': 'Carpet',
      'thermostats': 'Thermostats'
    };
    return categoryNames[category] || 'Tiles';
  };

  const getCategoryColor = (category: string): string => {
    const categoryColors: Record<string, string> = {
      'tiles': 'bg-blue-100 text-blue-800',
      'slabs': 'bg-gray-100 text-gray-800',
      'lvt': 'bg-green-100 text-green-800',
      'hardwood': 'bg-amber-100 text-amber-800',
      'heat': 'bg-red-100 text-red-800',
      'carpet': 'bg-purple-100 text-purple-800',
      'thermostats': 'bg-indigo-100 text-indigo-800'
    };
    return categoryColors[category] || 'bg-blue-100 text-blue-800';
  };

  // Preview URLs function
  const handlePreviewUrls = () => {
    if (!urlList.trim()) {
      toast({
        title: "No URLs provided",
        description: "Please enter product URLs in the text area",
        variant: "destructive",
      });
      return;
    }

    const urls = urlList
      .trim()
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.startsWith('http'));

    if (urls.length === 0) {
      toast({
        title: "No valid URLs found",
        description: "Please ensure each URL starts with http and is on a new line",
        variant: "destructive",
      });
      return;
    }

    const urlsWithCategories = urls.map(url => ({
      url,
      category: detectCategoryFromUrl(url)
    }));

    setPreviewUrls(urlsWithCategories);
    setShowPreview(!showPreview);
  };

  // Bulk scraping function
  const handleBulkScrape = async () => {
    setIsScrapingBulk(true);
    setProgress(0);
    setResult(null);

    try {
      const urls = previewUrls.map(item => item.url);
      
      const response = await fetch('/api/scrape/bulk-urls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls }),
      });

      if (!response.ok) {
        throw new Error('Failed to process URLs');
      }

      const data: ImportResult = await response.json();
      setResult(data);
      setProgress(100);
      
      toast({
        title: "Import Complete",
        description: `Successfully imported ${data.saved} products from ${data.totalUrls} URLs`,
      });

      // Clear the preview after successful scraping
      setShowPreview(false);
      setPreviewUrls([]);
      setUrlList("");
      
    } catch (error) {
      console.error('Bulk scraping error:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import products from URL list.",
        variant: "destructive",
      });
    } finally {
      setIsScrapingBulk(false);
    }
  };

  const sampleUrls = `https://www.daltile.com/products/terrazzo-look/outlander/sterling
https://www.msisurfaces.com/porcelain/brickstone-red/
https://www.arizonatile.com/en/products/ceramic-porcelain/
https://www.floridatile.com/products/porcelain-tile/
https://www.akdo.com/collections/ceramic-tile/`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Product Data Import</h1>
          <p className="text-gray-600">Import real product data from manufacturer websites to populate your comparison database</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8 w-fit">
          <button
            onClick={() => setActiveTab('bulk')}
            className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
              activeTab === 'bulk'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🔗 Bulk URL Import
          </button>
          <button
            onClick={() => setActiveTab('single')}
            className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
              activeTab === 'single'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📱 Single Product
          </button>
        </div>

        {activeTab === 'bulk' && (
          <Card className="p-8 hover-lift transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">🔗</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Bulk URL Import</h2>
                <p className="text-gray-600">Import multiple products at once with intelligent category detection</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">How It Works</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    <span className="text-blue-800">Paste URLs</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <span className="text-blue-800">Preview Categories</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <span className="text-blue-800">Import Products</span>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="urlInput" className="text-base font-medium text-gray-700 mb-3 block">
                  Product URLs
                </Label>
                <p className="text-sm text-gray-500 mb-3">
                  Paste one URL per line. We support Daltile, MSI, Arizona Tile, Shaw, Cambria, and more.
                </p>
                <Textarea
                  id="urlInput"
                  placeholder={sampleUrls}
                  value={urlList}
                  onChange={(e) => setUrlList(e.target.value)}
                  rows={6}
                  className="w-full p-4 bg-white border-2 border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-mono text-sm resize-none"
                />
                <div className="flex justify-between items-center mt-3">
                  <span className="text-sm text-gray-500">
                    {urlList.trim().split('\n').filter(line => line.trim().startsWith('http')).length} valid URLs detected
                  </span>
                  <Button 
                    onClick={handlePreviewUrls}
                    disabled={isScrapingBulk || !urlList.trim()}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105"
                  >
                    {showPreview ? "Hide Preview" : "Preview URLs"}
                  </Button>
                </div>
              </div>

              {/* URL Preview Area */}
              {showPreview && previewUrls.length > 0 && (
                <div className="fade-in">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">URL Preview</h3>
                    <span className="text-sm font-medium text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                      {previewUrls.length} URLs Found
                    </span>
                  </div>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg max-h-80">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            URL
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Detected Category
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {previewUrls.map((item, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-6 py-4 text-sm text-gray-700" style={{ wordBreak: 'break-all' }}>
                              {item.url}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                                {getCategoryDisplayName(item.category)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <Button 
                    onClick={handleBulkScrape}
                    disabled={isScrapingBulk}
                    className="mt-4 w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105"
                  >
                    {isScrapingBulk ? "Processing..." : `Scrape ${previewUrls.length} Products`}
                  </Button>
                </div>
              )}
            </div>

            {isScrapingBulk && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            {result && (
              <div className="mt-6">
                <Alert className="mb-4 bg-green-50 border-green-200">
                  <AlertDescription className="text-green-800">
                    <strong>Import Complete!</strong> {result.message}
                    <br />
                    Scraped: {result.scraped}/{result.totalUrls} URLs
                    <br />
                    Saved: {result.saved} products
                    {result.invalidUrls && result.invalidUrls > 0 && (
                      <>
                        <br />
                        <span className="text-amber-700">Note: {result.invalidUrls} invalid URLs were skipped</span>
                      </>
                    )}
                  </AlertDescription>
                </Alert>

                {/* Navigation Options */}
                {showNavigationOptions && (
                  <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">🎉 What would you like to do next?</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <Button 
                        onClick={navigateToComparison}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105"
                      >
                        🔍 View Comparison Table
                      </Button>
                      
                      <Button 
                        onClick={navigateToAllProducts}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105"
                      >
                        🏠 Browse All Products
                      </Button>
                    </div>

                    {/* Category-specific navigation */}
                    {result.products && result.products.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-blue-800 mb-2">Browse by Category:</h4>
                        <div className="flex flex-wrap gap-2">
                          {Array.from(new Set(result.products.map(p => p.category))).map((category) => (
                            <Button
                              key={category}
                              onClick={() => navigateToCategory(category)}
                              variant="outline"
                              className="text-xs py-1 px-3 border-blue-300 text-blue-700 hover:bg-blue-100 capitalize"
                            >
                              {category}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t border-blue-200">
                      <span className="text-sm text-blue-700">
                        {result.saved} products are now available for comparison
                      </span>
                      <Button 
                        onClick={resetForm}
                        variant="outline"
                        className="text-blue-700 border-blue-300 hover:bg-blue-100"
                      >
                        Import More Products
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </Card>
        )}

        {activeTab === 'single' && (
          <Card className="p-8 hover-lift transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">📱</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Single Product Import</h2>
                <p className="text-gray-600">Test individual products for quality and accuracy</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold text-green-900 mb-3">Quick Test</h3>
                <p className="text-green-800 text-sm">
                  Perfect for testing a single product URL to verify specifications and category detection before bulk importing.
                </p>
              </div>

              <div>
                <Label htmlFor="singleUrl" className="text-base font-medium text-gray-700 mb-3 block">
                  Product URL
                </Label>
                <p className="text-sm text-gray-500 mb-3">
                  Paste any supported manufacturer product URL to test the import process.
                </p>
                <Input
                  id="singleUrl"
                  type="url"
                  placeholder="https://www.daltile.com/products/emerson-wood/sterling"
                  value={singleUrl}
                  onChange={(e) => setSingleUrl(e.target.value)}
                  className="w-full p-4 bg-white border-2 border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 transition-all duration-300 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                />
                
                <Button 
                  onClick={handleSingleUrl}
                  disabled={isScrapingSingle || !singleUrl.trim()}
                  className="mt-4 w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105"
                >
                  {isScrapingSingle ? "Importing..." : "Import Product"}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Supported Manufacturers */}
        <Card className="mt-8 p-6">
          <h2 className="text-xl font-bold mb-4">Supported Manufacturers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Daltile", url: "daltile.com", category: "Tiles" },
              { name: "MSI", url: "msisurfaces.com", category: "Stone & Slabs" },
              { name: "Arizona Tile", url: "arizonatile.com", category: "Tiles & Stone" },
              { name: "Florida Tile", url: "floridatile.com", category: "Ceramic & Porcelain" },
              { name: "AKDO", url: "akdo.com", category: "Luxury Tile" },
              { name: "Shaw", url: "shawfloors.com", category: "Flooring" },
              { name: "Mohawk", url: "mohawkflooring.com", category: "All Categories" },
              { name: "Cambria", url: "cambriausa.com", category: "Quartz" },
            ].map((brand) => (
              <div key={brand.name} className="text-center p-3 border rounded-lg">
                <div className="font-semibold">{brand.name}</div>
                <div className="text-sm text-gray-600">{brand.url}</div>
                <div className="text-xs text-royal">{brand.category}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Instructions */}
        <Card className="mt-8 p-6">
          <h2 className="text-xl font-bold mb-4">How to Use</h2>
          <div className="space-y-4 text-gray-600">
            <div>
              <h3 className="font-semibold text-gray-900">1. Collect Product URLs</h3>
              <p>Visit manufacturer websites and copy product page URLs from their catalogs</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">2. Prepare Your Data</h3>
              <p>Create a CSV file or list with one product URL per line</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">3. Import Products</h3>
              <p>Upload your file or paste URLs to automatically extract product data including specifications, images, and pricing</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">4. View Results</h3>
              <p>Imported products will automatically appear in the comparison tool, organized by category</p>
            </div>
          </div>
        </Card>
      </div>

      <Footer />
    </div>
  );
}