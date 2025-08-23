import React from "react";
import OpenStreetMap from "./OpenStreetMap";
import { IcelandPlace } from "../types/IcelandPlace";

interface MapWrapperProps {
  places: IcelandPlace[];
  selectedPlaceIndex: number | null;
  onNextPlace: () => void;
  onPrevPlace: () => void;
  onPlaceSelect: (index: number) => void;
}

const MapWrapper: React.FC<MapWrapperProps> = ({
  places,
  selectedPlaceIndex,
  onNextPlace,
  onPrevPlace,
  onPlaceSelect,
}) => {
  return (
    <OpenStreetMap
      places={places}
      selectedPlaceIndex={selectedPlaceIndex}
      onNextPlace={onNextPlace}
      onPrevPlace={onPrevPlace}
      onPlaceSelect={onPlaceSelect}
    />
  );
};

export default MapWrapper;
