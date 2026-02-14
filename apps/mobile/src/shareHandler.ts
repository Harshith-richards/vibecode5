import { parseGoogleMapsLink, ParsedLocation } from "../../../packages/shared/src";

export const handleSharedLink = (incoming: string): ParsedLocation => {
  const trimmed = incoming.trim();
  if (!trimmed) {
    throw new Error("No shared link received");
  }
  return parseGoogleMapsLink(trimmed);
};
