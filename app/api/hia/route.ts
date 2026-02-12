import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_HIA_API_URL || "https://hold-idiot-accountable.onrender.com/api/webhooks/ingest";
const ACCESS_KEY = process.env.HIA_ACCESS_KEY;
const SECONDARY_WEBHOOK_URL = process.env.SECONDARY_WEBHOOK_URL;

async function notifySecondaryWebhook(eventType: string, blocklist: string[]) {
  if (!SECONDARY_WEBHOOK_URL) {
    console.warn("[Secondary Webhook] Skipping: SECONDARY_WEBHOOK_URL not defined");
    return;
  }

  try {
    const payload = {
      event: eventType,
      blocklist: Array.isArray(blocklist) ? blocklist : []
    };

    console.log(`[Secondary Webhook] Sending POST to: ${SECONDARY_WEBHOOK_URL}`);
    
    const response = await fetch(SECONDARY_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    
    console.log(`[Secondary Webhook] Response: ${response.status} ${response.statusText}`);
  } catch (error) {
    console.error("[Secondary Webhook] Error:", error);
  }
}

export async function GET() {
  if (!ACCESS_KEY) {
    return NextResponse.json(
      { error: "Server configuration error: API key missing" },
      { status: 500 }
    );
  }

  // Use the same base URL as the API_URL but point to the status endpoint
  // Based on your homelab setup, we use the client API base.
  const STATUS_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/client/status`;

  try {
    const response = await fetch(STATUS_URL, {
      method: "GET",
      headers: {
        "x-hia-access-key": ACCESS_KEY,
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Status proxy error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!ACCESS_KEY) {
    console.error("HIA_ACCESS_KEY is not defined in environment variables");
    return NextResponse.json(
      { error: "Server configuration error: API key missing" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();

    // 1. Primary Request to HIA
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
      return NextResponse.json(
        { error: errorData.error || `Upstream error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // 2. Secondary Request (Triggered after HIA success)
    // Note: body.blocklist comes from SESSION_START or our updated stopSession
    await notifySecondaryWebhook(body.event_type, body.blocklist || []);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
