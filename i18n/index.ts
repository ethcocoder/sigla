import { am } from "./am";
import { en } from "./en";

export const languages = { en, am } as const;
export type Language = keyof typeof languages;
export type TranslationKey = keyof typeof en;
