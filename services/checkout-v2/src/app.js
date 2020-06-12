import express from "express";
import logger from "pino-http";
import pinoPretty from "pino-pretty";
import openapi from "openapi-comment-parser";
import swaggerUi from "swagger-ui-express";
import client from "prom-client";

import checkoutRouter from "./routes/checkout";
import prometheus from "./prometheus";
import health from "./health";

const app = express();

// Setup Pino.
app.use(
  logger({
    level: process.env.LOG_LEVEL || "warn",
    prettyPrint: process.env.NODE_ENV !== "production",
    // Yarn 2 doesn't like pino importing `pino-pretty` on it's own, so we need to
    // provide it.
    prettifier: pinoPretty,
  })
);

// Prometheus metrics collected for all service api endpoints
app.use("/api", prometheus);
app.get("/metrics", (_, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(client.register.metrics());
});

app.use(health);

// Body parsing.
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup Swagger.
// Don't use `/` for swagger, it will catch everything.
const spec = openapi({ cwd: __dirname });
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(spec));

// checkout api.
app.use("/api/v1/checkout", checkoutRouter);

// Catch 404s.
app.use((_, res) => {
  res.sendStatus(404);
});

// Catch any other error.
// If we don't have 4 arguments express will callback with (req, res, next)
// Notice the lack of `err`
app.use((err, req, res, _) => {
  req.log.error(err);

  // Return only the status in production.
  if (process.env.NODE_ENV === "production") {
    return res.sendStatus(err.status || 500);
  }

  return res.status(err.status || 500).json({ error: err.message });
});

export default app;
