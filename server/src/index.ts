import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { router } from "./routes/index.js";
import { seedDefaultModels } from "./services/modelRegistry.js";

const app = express();
app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "25mb" }));
app.use(rateLimit({ windowMs: 60_000, limit: 120 }));
app.use("/api", router);
app.use(errorHandler);

await connectDb();
await seedDefaultModels();

app.listen(env.PORT, () => {
  console.log(`NIM chat API listening on ${env.PORT}`);
});
