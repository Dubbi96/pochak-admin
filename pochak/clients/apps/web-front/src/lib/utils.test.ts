import { describe, it, expect } from 'vitest'
import { cn, formatViewCount } from './utils'

describe('cn (class name utility)', () => {
  it('merges single class', () => {
    expect(cn('text-red-500')).toBe('text-red-500')
  })

  it('merges multiple classes', () => {
    const result = cn('text-red-500', 'bg-blue-500')
    expect(result).toContain('text-red-500')
    expect(result).toContain('bg-blue-500')
  })

  it('resolves conflicting tailwind classes (later wins)', () => {
    const result = cn('text-red-500', 'text-blue-500')
    expect(result).toBe('text-blue-500')
  })

  it('handles conditional classes', () => {
    const result = cn('base', false && 'hidden', 'extra')
    expect(result).toContain('base')
    expect(result).toContain('extra')
    expect(result).not.toContain('hidden')
  })

  it('handles undefined and null', () => {
    const result = cn('base', undefined, null)
    expect(result).toBe('base')
  })

  it('handles empty input', () => {
    expect(cn()).toBe('')
  })

  it('handles array of classes', () => {
    const result = cn(['text-sm', 'font-bold'])
    expect(result).toContain('text-sm')
    expect(result).toContain('font-bold')
  })
})

describe('formatViewCount', () => {
  it('returns string for counts under 1000', () => {
    expect(formatViewCount(0)).toBe('0')
    expect(formatViewCount(1)).toBe('1')
    expect(formatViewCount(999)).toBe('999')
  })

  it('formats thousands', () => {
    expect(formatViewCount(1000)).toBe('1.0천')
    expect(formatViewCount(1500)).toBe('1.5천')
    expect(formatViewCount(9999)).toBe('10.0천')
  })

  it('formats ten-thousands (만)', () => {
    expect(formatViewCount(10000)).toBe('1.0만')
    expect(formatViewCount(15000)).toBe('1.5만')
    expect(formatViewCount(100000)).toBe('10.0만')
    expect(formatViewCount(1000000)).toBe('100.0만')
  })
})
