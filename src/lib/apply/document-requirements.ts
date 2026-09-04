export const PASSPORT_SIZE_PHOTO = {
  key: "passport_photo",
  name: "Passport-size photograph",
  description:
    "A recent passport-size photograph of you against a plain white background.",
  instructions:
    "JPG or PNG, maximum 5 MB. Head and shoulders visible, face forward, plain white background only.",
  acceptedTypes: ["image/jpeg", "image/png"],
  maxSizeMb: 5,
  required: true,
} as const;

export function passportPhotoDocumentMeta(sortOrder = 0) {
  return {
    ...PASSPORT_SIZE_PHOTO,
    acceptedTypes: [...PASSPORT_SIZE_PHOTO.acceptedTypes],
    sortOrder,
  };
}
