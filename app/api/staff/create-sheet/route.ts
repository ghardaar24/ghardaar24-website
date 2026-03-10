import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase admin client to bypass RLS for insertions
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function POST(req: Request) {
  try {
    const { sheetName, description, staffId } = await req.json();

    if (!sheetName || !staffId) {
      return NextResponse.json(
        { error: "Sheet name and Staff ID are required" },
        { status: 400 }
      );
    }

    // 1. Verify staff has permission to create sheets
    const { data: staffData, error: staffError } = await supabaseAdmin
      .from("crm_staff")
      .select("can_add_sheets")
      .eq("id", staffId)
      .maybeSingle();

    if (staffError || !staffData) {
      return NextResponse.json(
        { error: "Could not retrieve staff permissions" },
        { status: 500 }
      );
    }

    if (!staffData.can_add_sheets) {
      return NextResponse.json(
        { error: "You do not have permission to create sheets" },
        { status: 403 }
      );
    }

    // 2. Insert the new sheet into crm_sheets
    const { data: sheetData, error: sheetError } = await supabaseAdmin
      .from("crm_sheets")
      .insert({
        name: sheetName,
        description: description || null,
        created_by_staff: staffId, // Link this sheet to the staff who made it
      })
      .select()
      .single();

    if (sheetError) {
      // Check for unique constraint violation
      if (sheetError.code === "23505") {
        return NextResponse.json(
          { error: "A sheet with this name already exists" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Failed to create sheet" },
        { status: 500 }
      );
    }

    // 3. Automatically grant the creator access to their new sheet
    const { error: accessError } = await supabaseAdmin
      .from("crm_sheet_access")
      .insert({
        staff_id: staffId,
        sheet_id: sheetData.id,
        // No granted_by since it's auto-generated, or we can leave it null
      });

    if (accessError) {
      return NextResponse.json(
        { error: "Sheet created, but failed to grant access" },
        { status: 500 }
      );
    }

    return NextResponse.json(sheetData);
  } catch (error) {
    console.error("Error generating CRM sheet:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
