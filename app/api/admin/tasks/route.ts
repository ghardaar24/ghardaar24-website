import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Helper to verify admin auth
async function verifyAdmin(request: NextRequest) {
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

  const { data: adminRecord } = await supabaseAdmin
    .from("admins")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!adminRecord) {
    return { error: "Unauthorized: Admin access required", status: 403 };
  }

  return { user, supabaseAdmin };
}

// GET - Fetch all tasks with staff info
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { supabaseAdmin } = auth;
    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get("staff_id");
    const status = searchParams.get("status");

    let query = supabaseAdmin
      .from("staff_tasks")
      .select(`
        *,
        assigned_staff:crm_staff!assigned_to(id, name, email),
        assigning_admin:admins!assigned_by(id, name, email)
      `)
      .order("created_at", { ascending: false });

    if (staffId) {
      query = query.eq("assigned_to", staffId);
    }
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
    console.error("Error in GET /api/admin/tasks:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new task
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { user, supabaseAdmin } = auth;
    const body = await request.json();
    const { title, description, assigned_to, priority, due_date } = body;

    if (!title || !assigned_to) {
      return NextResponse.json(
        { error: "Title and assigned_to are required" },
        { status: 400 }
      );
    }

    // Verify staff exists
    const { data: staff } = await supabaseAdmin
      .from("crm_staff")
      .select("id")
      .eq("id", assigned_to)
      .eq("is_active", true)
      .single();

    if (!staff) {
      return NextResponse.json(
        { error: "Invalid staff member" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("staff_tasks")
      .insert({
        title,
        description: description || null,
        assigned_to,
        assigned_by: user.id,
        priority: priority || "medium",
        due_date: due_date || null,
      })
      .select(`
        *,
        assigned_staff:crm_staff!assigned_to(id, name, email)
      `)
      .single();

    if (error) {
      console.error("Error creating task:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ task: data });
  } catch (error: unknown) {
    console.error("Error in POST /api/admin/tasks:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update task
export async function PUT(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { supabaseAdmin } = auth;
    const body = await request.json();
    const { id, title, description, assigned_to, priority, status, due_date } = body;

    if (!id) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (assigned_to !== undefined) updateData.assigned_to = assigned_to;
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) {
      updateData.status = status;
      if (status === "completed") {
        updateData.completed_at = new Date().toISOString();
      }
    }
    if (due_date !== undefined) updateData.due_date = due_date;

    const { data, error } = await supabaseAdmin
      .from("staff_tasks")
      .update(updateData)
      .eq("id", id)
      .select(`
        *,
        assigned_staff:crm_staff!assigned_to(id, name, email)
      `)
      .single();

    if (error) {
      console.error("Error updating task:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ task: data });
  } catch (error: unknown) {
    console.error("Error in PUT /api/admin/tasks:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete task
export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { supabaseAdmin } = auth;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("staff_tasks")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting task:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error in DELETE /api/admin/tasks:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
