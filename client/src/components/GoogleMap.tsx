import React, { useRef, useEffect, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface GoogleMapProps {
  leads: Array<{
    id: string;
    zipCode: string;
    materialCategory: string;
    projectType: string;
    intentScore: number;
    email: string;
  }>;
  height?: string;
  className?: string;
}

const GoogleMap: React.FC<GoogleMapProps> = ({ leads, height = '400px', className = '' }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        // Use the configured Google Maps API key from environment
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        
        if (!apiKey) {
          setError('Google Maps API key not configured. Please add your API key to enable map features.');
          return;
        }

        const loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ['places']
        });

        const google = await loader.load();
        
        if (!mapRef.current) return;

        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: 39.8283, lng: -98.5795 }, // Center of US
          zoom: 4,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        setMap(mapInstance);

        // Add markers for leads
        leads.forEach((lead, index) => {
          // Mock coordinates for demo - in production, use geocoding service
          const mockCoords = {
            lat: 39.8283 + (Math.random() - 0.5) * 20,
            lng: -98.5795 + (Math.random() - 0.5) * 40
          };

          const marker = new google.maps.Marker({
            position: mockCoords,
            map: mapInstance,
            title: `${lead.materialCategory} - ${lead.projectType}`,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="${lead.intentScore >= 8 ? '#10b981' : lead.intentScore >= 6 ? '#f59e0b' : '#ef4444'}"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(30, 30)
            }
          });

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div class="p-2">
                <h4 class="font-semibold">${lead.materialCategory}</h4>
                <p class="text-sm">${lead.projectType}</p>
                <p class="text-sm">Intent Score: ${lead.intentScore}/10</p>
                <p class="text-sm">ZIP: ${lead.zipCode}</p>
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(mapInstance, marker);
          });
        });

      } catch (error) {
        console.error('Error initializing map:', error);
        setError('Failed to load Google Maps. Please check your API key and network connection.');
      }
    };

    initMap();
  }, [leads]);

  if (error) {
    return (
      <div className={`bg-gray-100 border border-gray-300 rounded-lg p-8 text-center ${className}`} style={{ height }}>
        <div className="text-gray-600">
          <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <h3 className="text-lg font-medium mb-2">Google Maps Integration</h3>
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-2">Contact your administrator to configure the Google Maps API key.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`} style={{ height }}>
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default GoogleMap;