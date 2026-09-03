export function checkSession(request) {
  const sessionToken = process.env.VAULT_SESSION_TOKEN;
  if (!sessionToken) return false;

  const cookie = request.cookies.get("vault_session");
  if (!cookie) return false;

  return cookie.value === sessionToken;
}
