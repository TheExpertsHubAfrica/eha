import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { personalSchema } from "./application";

const base = {
  dateOfBirth: "1990-01-15",
  placeOfBirth: "Accra",
  nationality: "Ghanaian",
  gender: "female",
  passportNumber: "G1234567",
  maritalStatus: "single",
  phone: "+233201234567",
  email: "ama@example.com",
  countryOfResidence: "Ghana",
  currentCity: "Accra",
};

function nameError(fullName: string) {
  const result = personalSchema.safeParse({ ...base, fullName });
  return result.success ? null : result.error.issues[0]?.path[0];
}

describe("personalSchema fullName", () => {
  it("accepts real names", () => {
    for (const name of [
      "Ama Serwaa Mensah",
      "Nana Ama O'Neill",
      "Kwame Nkrumah-Addo",
      "J.K. Rowling",
      "Dr. Élodie Ñúñez",
      "Abena Ofori Jr.",
      "محمد علي",
    ]) {
      assert.equal(nameError(name), null, name);
    }
  });

  it("rejects links and domains", () => {
    for (const name of [
      "http://evil.example",
      "Visit evil.com now",
      "www.evil.example",
      "claim@evil.example",
      "evil.co/prize",
    ]) {
      assert.equal(nameError(name), "fullName", name);
    }
  });

  it("rejects values that spreadsheets run as formulas", () => {
    for (const name of ["=HYPERLINK(1)", "+SUM(1)", "-SUM(1)", "@SUM(1)"]) {
      assert.equal(nameError(name), "fullName", name);
    }
  });
});
