import { createClient } from "@supabase/supabase-js";
import { NextResponse, NextRequest } from "next/server";

// This API route fetches IDs of all admins and staff members
// It uses the service role key to bypass RLS policies that restrict access
// This is used by the Leads page to filter out internal users from the list

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
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
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
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

    // Fetch admin IDs
    const { data: admins, error: adminError } = await supabaseAdmin
      .from("admins")
      .select("id");

    if (adminError) {
      console.error("Error fetching admins:", adminError);
      throw adminError;
    }

    // Fetch staff IDs
    const { data: staff, error: staffError } = await supabaseAdmin
      .from("crm_staff")
      .select("id");

    if (staffError) {
      // If crm_staff table doesn't exist yet, just ignore (return empty)
      // handling 42P01 (undefined_table) effectively
      if (staffError.code !== '42P01') {
        console.error("Error fetching staff:", staffError);
        throw staffError;
      }
    }

    const adminIds = (admins || []).map((a) => a.id);
    const staffIds = (staff || []).map((s) => s.id);

    return NextResponse.json({
      adminIds,
      staffIds,
    });
  } catch (error) {
    console.error("Error in get-excluded-ids API:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
