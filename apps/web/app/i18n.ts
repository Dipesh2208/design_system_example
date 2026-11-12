export const supportedLngs = ["gu", "hi", "en"] as const;
export type SupportedLng = (typeof supportedLngs)[number];

export const fallbackLng = "gu";
export const defaultNS = "common";

export default {
  supportedLngs: [...supportedLngs],
  fallbackLng,
  defaultNS,
  react: { useSuspense: false },
};
