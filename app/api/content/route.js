import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabaseServer";

const SINGLE_ROW_ID = 1;

export async function GET() {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("content")
    .select("*")
    .eq("id", SINGLE_ROW_ID)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    data || {
      id: SINGLE_ROW_ID,
      header1_title: "Header 1",
      header1: "",
      text1_title: "Text 1",
      text1: "",
      header2_title: "Header 2",
      header2: "",
      text2_title: "Text 2",
      text2: "",
      images_title: "Images",
      images: [],
      planner: Array.from({ length: 8 }, () => ({ label: "", text: "" }))
    }
  );
}

export async function POST(request) {
  const body = await request.json();
  const supabase = createSupabaseServerClient();

  const payload = {
    id: SINGLE_ROW_ID,
    header1_title: body.header1_title,
    header1: body.header1,
    text1_title: body.text1_title,
    text1: body.text1,
    header2_title: body.header2_title,
    header2: body.header2,
    text2_title: body.text2_title,
    text2: body.text2,
    images_title: body.images_title,
    images: body.images,
    planner: body.planner
  };

  const { error } = await supabase
    .from("content")
    .upsert(payload, { onConflict: "id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
