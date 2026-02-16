export type ParsedLocation = {
  originalUrl: string;
  latitude: number;
  longitude: number;
  placeName?: string;
  address?: string;
};

export type CabProvider = "uber" | "ola" | "google_maps";
