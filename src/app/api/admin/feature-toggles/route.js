import { featureToggles } from "@/app/data/admin";

export async function GET() {
  return Response.json({
    success: true,
    toggles: featureToggles,
    persistence: "MongoDB collection placeholder: feature_toggles",
  });
}

export async function PATCH(request) {
  try {
    const { key, enabled } = await request.json();

    if (!key || typeof enabled !== "boolean") {
      return Response.json({ error: "Feature key and enabled boolean are required" }, { status: 400 });
    }

    return Response.json({
      success: true,
      toggle: { key, enabled },
      status: "staged",
      persistence: "Connect to MongoDB updateOne in backend phase.",
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to update feature toggle" }, { status: 500 });
  }
}
