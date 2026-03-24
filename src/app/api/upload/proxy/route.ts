import { NextResponse } from 'next/server';

const isDev = process.env.NODE_ENV === 'development';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("fileToUpload");

    if (!file) {
      return NextResponse.json(
        { error: "No file found in the request." },
        { status: 400 }
      );
    }

    // Re-create FormData to send to the external service
    const externalFormData = new FormData();
    externalFormData.append("reqtype", "fileupload");
    externalFormData.append("fileToUpload", file);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const response = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: externalFormData,
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      const errorText = await response.text();
      if (isDev) console.error("Catbox API Error:", errorText);
      return NextResponse.json(
        { error: "Failed to upload to external service." },
        { status: response.status }
      );
    }

    const url = await response.text();

    if (!url.startsWith("http")) {
        return NextResponse.json(
            { error: "Invalid response from external service" },
            { status: 500 }
        );
    }

    return NextResponse.json({ url });

  } catch (error: any) {
    if (isDev) console.error("Internal proxy error:", error);
    const errorMessage = error.name === 'AbortError' 
      ? "Request timed out. The external service may be slow or unreachable."
      : "An internal server error occurred.";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
