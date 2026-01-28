// Isaiah 54:17 - Spiritual Protection for this Software
// "No weapon that is formed against thee shall prosper; and every tongue that shall rise against thee
// in judgment thou shalt condemn. This is the heritage of the servants of the LORD,
// and their righteousness is of me, saith the LORD."

import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { logger } from "./logger";
import { storage } from "./storage";
import { runMigrations } from "stripe-replit-sync";
import { getStripeSync } from "./stripeClient";
import { WebhookHandlers } from "./webhookHandlers";
import { geoBlockMiddleware } from "./middleware/geo-block";

const app = express();

// Trust proxy headers (Cloudflare, Replit proxy)
app.set("trust proxy", 1);

// Version endpoint - confirms deployment picked up new code
app.get("/__version", (req, res) => {
  res.send("aichecklist-debug-v1-2026-01-23");
});

// Debug endpoint - BEFORE any auth middleware, static, or catch-all
app.get("/__debug", (req, res) => {
  res.json({
    time: new Date().toISOString(),
    host: req.headers.host,
    xForwardedProto: req.headers["x-forwarded-proto"],
    xForwardedFor: req.headers["x-forwarded-for"],
    cfConnectingIp: req.headers["cf-connecting-ip"],
    cfRay: req.headers["cf-ray"],
    userAgent: req.headers["user-agent"],
    url: req.originalUrl,
    method: req.method,
  });
});

// CRITICAL: Stripe webhook route must be registered BEFORE express.json()
// This route needs raw Buffer payload for signature verification
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["stripe-signature"];

    if (!signature) {
      return res.status(400).json({ error: "Missing stripe-signature" });
    }

    try {
      const sig = Array.isArray(signature) ? signature[0] : signature;

      if (!Buffer.isBuffer(req.body)) {
        logger.error("STRIPE WEBHOOK ERROR: req.body is not a Buffer");
        return res.status(500).json({ error: "Webhook processing error" });
      }

      await WebhookHandlers.processWebhook(req.body as Buffer, sig);

      res.status(200).json({ received: true });
    } catch (error: any) {
      logger.error("Webhook error:", { message: error.message });
      res.status(400).json({ error: "Webhook processing error" });
    }
  },
);

// Geo-blocking middleware - blocks access from sanctioned/restricted countries
// This runs early to prevent any further processing for blocked regions
app.use(geoBlockMiddleware);

// Enable gzip/brotli compression for all responses (reduces payload size by 60-70%)
app.use(
  compression({
    level: 6, // Balanced compression level (1-9, 6 is good balance of speed vs size)
    threshold: 1024, // Only compress responses > 1KB
    filter: (req, res) => {
      // Don't compress if client doesn't accept it
      if (req.headers["x-no-compression"]) return false;
      return compression.filter(req, res);
    },
  }),
);

// Now apply JSON middleware for all other routes
app.use(express.json({ limit: "50mb" })); // Increase limit for voice biometric data
app.use(express.urlencoded({ extended: false, limit: "50mb" }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      const meta = {
        method: req.method,
        path: path,
        statusCode: res.statusCode,
        duration: duration,
        response: capturedJsonResponse
          ? JSON.stringify(capturedJsonResponse).substring(0, 200)
          : undefined,
      };

      // Log based on status code
      if (res.statusCode >= 500) {
        logger.error(`Server error: ${logLine}`, meta);
      } else if (res.statusCode >= 400) {
        logger.warn(`Client error: ${logLine}`, meta);
      } else {
        logger.info(`Request complete: ${logLine}`, meta);
      }

      // Keep the original console logging too
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

// Initialize Stripe schema and sync data
async function initStripe() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    logger.warn("DATABASE_URL not set. Stripe integration will be limited.");
    return;
  }

  try {
    logger.info("Initializing Stripe schema...");
    await runMigrations({
      databaseUrl,
      schema: "stripe",
    });
    logger.info("Stripe schema ready");

    // Get StripeSync instance for data synchronization
    const stripeSync = await getStripeSync();

    // Sync all existing Stripe data in background
    logger.info("Syncing Stripe data...");
    stripeSync
      .syncBackfill()
      .then(() => {
        logger.info("Stripe data synced successfully");
      })
      .catch((err: any) => {
        logger.warn("Stripe sync incomplete:", { error: err.message });
      });
  } catch (error: any) {
    logger.warn("Stripe initialization incomplete:", { error: error.message });
  }
}

// Main function to start the server
async function startServer() {
  try {
    // Initialize the database
    await storage.initializeDatabase();

    // Initialize Stripe integration
    await initStripe();

    // Register API routes
    const server = await registerRoutes(app);

    // Global error handler
    app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      // Log error details
      logger.error(`Error processing ${req.method} ${req.path}`, {
        status,
        message,
        stack: err.stack,
        query: req.query,
        body: req.body,
        originalUrl: req.originalUrl,
      });

      res.status(status).json({ message });
    });

    // Serve attached_assets directory for videos and other media files
    // This needs to be set up BEFORE other static serving for both dev and production
    app.use(
      "/attached_assets",
      express.static("attached_assets", {
        maxAge: "1d", // Cache for 1 day
        setHeaders: (res, filepath) => {
          if (filepath.endsWith(".mp4")) {
            res.set({
              "Content-Type": "video/mp4",
              "Accept-Ranges": "bytes",
              "Cache-Control": "public, max-age=86400", // 24 hours
            });
          } else if (filepath.endsWith(".wav")) {
            res.set({
              "Content-Type": "audio/wav",
              "Cache-Control": "public, max-age=86400",
            });
          }
        },
      }),
    );

    // Setup Vite or static file serving
    // Use NODE_ENV to properly detect production mode for Replit deployment
    const isProduction = process.env.NODE_ENV === "production";
    const isDevelopment = !isProduction;

    if (isDevelopment) {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Start the server with increased timeout for uploads
    const port = Number(process.env.PORT) || 5000;

    // Set server timeouts to handle large uploads (voice biometric data)
    server.timeout = 300000; // 5 minutes for uploads
    server.headersTimeout = 310000; // Slightly more than server timeout
    server.keepAliveTimeout = 5000; // Standard keep alive

    server.listen(
      {
        port,
        host: "0.0.0.0",
        reusePort: true,
      },
      () => {
        const envMode = isProduction ? "production" : "development";
        const startupMessage = `Server started on port ${port} in ${envMode} mode`;
        log(startupMessage);
        logger.info(startupMessage, {
          port,
          environment: envMode,
          nodeVersion: process.version,
          memoryUsage: process.memoryUsage(),
          startTime: new Date().toISOString(),
        });
      },
    );

    return server;
  } catch (error) {
    logger.error("Failed to start server", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  }
}

// Start the server
startServer();
