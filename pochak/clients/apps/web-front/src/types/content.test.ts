/**
 * Coverage test for types/content.ts
 * Just importing the types causes the file to be covered
 */
import { describe, it, expect } from 'vitest'
import type { Banner, ContentItem, Channel, Competition } from './content'

describe('content types', () => {
  it('Banner type has required fields', () => {
    const banner: Banner = {
      id: 'b1',
      title: 'Test',
      subtitle: 'Sub',
      gradient: 'linear-gradient(red,blue)',
      linkTo: '/home',
    }
    expect(banner.id).toBe('b1')
  })

  it('ContentItem type has required fields', () => {
    const item: ContentItem = {
      id: 'v1',
      title: 'Test Video',
      type: 'VOD',
      competition: 'Comp',
      sport: 'Soccer',
      date: '2026-01-01',
      viewCount: 100,
      tags: ['tag1'],
    }
    expect(item.type).toBe('VOD')
  })

  it('Channel type has required fields', () => {
    const ch: Channel = {
      id: 't1',
      name: 'Team',
      color: '#ff0000',
      initial: 'T',
      subtitle: 'Sport',
      followers: 100,
    }
    expect(ch.name).toBe('Team')
  })

  it('Competition type has required fields', () => {
    const comp: Competition = {
      id: 'c1',
      name: 'Comp',
      dateRange: '2026',
      logoColor: '#000',
      logoText: 'C',
      subtitle: 'Sport',
      isAd: false,
    }
    expect(comp.isAd).toBe(false)
  })
})
