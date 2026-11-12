import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { localeCookie } from "../i18next.server";
import { supportedLngs, fallbackLng, type SupportedLng } from "../i18n";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const lng = String(formData.get("lng") || "");

  const validLng = (
    supportedLngs.includes(lng as SupportedLng) ? lng : fallbackLng
  ) as SupportedLng;

  return json(
    { success: true, lng: validLng },
    {
      headers: {
        "Set-Cookie": await localeCookie.serialize(validLng),
      },
    }
  );
}
