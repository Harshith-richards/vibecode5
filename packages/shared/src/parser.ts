import { ParsedLocation } from "./types";

const GOOGLE_MAPS_HOSTS = [
  "maps.google.com",
  "www.google.com",
  "google.com",
  "goo.gl",
  "maps.app.goo.gl",
] as const;

function isGoogleMapsHost(hostname: string): boolean {
  if (GOOGLE_MAPS_HOSTS.includes(hostname as (typeof GOOGLE_MAPS_HOSTS)[number])) {
    return true;
  }

  // Accept country domains such as maps.google.co.in
  if (hostname.startsWith("maps.google.")) {
    return true;
  }

  return false;
}

function parseCoordsFromText(input: string): { latitude: number; longitude: number } | null {
  const match = input.match(/(-?\d{1,2}\.\d+),\s*(-?\d{1,3}\.\d+)/);
  if (!match) return null;

  const latitude = Number(match[1]);
  const longitude = Number(match[2]);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    return null;
  }

  return { latitude, longitude };
}

export function parseGoogleMapsLink(rawUrl: string): ParsedLocation {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    throw new Error("Invalid URL");
  }

  if (!isGoogleMapsHost(url.hostname)) {
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

  const qValue = url.searchParams.get("q") || "";
  const placeName = qValue ? qValue.split(",")[0] : "Selected destination";

  return {
    originalUrl: rawUrl,
    latitude: coords.latitude,
    longitude: coords.longitude,
    placeName,
    address: queryCandidate || undefined,
  };
}

export function isLikelyGoogleMapsShortLink(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl.trim());
    return url.hostname === "maps.app.goo.gl" || (url.hostname === "goo.gl" && url.pathname.startsWith("/maps"));
  } catch {
    return false;
  }
}
