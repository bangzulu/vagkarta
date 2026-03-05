import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/geocode", async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 3) return res.json([]);

  const API_KEY = process.env.GEOAPIFY_API_KEY;
  if (!API_KEY) {
    console.error("GEOAPIFY_API_KEY saknas i .env");
    return res.status(500).json([]);
  }

  try {
    const response = await axios.get(
      "https://api.geoapify.com/v1/geocode/autocomplete",
      {
        params: {
          text: q,
          filter: "countrycode:se",
          limit: 5,
          lang: "sv",
          apiKey: API_KEY,
        },
        timeout: 8000,
      }
    );

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

    res.json(results);
  } catch (err) {
    console.error("❌ Geocode fel:", err.response?.status, err.message);
    res.status(500).json([]);
  }
});

export default router;
