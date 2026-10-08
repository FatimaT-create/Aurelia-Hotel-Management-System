// Formats a number as Pakistani Rupees, e.g. 61600 -> "Rs 61,600"
export function formatPKR(amount) {
  if (amount === null || amount === undefined) return "Rs 0";
  return `Rs ${Number(amount).toLocaleString("en-PK")}`;
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
