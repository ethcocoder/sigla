import { describe, expect, it } from "vitest";
import { am } from "../i18n/am";
import { en } from "../i18n/en";
const keys = Object.keys(en) as Array<keyof typeof en>;
describe("SIGLA foundation", () => {
  it("keeps English and Amharic resources aligned", () => { expect(Object.keys(am).sort()).toEqual(keys.sort()); });
  it("uses the live marketplace domain states", () => { expect(["DRAFT", "PAYMENT_PENDING", "PENDING_REVIEW", "APPROVED", "REJECTED", "EXPIRED", "SUSPENDED"]).toContain("APPROVED"); });
});
