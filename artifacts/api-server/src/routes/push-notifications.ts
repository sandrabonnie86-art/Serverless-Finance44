import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

// Store push subscriptions (in production, store in database)
const pushSubscriptions = new Map<number, any>();

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

// Subscribe to push notifications
router.post("/push/subscribe", async (req: Request, res: Response) => {
  const userId = req.session?.userId;
  if (!userId) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  try {
    const subscription = req.body;
    
    // Store subscription (in production, save to database)
    pushSubscriptions.set(userId, subscription);
    
    // Update user to mark push enabled
    await db.update(usersTable)
      .set({ biometricEnabled: true }) // Reuse this field for push notifications
      .where(eq(usersTable.id, userId));

    res.json({ success: true, message: "Push notifications enabled" });
  } catch (error) {
    console.error("Push subscribe error:", error);
    res.status(500).json({ message: "Failed to subscribe to push notifications" });
  }
});

// Unsubscribe from push notifications
router.post("/push/unsubscribe", async (req: Request, res: Response) => {
  const userId = req.session?.userId;
  if (!userId) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  try {
    // Remove subscription
    pushSubscriptions.delete(userId);
    
    // Update user to mark push disabled
    await db.update(usersTable)
      .set({ biometricEnabled: false })
      .where(eq(usersTable.id, userId));

    res.json({ success: true, message: "Push notifications disabled" });
  } catch (error) {
    console.error("Push unsubscribe error:", error);
    res.status(500).json({ message: "Failed to unsubscribe from push notifications" });
  }
});

// Get VAPID public key
router.get("/push/vapid-key", (_req: Request, res: Response) => {
  // In production, generate VAPID keys and store securely
  // For now, return a placeholder that indicates push is available
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || "";
  
  if (!vapidPublicKey) {
    res.status(503).json({ message: "Push notifications not configured" });
    return;
  }
  
  res.json({ publicKey: vapidPublicKey });
});

export default router;
