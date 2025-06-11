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

export default function DataImport() {
  const [isScrapingBulk, setIsScrapingBulk] = useState(false);
  const [isScrapingSingle, setIsScrapingSingle] = useState(false);
  const [singleUrl, setSingleUrl] = useState("");
  const [urlList, setUrlList] = useState("");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
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
              <div>
                <Label htmlFor="csvFile">Upload CSV File</Label>
                <Input
                  id="csvFile"
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  disabled={isScrapingBulk}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  CSV file should contain one URL per line
                </p>
              </div>
              
              <div className="text-center text-gray-400">or</div>
              
              <div>
                <Label htmlFor="urlList">Paste URLs (one per line)</Label>
                <Textarea
                  id="urlList"
                  placeholder={sampleUrls}
                  value={urlList}
                  onChange={(e) => setUrlList(e.target.value)}
                  rows={8}
                  className="mt-1 font-mono text-sm"
                />
              </div>
              
              <Button 
                onClick={handleTextUpload}
                disabled={isScrapingBulk || !urlList.trim()}
                className="w-full bg-royal text-white hover:bg-royal-dark"
              >
                {isScrapingBulk ? "Processing..." : "Import from URLs"}
              </Button>
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