function countryCode(request) {
  const value = String(request.headers.get("x-vercel-ip-country") || "").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(value) ? value : "unknown";
}

export function handleCountryRequest(request) {
  if (request.method !== "GET") {
    return Response.json({ error: "method_not_allowed" }, {
      status: 405,
      headers: { Allow: "GET", "Cache-Control": "no-store, max-age=0" }
    });
  }
  return Response.json({ country: countryCode(request) }, {
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff"
    }
  });
}

export default { fetch: handleCountryRequest };
export { countryCode };
