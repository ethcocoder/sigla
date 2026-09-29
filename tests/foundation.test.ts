import { describe, expect, it } from "vitest";

import { am } from "../i18n/am";
import { en } from "../i18n/en";
import { demoSettings, demoPosts } from "../data/demo";

const keys = Object.keys(en) as Array<keyof typeof en>;

describe("SIGLA foundation", () => {
  it("keeps English and Amharic resources aligned", () => {
    expect(Object.keys(am).sort()).toEqual(keys.sort());
  });

  it("keeps configurable business values out of listing records", () => {
    expect(demoSettings.registrationFee).toBeGreaterThan(0);
    expect(demoSettings.postFee).toBeGreaterThan(0);
    expect(demoSettings.maxImagesPerPost).toBeGreaterThan(0);
  });

  it("contains only approved demo posts in the public feed", () => {
    expect(demoPosts.every((post) => post.status === "APPROVED")).toBe(true);
  });
});
