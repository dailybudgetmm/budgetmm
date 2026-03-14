import { auth } from "./firebase";

/**
 * A wrapper around fetch that automatically injects the Firebase UID
 * as the `x-user-id` header for authenticated requests to the backend.
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  
  if (auth.currentUser) {
    headers.set("x-user-id", auth.currentUser.uid);
  }
  
  headers.set("Content-Type", headers.get("Content-Type") || "application/json");

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    let errorMsg = "An error occurred";
    try {
      const data = await response.json();
      errorMsg = data.message || errorMsg;
    } catch {
      errorMsg = response.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }
  
  // Handle 204 No Content
  if (response.status === 204) return null;
  
  return response.json();
}
