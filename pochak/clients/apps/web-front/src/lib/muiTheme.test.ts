/**
 * Coverage test for lib/muiTheme.ts
 * Importing and verifying the MUI theme object covers the module.
 */
import { describe, it, expect } from 'vitest'
import pochakTheme from './muiTheme'

describe('pochakTheme', () => {
  it('exports a MUI theme with dark mode', () => {
    expect(pochakTheme.palette.mode).toBe('dark')
  })

  it('has primary color set to Pochak green', () => {
    expect(pochakTheme.palette.primary.main).toBe('#10b95c')
  })

  it('has custom shape border radius', () => {
    expect(pochakTheme.shape.borderRadius).toBe(8)
  })

  it('has MuiChip component overrides', () => {
    expect(pochakTheme.components?.MuiChip).toBeDefined()
  })

  it('has MuiToggleButton component overrides', () => {
    expect(pochakTheme.components?.MuiToggleButton).toBeDefined()
  })

  it('has background colors', () => {
    expect(pochakTheme.palette.background.default).toBe('#121212')
    expect(pochakTheme.palette.background.paper).toBe('#1E1E1E')
  })
})
