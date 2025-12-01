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

  // Serve static files and Vite modules first
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
      // Fast path: serve HTML with Vite client script injection
      template = template.replace(
        '</head>',
        '<script type="module" src="/@vite/client"></script></head>'
      );
      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e) {
      console.error("Failed to serve HTML:", e);
      res.status(500).end("Server Error");
    }
  });
}

(async () => {
  await runApp(setupVite);
})();
