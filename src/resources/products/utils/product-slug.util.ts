export function slugifyProductTitle(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateProductSlug(title: string, timestamp: number): string {
  const namePart = slugifyProductTitle(title) || 'product';
  return `${namePart}-${timestamp}`;
}
