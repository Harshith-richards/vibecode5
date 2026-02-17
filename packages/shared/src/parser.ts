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

function toCoords(lat: string, lng: string): { latitude: number; longitude: number } | null {
  const latitude = Number(lat);
  const longitude = Number(lng);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    return null;
  }

  return { latitude, longitude };
}

// Supports q=lat,lng, @lat,lng and common data markers (!3dLAT!4dLNG)
export function extractLatLng(input: string): { latitude: number; longitude: number } | null {
  const qMatch = input.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (qMatch) {
    return toCoords(qMatch[1], qMatch[2]);
  }

  const queryMatch = input.match(/[?&](?:query|destination)=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (queryMatch) {
    return toCoords(queryMatch[1], queryMatch[2]);
  }

  const atMatch = input.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    return toCoords(atMatch[1], atMatch[2]);
  }

  const dataMatch = input.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (dataMatch) {
    return toCoords(dataMatch[1], dataMatch[2]);
  }

  const genericMatch = input.match(/(-?\d{1,2}\.\d+),\s*(-?\d{1,3}\.\d+)/);
  if (genericMatch) {
    return toCoords(genericMatch[1], genericMatch[2]);
  }

  return null;
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

  const coords = extractLatLng(rawUrl);
  if (!coords) {
    throw new Error("Could not extract coordinates from Google Maps link");
  }

  const queryCandidate =
    url.searchParams.get("q") ||
    url.searchParams.get("query") ||
    url.searchParams.get("destination") ||
    undefined;

  const qValue = url.searchParams.get("q") || "";
  const placeName = qValue ? qValue.split(",")[0] : "Selected destination";

  return {
    originalUrl: rawUrl,
    latitude: coords.latitude,
    longitude: coords.longitude,
    placeName,
    address: queryCandidate,
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
