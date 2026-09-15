/**
 * Utility to detect domains that commonly block iframe embedding (X-Frame-Options: SAMEORIGIN / DENY)
 * or non-.com domains (like .xyz, .org) as mentioned by the user.
 */
export function isNonComOrProtectedDomain(url?: string): boolean {
  if (!url) return false;
  try {
    const trimmed = url.trim();
    if (!trimmed) return false;
    const cleanUrl = trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`;
    const parsed = new URL(cleanUrl);
    const host = parsed.hostname.toLowerCase();

    // Explicitly check for .xyz and .org as mentioned by the user
    if (host.endsWith('.xyz') || host.endsWith('.org')) {
      return true;
    }

    // Common TLDs often used for internal dashboards, proxies, or restricted panels
    const sensitiveTlds = [
      '.xyz',
      '.org',
      '.top',
      '.site',
      '.club',
      '.online',
      '.vip',
      '.live',
      '.app',
      '.tech',
      '.io',
      '.info',
      '.cc',
      '.ws',
      '.me',
      '.biz',
      '.dev',
    ];

    if (sensitiveTlds.some((tld) => host.endsWith(tld))) {
      return true;
    }

    // If it's not .com
    if (!host.endsWith('.com')) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

export function getDomainExtensionLabel(url?: string): string {
  if (!url) return '';
  try {
    const cleanUrl = url.trim().startsWith('http://') || url.trim().startsWith('https://')
      ? url.trim()
      : `https://${url.trim()}`;
    const parsed = new URL(cleanUrl);
    const parts = parsed.hostname.toLowerCase().split('.');
    if (parts.length > 1) {
      return '.' + parts[parts.length - 1];
    }
    return '';
  } catch {
    return '';
  }
}
