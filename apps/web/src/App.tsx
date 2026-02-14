import { useEffect, useMemo, useState } from "react";
import {
  buildGoogleMapsDeepLink,
  buildOlaDeepLink,
  buildUberDeepLink,
  parseGoogleMapsLink,
  ParsedLocation,
} from "../../../packages/shared/src";

type Provider = "uber" | "ola" | "google_maps";

export default function App() {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<ParsedLocation | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shared = params.get("shared");
    if (shared) {
      const decoded = decodeURIComponent(shared);
      setInput(decoded);
      safeParse(decoded);
    }
  }, []);

  useEffect(() => {
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const preview = useMemo(() => {
    if (!location) return "";
    return `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`;
  }, [location]);

  const safeParse = (value: string) => {
    setError(null);
    try {
      const parsed = parseGoogleMapsLink(value);
      setLocation(parsed);
      setShowConfirm(true);
    } catch (e) {
      setLocation(null);
      setShowConfirm(false);
      setError(e instanceof Error ? e.message : "Unknown parsing error");
    }
  };

  const onChoose = (provider: Provider) => {
    if (!location) return;

    // IMPORTANT: this executes ONLY after explicit user choice.
    const deepLink =
      provider === "uber"
        ? buildUberDeepLink(location)
        : provider === "ola"
          ? buildOlaDeepLink(location)
          : buildGoogleMapsDeepLink(location);

    window.open(deepLink, "_blank", "noopener,noreferrer");
    setShowConfirm(false);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <section className="mx-auto max-w-xl space-y-4">
        <h1 className="text-2xl font-bold">RidePrompt</h1>
        <p className="text-slate-300">Paste a Google Maps link and choose your ride app.</p>

        {isOffline && (
          <div className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-3 text-amber-200">
            You are offline. Parsing still works for pasted links, but opening providers may fail.
          </div>
        )}

        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4 space-y-3">
          <label className="block text-sm">Google Maps URL</label>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="https://maps.google.com/..."
            className="w-full rounded-xl bg-slate-800 px-3 py-2 outline-none ring-1 ring-slate-600 focus:ring-cyan-400"
          />
          <button
            onClick={() => safeParse(input)}
            className="rounded-xl bg-cyan-500 px-4 py-2 font-medium text-slate-950 hover:bg-cyan-400 transition"
          >
            Detect Location
          </button>
          {error && <p className="text-rose-300 text-sm">{error}</p>}
        </div>

        {showConfirm && location && (
          <div className="rounded-2xl border border-slate-600 bg-slate-900 p-4 space-y-3 animate-pulse">
            <h2 className="text-lg font-semibold">Book cab to {location.placeName}?</h2>
            <p className="text-slate-300 text-sm">Address: {location.address || "Not available"}</p>
            <p className="text-slate-300 text-sm">Coordinates: {preview}</p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button onClick={() => onChoose("uber")} className="rounded-xl bg-black px-3 py-2">Open in Uber</button>
              <button onClick={() => onChoose("ola")} className="rounded-xl bg-yellow-400 text-black px-3 py-2">Open in Ola</button>
              <button onClick={() => onChoose("google_maps")} className="rounded-xl bg-slate-700 px-3 py-2">Open in Maps</button>
              <button onClick={() => setShowConfirm(false)} className="rounded-xl border border-slate-500 px-3 py-2">Cancel</button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
