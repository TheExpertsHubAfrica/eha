import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { csvCell } from "./csv";

describe("csvCell", () => {
  it("neutralises values that spreadsheets run as formulas", () => {
    assert.equal(csvCell("=1+1"), "'=1+1");
    assert.equal(csvCell("@SUM(A1)"), "'@SUM(A1)");
    assert.equal(csvCell("-2+3"), "'-2+3");
    assert.equal(csvCell("+SUM(A1)"), "'+SUM(A1)");
    assert.equal(csvCell("  =1+1"), "'  =1+1");
    assert.equal(csvCell("\t=1+1"), "'\t=1+1");
    assert.equal(csvCell("＝1+1"), "'＝1+1");
  });

  it("neutralises and quotes a formula containing separators", () => {
    assert.equal(csvCell('=HYPERLINK("http://x","y")'), `"'=HYPERLINK(""http://x"",""y"")"`);
  });

  it("leaves phone numbers readable", () => {
    assert.equal(csvCell("+233201234567"), "+233201234567");
    assert.equal(csvCell("+233 (20) 123-4567"), "+233 (20) 123-4567");
  });

  it("does not treat a formula as a phone number", () => {
    assert.equal(csvCell("+233=cmd|x"), "'+233=cmd|x");
  });

  it("quotes separators, quotes and all line endings", () => {
    assert.equal(csvCell("a,b"), '"a,b"');
    assert.equal(csvCell('say "hi"'), '"say ""hi"""');
    assert.equal(csvCell("a\nb"), '"a\nb"');
    assert.equal(csvCell("a\rb"), '"a\rb"');
  });

  it("passes plain values through", () => {
    assert.equal(csvCell("Ama Mensah"), "Ama Mensah");
    assert.equal(csvCell(42), "42");
    assert.equal(csvCell(-1), "-1");
    assert.equal(csvCell(null), "");
    assert.equal(csvCell(undefined), "");
  });
});
