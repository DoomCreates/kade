import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../lib/supabaseServer';

const SINGLE_ROW_ID = 1; // we’ll store everything in one row

export async function GET() {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from('content')
    .select('*')
    .eq('id', SINGLE_ROW_ID)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = "no rows found"
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    data || {
      id: SINGLE_ROW_ID,
      header1: '',
      text1: '',
      header2: '',
      text2: '',
      images: []
    }
  );
}

export async function POST(request) {
  const body = await request.json();
  const supabase = createSupabaseServerClient();

  const payload = {
    id: SINGLE_ROW_ID,
    header1: body.header1 || '',
    text1: body.text1 || '',
    header2: body.header2 || '',
    text2: body.text2 || '',
    images: body.images || []
  };

  const { error } = await supabase
    .from('content')
    .upsert(payload, { onConflict: 'id' });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
