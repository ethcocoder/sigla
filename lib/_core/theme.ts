import { Platform } from "react-native";

import themeConfig from "@/theme.config";

export type ColorScheme = "light" | "dark";

type ThemeColorName =
  | "primary"
  | "primaryDark"
  | "primarySoft"
  | "secondary"
  | "secondaryDark"
  | "secondarySoft"
  | "background"
  | "surface"
  | "foreground"
  | "muted"
  | "border"
  | "success"
  | "warning"
  | "error"
  | "white";
type ThemeColorConfig = Record<ThemeColorName, { light: string; dark: string }>;
type SchemePalette = Record<ColorScheme, Record<ThemeColorName, string>>;

export const ThemeColors = themeConfig.themeColors as ThemeColorConfig;

function buildSchemePalette(colors: ThemeColorConfig): SchemePalette {
  const palette: SchemePalette = {
    light: {} as SchemePalette["light"],
    dark: {} as SchemePalette["dark"],
  };

  (Object.keys(colors) as ThemeColorName[]).forEach((name) => {
    const swatch = colors[name];
    palette.light[name] = swatch.light;
    palette.dark[name] = swatch.dark;
  });

  return palette;
}

export const SchemeColors = buildSchemePalette(ThemeColors);

export type ThemeColorPalette = {
  primary: string;
  primaryDark: string;
  primarySoft: string;
  secondary: string;
  secondaryDark: string;
  secondarySoft: string;
  background: string;
  surface: string;
  foreground: string;
  muted: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  white: string;
  text: string;
  tint: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;
};

function buildRuntimePalette(scheme: ColorScheme): ThemeColorPalette {
  const base = SchemeColors[scheme];
  return {
    primary: base.primary,
    primaryDark: base.primaryDark,
    primarySoft: base.primarySoft,
    secondary: base.secondary,
    secondaryDark: base.secondaryDark,
    secondarySoft: base.secondarySoft,
    background: base.background,
    surface: base.surface,
    foreground: base.foreground,
    muted: base.muted,
    border: base.border,
    success: base.success,
    warning: base.warning,
    error: base.error,
    white: base.white,
    text: base.foreground,
    tint: base.primary,
    icon: base.muted,
    tabIconDefault: base.muted,
    tabIconSelected: base.primary,
  };
}

export const Colors = {
  light: buildRuntimePalette("light"),
  dark: buildRuntimePalette("dark"),
} satisfies Record<ColorScheme, ThemeColorPalette>;

export const Spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, page: 20 } as const;
export const Radii = { sm: 10, md: 16, lg: 24, pill: 999 } as const;
export const Typography = {
  display: { fontSize: 32, lineHeight: 38, fontWeight: "800" as const },
  title: { fontSize: 24, lineHeight: 30, fontWeight: "800" as const },
  heading: { fontSize: 18, lineHeight: 24, fontWeight: "700" as const },
  body: { fontSize: 15, lineHeight: 22, fontWeight: "400" as const },
  label: { fontSize: 12, lineHeight: 16, fontWeight: "700" as const, letterSpacing: 0.5 },
  caption: { fontSize: 12, lineHeight: 17, fontWeight: "500" as const },
};

export const Fonts = Platform.select({
  ios: { sans: "system-ui", serif: "ui-serif", rounded: "ui-rounded", mono: "ui-monospace" },
  default: { sans: "normal", serif: "serif", rounded: "normal", mono: "monospace" },
  web: { sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", serif: "Georgia, 'Times New Roman', serif", rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif", mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" },
});
