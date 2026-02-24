import { NextRequest, NextResponse } from "next/server";
import { 
  ACCESS_KEY, 
  STATUS_URL, 
  API_URL, 
  notifySecondaryWebhook, 
  getWebhookEventForType 
} from "@/lib/hia-proxy-utils";

function checkAccessKey() {
  if (!ACCESS_KEY) {
    console.error("[HIA Proxy] Configuration error: ACCESS_KEY missing");
    return NextResponse.json(
      { error: "Server configuration error: API key missing" },
      { status: 500 }
    );
  }
  return null;
}

export async function GET() {
  const configError = checkAccessKey();
  if (configError) return configError;

  try {
    const response = await fetch(STATUS_URL, {
      method: "GET",
      headers: { "x-hia-access-key": ACCESS_KEY! },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.warn(`[HIA Proxy] Status check failed: ${response.status} from ${STATUS_URL}`);
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
  const configError = checkAccessKey();
  if (configError) return configError;

  try {
    const body = await request.json();
    const eventType = body.event_type;
    const blocklist = body.blocklist || [];

    // Determine normalized event for secondary webhook (e.g. n8n)
    const { event, isStopping } = getWebhookEventForType(eventType, blocklist);
    const webhookBlocklist = blocklist; // Keep the actual list for unblocking!

    // Client explicitly requesting blocklist sync
    if (eventType === "SYNC_BLOCKLIST") {
      await notifySecondaryWebhook(event, webhookBlocklist);
      return NextResponse.json({ success: true, processed_event: "SYNC_BLOCKLIST" });
    }

    // Forward to HIA Ingest API
    let response;
    try {
      response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-hia-access-key": ACCESS_KEY!,
        },
        body: JSON.stringify(body),
      });
    } catch (fetchError: any) {
      console.error("[HIA Proxy] Fetch error:", fetchError);
      // Even if fetch fails, if it's a stopping event, we should try to unblock locally
      await notifySecondaryWebhook(event, webhookBlocklist);
      throw fetchError;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn(`[HIA Proxy] Ingest failed: ${response.status} from ${API_URL}`);
      
      // CRITICAL: If the backend rejects a stop request (e.g. session already ended),
      // we STILL want to notify n8n to unblock.
      if (isStopping) {
        await notifySecondaryWebhook(event, webhookBlocklist);
      }

      return NextResponse.json(
        { error: errorData.error || `Upstream error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Trigger secondary webhook for normal successful requests
    await notifySecondaryWebhook(event, webhookBlocklist);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[HIA Proxy] POST error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
