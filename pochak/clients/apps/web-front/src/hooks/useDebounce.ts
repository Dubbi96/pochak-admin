import { useState, useEffect } from 'react';

/**
 * 입력값에 디바운스를 적용하여 반환합니다.
 * @param value - 원본 값
 * @param delay - 디바운스 딜레이 (ms), 기본 300ms
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
