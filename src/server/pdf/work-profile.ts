import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import type { JobOffer } from "@/lib/catalog/types";
import { siteConfig } from "@/lib/site-config";
import { formatDisplayDate, formatMoney } from "@/lib/utils";
import type { DraftApplication } from "@/server/application/service";

const NAVY = rgb(0.043, 0.122, 0.227);
const MUTED = rgb(0.357, 0.396, 0.451);
const LINE = rgb(0.898, 0.91, 0.933);
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_LEFT = 48;
const CONTENT_WIDTH = 499;
const HEADER_HEIGHT = 48;
const FOOTER_RESERVE = 56;

function headerBottom() {
  return PAGE_HEIGHT - HEADER_HEIGHT;
}

function drawPageHeader(page: ReturnType<PDFDocument["addPage"]>, font: PDFFont, bold: PDFFont) {
  const bottom = headerBottom();
  page.drawRectangle({
    x: 0,
    y: bottom,
    width: PAGE_WIDTH,
    height: HEADER_HEIGHT,
    color: NAVY,
  });
  const baseline = bottom + HEADER_HEIGHT / 2 - 4;
  page.drawText(siteConfig.name.toUpperCase(), {
    x: MARGIN_LEFT,
    y: baseline,
    size: 11,
    font: bold,
    color: rgb(1, 1, 1),
  });
  const label = "Work profile";
  const labelSize = 10;
  page.drawText(label, {
    x: PAGE_WIDTH - MARGIN_LEFT - font.widthOfTextAtSize(label, labelSize),
    y: baseline,
    size: labelSize,
    font,
    color: rgb(0.91, 0.945, 0.984),
  });
}

type ProfileDoc = DraftApplication & {
  referenceNumber: string | null;
  submittedAt: Date | null;
};

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

export async function buildWorkProfilePdf(application: ProfileDoc, job: JobOffer) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = headerBottom() - 32;
  const left = MARGIN_LEFT;
  const width = CONTENT_WIDTH;

  function addPage() {
    page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - 72;
  }

  function ensure(space: number) {
    if (y - space < FOOTER_RESERVE) addPage();
  }

  function heading(text: string) {
    ensure(28);
    y -= 10;
    page.drawText(text.toUpperCase(), { x: left, y, size: 9, font: bold, color: NAVY });
    y -= 6;
    page.drawLine({
      start: { x: left, y },
      end: { x: left + width, y },
      thickness: 0.6,
      color: LINE,
    });
    y -= 16;
  }

  function row(label: string, value?: string | null) {
    if (!value) return;
    const labelWidth = 130;
    const lines = wrap(value, font, 10, width - labelWidth);
    ensure(14 * lines.length + 4);
    page.drawText(label, { x: left, y, size: 9, font, color: MUTED });
    lines.forEach((line, index) => {
      page.drawText(line, {
        x: left + labelWidth,
        y: y - index * 13,
        size: 10,
        font,
        color: NAVY,
      });
    });
    y -= 13 * lines.length + 6;
  }

  drawPageHeader(page, font, bold);

  page.drawText(application.referenceNumber ?? "", { x: left, y, size: 16, font: bold, color: NAVY });
  y -= 20;
  page.drawText(
    `Submitted ${formatDisplayDate(application.submittedAt) || "—"} · ${job.title}, ${job.city}`,
    { x: left, y, size: 10, font, color: MUTED },
  );
  y -= 28;

  heading("Selected opportunity");
  row("Role", job.title);
  row("Location", `${job.city}, ${job.country}`);
  row("Category", job.category);
  row("Listed salary", formatMoney(job.salary.amount, job.salary.currency));

  const profile = application.profile;
  heading("Personal information");
  row("Full name", profile?.fullName);
  row("Date of birth", formatDisplayDate(profile?.dateOfBirth));
  row("Place of birth", profile?.placeOfBirth);
  row("Nationality", profile?.nationality);
  row("Passport", profile?.passportNumber);
  row("Previous nationality", profile?.previousNationality);
  row("Marital status", profile?.maritalStatus);
  row("Phone", profile?.phone);
  row("Email", profile?.email);
  row("Residence", profile ? `${profile.currentCity}, ${profile.countryOfResidence}` : null);
  row("Spouse", profile?.spouseName);
  row("Spouse nationality", profile?.spouseNationality);

  if (application.education.length) {
    heading("Education");
    for (const record of application.education) {
      row(
        record.qualification,
        [record.institution, record.programme, record.graduationYear].filter(Boolean).join(" · "),
      );
      row("Languages", record.languages);
      row("Certifications", record.certifications);
    }
  }

  if (application.employment.length) {
    heading("Work history");
    for (const record of application.employment) {
      const dates = record.current
        ? `${formatDisplayDate(record.startDate)} - current`
        : `${formatDisplayDate(record.startDate)} - ${formatDisplayDate(record.endDate)}`;
      row(record.position, `${record.employer}, ${record.country} (${dates})`);
      row("Responsibilities", record.responsibilities);
      row("Reason for leaving", record.reasonForLeaving);
    }
  }

  heading("Background");
  for (const record of application.travelHistory) {
    row("Travel", `${record.country} (${record.year}) · ${record.purpose} · ${record.duration}`);
  }
  for (const record of application.dependants) {
    row(
      "Dependant",
      `${record.fullName} · ${record.relationship} · ${formatDisplayDate(record.dateOfBirth)}`,
    );
  }
  for (const contact of application.emergencyContacts) {
    row(
      contact.kind === "uae" ? "UAE contact" : "Emergency contact",
      `${contact.name} · ${contact.phone}`,
    );
  }
  if (application.military) {
    row(
      "Military service",
      [
        application.military.country,
        application.military.serviceType,
        application.military.rank,
        application.military.duration,
      ]
        .filter(Boolean)
        .join(" · "),
    );
  }
  row("Statement", profile?.personalStatement);

  heading("Documents submitted");
  for (const requirement of job.documentRequirements) {
    const file = application.documents.find(
      (doc: DraftApplication["documents"][number]) => doc.requirementKey === requirement.key,
    );
    row(
      requirement.name,
      file
        ? `Uploaded · ${file.originalFilename} · ${file.mimeType}`
        : requirement.required
          ? "Required — not uploaded"
          : "Optional — not uploaded",
    );
  }

  ensure(40);
  y -= 8;
  page.drawText(
    "This document is a copy of the submitted work profile. It is not a visa, contract, or placement decision.",
    { x: left, y, size: 8, font, color: MUTED },
  );

  doc.setTitle(`${application.referenceNumber} work profile`);
  doc.setAuthor(siteConfig.name);
  return doc.save();
}
