"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import { cn } from "@/lib/utils";
import "leaflet/dist/leaflet.css";

interface PropertyMapClientProps {
  latitude: number;
  longitude: number;
  title: string;
  address: string;
  featuredImage?: string;
  className?: string;
}

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

export function PropertyMapClient({
  latitude,
  longitude,
  title,
  address,
  featuredImage,
  className,
}: PropertyMapClientProps) {
  const position: [number, number] = [latitude, longitude];

  return (
    <MapContainer
      center={position}
      zoom={15}
      scrollWheelZoom={false}
      className={cn("w-full z-0", className)}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position} icon={defaultIcon}>
        <Popup>
          <div className="text-sm min-w-[200px]">
            {featuredImage && (
              <div className="w-full h-24 mb-2 rounded overflow-hidden bg-muted">
                <img
                  src={featuredImage}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <p className="font-semibold">{title}</p>
            <p className="text-muted-foreground">{address}</p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
