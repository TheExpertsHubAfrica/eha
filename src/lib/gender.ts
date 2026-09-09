export type ApplicantGender = "male" | "female";
export type JobGenderEligibility = "male" | "female" | "both";

export function genderLabel(gender: ApplicantGender | string) {
  if (gender === "male") return "Male";
  if (gender === "female") return "Female";
  return gender;
}

export function genderEligibilityLabel(eligibility: JobGenderEligibility | string) {
  if (eligibility === "male") return "Male only";
  if (eligibility === "female") return "Female only";
  return "Male and female";
}

/** Clear applicant-facing copy for the personal details form. */
export function genderEligibilityNotice(eligibility: JobGenderEligibility) {
  if (eligibility === "male") {
    return "This opportunity is open to male applicants only. Please confirm your gender below.";
  }
  if (eligibility === "female") {
    return "This opportunity is open to female applicants only. Please confirm your gender below.";
  }
  return "Select your gender as shown on your passport.";
}

export function allowedGendersForJob(
  eligibility: JobGenderEligibility,
): ApplicantGender[] {
  if (eligibility === "male") return ["male"];
  if (eligibility === "female") return ["female"];
  return ["male", "female"];
}

export function isGenderAllowed(
  eligibility: JobGenderEligibility,
  gender: ApplicantGender,
) {
  return allowedGendersForJob(eligibility).includes(gender);
}
