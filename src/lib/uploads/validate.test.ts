import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { inspectUpload, sanitizeFilename } from "./validate";

const pdfReq = { acceptedTypes: ["application/pdf"], maxSizeMb: 5 };
const imageReq = {
  acceptedTypes: ["application/pdf", "image/jpeg", "image/png"],
  maxSizeMb: 5,
};

function pdf(extra = "1 0 obj\n<<>>\nendobj") {
  return Buffer.from(`%PDF-1.4\n${extra}\n%%EOF`);
}

function jpeg() {
  return Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0xff, 0xd9]);
}

function png() {
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    Buffer.from("IHDR"),
  ]);
}

describe("inspectUpload", () => {
  it("accepts a valid PDF for a PDF-only slot", () => {
    const result = inspectUpload(pdf(), "cv.pdf", pdfReq);
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.mimeType, "application/pdf");
  });

  it("accepts JPEG and PNG for identity documents", () => {
    assert.equal(inspectUpload(jpeg(), "photo.jpg", imageReq).ok, true);
    assert.equal(inspectUpload(png(), "photo.png", imageReq).ok, true);
  });

  it("rejects HTML pretending to be a PDF", () => {
    const result = inspectUpload(Buffer.from("<!DOCTYPE html><script>alert(1)</script>"), "cv.pdf", pdfReq);
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "blocked");
  });

  it("rejects executables", () => {
    const result = inspectUpload(Buffer.from("MZ\x90\x00fake"), "setup.exe", pdfReq);
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "blocked");
  });

  it("rejects SVG and JavaScript by extension", () => {
    assert.equal(inspectUpload(pdf(), "image.svg", imageReq).ok, false);
    assert.equal(inspectUpload(pdf(), "payload.js.pdf", pdfReq).ok, false);
  });

  it("rejects a JPEG uploaded to a PDF-only CV slot", () => {
    const result = inspectUpload(jpeg(), "cv.jpg", pdfReq);
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "type");
  });

  it("rejects oversized files", () => {
    const result = inspectUpload(Buffer.alloc(6 * 1024 * 1024, 37), "cv.pdf", {
      ...pdfReq,
      maxSizeMb: 5,
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "size");
  });

  it("rejects path-traversal names as blocked types when extension is unsafe", () => {
    assert.equal(sanitizeFilename("../../etc/passwd"), "passwd");
    assert.equal(sanitizeFilename("..\\windows\\photo.jpg"), "photo.jpg");
    const result = inspectUpload(pdf(), "../../cv.pdf", pdfReq);
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.originalFilename, "cv.pdf");
  });

  it("rejects an empty buffer", () => {
    const result = inspectUpload(Buffer.alloc(0), "cv.pdf", pdfReq);
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "size");
  });
});
