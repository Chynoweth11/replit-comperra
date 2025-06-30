import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/header";
import Footer from "@/components/footer";

interface ImportResult {
  message: string;
  scraped: number;
  saved: number;
  totalUrls: number;
}

interface PreviewUrl {
  url: string;
  category: string;
}

export default function DataImport() {
  const [isScrapingBulk, setIsScrapingBulk] = useState(false);
  const [isScrapingSingle, setIsScrapingSingle] = useState(false);
  const [singleUrl, setSingleUrl] = useState("");
  const [urlList, setUrlList] = useState("");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<PreviewUrl[]>([]);
  const { toast } = useToast();

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
      const urls = urlList.split('\n').filter(url => url.trim().startsWith('http'));
      const csvContent = urls.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      
      const formData = new FormData();
      formData.append('urlFile', blob, 'urls.csv');

      const response = await fetch('/api/scrape/bulk', {
        method: 'POST',
        body: formData,
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
    } catch (error) {
      console.error('Text scraping error:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import products from URL list.",
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
      
      toast({
        title: "Product Added",
        description: `Successfully imported: ${data.material.name}`,
      });
      
      setSingleUrl("");
    } catch (error) {
      console.error('Single scraping error:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import product from URL.",
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
      const csvContent = urls.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      
      const formData = new FormData();
      formData.append('urlFile', blob, 'urls.csv');

      const response = await fetch('/api/scrape/bulk', {
        method: 'POST',
        body: formData,
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bulk Import */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Bulk Import</h2>
            <p className="text-gray-600 mb-6">Upload a CSV file with product URLs or paste URLs directly</p>
            
            <div className="space-y-4">
              {/* Elegant Multi-URL Input Interface */}
              <div id="input-area">
                <Label htmlFor="urlInput">Paste URLs (one per line)</Label>
                <Textarea
                  id="urlInput"
                  placeholder={sampleUrls}
                  value={urlList}
                  onChange={(e) => setUrlList(e.target.value)}
                  rows={8}
                  className="mt-1 w-full p-4 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 transition duration-300 ease-in-out focus:border-blue-500 font-mono text-sm"
                />
                <Button 
                  id="process-button"
                  onClick={handlePreviewUrls}
                  disabled={isScrapingBulk || !urlList.trim()}
                  className="mt-3 w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none transition duration-300 ease-in-out"
                >
                  {showPreview ? "Hide Preview" : "Preview URLs"}
                </Button>
              </div>

              {/* URL Preview Area */}
              {showPreview && previewUrls.length > 0 && (
                <div id="preview-area" className="mt-6 fade-in">
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
                    className="mt-4 w-full bg-royal text-white hover:bg-royal-dark"
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
              <Alert className="mt-4">
                <AlertDescription>
                  <strong>Import Complete:</strong> {result.message}
                  <br />
                  Scraped: {result.scraped}/{result.totalUrls} URLs
                  <br />
                  Saved: {result.saved} products
                </AlertDescription>
              </Alert>
            )}
          </Card>

          {/* Single URL Import */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Single Product Import</h2>
            <p className="text-gray-600 mb-6">Import one product at a time for testing</p>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="singleUrl">Product URL</Label>
                <Input
                  id="singleUrl"
                  type="url"
                  placeholder="https://www.daltile.com/products/..."
                  value={singleUrl}
                  onChange={(e) => setSingleUrl(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <Button 
                onClick={handleSingleUrl}
                disabled={isScrapingSingle || !singleUrl.trim()}
                className="w-full bg-royal text-white hover:bg-royal-dark"
              >
                {isScrapingSingle ? "Importing..." : "Import Product"}
              </Button>
            </div>
          </Card>
        </div>

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