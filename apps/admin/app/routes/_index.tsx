import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { getAdminUser } from "../session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getAdminUser(request);
  if (user) {
    return redirect("/dashboard");
  }
  return redirect("/auth");
}

export default function Index() {
  return null;
}
