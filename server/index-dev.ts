import fs from "node:fs";
import path from "node:path";
import { type Server } from "node:http";

import { nanoid } from "nanoid";
import { type Express } from "express";
import { createServer as createViteServer, createLogger } from "vite";

import viteConfig from "../vite.config";
import runApp from "./app";

export async function setupVite(app: Express, server: Server) {
  const viteLogger = createLogger();
  
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: viteLogger,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  
  // Serve index.html for all non-API, non-asset routes (SPA)
  app.use("*", (req, res, next) => {
    const path = req.path;
    
    // Skip API and static asset routes - let them fall through
    if (path.startsWith("/api/") || 
        path.includes("/@") ||
        /\.(js|css|json|png|jpg|jpeg|svg|ico|gif|woff|woff2|ttf|eot)$/i.test(path)) {
      return next();
    }
    
    const clientTemplate = require.resolve("../client/index.html");
    res.sendFile(clientTemplate);
  });
}

(async () => {
  await runApp(setupVite);
})();
