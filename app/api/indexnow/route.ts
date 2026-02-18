import { NextRequest, NextResponse } from "next/server";

const INDEXNOW_KEY = "0e721005c62d33d6b1f45c0e02761fff";
const SITE_HOST = "shouldirefinancemy.com";

interface IndexNowRequest {
  urls?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: IndexNowRequest = await request.json();
    
    // Default URLs to index if none provided
    const urlsToIndex = body.urls || [
      `https://${SITE_HOST}/`,
      `https://${SITE_HOST}/car`,
      `https://${SITE_HOST}/mortgage`,
      `https://${SITE_HOST}/personal-loan`,
      `https://${SITE_HOST}/credit-card`,
    ];

    // Submit to IndexNow (Bing/Yandex endpoint)
    const indexNowPayload = {
      host: SITE_HOST,
      key: INDEXNOW_KEY,
      keyLocation: `https://${SITE_HOST}/${INDEXNOW_KEY}.txt`,
      urlList: urlsToIndex,
    };

    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(indexNowPayload),
    });

    if (response.ok || response.status === 202) {
      return NextResponse.json({
        success: true,
        message: "URLs submitted to IndexNow",
        urls: urlsToIndex,
        status: response.status,
      });
    } else {
      const errorText = await response.text();
      return NextResponse.json(
        {
          success: false,
          message: "IndexNow submission failed",
          status: response.status,
          error: errorText,
        },
        { status: response.status }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Error submitting to IndexNow",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint to show documentation
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/indexnow",
    method: "POST",
    description: "Submit URLs to IndexNow for Bing/Yandex indexing",
    body: {
      urls: ["Optional array of URLs to submit. Defaults to all calculator pages."],
    },
    example: {
      curl: `curl -X POST https://${SITE_HOST}/api/indexnow -H "Content-Type: application/json" -d '{"urls":["https://${SITE_HOST}/car"]}'`,
    },
    key: INDEXNOW_KEY,
    keyLocation: `https://${SITE_HOST}/${INDEXNOW_KEY}.txt`,
  });
}
