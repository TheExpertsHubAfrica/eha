import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applicationAccessPath,
  formatApplicationReference,
  parseApplicationReference,
} from "./reference";

describe("application reference", () => {
  it("formats TEHA-YYYY-NNNNNN", () => {
    assert.equal(formatApplicationReference(2026, 124), "TEHA-2026-000124");
    assert.equal(formatApplicationReference(2026, 1), "TEHA-2026-000001");
  });

  it("appends a random suffix when given one", () => {
    assert.equal(formatApplicationReference(2026, 124, "K7M2QX"), "TEHA-2026-000124-K7M2QX");
    assert.throws(() => formatApplicationReference(2026, 124, "short"));
  });

  it("parses a suffixed reference", () => {
    assert.deepEqual(parseApplicationReference("teha-2026-000124-k7m2qx"), {
      prefix: "TEHA",
      year: 2026,
      sequence: 124,
    });
  });

  it("encodes the reference in the access path", () => {
    assert.equal(
      applicationAccessPath("TEHA-2026-000124-K7M2QX"),
      "/application/access?reference=TEHA-2026-000124-K7M2QX",
    );
    assert.equal(applicationAccessPath("a&b=c"), "/application/access?reference=a%26b%3Dc");
  });

  it("parses a valid reference", () => {
    assert.deepEqual(parseApplicationReference("teha-2026-000124"), {
      prefix: "TEHA",
      year: 2026,
      sequence: 124,
    });
    assert.equal(parseApplicationReference("EHA-2026-000124")?.prefix, "EHA");
  });

  it("rejects malformed references", () => {
    assert.equal(parseApplicationReference("EHA-26-124"), null);
    assert.equal(parseApplicationReference("EHA-2026-ABC124"), null);
    assert.equal(parseApplicationReference("EHA-2026-000124-ABC"), null);
  });
});
