import { Router } from "express";
import { z } from "zod";
import { IStorage } from "./storage";
import { insertAdvertisementSchema, insertNewsletterSchema } from "@shared/schema";

export function setupAdRoutes(app: Router, storage: IStorage) {
  // Get all advertisements
  app.get("/api/advertisements", async (req, res) => {
    try {
      const ads = await storage.getAdvertisements();
      res.json(ads);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch advertisements" });
    }
  });

  // Create advertisement
  app.post("/api/admin/advertisements", async (req, res) => {
    try {
      const data = insertAdvertisementSchema.parse(req.body);
      const ad = await storage.createAdvertisement(data);
      res.status(201).json(ad);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create advertisement" });
    }
  });

  // Update advertisement
  app.patch("/api/admin/advertisements/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertAdvertisementSchema.partial().parse(req.body);
      const ad = await storage.updateAdvertisement(id, data);
      res.json(ad);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update advertisement" });
    }
  });

  // Delete advertisement
  app.delete("/api/admin/advertisements/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteAdvertisement(id);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete advertisement" });
    }
  });

  // Send newsletter/rassilka
  app.post("/api/admin/send-newsletter", async (req, res) => {
    try {
      const { title, message, imageUrl } = req.body;
      if (!title || !message) {
        return res.status(400).json({ error: "Title and message required" });
      }

      const settings = await storage.getSettings();
      if (!settings.telegramBotToken || !settings.telegramChatId) {
        return res.status(400).json({ error: "Telegram bot not configured" });
      }

      const telegramMessage = `
📢 *${title}*

${message}
      `.trim();

      try {
        const telegramUrl = `https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`;
        await fetch(telegramUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: settings.telegramChatId,
            text: telegramMessage,
            parse_mode: "Markdown",
          }),
        });

        if (imageUrl) {
          const photoUrl = `https://api.telegram.org/bot${settings.telegramBotToken}/sendPhoto`;
          await fetch(photoUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: settings.telegramChatId,
              photo: imageUrl,
              caption: title,
              parse_mode: "Markdown",
            }),
          });
        }
      } catch (telegramError) {
        console.error("Telegram notification failed:", telegramError);
      }

      // Save newsletter to database
      await storage.createNewsletter({ title, message, imageUrl: imageUrl || null });

      res.json({ success: true, message: "Newsletter sent successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to send newsletter" });
    }
  });
}
