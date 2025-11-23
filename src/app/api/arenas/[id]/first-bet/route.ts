import { NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabase-server";

interface Params {
  id: string;
}

export async function POST(_req: Request, context: { params: Promise<Params> }) {
  try {
    const { id } = await context.params;

    const { error } = await supabaseServer
      .from("arenas")
      .update({ first_demo_bet_at: new Date().toISOString() })
      .eq("id", id)
      .is("first_demo_bet_at", null);

    if (error) {
      // eslint-disable-next-line no-console
      console.error("[api/arenas/:id/first-bet] Supabase error", error);
      return NextResponse.json({ error: "Failed to mark first bet" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[api/arenas/:id/first-bet] Unexpected error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


