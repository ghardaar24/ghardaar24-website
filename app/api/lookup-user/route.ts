import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// This API route looks up a user by email and returns their name if they exist
// Used for auto-populating staff name when email is entered

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
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

    // Verify the requesting user
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

    // First, check if user exists in auth.users
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
    const existingAuthUser = usersData?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (!existingAuthUser) {
      // User doesn't exist
      return NextResponse.json({
        exists: false,
        name: null,
        isStaff: false,
        isAdmin: false,
      });
    }

    // User exists, check if they're already a staff member
    const { data: existingStaff } = await supabaseAdmin
      .from("crm_staff")
      .select("id")
      .eq("id", existingAuthUser.id)
      .single();

    // Check if they're an admin
    const { data: existingAdmin } = await supabaseAdmin
      .from("admins")
      .select("id, name")
      .eq("id", existingAuthUser.id)
      .single();

    // Get user profile for the name
    const { data: userProfile } = await supabaseAdmin
      .from("user_profiles")
      .select("name")
      .eq("id", existingAuthUser.id)
      .single();

    // Get name from user profile, admin record, or auth metadata
    const name = userProfile?.name || 
                 existingAdmin?.name || 
                 existingAuthUser.user_metadata?.name ||
                 existingAuthUser.user_metadata?.full_name ||
                 "";

    return NextResponse.json({
      exists: true,
      name: name,
      isStaff: !!existingStaff,
      isAdmin: !!existingAdmin,
    });
  } catch (error) {
    console.error("Error in lookup-user API:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
