/**
 * Format a number as Korean Won currency (e.g., "12,000원").
 */
export function formatCurrency(
  amount: number,
  options?: { showSymbol?: boolean; currency?: string },
): string {
  const { showSymbol = true, currency = "KRW" } = options ?? {};

  if (currency === "KRW") {
    const formatted = new Intl.NumberFormat("ko-KR").format(amount);
    return showSymbol ? `${formatted}원` : formatted;
  }

  return new Intl.NumberFormat("ko-KR", {
    style: showSymbol ? "currency" : "decimal",
    currency,
  }).format(amount);
}

/**
 * Format a number with locale-aware thousand separators.
 */
export function formatNumber(value: number, locale: string = "ko-KR"): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Format a phone number string to "010-1234-5678" pattern.
 * Strips non-digit characters before formatting.
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return phone;
}
