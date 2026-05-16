const createTicketId = (prefix) => `${prefix}-${Date.now().toString(36).toUpperCase()}`;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const requiredFields = ["name", "email", "phone", "productSlug", "serialNumber", "purchaseDate", "invoiceNumber", "dealer", "pincode", "address", "invoice"];
    const missing = requiredFields.filter((field) => !formData.get(field));

    if (missing.length > 0) {
      return Response.json({ error: "Missing required warranty fields", missing }, { status: 400 });
    }

    return Response.json({
      success: true,
      ticketId: createTicketId("SCW"),
      status: "received",
      message: "Warranty claim received. Email confirmation will be sent when messaging is connected.",
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to submit warranty claim" }, { status: 500 });
  }
}
