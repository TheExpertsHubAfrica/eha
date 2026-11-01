import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { maskEmail } from "./mask-email";

describe("maskEmail", () => {
  it("keeps only the first letter and the domain", () => {
    assert.equal(maskEmail("ama.mensah@gmail.com"), "a***@gmail.com");
  });

  it("does not reveal the length of the local part", () => {
    assert.equal(maskEmail("a@gmail.com"), maskEmail("abcdefgh@gmail.com"));
  });

  it("handles values that are not email addresses", () => {
    assert.equal(maskEmail("not-an-email"), "***");
    assert.equal(maskEmail("@gmail.com"), "***");
  });
});
