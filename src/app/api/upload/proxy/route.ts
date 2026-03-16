import { NextResponse } from 'next/server';

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
      console.error("Catbox API Error:", errorText);
      return NextResponse.json(
        { error: "Failed to upload to external service.", details: errorText },
        { status: response.status }
      );
    }

    const url = await response.text();

    if (!url.startsWith("http")) {
        return NextResponse.json(
            { error: "Invalid response from Catbox", details: url },
            { status: 500 }
        );
    }

    return NextResponse.json({ url });

  } catch (error: any) {
    console.error("Internal proxy error:", error);
    const errorMessage = error.name === 'AbortError' 
      ? "Request timed out. The external service may be slow or unreachable."
      : error.message;
    return NextResponse.json(
      { error: "An internal server error occurred.", details: errorMessage },
      { status: 500 }
    );
  }
}
