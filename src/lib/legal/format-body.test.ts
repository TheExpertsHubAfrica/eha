import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseLegalBody } from "./format-body";

describe("parseLegalBody", () => {
  it("turns numbered section titles into headings", () => {
    const blocks = parseLegalBody(
      "Intro paragraph.\n1. Purpose:\nBody under purpose.\n2. Fees:\nBody under fees.",
    );
    assert.equal(blocks.length, 5);
    assert.equal(blocks[0]?.type, "p");
    assert.equal(blocks[1]?.type, "h3");
    assert.equal(blocks[1]?.type === "h3" && blocks[1].text, "1. Purpose:");
    assert.equal(blocks[2]?.type, "p");
    assert.equal(blocks[3]?.type, "h3");
  });

  it("supports markdown headings and bullet lists", () => {
    const blocks = parseLegalBody("# Privacy\n\nDetails here.\n- One\n- Two");
    assert.equal(blocks[0]?.type, "h2");
    assert.equal(blocks[1]?.type, "p");
    assert.equal(blocks[2]?.type, "ul");
  });
});
