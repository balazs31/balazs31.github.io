export interface IcelandPlace {
  day: string;
  location: string;
  gpsCoordinates: string;
  googleMapsLink: string;
  description: string;
  images: string[];
  latitude?: number;
  longitude?: number;
}

export const parseGPSCoordinates = (
  gpsString: string
): { lat: number; lng: number } | null => {
  if (!gpsString || gpsString.trim() === "") {
    console.log("Empty GPS string");
    return null;
  }

  console.log("Parsing GPS:", gpsString);

  // Handle different coordinate formats
  let lat: number, lng: number;

  // Format 1: "64.1328125085074, -20.254953238633"
  if (gpsString.includes(",") && !gpsString.includes("°")) {
    const [latStr, lngStr] = gpsString.split(",").map((s) => s.trim());
    lat = parseFloat(latStr);
    lng = parseFloat(lngStr);
    console.log("Format 1 - Decimal:", { lat, lng });
  }
  // Format 2: '63°24\'05.5" N, 19°07\'42.7" W'
  else if (gpsString.includes("°") && gpsString.includes("'")) {
    const parts = gpsString.split(",").map((s) => s.trim());

    // Parse latitude
    const latMatch = parts[0].match(/(\d+)°(\d+)'([\d.]+)"?\s*([NS])/);
    if (latMatch) {
      const [, degrees, minutes, seconds, direction] = latMatch;
      lat =
        parseInt(degrees) + parseInt(minutes) / 60 + parseFloat(seconds) / 3600;
      if (direction === "S") lat = -lat;
    } else {
      console.log("Failed to parse latitude DMS:", parts[0]);
      return null;
    }

    // Parse longitude
    const lngMatch = parts[1].match(/(\d+)°(\d+)'([\d.]+)"?\s*([EW])/);
    if (lngMatch) {
      const [, degrees, minutes, seconds, direction] = lngMatch;
      lng =
        parseInt(degrees) + parseInt(minutes) / 60 + parseFloat(seconds) / 3600;
      if (direction === "W") lng = -lng;
    } else {
      console.log("Failed to parse longitude DMS:", parts[1]);
      return null;
    }
    console.log("Format 2 - DMS:", { lat, lng });
  }
  // Format 3: "64.03° N, -16.98° W"
  else if (gpsString.includes("°")) {
    const parts = gpsString.split(",").map((s) => s.trim());

    // Parse latitude
    const latMatch = parts[0].match(/([\d.-]+)°?\s*([NS])?/);
    if (latMatch) {
      lat = parseFloat(latMatch[1]);
      if (latMatch[2] === "S") lat = -lat;
    } else {
      console.log("Failed to parse latitude decimal degrees:", parts[0]);
      return null;
    }

    // Parse longitude
    const lngMatch = parts[1].match(/([\d.-]+)°?\s*([EW])?/);
    if (lngMatch) {
      lng = parseFloat(lngMatch[1]);
      if (lngMatch[2] === "W" && lng > 0) lng = -lng;
    } else {
      console.log("Failed to parse longitude decimal degrees:", parts[1]);
      return null;
    }
    console.log("Format 3 - Decimal degrees:", { lat, lng });
  } else {
    console.log("Unknown GPS format:", gpsString);
    return null;
  }

  // Validate coordinates
  if (isNaN(lat) || isNaN(lng)) {
    console.log("Invalid coordinates (NaN):", { lat, lng });
    return null;
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    console.log("Coordinates out of range:", { lat, lng });
    return null;
  }

  console.log("Successfully parsed coordinates:", { lat, lng });
  return { lat, lng };
};

export const parseCsvData = (csvText: string): IcelandPlace[] => {
  const lines = csvText.split("\n");
  const dataLines = lines.slice(1).filter((line) => line.trim() !== "");

  console.log("Total lines:", lines.length);
  console.log("Data lines:", dataLines.length);

  const places = dataLines.map((line, index) => {
    // More robust CSV parsing that handles quoted values
    const columns: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        columns.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    columns.push(current.trim()); // Add the last column

    const day = columns[0]?.replace(/"/g, "").trim() || "";
    const location = columns[1]?.replace(/"/g, "").trim() || "";
    const gpsCoordinates = columns[2]?.replace(/"/g, "").trim() || "";
    const googleMapsLink = columns[3]?.replace(/"/g, "").trim() || "";
    const description = columns[4]?.replace(/"/g, "").trim() || "";
    const imagesString = columns[5]?.replace(/"/g, "").trim() || "";

    // Parse images from semicolon-separated string
    const images = imagesString
      ? imagesString
          .split(";")
          .map((url) => url.trim())
          .filter((url) => url.length > 0)
      : [];

    console.log(`Line ${index + 1}:`, {
      day,
      location,
      gpsCoordinates: gpsCoordinates.substring(0, 50),
      googleMapsLink: googleMapsLink.substring(0, 50),
      description: description.substring(0, 50),
      imagesCount: images.length,
    });

    const coordinates = parseGPSCoordinates(gpsCoordinates);
    console.log(`Coordinates for ${location}:`, coordinates);

    return {
      day,
      location,
      gpsCoordinates,
      googleMapsLink,
      description,
      images,
      latitude: coordinates?.lat,
      longitude: coordinates?.lng,
    };
  });

  const validPlaces = places.filter(
    (place) => place.location && place.latitude && place.longitude
  );
  console.log("Valid places:", validPlaces.length, "out of", places.length);
  console.log("Valid places details:", validPlaces);

  return validPlaces;
};
