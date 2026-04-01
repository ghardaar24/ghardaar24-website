import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase admin client to bypass RLS for insertions
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { sheetName, description } = await req.json();

    if (!sheetName) {
      return NextResponse.json(
        { error: "Sheet name is required" },
        { status: 400 }
      );
    }

    // Verify authorization
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

    // Verify the caller's identity from their token
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Verify the authenticated user is an active staff member with sheet creation permission
    const { data: staffData, error: staffError } = await supabaseAdmin
      .from("crm_staff")
      .select("can_add_sheets")
      .eq("id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (staffError || !staffData) {
      return NextResponse.json(
        { error: "Unauthorized: Staff access required" },
        { status: 403 }
      );
    }

    if (!staffData.can_add_sheets) {
      return NextResponse.json(
        { error: "You do not have permission to create sheets" },
        { status: 403 }
      );
    }

    // Insert the new sheet
    const { data: sheetData, error: sheetError } = await supabaseAdmin
      .from("crm_sheets")
      .insert({
        name: sheetName,
        description: description || null,
        created_by_staff: user.id,
      })
      .select()
      .single();

    if (sheetError) {
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

    // Automatically grant the creator access to their new sheet
    const { error: accessError } = await supabaseAdmin
      .from("crm_sheet_access")
      .insert({
        staff_id: user.id,
        sheet_id: sheetData.id,
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
