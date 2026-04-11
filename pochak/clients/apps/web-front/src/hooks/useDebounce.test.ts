import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from './useDebounce'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useDebounce', () => {
  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300))
    expect(result.current).toBe('initial')
  })

  it('does not update value before delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'first' } }
    )

    rerender({ value: 'second' })
    act(() => { vi.advanceTimersByTime(100) })
    expect(result.current).toBe('first')
  })

  it('updates value after delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'first' } }
    )

    rerender({ value: 'second' })
    act(() => { vi.advanceTimersByTime(300) })
    expect(result.current).toBe('second')
  })

  it('resets timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'first' } }
    )

    rerender({ value: 'second' })
    act(() => { vi.advanceTimersByTime(100) })

    rerender({ value: 'third' })
    act(() => { vi.advanceTimersByTime(100) })

    // Should still be 'first' since timer was reset
    expect(result.current).toBe('first')

    act(() => { vi.advanceTimersByTime(200) })
    // Now 300ms after 'third' was set
    expect(result.current).toBe('third')
  })

  it('uses default delay of 300ms', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'first' } }
    )

    rerender({ value: 'second' })
    act(() => { vi.advanceTimersByTime(299) })
    expect(result.current).toBe('first')

    act(() => { vi.advanceTimersByTime(1) })
    expect(result.current).toBe('second')
  })

  it('works with number values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 200),
      { initialProps: { value: 0 } }
    )

    rerender({ value: 42 })
    act(() => { vi.advanceTimersByTime(200) })
    expect(result.current).toBe(42)
  })

  it('works with object values', () => {
    const obj1 = { x: 1 }
    const obj2 = { x: 2 }
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 200),
      { initialProps: { value: obj1 } }
    )

    rerender({ value: obj2 })
    act(() => { vi.advanceTimersByTime(200) })
    expect(result.current).toEqual({ x: 2 })
  })
})
