import React, { useEffect, useRef } from "react";
import { IcelandPlace } from "../types/IcelandPlace";
import ImageCarousel from "./ImageCarousel";

interface PlacesListProps {
  places: IcelandPlace[];
  onPlaceSelect: (index: number) => void;
  selectedPlaceIndex: number | null;
}

const PlacesList: React.FC<PlacesListProps> = ({
  places,
  onPlaceSelect,
  selectedPlaceIndex,
}) => {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize refs array
  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, places.length);
  }, [places.length]);

  // Scroll to selected item within the container when selectedPlaceIndex changes
  useEffect(() => {
    if (
      selectedPlaceIndex !== null &&
      cardRefs.current[selectedPlaceIndex] &&
      containerRef.current
    ) {
      const selectedCard = cardRefs.current[selectedPlaceIndex];
      const container = containerRef.current;

      if (selectedCard) {
        const cardTop = selectedCard.offsetTop;
        const cardHeight = selectedCard.offsetHeight;
        const containerTop = container.scrollTop;
        const containerHeight = container.clientHeight;

        // Calculate if the card is visible in the container
        const cardBottom = cardTop + cardHeight;
        const containerBottom = containerTop + containerHeight;

        // Scroll only if the card is not fully visible
        if (cardTop < containerTop || cardBottom > containerBottom) {
          const scrollToPosition =
            cardTop - containerHeight / 2 + cardHeight / 2;
          container.scrollTo({
            top: scrollToPosition,
            behavior: "smooth",
          });
        }
      }
    }
  }, [selectedPlaceIndex]);

  // Handle card click (no additional scrolling needed since useEffect handles it)
  const handleCardClick = (index: number) => {
    onPlaceSelect(index);
  };

  // Function to get day color (same as in OpenStreetMap)
  const getDayColor = (day: string): string => {
    const dayNumber = parseInt(day.replace(/\D/g, "")) || 1;
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

  return (
    <div
      ref={containerRef}
      style={{
        height: "600px",
        overflowY: "auto",
        padding: "20px",
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          marginBottom: "20px",
          color: "#333",
          fontSize: "24px",
          borderBottom: "2px solid #007bff",
          paddingBottom: "10px",
        }}
      >
        Iceland Travel Itinerary
      </h2>

      {places.length === 0 && (
        <p style={{ color: "#666", fontStyle: "italic" }}>
          No places with valid coordinates found in the data.
        </p>
      )}

      {places.map((place, index) => (
        <div
          key={index}
          ref={(el) => {
            cardRefs.current[index] = el;
          }}
          onClick={() => handleCardClick(index)}
          style={{
            marginBottom: "15px",
            backgroundColor: selectedPlaceIndex === index ? "#e3f2fd" : "white",
            borderRadius: "6px",
            border:
              selectedPlaceIndex === index
                ? "2px solid #007bff"
                : "1px solid #e9ecef",
            boxShadow:
              selectedPlaceIndex === index
                ? "0 4px 12px rgba(0,123,255,0.3)"
                : "0 1px 3px rgba(0,0,0,0.1)",
            cursor: "pointer",
            transition: "all 0.2s ease-in-out",
            position: "relative",
            overflow: "hidden",
          }}
          onMouseEnter={(e) => {
            if (selectedPlaceIndex !== index) {
              e.currentTarget.style.backgroundColor = "#f8f9fa";
              e.currentTarget.style.transform = "translateY(-1px)";
            }
          }}
          onMouseLeave={(e) => {
            if (selectedPlaceIndex !== index) {
              e.currentTarget.style.backgroundColor = "white";
              e.currentTarget.style.transform = "translateY(0)";
            }
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: "15px",
              backgroundColor:
                selectedPlaceIndex === index
                  ? "#ff4757"
                  : getDayColor(place.day),
              color: "white",
              borderRadius: "50%",
              width: "24px",
              height: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "bold",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              zIndex: 10,
            }}
          >
            {index + 1}
          </div>

          <ImageCarousel images={place.images} alt={place.location} />

          <div style={{ padding: "15px" }}>
            <h3
              style={{
                margin: "0 0 8px 0",
                color: selectedPlaceIndex === index ? "#0056b3" : "#007bff",
                fontSize: "16px",
                fontWeight: "600",
                paddingRight: "35px",
              }}
            >
              {place.location}
            </h3>

            <p
              style={{
                margin: "4px 0",
                color: "#666",
                fontSize: "14px",
              }}
            >
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

            {place.latitude && place.longitude && (
              <p
                style={{
                  margin: "4px 0",
                  color: "#666",
                  fontSize: "14px",
                }}
              >
                <strong>Coordinates:</strong> {place.latitude.toFixed(6)},{" "}
                {place.longitude.toFixed(6)}
              </p>
            )}

            {place.googleMapsLink && (
              <p
                style={{
                  margin: "8px 0 0 0",
                  fontSize: "14px",
                }}
              >
                <a
                  href={place.googleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#007bff",
                    textDecoration: "none",
                    fontSize: "14px",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.textDecoration = "underline")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.textDecoration = "none")
                  }
                >
                  📍 View in Google Maps
                </a>
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlacesList;
