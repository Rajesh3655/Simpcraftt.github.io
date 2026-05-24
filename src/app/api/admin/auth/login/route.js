const createSessionToken = () => `admin_${Date.now().toString(36)}_${crypto.randomUUID()}`;

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json({ error: "Email and password are required" }, { status: 400 });
    }

    return Response.json({
      success: true,
      token: createSessionToken(),
      user: {
        name: "INFIBOLT Admin",
        email,
        role: "Owner",
        permissions: ["products:write", "claims:write", "customers:read", "settings:write"],
      },
      security: {
        strategy: "JWT/session placeholder",
        next: "Connect password hashing, refresh tokens, role checks, and activity logging.",
      },
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Admin login failed" }, { status: 500 });
  }
}
