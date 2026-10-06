import { dateInputValue } from "@/lib/utils";
import type { DraftApplication } from "@/server/application/service";
import type {
  EducationInput,
  EmploymentInput,
  PersonalInput,
  SupportingInput,
} from "@/lib/validation/application";

function genderDefault(
  genderEligibility: "male" | "female" | "both",
  savedGender?: string | null,
): PersonalInput["gender"] {
  const allowed =
    genderEligibility === "male"
      ? (["male"] as const)
      : genderEligibility === "female"
        ? (["female"] as const)
        : (["male", "female"] as const);

  if (savedGender && (allowed as readonly string[]).includes(savedGender)) {
    return savedGender as PersonalInput["gender"];
  }
  if (genderEligibility === "male" || genderEligibility === "female") {
    return genderEligibility;
  }
  return "" as PersonalInput["gender"];
}

/** Empty personal form before a draft exists (deferred create). */
export function emptyPersonalDefaults(
  genderEligibility: "male" | "female" | "both" = "both",
): PersonalInput {
  return {
    fullName: "",
    dateOfBirth: "",
    placeOfBirth: "",
    nationality: "",
    gender: genderDefault(genderEligibility),
    passportNumber: "",
    previousNationality: "",
    maritalStatus: "single",
    phone: "",
    email: "",
    countryOfResidence: "",
    currentCity: "",
    spouseName: "",
    spouseNationality: "",
    spousePlaceOfBirth: "",
    spouseDateOfBirth: "",
  };
}

export function personalDefaults(
  draft: DraftApplication,
  genderEligibility: "male" | "female" | "both" = "both",
): PersonalInput {
  const profile = draft.profile;
  return {
    fullName: profile?.fullName ?? "",
    dateOfBirth: dateInputValue(profile?.dateOfBirth),
    placeOfBirth: profile?.placeOfBirth ?? "",
    nationality: profile?.nationality ?? "",
    gender: genderDefault(genderEligibility, profile?.gender),
    passportNumber: profile?.passportNumber ?? "",
    previousNationality: profile?.previousNationality ?? "",
    maritalStatus: profile?.maritalStatus ?? "single",
    phone: profile?.phone ?? "",
    email: profile?.email ?? "",
    countryOfResidence: profile?.countryOfResidence ?? "",
    currentCity: profile?.currentCity ?? "",
    spouseName: profile?.spouseName ?? "",
    spouseNationality: profile?.spouseNationality ?? "",
    spousePlaceOfBirth: profile?.spousePlaceOfBirth ?? "",
    spouseDateOfBirth: dateInputValue(profile?.spouseDateOfBirth),
  };
}

export function educationDefaults(draft: DraftApplication): EducationInput {
  return {
    records:
      draft.education.length > 0
        ? draft.education.map((record) => ({
            qualification: record.qualification,
            institution: record.institution,
            programme: record.programme ?? "",
            graduationYear: record.graduationYear ? String(record.graduationYear) : "",
            languages: record.languages ?? "",
            certifications: record.certifications ?? "",
          }))
        : [
            {
              qualification: "",
              institution: "",
              programme: "",
              graduationYear: "",
              languages: "",
              certifications: "",
            },
          ],
  };
}

export function employmentDefaults(draft: DraftApplication): EmploymentInput {
  return {
    records:
      draft.employment.length > 0
        ? draft.employment.map((record) => ({
            employer: record.employer,
            position: record.position,
            country: record.country,
            startDate: dateInputValue(record.startDate),
            endDate: dateInputValue(record.endDate),
            current: record.current,
            responsibilities: record.responsibilities,
            reasonForLeaving: record.reasonForLeaving ?? "",
          }))
        : [
            {
              employer: "",
              position: "",
              country: "",
              startDate: "",
              endDate: "",
              current: false,
              responsibilities: "",
              reasonForLeaving: "",
            },
          ],
  };
}

export function supportingDefaults(draft: DraftApplication): SupportingInput {
  const home = draft.emergencyContacts.find((item) => item.kind === "home");
  const uae = draft.emergencyContacts.find((item) => item.kind === "uae");
  return {
    visitedAbroad: draft.profile?.visitedAbroad ?? false,
    travel: draft.travelHistory.map((record) => ({
      country: record.country,
      purpose: record.purpose,
      year: String(record.year),
      duration: record.duration,
    })),
    dependants: draft.dependants.map((record) => ({
      fullName: record.fullName,
      dateOfBirth: dateInputValue(record.dateOfBirth),
      relationship: record.relationship,
    })),
    emergencyName: home?.name ?? "",
    emergencyRelationship: home?.relationship ?? "",
    emergencyPhone: home?.phone ?? "",
    emergencyEmail: home?.email ?? "",
    emergencyCountry: home?.country ?? "",
    emergencyCity: home?.city ?? "",
    uaeName: uae?.name ?? "",
    uaeNationality: "",
    uaeWorkplace: uae?.city ?? "",
    uaePhone: uae?.phone ?? "",
    militaryService: draft.profile?.militaryService ?? false,
    militaryCountry: draft.military?.country ?? "",
    militaryType: draft.military?.serviceType ?? "",
    militaryRank: draft.military?.rank ?? "",
    militaryDuration: draft.military?.duration ?? "",
    personalStatement: draft.profile?.personalStatement ?? "",
  };
}
