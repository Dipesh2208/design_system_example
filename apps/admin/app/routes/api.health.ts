import { json } from "@remix-run/node";

export async function loader() {
  return json(
    { status: "ok", timestamp: Date.now() },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    },
  );
}
