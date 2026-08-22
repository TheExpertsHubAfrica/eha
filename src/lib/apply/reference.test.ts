import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatApplicationReference, parseApplicationReference } from "./reference";

describe("application reference", () => {
  it("formats TEHA-YYYY-NNNNNN", () => {
    assert.equal(formatApplicationReference(2026, 124), "TEHA-2026-000124");
    assert.equal(formatApplicationReference(2026, 1), "TEHA-2026-000001");
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
  });
});
