import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { name, email, message, whatsapp } = await request.json();
    if (!name || !email) {
      return Response.json(
        { error: "Name and email are required" },
        { status: 400 },
      );
    }
    await sql`INSERT INTO leads (name, email, message, whatsapp) VALUES (${name}, ${email}, ${message}, ${whatsapp})`;
    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to submit lead" }, { status: 500 });
  }
}
