import React, { useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import { IcelandPlace } from "../types/IcelandPlace";
import "leaflet/dist/leaflet.css";

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

interface OpenStreetMapProps {
  places: IcelandPlace[];
}

const OpenStreetMap: React.FC<OpenStreetMapProps> = ({ places }) => {
  const mapRef = useRef<L.Map>(null);

  // Filter places with valid coordinates
  const validPlaces = places.filter(
    (place) => place.latitude && place.longitude
  );

  // Calculate bounds to fit all markers
  const getBounds = () => {
    if (validPlaces.length === 0) return undefined;

    const latitudes = validPlaces.map((place) => place.latitude!);
    const longitudes = validPlaces.map((place) => place.longitude!);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    return [
      [minLat, minLng],
      [maxLat, maxLng],
    ] as L.LatLngBoundsExpression;
  };

  const bounds = getBounds();

  // Create path coordinates for the polyline (connecting points in order)
  const pathCoordinates = validPlaces.map(
    (place) => [place.latitude!, place.longitude!] as [number, number]
  );

  return (
    <div
      style={{
        height: "600px",
        width: "100%",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      }}
    >
      <MapContainer
        ref={mapRef}
        center={[64.9631, -19.0208]} // Center of Iceland
        zoom={7}
        bounds={bounds}
        boundsOptions={{ padding: [20, 20] }}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Polyline connecting all points in order */}
        {pathCoordinates.length > 1 && (
          <Polyline
            positions={pathCoordinates}
            pathOptions={{
              color: "#007bff",
              weight: 3,
              opacity: 0.8,
              dashArray: "10, 5",
            }}
          />
        )}

        {validPlaces.map((place, index) => (
          <Marker key={index} position={[place.latitude!, place.longitude!]}>
            <Popup maxWidth={300} minWidth={250}>
              <div style={{ padding: "10px", fontFamily: "Arial, sans-serif" }}>
                <h3
                  style={{
                    margin: "0 0 8px 0",
                    color: "#333",
                    fontSize: "16px",
                  }}
                >
                  {place.location}
                </h3>
                <p style={{ margin: "4px 0", color: "#666", fontSize: "14px" }}>
                  <strong>Day:</strong> {place.day}
                </p>
                <p style={{ margin: "4px 0", color: "#666", fontSize: "14px" }}>
                  <strong>Coordinates:</strong> {place.latitude!.toFixed(6)},{" "}
                  {place.longitude!.toFixed(6)}
                </p>
                {place.googleMapsLink && (
                  <p style={{ margin: "8px 0 0 0", fontSize: "14px" }}>
                    <a
                      href={place.googleMapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#007bff", textDecoration: "none" }}
                    >
                      📍 View in Google Maps
                    </a>
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default OpenStreetMap;
