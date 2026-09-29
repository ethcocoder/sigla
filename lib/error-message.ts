const SAFE_MESSAGES = {
  network: "We couldn’t reach SIGLA. Check your connection and try again.",
  unauthorized: "You don’t have permission to do that.",
  validation: "Please check the highlighted fields and try again.",
  upload: "That image could not be uploaded. Try a smaller JPG, PNG, or WEBP.",
  generic: "Something went wrong. Please try again.",
} as const;

export type SafeErrorKind = keyof typeof SAFE_MESSAGES;

export function getSafeErrorMessage(error: unknown, fallback: SafeErrorKind = "generic") {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = String((error as { code?: unknown }).code ?? "");
    if (code.includes("permission") || code.includes("unauthorized")) return SAFE_MESSAGES.unauthorized;
    if (code.includes("network") || code.includes("fetch")) return SAFE_MESSAGES.network;
    if (code.includes("storage") || code.includes("upload")) return SAFE_MESSAGES.upload;
    if (code.includes("validation") || code.includes("invalid")) return SAFE_MESSAGES.validation;
  }
  return SAFE_MESSAGES[fallback];
}
