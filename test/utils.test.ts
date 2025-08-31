import { describe, it, expect } from "vitest";
import { normalizeUrl, base62, genCode } from "../src/utils.js";

describe("utils.normalizeUrl", () => {
  it("adds https if missing", () => {
    expect(normalizeUrl("example.com")).toBe("https://example.com/");
  });

  it("keeps http and https", () => {
    expect(normalizeUrl("http://example.com")).toBe("http://example.com/");
    expect(normalizeUrl("https://example.com/path?q=1")).toBe("https://example.com/path?q=1");
  });

  it("throws on invalid URL", () => {
    expect(() => normalizeUrl("::not-a-url::")).toThrowError(/Invalid URL/);
  });
});

describe("utils.base62", () => {
  it("encodes zero", () => {
    expect(base62(0n)).toBe("0");
  });

  it("encodes small numbers", () => {
    expect(base62(1n)).toBe("1");
    expect(base62(61n)).toBe("Z");
    expect(base62(62n)).toBe("10");
  });
});
