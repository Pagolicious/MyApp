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
