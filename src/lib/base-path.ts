/** Prefix for static assets when deployed under a subpath (e.g. GitHub Pages). */
export const basePath = "/commercial-ops-new";

export function assetPath(path: string): string {
  return `${basePath}${path.startsWith("/") ? path : `/${path}`}`;
}
