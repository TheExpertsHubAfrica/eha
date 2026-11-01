import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { paymentStatusFromPaystack } from "./status";

describe("paymentStatusFromPaystack", () => {
  it("treats success, failed and reversed as final", () => {
    assert.deepEqual(paymentStatusFromPaystack("success"), { status: "success", final: true });
    assert.deepEqual(paymentStatusFromPaystack("failed"), { status: "failed", final: true });
    assert.deepEqual(paymentStatusFromPaystack("reversed"), { status: "failed", final: true });
  });

  it("does not treat an unfinished payment as failed", () => {
    assert.deepEqual(paymentStatusFromPaystack("abandoned"), { status: "abandoned", final: false });
    for (const status of ["ongoing", "pending", "processing", "queued"]) {
      assert.deepEqual(paymentStatusFromPaystack(status), { status: "pending", final: false });
    }
  });

  it("treats an unknown status as in progress", () => {
    assert.deepEqual(paymentStatusFromPaystack("something_new"), { status: "pending", final: false });
  });
});
