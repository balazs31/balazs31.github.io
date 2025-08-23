import React, { useState } from "react";

interface ImageCarouselProps {
  images: string[];
  alt: string;
  height?: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  alt,
  height = "250px",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          height: height,
          borderRadius: "0",
          marginBottom: "0",
          backgroundColor: "#f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#666",
          fontSize: "14px",
        }}
      >
        No images available
      </div>
    );
  }

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div
      style={{
        width: "100%",
        height: height,
        borderRadius: "0",
        overflow: "hidden",
        marginBottom: "0",
        boxShadow: "none",
        position: "relative",
        backgroundColor: "#f0f0f0",
      }}
    >
      {/* Main Image */}
      <img
        src={images[currentIndex]}
        alt={`${alt} - Image ${currentIndex + 1}`}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transition: "transform 0.3s ease",
        }}
        onError={(e) => {
          console.warn(`Failed to load image: ${images[currentIndex]}`);
          // Remove the broken image from the array and show next one
          if (images.length > 1) {
            nextImage();
          }
        }}
      />

      {/* Navigation arrows (only show if more than 1 image) */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            style={{
              position: "absolute",
              left: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(0, 0, 0, 0.5)",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "30px",
              height: "30px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              zIndex: 2,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(0, 0, 0, 0.7)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(0, 0, 0, 0.5)";
            }}
          >
            &#8249;
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            style={{
              position: "absolute",
              right: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(0, 0, 0, 0.5)",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "30px",
              height: "30px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              zIndex: 2,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(0, 0, 0, 0.7)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(0, 0, 0, 0.5)";
            }}
          >
            &#8250;
          </button>
        </>
      )}

      {/* Image counter */}
      {images.length > 1 && (
        <div
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            background: "rgba(0, 0, 0, 0.7)",
            color: "white",
            padding: "2px 6px",
            borderRadius: "10px",
            fontSize: "11px",
            zIndex: 2,
          }}
        >
          {currentIndex + 1}/{images.length}
        </div>
      )}

      {/* Dots indicator (only show if more than 1 image) */}
      {images.length > 1 && images.length <= 5 && (
        <div
          style={{
            position: "absolute",
            bottom: "8px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: "4px",
            zIndex: 2,
          }}
        >
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                goToImage(index);
              }}
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                border: "none",
                background:
                  index === currentIndex ? "white" : "rgba(255, 255, 255, 0.5)",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;
