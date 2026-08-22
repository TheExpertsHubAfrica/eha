import { z } from "zod";

const dateOnly = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date.");

function adultDate(value: string, ctx: z.RefinementCtx) {
  const birth = new Date(`${value}T00:00:00.000Z`);
  const cutoff = new Date();
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 18);
  if (birth > cutoff) {
    ctx.addIssue({
      code: "custom",
      message: "Applicants must be at least 18 years old.",
    });
  }
}

export const maritalStatusSchema = z.enum([
  "single",
  "married",
  "divorced",
  "widowed",
  "separated",
]);

export const personalSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name.").max(120),
    dateOfBirth: dateOnly.superRefine(adultDate),
    placeOfBirth: z.string().trim().min(2, "Enter your place of birth.").max(120),
    nationality: z.string().trim().min(2, "Enter your nationality.").max(80),
    passportNumber: z
      .string()
      .trim()
      .min(5, "Enter the passport number.")
      .max(20)
      .regex(/^[A-Za-z0-9]+$/, "Use letters and numbers only."),
    previousNationality: z.string().trim().max(80).optional().or(z.literal("")),
    maritalStatus: maritalStatusSchema,
    phone: z.string().trim().min(7, "Enter a phone number with country code.").max(30),
    email: z.string().trim().email("Enter a valid email address."),
    countryOfResidence: z.string().trim().min(2, "Enter your country of residence.").max(80),
    currentCity: z.string().trim().min(2, "Enter your current city.").max(80),
    spouseName: z.string().trim().max(120).optional().or(z.literal("")),
    spouseNationality: z.string().trim().max(80).optional().or(z.literal("")),
    spousePlaceOfBirth: z.string().trim().max(120).optional().or(z.literal("")),
    spouseDateOfBirth: z.string().trim().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.maritalStatus !== "married") return;
    if (!data.spouseName?.trim()) {
      ctx.addIssue({ code: "custom", path: ["spouseName"], message: "Enter your spouse's name." });
    }
    if (!data.spouseNationality?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["spouseNationality"],
        message: "Enter your spouse's nationality.",
      });
    }
    if (data.spouseDateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(data.spouseDateOfBirth)) {
      ctx.addIssue({
        code: "custom",
        path: ["spouseDateOfBirth"],
        message: "Enter a valid date.",
      });
    }
  });

export const educationRecordSchema = z.object({
  qualification: z.string().trim().min(2, "Enter the qualification.").max(120),
  institution: z.string().trim().min(2, "Enter the institution.").max(160),
  programme: z.string().trim().max(160).optional().or(z.literal("")),
  graduationYear: z.string().trim().optional().or(z.literal("")),
  languages: z.string().trim().max(160).optional().or(z.literal("")),
  certifications: z.string().trim().max(240).optional().or(z.literal("")),
});

export const educationSchema = z.object({
  records: z.array(educationRecordSchema).min(1, "Add at least one qualification."),
});

export const employmentRecordSchema = z
  .object({
    employer: z.string().trim().min(2, "Enter the employer.").max(160),
    position: z.string().trim().min(2, "Enter the position.").max(120),
    country: z.string().trim().min(2, "Enter the country.").max(80),
    startDate: dateOnly,
    endDate: z.string().trim().optional().or(z.literal("")),
    current: z.boolean(),
    responsibilities: z
      .string()
      .trim()
      .min(12, "Summarise your responsibilities (at least 12 characters).")
      .max(1500),
    reasonForLeaving: z.string().trim().max(240).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.current) return;
    if (!data.endDate) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "Enter an end date or mark this as your current role.",
      });
    }
  });

export const employmentSchema = z.object({
  records: z.array(employmentRecordSchema).min(1, "Add at least one work record."),
});

export const travelRecordSchema = z.object({
  country: z.string().trim().min(2, "Enter the country.").max(80),
  purpose: z.string().trim().min(2, "Enter the purpose.").max(80),
  year: z.string().trim().regex(/^\d{4}$/, "Enter a 4-digit year."),
  duration: z.string().trim().min(1, "Enter the duration.").max(80),
});

export const dependantSchema = z.object({
  fullName: z.string().trim().min(2, "Enter the name.").max(120),
  dateOfBirth: dateOnly,
  relationship: z.string().trim().min(2, "Enter the relationship.").max(40),
});

export const supportingSchema = z
  .object({
    visitedAbroad: z.boolean(),
    travel: z.array(travelRecordSchema),
    dependants: z.array(
      z.object({
        fullName: z.string(),
        dateOfBirth: z.string(),
        relationship: z.string(),
      }),
    ),
    emergencyName: z.string().trim().max(120).optional().or(z.literal("")),
    emergencyRelationship: z.string().trim().max(40).optional().or(z.literal("")),
    emergencyPhone: z.string().trim().max(30).optional().or(z.literal("")),
    emergencyEmail: z
      .string()
      .trim()
      .refine((value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
        message: "Enter a valid email address.",
      })
      .optional(),
    emergencyCountry: z.string().trim().max(80).optional().or(z.literal("")),
    emergencyCity: z.string().trim().max(80).optional().or(z.literal("")),
    uaeName: z.string().trim().max(120).optional().or(z.literal("")),
    uaeNationality: z.string().trim().max(80).optional().or(z.literal("")),
    uaeWorkplace: z.string().trim().max(120).optional().or(z.literal("")),
    uaePhone: z.string().trim().max(30).optional().or(z.literal("")),
    militaryService: z.boolean(),
    militaryCountry: z.string().trim().max(80).optional().or(z.literal("")),
    militaryType: z.string().trim().max(80).optional().or(z.literal("")),
    militaryRank: z.string().trim().max(80).optional().or(z.literal("")),
    militaryDuration: z.string().trim().max(80).optional().or(z.literal("")),
    personalStatement: z
      .string()
      .trim()
      .min(40, "Write a short statement (at least 40 characters).")
      .max(1000, "Keep the statement under 1,000 characters."),
  })
  .superRefine((data, ctx) => {
    if (data.visitedAbroad && data.travel.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["travel"],
        message: "Add at least one country, or choose that you have not travelled.",
      });
    }

    for (const [index, row] of data.dependants.entries()) {
      if (!row.fullName.trim() && !row.dateOfBirth.trim()) continue;
      const parsed = dependantSchema.safeParse(row);
      if (!parsed.success) {
        for (const issue of parsed.error.issues) {
          ctx.addIssue({ ...issue, path: ["dependants", index, ...issue.path] });
        }
      }
    }
  });

export type SupportingJobRequirements = {
  requireTravel: boolean;
  requireEmergency: boolean;
  requireMilitary: boolean;
};

export function supportingSchemaForJob(requirements: SupportingJobRequirements) {
  return supportingSchema.superRefine((data, ctx) => {
    if (requirements.requireEmergency) {
      const missing =
        !data.emergencyName?.trim() ||
        !data.emergencyRelationship?.trim() ||
        !data.emergencyPhone?.trim() ||
        !data.emergencyCountry?.trim() ||
        !data.emergencyCity?.trim();
      if (missing) {
        ctx.addIssue({
          code: "custom",
          path: ["emergencyName"],
          message: "Enter an emergency contact (name, relationship, phone, country, and city).",
        });
      }
    }

    if (requirements.requireMilitary && data.militaryService) {
      if (!data.militaryCountry?.trim() || !data.militaryType?.trim() || !data.militaryDuration?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["militaryCountry"],
          message: "Complete military service details.",
        });
      }
    }
  });
}

export function stripEmptyDependants(dependants: SupportingInput["dependants"]) {
  return dependants.filter((row) => row.fullName.trim() || row.dateOfBirth.trim());
}

export type PersonalInput = z.infer<typeof personalSchema>;
export type EducationInput = z.infer<typeof educationSchema>;
export type EmploymentInput = z.infer<typeof employmentSchema>;
export type SupportingInput = z.infer<typeof supportingSchema>;
