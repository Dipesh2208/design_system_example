import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { localeCookie } from "../i18next.server";
import { supportedLngs } from "../i18n";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const lng = formData.get("lng")?.toString();

  if (lng && supportedLngs.includes(lng as any)) {
    return json(
      { success: true, lng },
      {
        headers: {
          "Set-Cookie": await localeCookie.serialize(lng),
        },
      }
    );
  }

  return json({ success: false }, { status: 400 });
}
