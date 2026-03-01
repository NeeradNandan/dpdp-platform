import { NextResponse, type NextRequest } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const autoConfirm = process.env.AUTH_AUTO_CONFIRM === "true";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, organizationName, gstin, industry, orgSize } = body;

    if (!email || !password || !organizationName || !industry || !orgSize) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const userMetadata = {
      organization_name: organizationName,
      gstin: gstin || null,
      industry,
      org_size: orgSize,
    };

    if (autoConfirm) {
      const supabase = createAdminClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: userMetadata,
      });

      if (error) {
        if (error.message?.includes("already been registered")) {
          return NextResponse.json(
            { error: "An account with this email already exists." },
            { status: 409 }
          );
        }
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({
        message: "Account created successfully.",
        autoConfirmed: true,
        userId: data.user.id,
      });
    }

    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const supabase = createAdminClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userMetadata,
        emailRedirectTo: `${origin}/api/auth/callback`,
      },
    });

    if (error) {
      if (error.message?.includes("already been registered")) {
        return NextResponse.json(
          { error: "An account with this email already exists." },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      message: "Account created. Please check your email to confirm.",
      autoConfirmed: false,
      userId: data.user?.id,
    });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
