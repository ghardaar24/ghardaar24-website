import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Helper to verify staff auth
async function verifyStaff(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return { error: "Missing authorization header", status: 401 };
  }

  const token = authHeader.replace("Bearer ", "");
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return { error: "Invalid token", status: 401 };
  }

  const { data: staffRecord } = await supabaseAdmin
    .from("crm_staff")
    .select("id, name")
    .eq("id", user.id)
    .eq("is_active", true)
    .single();

  if (!staffRecord) {
    return { error: "Unauthorized: Staff access required", status: 403 };
  }

  return { user, staffRecord, supabaseAdmin };
}

// GET - Fetch tasks assigned to staff
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyStaff(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { user, supabaseAdmin } = auth;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = supabaseAdmin
      .from("staff_tasks")
      .select(`
        *,
        assigning_admin:admins!assigned_by(id, name, email)
      `)
      .eq("assigned_to", user.id)
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching tasks:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tasks: data });
  } catch (error: unknown) {
    console.error("Error in GET /api/staff/tasks:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update task status
export async function PUT(request: NextRequest) {
  try {
    const auth = await verifyStaff(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { user, supabaseAdmin } = auth;
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Task ID and status are required" },
        { status: 400 }
      );
    }

    if (!["pending", "in_progress", "completed"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Verify task belongs to this staff
    const { data: existingTask } = await supabaseAdmin
      .from("staff_tasks")
      .select("id")
      .eq("id", id)
      .eq("assigned_to", user.id)
      .single();

    if (!existingTask) {
      return NextResponse.json(
        { error: "Task not found or not assigned to you" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = { status };
    if (status === "completed") {
      updateData.completed_at = new Date().toISOString();
    } else {
      updateData.completed_at = null;
    }

    const { data, error } = await supabaseAdmin
      .from("staff_tasks")
      .update(updateData)
      .eq("id", id)
      .eq("assigned_to", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating task:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ task: data });
  } catch (error: unknown) {
    console.error("Error in PUT /api/staff/tasks:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
