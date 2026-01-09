import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET - Fetch active staff members for admin
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Missing authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Verify the user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Verify user is an admin
    const { data: adminRecord } = await supabaseAdmin
      .from("admins")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!adminRecord) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    // Fetch active staff members
    const { data: staffData, error: staffError } = await supabaseAdmin
      .from("crm_staff")
      .select("id, name, email")
      .eq("is_active", true)
      .order("name");

    if (staffError) {
      console.error("Error fetching staff:", staffError);
      return NextResponse.json({ error: staffError.message }, { status: 500 });
    }

    return NextResponse.json({ staff: staffData || [] });
  } catch (error: unknown) {
    console.error("Error in GET /api/admin/staff:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
