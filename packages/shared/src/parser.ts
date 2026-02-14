import { ParsedLocation } from "./types";

const GOOGLE_MAPS_HOSTS = new Set([
  "maps.google.com",
  "www.google.com",
  "google.com",
  "goo.gl",
]);

function parseCoordsFromText(input: string): { latitude: number; longitude: number } | null {
  const match = input.match(/(-?\d{1,2}\.\d+),\s*(-?\d{1,3}\.\d+)/);
  if (!match) return null;
  return { latitude: Number(match[1]), longitude: Number(match[2]) };
}

export function parseGoogleMapsLink(rawUrl: string): ParsedLocation {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    throw new Error("Invalid URL");
  }

  if (!GOOGLE_MAPS_HOSTS.has(url.hostname)) {
    throw new Error("Not a Google Maps URL");
  }

  // Attempt query patterns first (q=lat,lng / destination=lat,lng)
  const queryCandidate =
    url.searchParams.get("q") ||
    url.searchParams.get("query") ||
    url.searchParams.get("destination") ||
    "";

  let coords = parseCoordsFromText(queryCandidate);

  // Path patterns like /@12.34,77.11,17z
  if (!coords) {
    coords = parseCoordsFromText(url.pathname);
  }

  // Data blob fallback
  if (!coords) {
    coords = parseCoordsFromText(rawUrl);
  }

  if (!coords) {
    throw new Error("Could not extract coordinates from Google Maps link");
  }

  const placeName = url.searchParams.get("q")?.split(",")?.[0] || "Selected destination";

  return {
    originalUrl: rawUrl,
    latitude: coords.latitude,
    longitude: coords.longitude,
    placeName,
    address: queryCandidate || undefined,
  };
}
