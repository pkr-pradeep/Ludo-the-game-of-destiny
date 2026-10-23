/**
 * Helper to resolve static assets correctly across any deployment environment
 * (standard root domain, GitHub Pages sub-directory path, preview environments, etc.)
 */
export function getAssetUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const base = import.meta.env.BASE_URL || './';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  return `${cleanBase}${cleanPath}`;
}

export const KONARK_WHEEL_IMG_URL = getAssetUrl('assets/aistudio/image_ca70523e.png');
