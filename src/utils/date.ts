export const formatNigerianDate = (date, options) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-NG", { timeZone: "Africa/Lagos", ...options });
};
export const formatNigerianTime = (date, options) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-NG", { timeZone: "Africa/Lagos", ...options });
};
