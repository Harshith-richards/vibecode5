import { ParsedLocation } from "./types";

export const buildUberDeepLink = (location: ParsedLocation): string => {
  const params = new URLSearchParams({ action: "setPickup" });
  params.set("dropoff[latitude]", String(location.latitude));
  params.set("dropoff[longitude]", String(location.longitude));
  params.set("dropoff[nickname]", location.placeName || "Destination");
  return `https://m.uber.com/ul/?${params.toString()}`;
};

export const buildOlaDeepLink = (location: ParsedLocation): string => {
  const destination = `${location.latitude},${location.longitude}`;
  return `https://book.olacabs.com/?drop_lat=${location.latitude}&drop_lng=${location.longitude}&drop_location=${encodeURIComponent(destination)}`;
};

export const buildGoogleMapsDeepLink = (location: ParsedLocation): string => {
  return `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
};
