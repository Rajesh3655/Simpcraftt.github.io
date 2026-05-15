import { warrantyClaims } from "@/app/data/admin";

export async function GET() {
  return Response.json({
    success: true,
    claims: warrantyClaims,
    persistence: "MongoDB collection placeholder: warranty_claims",
  });
}

export async function PATCH(request) {
  try {
    const { id, status, note } = await request.json();

    if (!id || !status) {
      return Response.json({ error: "Claim id and status are required" }, { status: 400 });
    }

    return Response.json({
      success: true,
      claim: { id, status, note: note ?? "" },
      action: "status_update_staged",
      notification: "Email notification placeholder queued",
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to update warranty claim" }, { status: 500 });
  }
}
