import type { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request: _request }: LoaderFunctionArgs) {
  return new Response(null, {
    status: 204,
    headers: {
      "Content-Type": "image/x-icon",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
