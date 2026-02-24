// Environment variable configuration
export const HIA_API_BASE = (process.env.HIA_API_BASE || process.env.NEXT_PUBLIC_API_URL || "https://hold-idiot-accountable.onrender.com").replace(/\/$/, "");
export const API_URL = process.env.HIA_API_URL || process.env.NEXT_PUBLIC_HIA_API_URL || `${HIA_API_BASE}/api/webhooks/ingest`;
export const ACCESS_KEY = process.env.HIA_ACCESS_KEY || process.env.HIA_HOMELAB_KEY;
export const SECONDARY_WEBHOOK_URL = process.env.SECONDARY_WEBHOOK_URL;
export const STATUS_URL = `${HIA_API_BASE}/api/client/status`;

/**
 * Notifies a secondary webhook (e.g., n8n) about session events.
 */
export async function notifySecondaryWebhook(eventType: string, blocklist: string[]) {
  if (!SECONDARY_WEBHOOK_URL) return;

  try {
    const payload = {
      event: eventType,
      blocklist: Array.isArray(blocklist) ? blocklist : []
    };

    await fetch(SECONDARY_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("[Secondary Webhook] Error:", error);
  }
}

/**
 * Normalizes event types for the secondary webhook to ensure consistent blocking/unblocking behavior.
 */
export function getWebhookEventForType(eventType: string, blocklist: string[] = []): { event: string; isStopping: boolean } {
  // Handle sync events based on whether the list is empty
  if (eventType === "SYNC_BLOCKLIST") {
    const isStopping = !blocklist || blocklist.length === 0;
    return { 
      event: isStopping ? "SESSION_STOP" : "SESSION_START", 
      isStopping 
    };
  }

  if (eventType === "BREAK_SKIP" || eventType === "BREAK_STOP") {
    return { event: "SESSION_START", isStopping: false };
  }
  
  const stoppingEvents = ["BREAK_START", "SESSION_STOP"];
  if (stoppingEvents.includes(eventType)) {
    return { event: "SESSION_STOP", isStopping: true };
  }

  return { event: eventType, isStopping: false };
}
