import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routeCheckRoutes from "./routes/routeCheck.js";
import geocodeRoutes from "./routes/geocode.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", routeCheckRoutes);
app.use("/api", geocodeRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend kör på http://localhost:${PORT}`);
});
