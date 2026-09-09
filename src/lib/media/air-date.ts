export function todayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function hasAiredOnOrBeforeToday(
  airDate?: string | null,
  today = todayIsoDate(),
) {
  if (!airDate) return true;

  const isoDate = airDate.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return true;

  return isoDate <= today;
}
