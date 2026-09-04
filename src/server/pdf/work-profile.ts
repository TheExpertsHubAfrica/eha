import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFImage,
  type PDFPage,
} from "pdf-lib";
import type { JobOffer } from "@/lib/catalog/types";
import { PASSPORT_SIZE_PHOTO } from "@/lib/apply/document-requirements";
import { siteConfig } from "@/lib/site-config";
import { formatDisplayDate, formatMoney } from "@/lib/utils";
import type { DraftApplication } from "@/server/application/service";
import { getObjectStorage } from "@/server/storage";

const BLACK = rgb(0, 0, 0);
const MUTED = rgb(0.35, 0.35, 0.35);
const LINE = rgb(0.72, 0.72, 0.72);
const FILL = rgb(0.97, 0.97, 0.97);
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 36;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const HEADER_HEIGHT = 42;
const FOOTER_RESERVE = 40;
const PHOTO_W = 92;
const PHOTO_H = 118;

type ProfileDoc = DraftApplication & {
  referenceNumber: string | null;
  submittedAt: Date | null;
};

type StoredBytes = {
  requirementKey: string;
  name: string;
  filename: string;
  mimeType: string;
  bytes: Uint8Array;
};

function headerBottom() {
  return PAGE_HEIGHT - HEADER_HEIGHT;
}

function display(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "N/A";
}

function titleCase(value?: string | null) {
  if (!value) return "N/A";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function isImageMime(mime: string) {
  return mime === "image/jpeg" || mime === "image/jpg" || mime === "image/png";
}

function isPdfMime(mime: string) {
  return mime === "application/pdf";
}

async function loadStoredDocuments(
  application: ProfileDoc,
  job: JobOffer,
): Promise<StoredBytes[]> {
  const storage = getObjectStorage();
  const loaded: StoredBytes[] = [];

  for (const requirement of job.documentRequirements) {
    const file = application.documents.find((doc) => doc.requirementKey === requirement.key);
    if (!file) continue;
    try {
      const bytes = await storage.get(file.storageKey);
      loaded.push({
        requirementKey: requirement.key,
        name: requirement.name,
        filename: file.originalFilename,
        mimeType: file.mimeType,
        bytes,
      });
    } catch {
      // Skip unreadable files; checklist will still note the upload.
    }
  }

  return loaded;
}

async function embedRaster(
  doc: PDFDocument,
  bytes: Uint8Array,
  mimeType: string,
): Promise<PDFImage | null> {
  try {
    if (mimeType === "image/png") return await doc.embedPng(bytes);
    if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
      return await doc.embedJpg(bytes);
    }
  } catch {
    return null;
  }
  return null;
}

export async function buildWorkProfilePdf(application: ProfileDoc, job: JobOffer) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique);

  const stored = await loadStoredDocuments(application, job);
  const passportFile =
    stored.find((item) => item.requirementKey === PASSPORT_SIZE_PHOTO.key) ??
    stored.find((item) => isImageMime(item.mimeType) && /photo|passport.?size/i.test(item.name));
  const passportImage = passportFile
    ? await embedRaster(doc, passportFile.bytes, passportFile.mimeType)
    : null;

  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = headerBottom() - 14;

  function drawChrome(target: PDFPage) {
    target.drawRectangle({
      x: 0,
      y: headerBottom(),
      width: PAGE_WIDTH,
      height: HEADER_HEIGHT,
      color: BLACK,
    });
    const baseline = headerBottom() + HEADER_HEIGHT / 2 - 4;
    target.drawText(siteConfig.name.toUpperCase(), {
      x: MARGIN,
      y: baseline,
      size: 10,
      font: bold,
      color: rgb(1, 1, 1),
    });
    const label = "Applicant summary";
    target.drawText(label, {
      x: PAGE_WIDTH - MARGIN - font.widthOfTextAtSize(label, 9),
      y: baseline,
      size: 9,
      font,
      color: rgb(0.82, 0.82, 0.82),
    });
  }

  function addPage() {
    page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    drawChrome(page);
    y = headerBottom() - 18;
  }

  function ensure(space: number) {
    if (y - space < FOOTER_RESERVE) addPage();
  }

  function sectionTitle(text: string) {
    ensure(40);
    y -= 18;
    page.drawText(text, { x: MARGIN, y, size: 10, font: italic, color: BLACK });
    y -= 14;
  }

  function drawCell(
    x: number,
    top: number,
    width: number,
    height: number,
    label: string,
    value: string,
  ) {
    page.drawRectangle({
      x,
      y: top - height,
      width,
      height,
      borderColor: LINE,
      borderWidth: 0.6,
    });
    page.drawText(label, {
      x: x + 5,
      y: top - 12,
      size: 7.5,
      font: italic,
      color: MUTED,
    });
    const lines = wrap(value || "N/A", font, 9, width - 10).slice(0, 3);
    lines.forEach((line, index) => {
      page.drawText(line, {
        x: x + 5,
        y: top - 26 - index * 11,
        size: 9,
        font,
        color: BLACK,
      });
    });
  }

  function fieldRow(
    fields: Array<{ label: string; value: string }>,
    rowHeight = 38,
  ) {
    ensure(rowHeight + 4);
    const top = y;
    const colW = CONTENT_WIDTH / fields.length;
    fields.forEach((field, index) => {
      drawCell(MARGIN + index * colW, top, colW, rowHeight, field.label, field.value);
    });
    y -= rowHeight;
  }

  function multilineBlock(label: string, value: string, minHeight = 72) {
    const lines = wrap(value || "N/A", font, 9, CONTENT_WIDTH - 12);
    const height = Math.max(minHeight, 22 + lines.length * 12);
    ensure(height + 6);
    const top = y;
    page.drawRectangle({
      x: MARGIN,
      y: top - height,
      width: CONTENT_WIDTH,
      height,
      borderColor: LINE,
      borderWidth: 0.6,
    });
    page.drawText(label, {
      x: MARGIN + 5,
      y: top - 12,
      size: 7.5,
      font: italic,
      color: MUTED,
    });
    lines.forEach((line, index) => {
      page.drawText(line, {
        x: MARGIN + 5,
        y: top - 26 - index * 12,
        size: 9,
        font,
        color: BLACK,
      });
    });
    y -= height;
  }

  drawChrome(page);

  const profile = application.profile;
  const photoX = PAGE_WIDTH - MARGIN - PHOTO_W;
  const photoTop = y;

  page.drawRectangle({
    x: photoX,
    y: photoTop - PHOTO_H,
    width: PHOTO_W,
    height: PHOTO_H,
    borderColor: LINE,
    borderWidth: 0.8,
    color: FILL,
  });

  if (passportImage) {
    const scale = Math.min(
      (PHOTO_W - 4) / passportImage.width,
      (PHOTO_H - 4) / passportImage.height,
    );
    const drawW = passportImage.width * scale;
    const drawH = passportImage.height * scale;
    page.drawImage(passportImage, {
      x: photoX + (PHOTO_W - drawW) / 2,
      y: photoTop - PHOTO_H + (PHOTO_H - drawH) / 2,
      width: drawW,
      height: drawH,
    });
  } else {
    const missing = "Passport\nPicture";
    missing.split("\n").forEach((line, index) => {
      const size = 8;
      page.drawText(line, {
        x: photoX + (PHOTO_W - font.widthOfTextAtSize(line, size)) / 2,
        y: photoTop - PHOTO_H / 2 - index * 11,
        size,
        font,
        color: MUTED,
      });
    });
  }

  const metaWidth = CONTENT_WIDTH - PHOTO_W - 14;
  page.drawText(application.referenceNumber ?? "Application", {
    x: MARGIN,
    y,
    size: 14,
    font: bold,
    color: BLACK,
  });
  y -= 16;
  page.drawText(`Submitted ${formatDisplayDate(application.submittedAt) || "—"}`, {
    x: MARGIN,
    y,
    size: 9,
    font,
    color: MUTED,
  });
  y -= 14;
  const jobLine = wrap(`${job.title} · ${job.city}, ${job.country}`, font, 9, metaWidth);
  jobLine.forEach((line) => {
    page.drawText(line, { x: MARGIN, y, size: 9, font, color: BLACK });
    y -= 12;
  });

  y = Math.min(y, photoTop - PHOTO_H - 14);

  sectionTitle("Selected opportunity");
  fieldRow([
    { label: "Role", value: display(job.title) },
    { label: "Location", value: `${job.city}, ${job.country}` },
  ]);
  fieldRow([
    { label: "Category", value: display(job.category) },
    {
      label: "Listed salary",
      value: formatMoney(job.salary.amount, job.salary.currency),
    },
  ]);

  sectionTitle("Personal Information");
  fieldRow([
    { label: "Full Name", value: display(profile?.fullName) },
    { label: "Passport No.", value: display(profile?.passportNumber) },
  ]);
  fieldRow([
    { label: "Place of Birth", value: display(profile?.placeOfBirth) },
    { label: "Date of Birth", value: formatDisplayDate(profile?.dateOfBirth) || "N/A" },
  ]);
  fieldRow([
    { label: "Nationality", value: display(profile?.nationality) },
    { label: "Previous Nationality", value: display(profile?.previousNationality) },
  ]);
  fieldRow([
    { label: "Country of Residence", value: display(profile?.countryOfResidence) },
    { label: "Current City", value: display(profile?.currentCity) },
  ]);

  sectionTitle("Education Qualification");
  if (application.education.length === 0) {
    fieldRow([
      { label: "Type of Qualification", value: "N/A" },
      { label: "School / College", value: "N/A" },
    ]);
  } else {
    for (const record of application.education) {
      fieldRow([
        { label: "Type of Qualification", value: display(record.qualification) },
        {
          label: "School / College",
          value: [record.institution, record.programme].filter(Boolean).join(" — ") || "N/A",
        },
      ]);
      fieldRow([
        { label: "Languages", value: display(record.languages) },
        {
          label: "Graduation / Certifications",
          value:
            [record.graduationYear?.toString(), record.certifications]
              .filter(Boolean)
              .join(" · ") || "N/A",
        },
      ]);
    }
  }

  sectionTitle("Marital Status");
  fieldRow([
    { label: "Marital Status", value: titleCase(profile?.maritalStatus) },
    { label: "Spouse Name", value: display(profile?.spouseName) },
  ]);
  fieldRow([
    { label: "Spouse Nationality", value: display(profile?.spouseNationality) },
    {
      label: "Spouse Place of Birth",
      value: display(profile?.spousePlaceOfBirth),
    },
  ]);
  fieldRow([
    {
      label: "Spouse Date of Birth",
      value: formatDisplayDate(profile?.spouseDateOfBirth) || "N/A",
    },
  ]);

  sectionTitle("Children / Dependants");
  if (application.dependants.length === 0) {
    fieldRow([
      { label: "Name", value: "N/A" },
      { label: "Relationship", value: "N/A" },
      { label: "Date of Birth", value: "N/A" },
    ]);
  } else {
    for (const record of application.dependants) {
      fieldRow([
        { label: "Name", value: display(record.fullName) },
        { label: "Relationship", value: display(record.relationship) },
        {
          label: "Date of Birth",
          value: formatDisplayDate(record.dateOfBirth) || "N/A",
        },
      ]);
    }
  }

  sectionTitle("Communication");
  fieldRow([
    { label: "Telephone — Home country", value: display(profile?.phone) },
    { label: "E-mail Address", value: display(profile?.email) },
  ]);

  sectionTitle("Work history");
  if (application.employment.length === 0) {
    fieldRow([{ label: "Employment", value: "N/A" }]);
  } else {
    for (const record of application.employment) {
      const dates = record.current
        ? `${formatDisplayDate(record.startDate)} – current`
        : `${formatDisplayDate(record.startDate)} – ${formatDisplayDate(record.endDate)}`;
      fieldRow([
        { label: "Position", value: display(record.position) },
        { label: "Employer", value: display(record.employer) },
      ]);
      fieldRow([
        { label: "Country", value: display(record.country) },
        { label: "Dates", value: dates },
      ]);
      multilineBlock("Responsibilities", display(record.responsibilities), 54);
      if (record.reasonForLeaving) {
        fieldRow([{ label: "Reason for leaving", value: display(record.reasonForLeaving) }]);
      }
    }
  }

  sectionTitle("Did you previously work in military");
  if (application.military) {
    fieldRow([
      { label: "Name of country", value: display(application.military.country) },
      { label: "Type of Service", value: display(application.military.serviceType) },
    ]);
    fieldRow([
      { label: "Rank", value: display(application.military.rank) },
      { label: "Duration of Service", value: display(application.military.duration) },
    ]);
  } else {
    fieldRow([
      { label: "Name of country", value: "N/A" },
      { label: "Type of Service", value: "N/A" },
      { label: "Rank", value: "N/A" },
      { label: "Duration of Service", value: "N/A" },
    ]);
  }

  const homeContacts = application.emergencyContacts.filter((item) => item.kind !== "uae");
  const uaeContacts = application.emergencyContacts.filter((item) => item.kind === "uae");

  sectionTitle("Emergency / home-country contacts");
  if (homeContacts.length === 0) {
    fieldRow([
      { label: "Name", value: "N/A" },
      { label: "Relationship", value: "N/A" },
      { label: "Telephone", value: "N/A" },
    ]);
  } else {
    for (const contact of homeContacts) {
      fieldRow([
        { label: "Name", value: display(contact.name) },
        { label: "Relationship", value: display(contact.relationship) },
        { label: "Telephone", value: display(contact.phone) },
      ]);
      fieldRow([
        { label: "E-mail", value: display(contact.email) },
        { label: "Location", value: `${contact.city}, ${contact.country}` },
      ]);
    }
  }

  sectionTitle("Contact persons in UAE");
  if (uaeContacts.length === 0) {
    fieldRow([
      { label: "Name", value: "N/A" },
      { label: "Nationality / Place of work", value: "N/A" },
      { label: "Telephone", value: "N/A" },
    ]);
  } else {
    for (const contact of uaeContacts) {
      fieldRow([
        { label: "Name", value: display(contact.name) },
        {
          label: "Nationality / Place of work",
          value: [contact.city, contact.country].filter(Boolean).join(" · ") || "N/A",
        },
        { label: "Telephone", value: display(contact.phone) },
      ]);
    }
  }

  sectionTitle("Previously visited countries");
  if (application.travelHistory.length === 0) {
    fieldRow([{ label: "Travel history", value: profile?.visitedAbroad ? "Yes — details not listed" : "N/A" }]);
  } else {
    for (const record of application.travelHistory) {
      fieldRow([
        { label: "Country", value: display(record.country) },
        { label: "Year", value: String(record.year) },
        { label: "Purpose", value: display(record.purpose) },
        { label: "Duration", value: display(record.duration) },
      ]);
    }
  }

  sectionTitle("A brief about you");
  multilineBlock("Personal statement", display(profile?.personalStatement), 90);

  sectionTitle("Documents submitted");
  for (const requirement of job.documentRequirements) {
    const file = application.documents.find((doc) => doc.requirementKey === requirement.key);
    const storedFile = stored.find((item) => item.requirementKey === requirement.key);
    let status = requirement.required ? "Required — not uploaded" : "Optional — not uploaded";
    if (file) {
      if (storedFile && isImageMime(storedFile.mimeType)) {
        status =
          requirement.key === PASSPORT_SIZE_PHOTO.key || storedFile === passportFile
            ? `Image included (passport picture) · ${file.originalFilename}`
            : `Image attached on following page · ${file.originalFilename}`;
      } else if (storedFile && isPdfMime(storedFile.mimeType)) {
        status = `PDF pages appended · ${file.originalFilename}`;
      } else {
        status = `Uploaded · ${file.originalFilename} · ${file.mimeType}`;
      }
    }
    fieldRow([{ label: requirement.name, value: status }], 42);
  }

  ensure(28);
  y -= 10;
  page.drawText(
    "This document is a copy of the submitted work profile. It is not a visa, contract, or placement decision.",
    { x: MARGIN, y, size: 7.5, font, color: MUTED },
  );

  // Additional image pages (exclude passport photo already shown in header)
  for (const file of stored) {
    if (!isImageMime(file.mimeType)) continue;
    if (passportFile && file.requirementKey === passportFile.requirementKey) continue;

    const image = await embedRaster(doc, file.bytes, file.mimeType);
    if (!image) continue;

    addPage();
    page.drawText(file.name, { x: MARGIN, y, size: 11, font: bold, color: BLACK });
    y -= 14;
    page.drawText(file.filename, { x: MARGIN, y, size: 8, font, color: MUTED });
    y -= 16;

    const maxW = CONTENT_WIDTH;
    const maxH = y - FOOTER_RESERVE;
    const scale = Math.min(maxW / image.width, maxH / image.height, 1);
    const drawW = image.width * scale;
    const drawH = image.height * scale;
    page.drawRectangle({
      x: MARGIN,
      y: y - drawH - 4,
      width: drawW + 8,
      height: drawH + 8,
      borderColor: LINE,
      borderWidth: 0.6,
    });
    page.drawImage(image, {
      x: MARGIN + 4,
      y: y - drawH,
      width: drawW,
      height: drawH,
    });
  }

  // Append uploaded PDF pages
  for (const file of stored) {
    if (!isPdfMime(file.mimeType)) continue;
    try {
      const source = await PDFDocument.load(file.bytes, { ignoreEncryption: true });
      const pageIndices = source.getPageIndices();
      if (pageIndices.length === 0) continue;

      // Separator title page for clarity when many attachments
      addPage();
      page.drawText("Attached document", {
        x: MARGIN,
        y,
        size: 12,
        font: bold,
        color: BLACK,
      });
      y -= 16;
      page.drawText(file.name, { x: MARGIN, y, size: 10, font, color: BLACK });
      y -= 14;
      page.drawText(file.filename, { x: MARGIN, y, size: 8, font, color: MUTED });
      y -= 14;
      page.drawText(`${pageIndices.length} page(s) follow.`, {
        x: MARGIN,
        y,
        size: 9,
        font,
        color: MUTED,
      });

      const copied = await doc.copyPages(source, pageIndices);
      for (const copiedPage of copied) {
        doc.addPage(copiedPage);
      }
    } catch {
      addPage();
      page.drawText(`Could not append PDF: ${file.name}`, {
        x: MARGIN,
        y,
        size: 10,
        font: bold,
        color: BLACK,
      });
      y -= 14;
      page.drawText(file.filename, { x: MARGIN, y, size: 9, font, color: MUTED });
    }
  }

  doc.setTitle(`${application.referenceNumber ?? "Application"} applicant summary`);
  doc.setAuthor(siteConfig.name);
  return doc.save();
}
