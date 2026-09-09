export function ghsToPesewas(amountGhs: number) {
  return Math.round(amountGhs * 100);
}

export function pesewasToGhs(pesewas: number) {
  return pesewas / 100;
}

export function formatGhs(amountGhs: number) {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(amountGhs);
}
