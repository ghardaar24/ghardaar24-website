import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// This API route updates staff users in Supabase Auth
// It uses the service role key which has admin privileges

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { staffId, email, name, password } = body;

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

    // Build update object for Supabase Auth
    const authUpdateData: {
      email?: string;
      password?: string;
      user_metadata?: { name: string };
    } = {};

    if (email) {
      authUpdateData.email = email;
    }

    if (name) {
      authUpdateData.user_metadata = { name };
    }

    if (password && password.trim() !== "") {
      authUpdateData.password = password;
    }

    // Update user in Supabase Auth if there's anything to update
    if (Object.keys(authUpdateData).length > 0) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        staffId,
        authUpdateData
      );

      if (authError) {
        console.error("Auth error updating staff:", authError.message);
        return NextResponse.json(
          { error: authError.message },
          { status: 400 }
        );
      }
    }

    // Update crm_staff table
    const staffUpdateData: { name?: string; email?: string } = {};
    if (name) staffUpdateData.name = name;
    if (email) staffUpdateData.email = email;

    if (Object.keys(staffUpdateData).length > 0) {
      const { error: staffError } = await supabaseAdmin
        .from("crm_staff")
        .update(staffUpdateData)
        .eq("id", staffId);

      if (staffError) {
        console.error("Error updating staff record:", staffError.message);
        return NextResponse.json(
          { error: staffError.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Staff updated successfully",
    });
  } catch (error) {
    console.error("Error in update-staff API:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
