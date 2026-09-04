export type CoverKind = "job" | "travel";

export function offerCoverUrl(kind: CoverKind, id: string) {
  return `/api/media/cover/${kind}/${id}`;
}
