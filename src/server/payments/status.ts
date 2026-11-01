/**
 * Maps a Paystack transaction status to ours. Only `failed` is final among the non-success values:
 * `abandoned` means the customer has not finished yet, and anything unrecognised is treated as in
 * progress so that a new Paystack status can never mark a real payment as failed.
 */
export function paymentStatusFromPaystack(status: string) {
  switch (status) {
    case "success":
      return { status: "success", final: true } as const;
    case "failed":
    case "reversed":
      return { status: "failed", final: true } as const;
    case "abandoned":
      return { status: "abandoned", final: false } as const;
    default:
      return { status: "pending", final: false } as const;
  }
}
