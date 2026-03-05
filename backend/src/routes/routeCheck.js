import express from "express";
import { getRoute } from "../services/osrmRoutes.js";
import { colorRoute } from "../utils/colorRoute.js";
import { getTrafficConditions } from "../services/trafikverket.js";

const router = express.Router();

router.post("/route-check", async (req, res) => {
  try {
    const { from, to } = req.body;

    const route = await getRoute(from, to);
    if (!route) return res.status(400).json({ error: "No route found" });

    const coords = route.geometry.coordinates;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const [lon, lat] of coords) {
      minX = Math.min(minX, lon);
      minY = Math.min(minY, lat);
      maxX = Math.max(maxX, lon);
      maxY = Math.max(maxY, lat);
    }

    const BUFFER = 0.01;
    const bbox = {
      minX: minX - BUFFER,
      minY: minY - BUFFER,
      maxX: maxX + BUFFER,
      maxY: maxY + BUFFER,
    };

    let roadConditions = [];
    try {
      roadConditions = await getTrafficConditions(bbox);
    } catch (err) {
      console.warn("⚠️ Trafikverket misslyckades:", err.message);
    }

    const segments = colorRoute(route, roadConditions);

    res.json({ route, segments });
  } catch (err) {
    console.error("❌ route-check fel:", err);
    res.status(500).json({ error: "route-check failed" });
  }
});

export default router;
