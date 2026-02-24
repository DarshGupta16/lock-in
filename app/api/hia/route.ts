import { NextRequest, NextResponse } from "next/server";

// Robust environment variable loading with fallbacks
const HIA_API_BASE = process.env.HIA_API_BASE || process.env.NEXT_PUBLIC_API_URL || "https://hold-idiot-accountable.onrender.com";
const API_URL = process.env.HIA_API_URL || process.env.NEXT_PUBLIC_HIA_API_URL || `${HIA_API_BASE.replace(/\/$/, "")}/api/webhooks/ingest`;
const ACCESS_KEY = process.env.HIA_ACCESS_KEY || process.env.HIA_HOMELAB_KEY;
const SECONDARY_WEBHOOK_URL = process.env.SECONDARY_WEBHOOK_URL;

async function notifySecondaryWebhook(eventType: string, blocklist: string[]) {
  if (!SECONDARY_WEBHOOK_URL) {
    return;
  }

  try {
    const payload = {
      event: eventType,
      blocklist: Array.isArray(blocklist) ? blocklist : []
    };

    await fetch(SECONDARY_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("[Secondary Webhook] Error:", error);
  }
}

export async function GET() {
  if (!ACCESS_KEY) {
    console.error("[HIA Proxy] Configuration error: ACCESS_KEY missing");
    return NextResponse.json(
      { error: "Server configuration error: API key missing" },
      { status: 500 }
    );
  }

  const STATUS_URL = `${HIA_API_BASE.replace(/\/$/, "")}/api/client/status`;

  try {
    const response = await fetch(STATUS_URL, {
      method: "GET",
      headers: {
        "x-hia-access-key": ACCESS_KEY,
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.warn(`[HIA Proxy] Status check failed: ${response.status} ${response.statusText} from ${STATUS_URL}`);
      return NextResponse.json(
        { error: `Upstream error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[HIA Proxy] Status fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!ACCESS_KEY) {
    console.error("[HIA Proxy] Configuration error: ACCESS_KEY missing");
    return NextResponse.json(
      { error: "Server configuration error: API key missing" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();

    // Client explicitly requesting blocklist sync (e.g. on automatic transition)
    if (body.event_type === "SYNC_BLOCKLIST") {
      await notifySecondaryWebhook("SESSION_START", body.blocklist || []);
      return NextResponse.json({ success: true, processed_event: "SYNC_BLOCKLIST" });
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hia-access-key": ACCESS_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn(`[HIA Proxy] Ingest failed: ${response.status} from ${API_URL}`);
      return NextResponse.json(
        { error: errorData.error || `Upstream error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Trigger secondary webhook if configured
    await notifySecondaryWebhook(body.event_type, body.blocklist || []);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[HIA Proxy] POST error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
