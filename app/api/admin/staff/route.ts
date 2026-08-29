import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    let query = supabaseAdmin
      .from("staff_directory")
      .select("*")
      .order("created_at", { ascending: false });

    if (category && category !== "MASTER") {
      query = query.eq("module_category", category);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: data || [] }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error occurred.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      degree,
      email,
      username,
      password,
      module_category,
      department,
      consultation_fee,
      access_level,
      status,
    } = body;

    if (!name || !email || !password || !department) {
      return NextResponse.json(
        { success: false, error: "Missing required doctor onboarding parameters." },
        { status: 400 }
      );
    }

    const assignedRole = "doctor";

    // 1. Create auth credentials in Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        degree: degree || "",
        username: username || email.split("@")[0],
        role: assignedRole,
        department,
        consultation_fee: consultation_fee || 500,
        access_level: access_level || "Full Admin",
        status: status || "Active",
      },
    });

    if (authError) {
      return NextResponse.json({ success: false, error: authError.message }, { status: 400 });
    }

    // 2. Generate custom Hospital Reference ID: GH-2026-XXX
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const reference_id = `GH-2026-${randomSuffix}`;

    const newRecord = {
      auth_user_id: authUser.user.id,
      reference_id,
      name,
      degree: degree || "",
      email: email.trim(),
      username: username || email.split("@")[0],
      module_category: module_category || "Doctors",
      department,
      consultation_fee: Number(consultation_fee) || 500,
      access_level: access_level || "Full Admin",
      status: status || "Active",
      created_at: new Date().toISOString(),
    };

    const { data: directoryRecord, error: dirError } = await supabaseAdmin
      .from("staff_directory")
      .insert([newRecord])
      .select()
      .single();

    if (dirError) {
      return NextResponse.json({ success: false, error: dirError.message }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Doctor registered & authenticated credentials generated.",
        data: directoryRecord,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error occurred.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      name,
      degree,
      email,
      department,
      consultation_fee,
      access_level,
      status,
      password,
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Record ID is required for editing." }, { status: 400 });
    }

    // Update in database directory
    const updatePayload: Record<string, unknown> = {
      name,
      degree,
      email,
      department,
      consultation_fee: Number(consultation_fee),
      access_level,
      status,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedRecord, error: updateError } = await supabaseAdmin
      .from("staff_directory")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 400 });
    }

    // Update Auth credentials if password or email changed
    if (updatedRecord?.auth_user_id) {
      const authUpdates: { email?: string; password?: string; user_metadata?: Record<string, unknown> } = {
        email,
        user_metadata: {
          full_name: name,
          degree,
          department,
          consultation_fee,
          status,
        },
      };
      if (password && password.trim() !== "") {
        authUpdates.password = password;
      }
      await supabaseAdmin.auth.admin.updateUserById(updatedRecord.auth_user_id, authUpdates);
    }

    return NextResponse.json(
      { success: true, message: "Doctor record updated successfully.", data: updatedRecord },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error occurred.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Staff Directory ID is required." }, { status: 400 });
    }

    const { data: record } = await supabaseAdmin
      .from("staff_directory")
      .select("auth_user_id")
      .eq("id", id)
      .single();

    if (record?.auth_user_id) {
      await supabaseAdmin.auth.admin.deleteUser(record.auth_user_id);
    }

    const { error: deleteError } = await supabaseAdmin
      .from("staff_directory")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json({ success: false, error: deleteError.message }, { status: 400 });
    }

    return NextResponse.json(
      { success: true, message: "Doctor record and login credentials removed." },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error occurred.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}