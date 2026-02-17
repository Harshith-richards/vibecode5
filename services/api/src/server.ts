import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

type HistoryItem = {
  id: string;
  createdAt: string;
  provider: "uber" | "ola" | "google_maps";
  placeName?: string;
  lat?: number;
  lng?: number;
  locationConsent: boolean;
};

const history: HistoryItem[] = [];

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/history", (req, res) => {
  const body = req.body as Partial<HistoryItem>;
  if (!body.provider) return res.status(400).json({ error: "provider is required" });

  const item: HistoryItem = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    provider: body.provider,
    placeName: body.placeName,
    lat: body.locationConsent ? body.lat : undefined,
    lng: body.locationConsent ? body.lng : undefined,
    locationConsent: Boolean(body.locationConsent),
  };

  history.unshift(item);
  res.status(201).json(item);
});

app.get("/history", (_req, res) => {
  res.json(history.slice(0, 30));
});

app.post("/analytics/event", (req, res) => {
  const { event, at = new Date().toISOString() } = req.body ?? {};
  if (!event) return res.status(400).json({ error: "event is required" });
  res.status(202).json({ accepted: true, event, at });
});

const PORT = Number(process.env.PORT || 8080);
app.listen(PORT, () => {
  console.log(`RidePrompt API listening on ${PORT}`);
});
