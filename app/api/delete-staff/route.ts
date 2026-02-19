import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// This API route removes staff role from users
// It only removes them from crm_staff table, keeping their account intact
// The user will remain as a normal user in the system

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { staffId } = body;

    if (!staffId) {
      return NextResponse.json(
        { error: "Staff ID is required" },
        { status: 400 }
      );
    }

    if (!supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: "Service role key not configured" },
        { status: 500 }
      );
    }

    // Check for authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Missing authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Create admin client with service role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verify the user
    const { data: { user }, error: authErrorResult } = await supabaseAdmin.auth.getUser(token);

    if (authErrorResult || !user) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    // Verify user is an admin
    const { data: adminRecord, error: adminCheckError } = await supabaseAdmin
      .from("admins")
      .select("id")
      .eq("id", user.id)
      .single();

    if (adminCheckError || !adminRecord) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    // Only delete from crm_staff table - keep the user's account intact
    // This removes their staff role but keeps them as a normal user
    const { error: staffError } = await supabaseAdmin
      .from("crm_staff")
      .delete()
      .eq("id", staffId);

    if (staffError) {
      console.error("Error removing staff role:", staffError);
      return NextResponse.json(
        { error: staffError.message },
        { status: 400 }
      );
    }

    // Also remove any sheet access for this staff member
    await supabaseAdmin
      .from("crm_sheet_access")
      .delete()
      .eq("staff_id", staffId);

    return NextResponse.json({
      success: true,
      message: "Staff role removed successfully. User account remains active.",
    });
  } catch (error) {
    console.error("Error in delete-staff API:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

