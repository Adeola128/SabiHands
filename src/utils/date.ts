export const formatNigerianDate = (date: string | Date | number | null | undefined, options?: Intl.DateTimeFormatOptions) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-NG", { timeZone: "Africa/Lagos", ...options });
};
export const formatNigerianTime = (date: string | Date | number | null | undefined, options?: Intl.DateTimeFormatOptions) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-NG", { timeZone: "Africa/Lagos", ...options });
};
