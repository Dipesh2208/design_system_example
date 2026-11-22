import guCommon from "./gu/common.json";
import hiCommon from "./hi/common.json";
import enCommon from "./en/common.json";

export const resources = {
  gu: { common: guCommon },
  hi: { common: hiCommon },
  en: { common: enCommon },
} as const;
