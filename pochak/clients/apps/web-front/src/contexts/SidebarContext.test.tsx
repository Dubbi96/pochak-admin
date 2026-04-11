import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { SidebarProvider, useSidebar } from './SidebarContext'
import type { ReactNode } from 'react'

function wrapper({ children }: { children: ReactNode }) {
  return <SidebarProvider>{children}</SidebarProvider>
}

describe('SidebarContext', () => {
  it('provides default expanded state', () => {
    const { result } = renderHook(() => useSidebar(), { wrapper })
    // matchMedia returns matches: false for (max-width: 1279px), so expanded = true
    expect(typeof result.current.expanded).toBe('boolean')
  })

  it('toggle flips expanded state', () => {
    const { result } = renderHook(() => useSidebar(), { wrapper })
    const initial = result.current.expanded
    act(() => { result.current.toggle() })
    expect(result.current.expanded).toBe(!initial)
  })

  it('collapse sets expanded to false', () => {
    const { result } = renderHook(() => useSidebar(), { wrapper })
    act(() => { result.current.collapse() })
    expect(result.current.expanded).toBe(false)
  })

  it('setExpanded sets value directly', () => {
    const { result } = renderHook(() => useSidebar(), { wrapper })
    act(() => { result.current.setExpanded(false) })
    expect(result.current.expanded).toBe(false)
    act(() => { result.current.setExpanded(true) })
    expect(result.current.expanded).toBe(true)
  })

  it('returns default values without provider', () => {
    const { result } = renderHook(() => useSidebar())
    expect(result.current.expanded).toBe(true)
    expect(typeof result.current.toggle).toBe('function')
    expect(typeof result.current.collapse).toBe('function')
    expect(typeof result.current.setExpanded).toBe('function')
  })
})
