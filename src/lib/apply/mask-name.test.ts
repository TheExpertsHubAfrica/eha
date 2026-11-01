import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { maskPersonName } from "./mask-name";

describe("maskPersonName", () => {
  it("keeps only the initial of each word", () => {
    assert.equal(maskPersonName("Ama Serwaa Mensah"), "A*** S*** M***");
  });

  it("handles extra spaces, single letters and non-ASCII names", () => {
    assert.equal(maskPersonName("  Kofi   Annan "), "K*** A***");
    assert.equal(maskPersonName("K"), "K***");
    assert.equal(maskPersonName("Élodie 𝒜bena"), "É*** 𝒜***");
  });

  it("does not return an empty value", () => {
    assert.equal(maskPersonName("   "), "***");
  });
});
