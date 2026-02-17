import {
  isLikelyGoogleMapsShortLink,
  parseGoogleMapsLink,
  ParsedLocation,
} from "@rideprompt/shared";

const REQUEST_TIMEOUT_MS = 12000;

async function fetchWithTimeout(inputUrl: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(inputUrl, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function resolveGoogleMapsUrl(inputUrl: string): Promise<string> {
  try {
    const response = await fetchWithTimeout(inputUrl);
    return response.url || inputUrl;
  } catch (error) {
    console.error("Error resolving URL:", error);
    return inputUrl;
  }
}

export async function handleSharedLink(incoming: string): Promise<ParsedLocation> {
  const trimmed = incoming.trim();
  if (!trimmed) {
    throw new Error("No shared link received");
  }

  let finalUrl = trimmed;
  if (isLikelyGoogleMapsShortLink(trimmed)) {
    finalUrl = await resolveGoogleMapsUrl(trimmed);
  }

  return parseGoogleMapsLink(finalUrl);
}
