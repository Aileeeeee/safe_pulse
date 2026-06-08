"use client";
import { useEffect, useRef } from "react";

interface IncidentMapProps {
  latitude:  number;
  longitude: number;
  location:  string;
  severity:  string;
  height?:   number;
}

const SEV_COLORS: Record<string, string> = {
  Critical: "#d63b3b",
  High:     "#e07c2a",
  Medium:   "#c9a000",
  Low:      "#1c6e4e",
};

export function IncidentMap({
  latitude,
  longitude,
  location,
  severity,
  height = 320,
}: IncidentMapProps) {
  const mapRef      = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<unknown>(null);
  const color       = SEV_COLORS[severity] ?? "#d63b3b";

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    import("leaflet").then((L) => {
      // Fix marker icon issue with Next.js
      const DefaultIcon = L.icon({
        iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize:      [25, 41],
        iconAnchor:    [12, 41],
      });
      L.Marker.prototype.options.icon = DefaultIcon;

      const map = L.map(mapRef.current!, {
        center:          [latitude, longitude],
        zoom:            14,
        zoomControl:     true,
        scrollWheelZoom: false,
        attributionControl: false,
      });

      // OpenStreetMap — free, no API key
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      // Radius circle
      L.circle([latitude, longitude], {
        radius:      300,
        fillColor:   color,
        fillOpacity: 0.12,
        color:       color,
        weight:      1.5,
        opacity:     0.4,
      }).addTo(map);

      // Custom pulsing marker
      const pulseIcon = L.divIcon({
        html: `
          <div style="position:relative;width:28px;height:28px;display:flex;align-items:center;justify-content:center">
            <div style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:0.25;animation:sp-ping 1.5s ease infinite"></div>
            <div style="position:relative;width:14px;height:14px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25)"></div>
          </div>
          <style>
            @keyframes sp-ping {
              0%   { transform: scale(1);   opacity: 0.25; }
              70%  { transform: scale(2.2); opacity: 0; }
              100% { transform: scale(2.2); opacity: 0; }
            }
          </style>
        `,
        className:  "",
        iconSize:   [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([latitude, longitude], { icon: pulseIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family:DM Sans,sans-serif;padding:2px 0">
          <p style="font-size:11px;color:#9c9a94;margin:0 0 3px">INCIDENT LOCATION</p>
          <p style="font-size:13px;font-weight:600;color:#1a1a18;margin:0">${location}</p>
          <p style="font-size:10px;color:#9c9a94;margin:3px 0 0;font-family:monospace">
            ${latitude.toFixed(6)}, ${longitude.toFixed(6)}
          </p>
        </div>
      `).openPopup();

      mapInstance.current = map;
    });

    return () => {
      if (mapInstance.current) {
        (mapInstance.current as { remove: () => void }).remove();
        mapInstance.current = null;
      }
    };
  }, [latitude, longitude, location, severity, color]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div
        ref={mapRef}
        className="w-full rounded-xl overflow-hidden border border-gray-100"
        style={{ height, zIndex: 0 }}
      />
    </>
  );
}