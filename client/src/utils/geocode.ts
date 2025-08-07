// utils/geocode.ts
export async function getLatLngFromGoogle(fullAddress: string): Promise<{ lat: number; lng: number }> {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.status === 'OK') {
    const { lat, lng } = data.results[0].geometry.location;
    return { lat, lng };
  } else {
    console.error('Geocoding failed:', data.status);
    throw new Error('Failed to geocode address');
  }
}