import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search } from 'lucide-react';

interface MapPickerProps {
  latitude?: number;
  longitude?: number;
  onLocationSelect: (lat: number, lng: number) => void;
}

export function MapPicker({ latitude, longitude, onLocationSelect }: MapPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLat, setSelectedLat] = useState(latitude || 41.2995);
  const [selectedLng, setSelectedLng] = useState(longitude || 69.2401);
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Load Leaflet CSS and JS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      initializeMap();
    };
    document.body.appendChild(script);

    return () => {
      if (link.parentNode) link.parentNode.removeChild(link);
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const L = (window as any).L;
    const map = L.map(mapRef.current).setView([selectedLat, selectedLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([selectedLat, selectedLng]).addTo(map);

    map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      setSelectedLat(lat);
      setSelectedLng(lng);
      marker.setLatLng([lat, lng]);
    });

    mapInstanceRef.current = { map, marker, L };
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`
      );
      const results = await response.json();

      if (results.length > 0) {
        const { lat, lon } = results[0];
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);
        setSelectedLat(newLat);
        setSelectedLng(newLng);

        if (mapInstanceRef.current) {
          const { map, marker } = mapInstanceRef.current;
          map.setView([newLat, newLng], 13);
          marker.setLatLng([newLat, newLng]);
        }
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="Joylashuvni qidiring (masalan: Tashkent)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          data-testid="input-map-search"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleSearch}
          disabled={isSearching}
          data-testid="button-search-location"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={mapRef}
        className="w-full h-64 rounded-md border border-input"
        data-testid="map-container"
      />

      <div className="flex gap-2 text-sm">
        <div className="flex-1">
          <p className="text-muted-foreground">Latitude</p>
          <p className="font-mono font-semibold">{selectedLat.toFixed(6)}</p>
        </div>
        <div className="flex-1">
          <p className="text-muted-foreground">Longitude</p>
          <p className="font-mono font-semibold">{selectedLng.toFixed(6)}</p>
        </div>
      </div>

      <Button
        type="button"
        className="w-full"
        onClick={() => onLocationSelect(selectedLat, selectedLng)}
        data-testid="button-confirm-location"
      >
        <MapPin className="h-4 w-4 mr-2" />
        Bu joylashuvni tanlash
      </Button>
    </div>
  );
}
