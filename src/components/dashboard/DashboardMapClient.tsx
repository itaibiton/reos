"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import { useRouter } from "next/navigation";
import "leaflet/dist/leaflet.css";

interface PropertyMarker {
  id: string;
  title: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  priceUsd: number;
  propertyType: string;
  featuredImage?: string;
}

interface DashboardMapClientProps {
  properties: PropertyMarker[];
}

// Currency formatter for USD
const formatUSD = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
};

// Property type labels
const PROPERTY_TYPE_LABELS: Record<string, string> = {
  residential: "Residential",
  commercial: "Commercial",
  mixed_use: "Mixed Use",
  land: "Land",
};

// Fix for default marker icon in Leaflet with bundlers
const defaultIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export function DashboardMapClient({ properties }: DashboardMapClientProps) {
  const router = useRouter();

  // Calculate bounds center from all properties
  const validProperties = properties.filter(
    (p) => p.latitude && p.longitude && !isNaN(p.latitude) && !isNaN(p.longitude)
  );

  // Default center (Israel) if no properties
  const defaultCenter: [number, number] = [31.5, 34.8];
  const defaultZoom = 8;

  // Calculate center from properties
  let center = defaultCenter;
  let zoom = defaultZoom;

  if (validProperties.length > 0) {
    const lats = validProperties.map((p) => p.latitude);
    const lngs = validProperties.map((p) => p.longitude);
    const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
    center = [avgLat, avgLng];

    // Adjust zoom based on spread
    const latSpread = Math.max(...lats) - Math.min(...lats);
    const lngSpread = Math.max(...lngs) - Math.min(...lngs);
    const maxSpread = Math.max(latSpread, lngSpread);

    if (maxSpread < 0.1) zoom = 13;
    else if (maxSpread < 0.5) zoom = 11;
    else if (maxSpread < 1) zoom = 10;
    else if (maxSpread < 2) zoom = 9;
    else zoom = 8;
  }

  const handlePropertyClick = (propertyId: string) => {
    router.push(`/properties/${propertyId}`);
  };

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      className="h-full w-full z-0"
      style={{ minHeight: "400px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {validProperties.map((property) => (
        <Marker
          key={property.id}
          position={[property.latitude, property.longitude]}
          icon={defaultIcon}
        >
          <Popup>
            <div className="text-sm min-w-[220px]">
              {property.featuredImage && (
                <div className="w-full h-28 mb-2 rounded overflow-hidden bg-muted">
                  <img
                    src={property.featuredImage}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <p className="font-semibold text-base mb-1">{property.title}</p>
              <p className="text-muted-foreground text-xs mb-2">
                {property.address}, {property.city}
              </p>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-primary">
                  {formatUSD(property.priceUsd)}
                </span>
                <span className="text-xs bg-muted px-2 py-0.5 rounded">
                  {PROPERTY_TYPE_LABELS[property.propertyType] || property.propertyType}
                </span>
              </div>
              <button
                onClick={() => handlePropertyClick(property.id)}
                className="w-full text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded hover:bg-primary/90 transition-colors"
              >
                View Details
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
