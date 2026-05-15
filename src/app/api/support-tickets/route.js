const createTicketId = (prefix) => `${prefix}-${Date.now().toString(36).toUpperCase()}`;

export async function POST(request) {
  try {
    const { name, email, topic, message } = await request.json();

    if (!name || !email || !message) {
      return Response.json({ error: "Name, email, and message are required" }, { status: 400 });
    }

    return Response.json({
      success: true,
      ticketId: createTicketId("SCS"),
      topic: topic ?? "general",
      status: "open",
      message: "Support ticket created. Agent routing will be connected in the backend phase.",
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to create support ticket" }, { status: 500 });
  }
}
