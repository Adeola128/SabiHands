export const generateSeoUrl = (name: string, id: string): string => {
  if (!name) return id;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `${slug}-${id}`;
};

export const extractIdFromSeoUrl = (urlParam: string | undefined): string | null => {
  if (!urlParam) return null;
  const uuidMatch = urlParam.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i);
  return uuidMatch ? uuidMatch[0] : urlParam;
};
