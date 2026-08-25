export const generateSlug = (title: string, id: string): string => {
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

  // Extract a short ID (e.g. first 8 chars of a UUID)
  const shortId = id.substring(0, 8);

  return `${baseSlug}-${shortId}`;
};
