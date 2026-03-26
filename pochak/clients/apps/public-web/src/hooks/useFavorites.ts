import { useCallback, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'pochak_favorites'

function getSnapshot(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

let cachedSnapshot = getSnapshot()
const listeners = new Set<() => void>()

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

function notify() {
  cachedSnapshot = getSnapshot()
  listeners.forEach((cb) => cb())
}

function setFavorites(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  notify()
}

export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, () => cachedSnapshot)

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites],
  )

  const toggleFavorite = useCallback(
    (id: string) => {
      const current = getSnapshot()
      if (current.includes(id)) {
        setFavorites(current.filter((fid) => fid !== id))
      } else {
        setFavorites([...current, id])
      }
    },
    [],
  )

  return { favorites, isFavorite, toggleFavorite }
}
