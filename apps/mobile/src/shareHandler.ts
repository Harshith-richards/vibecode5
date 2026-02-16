import {
  isLikelyGoogleMapsShortLink,
  parseGoogleMapsLink,
  ParsedLocation,
} from "@rideprompt/shared";

const REQUEST_TIMEOUT_MS = 10000;

async function fetchWithTimeout(input: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(input, { ...init, redirect: "follow", signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export async function resolveGoogleMapsUrl(incoming: string): Promise<string> {
  if (!isLikelyGoogleMapsShortLink(incoming)) {
    return incoming;
  }

  try {
    const headResponse = await fetchWithTimeout(incoming, { method: "HEAD" });
    if (headResponse.url) {
      return headResponse.url;
    }
  } catch {
    // Some Google endpoints block HEAD; fallback to GET below.
  }

  const getResponse = await fetchWithTimeout(incoming, { method: "GET" });
  if (!getResponse.url) {
    throw new Error("Could not resolve shortened Google Maps link");
  }

  return getResponse.url;
}

export async function handleSharedLink(incoming: string): Promise<ParsedLocation> {
  const trimmed = incoming.trim();
  if (!trimmed) {
    throw new Error("No shared link received");
  }

  const resolvedUrl = await resolveGoogleMapsUrl(trimmed);
  return parseGoogleMapsLink(resolvedUrl);
}
