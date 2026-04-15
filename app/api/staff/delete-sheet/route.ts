import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function DELETE(req: NextRequest) {
  try {
    const { sheetId } = await req.json();

    if (!sheetId) {
      return NextResponse.json(
        { error: "Sheet ID is required" },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Missing authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verify the caller's identity
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Verify the user is an active staff member
    const { data: staffData, error: staffError } = await supabaseAdmin
      .from("crm_staff")
      .select("id")
      .eq("id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (staffError || !staffData) {
      return NextResponse.json(
        { error: "Unauthorized: Staff access required" },
        { status: 403 }
      );
    }

    // Verify the sheet exists and was created by this staff member
    const { data: sheetData, error: sheetError } = await supabaseAdmin
      .from("crm_sheets")
      .select("id, created_by_staff")
      .eq("id", sheetId)
      .maybeSingle();

    if (sheetError || !sheetData) {
      return NextResponse.json(
        { error: "Sheet not found" },
        { status: 404 }
      );
    }

    if (sheetData.created_by_staff !== user.id) {
      return NextResponse.json(
        { error: "You can only delete sheets you created" },
        { status: 403 }
      );
    }

    // Delete all clients in this sheet
    const { error: clientsError } = await supabaseAdmin
      .from("crm_clients")
      .delete()
      .eq("sheet_id", sheetId);

    if (clientsError) throw clientsError;

    // Delete sheet access entries
    const { error: accessError } = await supabaseAdmin
      .from("crm_sheet_access")
      .delete()
      .eq("sheet_id", sheetId);

    if (accessError) throw accessError;

    // Delete the sheet
    const { error: deleteError } = await supabaseAdmin
      .from("crm_sheets")
      .delete()
      .eq("id", sheetId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting sheet:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
