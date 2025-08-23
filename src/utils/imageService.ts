// Image service for parsing images from CSV data

// Function to parse images from a semicolon-separated string
export const parseImages = (imageString: string): string[] => {
  if (!imageString || imageString.trim() === "") {
    return [];
  }

  // Split by semicolon and filter out empty strings
  return imageString
    .split(";")
    .map((url) => url.trim())
    .filter((url) => url.length > 0);
};

// Function to get the first image as primary image (for backwards compatibility)
export const getPrimaryImage = (imageString: string): string | undefined => {
  const images = parseImages(imageString);
  return images.length > 0 ? images[0] : undefined;
};

// No longer needed - keeping for compatibility
export const fetchImagesForLocations = async (
  locations: string[]
): Promise<Record<string, string>> => {
  // Return empty object since images are now parsed from CSV
  return {};
};
