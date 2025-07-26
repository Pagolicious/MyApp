export interface AutocompleteSuggestion {
  placeId: string;
  description: string;
  types: string[];
}

export interface PlaceDetails {
  geometry: {
    location: {
      latitude: number;
      longitude: number;
    };
  };
  name: string;
  formatted_address: string;
}

export interface LocationParam {
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
};

export interface GeoPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
};
