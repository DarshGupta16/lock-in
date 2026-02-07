import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_HIA_API_URL || "https://hold-idiot-accountable.onrender.com/api/webhooks/ingest";
const ACCESS_KEY = process.env.HIA_ACCESS_KEY;

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
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
