import React, { useMemo, useState } from "react";
import { Button, Linking, SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";
import { handleSharedLink } from "./src/shareHandler";
import { buildGoogleMapsDeepLink, buildOlaDeepLink, buildUberDeepLink, ParsedLocation } from "../../packages/shared/src";

export default function App() {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<ParsedLocation | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const preview = useMemo(() => {
    if (!location) return "";
    return `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`;
  }, [location]);

  const detect = (url: string) => {
    setError(null);
    try {
      const parsed = handleSharedLink(url);
      setLocation(parsed);
      setShowConfirm(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to parse link");
      setShowConfirm(false);
      setLocation(null);
    }
  };

  const openProvider = async (provider: "uber" | "ola" | "maps") => {
    if (!location) return;

    // IMPORTANT: No auto-booking or auto-redirect. This runs only after explicit tap.
    const deepLink =
      provider === "uber"
        ? buildUberDeepLink(location)
        : provider === "ola"
          ? buildOlaDeepLink(location)
          : buildGoogleMapsDeepLink(location);

    await Linking.openURL(deepLink);
    setShowConfirm(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0f172a" }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Text style={{ color: "white", fontSize: 28, fontWeight: "700" }}>RidePrompt</Text>
        <Text style={{ color: "#cbd5e1" }}>Paste or share a Google Maps link to continue.</Text>

        <TextInput
          placeholder="https://maps.google.com/..."
          placeholderTextColor="#94a3b8"
          value={input}
          onChangeText={setInput}
          autoCapitalize="none"
          style={{ backgroundColor: "#1e293b", color: "white", borderRadius: 10, padding: 12 }}
        />
        <Button title="Detect Location" onPress={() => detect(input)} />

        {error ? <Text style={{ color: "#fda4af" }}>{error}</Text> : null}

        {showConfirm && location ? (
          <View style={{ backgroundColor: "#1e293b", borderRadius: 12, padding: 14, gap: 8 }}>
            <Text style={{ color: "white", fontSize: 18, fontWeight: "600" }}>
              Book cab to {location.placeName || "destination"}?
            </Text>
            <Text style={{ color: "#cbd5e1" }}>{location.address || "Address unavailable"}</Text>
            <Text style={{ color: "#cbd5e1" }}>Coordinates: {preview}</Text>
            <Button title="Open in Uber" onPress={() => openProvider("uber")} />
            <Button title="Open in Ola" onPress={() => openProvider("ola")} />
            <Button title="Open in Google Maps" onPress={() => openProvider("maps")} />
            <Button title="Cancel" onPress={() => setShowConfirm(false)} color="#94a3b8" />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
