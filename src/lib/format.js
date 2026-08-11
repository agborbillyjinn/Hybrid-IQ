export function formatCurrency(n) {
  if (n == null || isNaN(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return "£" + (n / 1_000_000).toFixed(2) + "M";
  if (abs >= 1_000) return "£" + (n / 1_000).toFixed(1) + "K";
  return "£" + Math.round(n).toLocaleString();
}

export function formatNumber(n) {
  if (n == null || isNaN(n)) return "—";
  return Math.round(n).toLocaleString();
}

export function formatDate(d) {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function timeAgo(d) {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "Today";
  if (days < 30) return days + "d ago";
  const months = Math.floor(days / 30);
  if (months < 12) return months + "mo ago";
  return Math.floor(months / 12) + "y ago";
}