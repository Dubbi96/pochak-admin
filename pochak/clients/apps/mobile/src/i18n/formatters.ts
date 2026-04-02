/**
 * Date / number formatting utilities with locale awareness.
 */

/**
 * Format a date string or Date object into a locale-appropriate string.
 *
 * - ko: "2026년 3월 20일"
 * - en: "March 20, 2026"
 */
export function formatDate(date: string | Date, locale: 'ko' | 'en' = 'ko'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) {
    return String(date);
  }

  if (locale === 'ko') {
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
  }

  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format a number with locale-appropriate grouping.
 *
 * - ko: 1,234,567
 * - en: 1,234,567
 */
export function formatNumber(num: number, locale: 'ko' | 'en' = 'ko'): string {
  const tag = locale === 'ko' ? 'ko-KR' : 'en-US';
  return new Intl.NumberFormat(tag).format(num);
}

/**
 * Format a date as a human-readable relative time string.
 *
 * Examples:
 * - ko: "방금 전", "3분 전", "2시간 전", "어제", "3일 전"
 * - en: "just now", "3 minutes ago", "2 hours ago", "yesterday", "3 days ago"
 */
export function formatRelativeTime(date: string | Date, locale: 'ko' | 'en' = 'ko'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) {
    return String(date);
  }

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (locale === 'ko') {
    if (diffSec < 60) return '방금 전';
    if (diffMin < 60) return `${diffMin}분 전`;
    if (diffHour < 24) return `${diffHour}시간 전`;
    if (diffDay === 1) return '어제';
    if (diffDay < 30) return `${diffDay}일 전`;
    if (diffDay < 365) return `${Math.floor(diffDay / 30)}개월 전`;
    return `${Math.floor(diffDay / 365)}년 전`;
  }

  // English
  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
  if (diffDay === 1) return 'yesterday';
  if (diffDay < 30) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
  if (diffDay < 365) {
    const months = Math.floor(diffDay / 30);
    return `${months} month${months === 1 ? '' : 's'} ago`;
  }
  const years = Math.floor(diffDay / 365);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}
