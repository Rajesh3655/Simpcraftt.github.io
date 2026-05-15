import { products } from "@/app/data/commerce";

export async function GET() {
  return Response.json({
    success: true,
    products,
    persistence: "MongoDB collection placeholder: products",
  });
}

export async function POST(request) {
  try {
    const product = await request.json();

    if (!product?.name) {
      return Response.json({ error: "Product name is required" }, { status: 400 });
    }

    return Response.json({
      success: true,
      product: {
        id: crypto.randomUUID(),
        ...product,
      },
      status: "validated",
      persistence: "Connect to MongoDB insertOne in backend phase.",
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to save product" }, { status: 500 });
  }
}
