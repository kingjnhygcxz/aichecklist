import express, { type Request, Response, NextFunction, type Express } from "express";
import { registerRoutes } from "./routes";
import { logger } from "./logger";
import { storage } from "./storage";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Set production environment
app.set('env', 'production');

function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit", 
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

function serveStatic(app: Express) {
  // Look for public folder in the dist directory (simple relative path)
  const distPath = path.resolve("dist", "public");
  
  console.log(`Looking for frontend files at: ${distPath}`);
  
  if (!fs.existsSync(distPath)) {
    console.log(`Directory not found: ${distPath}`);
    console.log("Available files in current directory:", fs.readdirSync("."));
    if (fs.existsSync("dist")) {
      console.log("Files in dist directory:", fs.readdirSync("dist"));
    }
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  console.log(`✅ Found frontend files at: ${distPath}`);
  console.log("Frontend files:", fs.readdirSync(distPath));

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    console.log(`Serving index.html for route: ${_req.path}`);
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

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
          : undefined
      };

      if (res.statusCode >= 500) {
        logger.error(`Server error: ${logLine}`, meta);
      } else if (res.statusCode >= 400) {
        logger.warn(`Client error: ${logLine}`, meta);
      } else {
        logger.info(`Request complete: ${logLine}`, meta);
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

// Main function to start the server
async function startServer() {
  try {
    // Initialize the database
    await storage.initializeDatabase();
    
    // Register API routes
    const server = await registerRoutes(app);

    // Global error handler
    app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      
      logger.error(`Error processing ${req.method} ${req.path}`, {
        status,
        message,
        stack: err.stack,
        query: req.query,
        body: req.body,
        originalUrl: req.originalUrl
      });

      res.status(status).json({ message });
    });

    // Serve attached_assets directory
    app.use('/attached_assets', express.static('attached_assets', {
      maxAge: '1d',
      setHeaders: (res, filepath) => {
        if (filepath.endsWith('.mp4')) {
          res.set({
            'Content-Type': 'video/mp4',
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'public, max-age=86400'
          });
        } else if (filepath.endsWith('.wav')) {
          res.set({
            'Content-Type': 'audio/wav',
            'Cache-Control': 'public, max-age=86400'
          });
        }
      }
    }));

    // Serve static files (production only)
    serveStatic(app);

    // Start the server with increased timeout for uploads
    const port = process.env.PORT || 5000;
    
    // Set server timeouts to handle large uploads (voice biometric data)
    server.timeout = 300000; // 5 minutes for uploads
    server.headersTimeout = 310000; // Slightly more than server timeout
    server.keepAliveTimeout = 5000; // Standard keep alive
    
    server.listen({
      port: Number(port),
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      const startupMessage = `Server started on port ${port} in production mode`;
      log(startupMessage);
      logger.info(startupMessage, {
        port: Number(port),
        environment: 'production',
        nodeVersion: process.version,
        memoryUsage: process.memoryUsage(),
        startTime: new Date().toISOString()
      });
    });
    
    return server;
  } catch (error) {
    logger.error("Failed to start server", { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    process.exit(1);
  }
}

// Start the server
startServer();