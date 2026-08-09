import { createClient } from "@supabase/supabase-js";

export class AdminAuthError extends Error {
  status: 401 | 403 | 500;

  constructor(status: 401 | 403 | 500, message: string) {
    super(message);
    this.name = "AdminAuthError";
    this.status = status;
  }
}

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new AdminAuthError(500, `Missing ${name}`);
  return value;
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match?.[1]) throw new AdminAuthError(401, "Missing bearer token");
  return match[1].trim();
}

export async function requireSuperadmin(request: Request) {
  const url = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  const token = getBearerToken(request);

  const authClient = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const {
    data: { user },
    error: userError,
  } = await authClient.auth.getUser(token);

  if (userError || !user) {
    throw new AdminAuthError(401, "Invalid bearer token");
  }

  const adminClient = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: adminUser, error: adminError } = await adminClient
    .from("admin_users")
    .select("user_id, role, active")
    .eq("user_id", user.id)
    .eq("role", "superadmin")
    .eq("active", true)
    .maybeSingle();

  if (adminError) {
    throw new AdminAuthError(500, "Unable to verify admin role");
  }

  if (!adminUser) {
    throw new AdminAuthError(403, "Superadmin role required");
  }

  return { user, adminUser };
}

export function adminAuthResponse(error: unknown) {
  if (!(error instanceof AdminAuthError)) return null;
  const message =
    error.status === 401
      ? "unauthorized"
      : error.status === 403
        ? "forbidden"
        : "internal_error";
  return Response.json(
    { ok: false, message },
    { status: error.status },
  );
}
