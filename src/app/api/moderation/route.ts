import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      console.warn("⚠️ Missing text field in request body");
      return NextResponse.json(
        { detail: "Missing 'text' field" },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://globetalk-moderation-388957617777.us-central1.run.app/api/v1/check",
      {
        method: "POST",
        headers: {
          "X-Api-Key": process.env.CONTENT_MODERATION_API_KEY || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      }
    );

    const rawBody = await response.text();

    // ensure JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("❌ Non-JSON response from moderation API");
      return NextResponse.json(
        { contains_profanity: false, censored_text: text },
        { status: 500 }
      );
    }

    const data = JSON.parse(rawBody);

    if (!response.ok) {
      console.error("❌ Moderation API returned error:", data);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("❌ Unexpected error in moderation handler:", err);
    return NextResponse.json(
      { contains_profanity: false, censored_text: "" },
      { status: 500 }
    );
  }
}
