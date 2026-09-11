const MUTATING_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"]);

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

function requestMethod(input: RequestInfo | URL, init?: RequestInit): string {
  if (init?.method) return init.method.toUpperCase();
  if (typeof Request !== "undefined" && input instanceof Request) {
    return input.method.toUpperCase();
  }
  return "GET";
}

function isCredentialAuthRequest(url: string): boolean {
  return url.includes("/api/auth/login") || url.includes("/api/auth/signup");
}

function redirectToLogin() {
  if (typeof window === "undefined") return;
  const { pathname } = window.location;
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) return;
  window.location.replace("/login");
}

export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const response = await fetch(input, init);

  if (
    response.status === 401 &&
    MUTATING_METHODS.has(requestMethod(input, init)) &&
    !isCredentialAuthRequest(requestUrl(input))
  ) {
    redirectToLogin();
  }

  return response;
}
