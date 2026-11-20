import express from "express";
import axios from "axios";
import https from "node:https";

const router = express.Router();

// Återanvänd TLS-anslutningen till Geoapify i stället för en ny handskakning per sökning.
const geoapify = axios.create({
  baseURL: "https://api.geoapify.com/v1/geocode",
  timeout: 8000,
  httpsAgent: new https.Agent({ keepAlive: true }),
});

// Enkel minnescache: samma söktext ger samma svar i ett dygn.
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_MAX = 1000;
const cache = new Map();

function cacheGet(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return hit.data;
}

function cacheSet(key, data) {
  cache.set(key, { at: Date.now(), data });
  if (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value);
}

router.get("/geocode", async (req, res) => {
  const q = String(req.query.q ?? "").trim().toLowerCase();
  if (q.length < 3) return res.json([]);

  const cached = cacheGet(q);
  if (cached) return res.json(cached);

  const API_KEY = process.env.GEOAPIFY_API_KEY;
  if (!API_KEY) {
    console.error("GEOAPIFY_API_KEY saknas i .env");
    return res.status(500).json([]);
  }

  try {
    const response = await geoapify.get("/autocomplete", {
      params: {
        text: q,
        filter: "countrycode:se",
        limit: 5,
        lang: "sv",
        apiKey: API_KEY,
      },
    });

    const results = response.data.features.map((f) => {
      const p = f.properties;
      let label = p.formatted ?? "";
      if (p.state_code && p.state) {
        label = label.replace(p.state_code, p.state);
      }
      return {
        label,
        lat: f.geometry.coordinates[1],
        lon: f.geometry.coordinates[0],
      };
    });

    cacheSet(q, results);
    res.json(results);
  } catch (err) {
    console.error("❌ Geocode fel:", err.response?.status, err.message);
    res.status(500).json([]);
  }
});

export default router;
