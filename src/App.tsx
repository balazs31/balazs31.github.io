import React, { useState, useEffect } from "react";
import "./App.css";
import MapWrapper from "./components/MapWrapper";
import PlacesList from "./components/PlacesList";
import { IcelandPlace, parseCsvData } from "./types/IcelandPlace";

function App() {
  const [places, setPlaces] = useState<IcelandPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlaceIndex, setSelectedPlaceIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    const loadCsvData = async () => {
      try {
        setLoading(true);
        console.log("Loading CSV data...");
        const response = await fetch("/data/iceland-places.csv");
        if (!response.ok) {
          throw new Error(
            `Failed to load CSV data: ${response.status} ${response.statusText}`
          );
        }
        const csvText = await response.text();
        console.log("CSV text loaded:", csvText.substring(0, 200) + "...");
        const parsedPlaces = parseCsvData(csvText);
        console.log("Parsed places:", parsedPlaces);

        setPlaces(parsedPlaces);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
        console.error("Error loading CSV data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCsvData();
  }, []);

  const handlePlaceSelect = (index: number) => {
    setSelectedPlaceIndex(index);
  };

  const handleNextPlace = () => {
    if (places.length === 0) return;
    const nextIndex =
      selectedPlaceIndex === null
        ? 0
        : (selectedPlaceIndex + 1) % places.length;
    setSelectedPlaceIndex(nextIndex);
  };

  const handlePrevPlace = () => {
    if (places.length === 0) return;
    const prevIndex =
      selectedPlaceIndex === null
        ? places.length - 1
        : (selectedPlaceIndex - 1 + places.length) % places.length;
    setSelectedPlaceIndex(prevIndex);
  };

  // Function to get day color (same as in components)
  const getDayColor = (day: string): string => {
    const dayNumber = parseInt(day.replace(/\D/g, "")) || 1;
    const colors = [
      "#2196F3",
      "#4CAF50",
      "#FF9800",
      "#9C27B0",
      "#F44336",
      "#00BCD4",
      "#CDDC39",
      "#FF5722",
      "#3F51B5",
      "#E91E63",
      "#795548",
      "#607D8B",
    ];
    return colors[(dayNumber - 1) % colors.length];
  };

  // Get unique days for legend
  const uniqueDays = Array.from(
    new Set(places.map((place) => place.day))
  ).sort();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
          color: "#666",
        }}
      >
        Loading Iceland travel data...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          padding: "20px",
        }}
      >
        <h2 style={{ color: "#dc3545" }}>Error Loading Data</h2>
        <p style={{ color: "#666", textAlign: "center" }}>{error}</p>
        <p style={{ color: "#666", fontSize: "14px", marginTop: "10px" }}>
          Make sure the CSV file is available in the public/data directory.
        </p>
      </div>
    );
  }

  return (
    <div
      className="app-container"
      style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}
    >
      <header
        className="header"
        style={{
          textAlign: "center",
          marginBottom: "30px",
          borderBottom: "3px solid #007bff",
          paddingBottom: "20px",
        }}
      >
        <h1
          style={{
            color: "#333",
            fontSize: "36px",
            margin: "0 0 10px 0",
          }}
        >
          🇮🇸 Iceland Travel Map
        </h1>
        <p
          style={{
            color: "#666",
            fontSize: "18px",
            margin: 0,
          }}
        >
          Interactive map showing your Iceland adventure itinerary using
          OpenStreetMap
        </p>
        <p
          style={{
            color: "#666",
            fontSize: "14px",
            margin: "10px 0 0 0",
          }}
        >
          Click or hover over markers to see details • {places.length} locations
          mapped
        </p>
      </header>

      <div
        className="app-layout"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 400px",
          gap: "20px",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <div>
          <MapWrapper
            places={places}
            selectedPlaceIndex={selectedPlaceIndex}
            onNextPlace={handleNextPlace}
            onPrevPlace={handlePrevPlace}
            onPlaceSelect={handlePlaceSelect}
          />

          {/* Day Color Legend */}
          {uniqueDays.length > 1 && (
            <div
              style={{
                marginTop: "15px",
                padding: "15px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              }}
            >
              <h4
                style={{
                  margin: "0 0 10px 0",
                  color: "#333",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              >
                Day Legend
              </h4>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                {uniqueDays.map((day) => (
                  <div
                    key={day}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        backgroundColor: getDayColor(day),
                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#666",
                        fontWeight: "500",
                      }}
                    >
                      {day}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div>
          <PlacesList
            places={places}
            onPlaceSelect={handlePlaceSelect}
            selectedPlaceIndex={selectedPlaceIndex}
          />
        </div>
      </div>

      <footer
        style={{
          textAlign: "center",
          marginTop: "40px",
          padding: "20px",
          color: "#666",
          fontSize: "14px",
          borderTop: "1px solid #e9ecef",
        }}
      >
        <p>Built with React, TypeScript, and OpenStreetMap (Leaflet)</p>
      </footer>
    </div>
  );
}

export default App;
