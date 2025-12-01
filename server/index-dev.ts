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
  
  // Serve index.html for all non-API routes (SPA)
  app.use("*", async (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    
    const clientTemplate = path.resolve(
      import.meta.dirname,
      "..",
      "client",
      "index.html",
    );

    try {
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      // Timeout protection: if transformation takes too long, serve as-is
      const transformPromise = vite.transformIndexHtml(req.originalUrl, template);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Transformation timeout")), 3000)
      );
      
      try {
        const page = await Promise.race([transformPromise, timeoutPromise]);
        res.status(200).set({ "Content-Type": "text/html; charset=utf-8" }).end(page);
      } catch (timeoutErr) {
        // Fallback: serve raw HTML if transformation times out
        res.status(200).set({ "Content-Type": "text/html; charset=utf-8" }).end(template);
      }
    } catch (e) {
      res.status(500).set({ "Content-Type": "text/html" }).end("<h1>500 Internal Server Error</h1>");
    }
  });
}

(async () => {
  await runApp(setupVite);
})();
