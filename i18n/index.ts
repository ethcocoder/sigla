import { am } from "./am";
import { en } from "./en";
import { om } from "./om";

export const languages = { en, am, om } as const;
export type Language = keyof typeof languages;
export type TranslationKey = keyof typeof en;
