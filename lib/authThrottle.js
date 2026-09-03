import { createSupabaseServerClient } from "./supabaseServer";

const MAX_ATTEMPTS_BEFORE_LOCK = 5;
const BASE_LOCK_MINUTES = 2;
const MAX_LOCK_MINUTES = 30;

export async function isLocked() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("auth_throttle")
    .select("locked_until")
    .eq("id", 1)
    .single();

  // Fails open on a Supabase outage — you stay lockable-out but not
  // permanently locked out by an infra blip. Trade-off, not an oversight.
  if (error || !data || !data.locked_until) return { locked: false };

  const lockedUntil = new Date(data.locked_until);
  if (lockedUntil > new Date()) {
    return {
      locked: true,
      retryAfterSeconds: Math.ceil((lockedUntil - new Date()) / 1000),
    };
  }
  return { locked: false };
}

export async function recordFailure() {
  const supabase = createSupabaseServerClient();

  const { data } = await supabase
    .from("auth_throttle")
    .select("failed_count")
    .eq("id", 1)
    .single();

  const failedCount = (data?.failed_count || 0) + 1;
  let lockedUntil = null;

  if (failedCount >= MAX_ATTEMPTS_BEFORE_LOCK) {
    const overBy = failedCount - MAX_ATTEMPTS_BEFORE_LOCK;
    const minutes = Math.min(BASE_LOCK_MINUTES * Math.pow(2, overBy), MAX_LOCK_MINUTES);
    lockedUntil = new Date(Date.now() + minutes * 60 * 1000).toISOString();
  }

  await supabase.from("auth_throttle").upsert({
    id: 1,
    failed_count: failedCount,
    locked_until: lockedUntil,
    updated_at: new Date().toISOString(),
  });
}

export async function recordSuccess() {
  const supabase = createSupabaseServerClient();
  await supabase.from("auth_throttle").upsert({
    id: 1,
    failed_count: 0,
    locked_until: null,
    updated_at: new Date().toISOString(),
  });
}
