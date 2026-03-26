/**
 * Format a date string or Date object to "YYYY.MM.DD" (Korean convention).
 */
export function formatDate(
  input: string | Date,
  separator: string = ".",
): string {
  const date = typeof input === "string" ? new Date(input) : input;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${separator}${m}${separator}${d}`;
}

/**
 * Format a date to "HH:mm" or "HH:mm:ss".
 */
export function formatTime(
  input: string | Date,
  includeSeconds: boolean = false,
): string {
  const date = typeof input === "string" ? new Date(input) : input;
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  if (includeSeconds) {
    const s = String(date.getSeconds()).padStart(2, "0");
    return `${h}:${min}:${s}`;
  }
  return `${h}:${min}`;
}

/**
 * Format a date as a relative time string (e.g., "3분 전", "2시간 전", "어제").
 */
export function formatRelative(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "방금 전";
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays === 1) return "어제";
  if (diffDays < 7) return `${diffDays}일 전`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;

  return formatDate(date);
}
