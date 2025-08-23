import React, { useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { IcelandPlace } from "../types/IcelandPlace";
import ImageCarousel from "./ImageCarousel";
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
  selectedPlaceIndex: number | null;
  onNextPlace: () => void;
  onPrevPlace: () => void;
  onPlaceSelect: (index: number) => void;
}

const OpenStreetMap: React.FC<OpenStreetMapProps> = ({
  places,
  selectedPlaceIndex,
  onNextPlace,
  onPrevPlace,
  onPlaceSelect,
}) => {
  const mapRef = useRef<L.Map>(null);
  const markerRefs = useRef<(L.Marker | null)[]>([]);
  const isMobile = window.innerWidth < 768;
  const imageHeight = isMobile ? 250 : 150;

  // Effect to open popup when a place is selected
  useEffect(() => {
    if (selectedPlaceIndex !== null && markerRefs.current[selectedPlaceIndex]) {
      const marker = markerRefs.current[selectedPlaceIndex];
      if (marker) {
        marker.openPopup();
        // Center the map on the selected marker
        if (mapRef.current) {
          const position = marker.getLatLng();
          mapRef.current.setView(position, mapRef.current.getZoom());
        }
      }
    }
  }, [selectedPlaceIndex]);

  // Create custom icons for normal and highlighted markers
  const getDayColor = (day: string): string => {
    // Extract day number from day string (e.g., "Day 1" -> 1)
    const dayNumber = parseInt(day.replace(/\D/g, "")) || 1;

    // Color palette for different days
    const colors = [
      "#2196F3", // Day 1 - Blue
      "#4CAF50", // Day 2 - Green
      "#FF9800", // Day 3 - Orange
      "#9C27B0", // Day 4 - Purple
      "#F44336", // Day 5 - Red
      "#00BCD4", // Day 6 - Cyan
      "#CDDC39", // Day 7 - Lime
      "#FF5722", // Day 8 - Deep Orange
      "#3F51B5", // Day 9 - Indigo
      "#E91E63", // Day 10 - Pink
      "#795548", // Day 11 - Brown
      "#607D8B", // Day 12 - Blue Grey
    ];

    return colors[(dayNumber - 1) % colors.length];
  };

  const createCustomIcon = (
    isSelected: boolean,
    index: number,
    day: string
  ) => {
    const baseColor = getDayColor(day);
    const iconColor = isSelected ? "#ff4757" : baseColor;
    const shadowColor = isSelected
      ? "rgba(255, 71, 87, 0.4)"
      : `${baseColor}66`;
    const size = isSelected ? 32 : 28;
    const pulseAnimation = isSelected ? "animation: pulse 2s infinite;" : "";

    return new L.DivIcon({
      html: `
        <style>
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 ${shadowColor}; }
            70% { box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
            100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
          }
        </style>
        <div style="
          position: relative;
          width: ${size}px;
          height: ${size}px;
        ">
          <!-- Marker pin shape -->
          <div style="
            background: linear-gradient(135deg, ${iconColor} 0%, ${iconColor}dd 100%);
            width: ${size}px;
            height: ${size}px;
            border-radius: 50% 50% 50% 0;
            border: 2px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: ${isSelected ? "14px" : "12px"};
            transform: rotate(-45deg);
            position: relative;
            ${pulseAnimation}
          ">
            <span style="transform: rotate(45deg); text-shadow: 0 1px 2px rgba(0,0,0,0.3);">${
              index + 1
            }</span>
          </div>
        </div>
      `,
      className: "custom-marker-enhanced",
      iconSize: [size, size + 8] as [number, number],
      iconAnchor: [size / 2, size + 4] as [number, number],
      popupAnchor: [0, -(size + 4)] as [number, number],
    });
  };

  // Filter places with valid coordinates
  const validPlaces = places.filter(
    (place) => place.latitude && place.longitude
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (validPlaces.length === 0) return;

      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        onPrevPlace();
      } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        onNextPlace();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [onNextPlace, onPrevPlace, validPlaces.length]);

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

  return (
    <div
      style={{
        height: "600px",
        width: "100%",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        position: "relative",
      }}
    >
      {/* Navigation Arrows */}
      {validPlaces.length > 1 && (
        <>
          <button
            onClick={onPrevPlace}
            style={{
              position: "absolute",
              left: "15px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(0, 123, 255, 0.9)",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: "bold",
              zIndex: 1000,
              boxShadow: "0 4px 12px rgba(0, 123, 255, 0.3)",
              transition: "all 0.2s ease-in-out",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(0, 123, 255, 1)";
              e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(0, 123, 255, 0.9)";
              e.currentTarget.style.transform = "translateY(-50%) scale(1)";
            }}
            title="Previous location"
          >
            &#8249;
          </button>

          <button
            onClick={onNextPlace}
            style={{
              position: "absolute",
              right: "15px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(0, 123, 255, 0.9)",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: "bold",
              zIndex: 1000,
              boxShadow: "0 4px 12px rgba(0, 123, 255, 0.3)",
              transition: "all 0.2s ease-in-out",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(0, 123, 255, 1)";
              e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(0, 123, 255, 0.9)";
              e.currentTarget.style.transform = "translateY(-50%) scale(1)";
            }}
            title="Next location"
          >
            &#8250;
          </button>
        </>
      )}

      {/* Location Counter */}
      {validPlaces.length > 0 && selectedPlaceIndex !== null && (
        <div
          style={{
            position: "absolute",
            top: "15px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "8px 16px",
            borderRadius: "20px",
            fontSize: "14px",
            fontWeight: "bold",
            zIndex: 1000,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
          }}
        >
          {selectedPlaceIndex + 1} of {validPlaces.length}:{" "}
          {validPlaces[selectedPlaceIndex]?.location}
        </div>
      )}

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

        {validPlaces.map((place, index) => (
          <Marker
            key={index}
            position={[place.latitude!, place.longitude!]}
            icon={createCustomIcon(
              selectedPlaceIndex === index,
              index,
              place.day
            )}
            ref={(ref) => {
              markerRefs.current[index] = ref;
            }}
            eventHandlers={{
              click: () => {
                onPlaceSelect(index);
              },
            }}
          >
            <Popup maxWidth={300} minWidth={250}>
              <div
                style={{
                  fontFamily: "Arial, sans-serif",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                  }}
                >
                  <ImageCarousel
                    images={place.images}
                    alt={place.location}
                    height={`${imageHeight}px`}
                  />
                </div>
                <div
                  style={{
                    paddingTop: imageHeight,
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      background: `linear-gradient(135deg, ${getDayColor(
                        place.day
                      )} 0%, ${getDayColor(place.day)}dd 100%)`,
                      color: "white",
                      borderRadius: "50%",
                      width: "28px",
                      height: "28px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "13px",
                      fontWeight: "bold",
                      marginRight: "12px",
                      boxShadow: `0 2px 8px ${getDayColor(place.day)}30`,
                      textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                    }}
                  >
                    {index + 1}
                  </div>
                  <h3
                    style={{
                      margin: "0",
                      color: "#333",
                      fontSize: "17px",
                      fontWeight: "600",
                    }}
                  >
                    {place.location}
                  </h3>
                </div>
                <p style={{ margin: "4px 0", color: "#666", fontSize: "14px" }}>
                  <strong>Day:</strong> {place.day}
                </p>
                {place.description && (
                  <p
                    style={{
                      margin: "8px 0",
                      color: "#555",
                      fontSize: "14px",
                      lineHeight: "1.4",
                      fontStyle: "italic",
                    }}
                  >
                    {place.description}
                  </p>
                )}
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
