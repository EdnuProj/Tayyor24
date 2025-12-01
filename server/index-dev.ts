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
  
  // Determine HMR configuration based on environment
  let hmrConfig: any = { server };
  
  // For all environments, use server-based HMR which works everywhere
  hmrConfig = { server };
  
  const serverOptions = {
    middlewareMode: true,
    hmr: hmrConfig,
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
  app.use("*", async (req, res, next) => {
    // Skip non-HTML requests to API or other non-page routes
    if (req.path.startsWith("/api/") || req.path.startsWith("/.vite/") || req.path.includes(".")) {
      return next();
    }

    const url = req.originalUrl;
    let responded = false;

    // Timeout handler - if response takes more than 5 seconds, send error
    const timeoutHandle = setTimeout(() => {
      if (!responded) {
        responded = true;
        res.status(500).set({ "Content-Type": "text/html" }).end("<h1>Request Timeout</h1>");
      }
    }, 5000);

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      
      clearTimeout(timeoutHandle);
      if (!responded) {
        responded = true;
        res.status(200).set({ "Content-Type": "text/html" }).end(page);
      }
    } catch (e) {
      clearTimeout(timeoutHandle);
      if (!responded) {
        responded = true;
        vite.ssrFixStacktrace(e as Error);
        res.status(500).set({ "Content-Type": "text/html" }).end("<h1>Server Error</h1>");
      }
    }
  });
}

(async () => {
  await runApp(setupVite);
})();
