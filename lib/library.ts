import type { Paper } from "@/lib/mock-data"

export const LIBRARY_KEY = "paper2struct_library"

export function getLibrary(): Paper[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(LIBRARY_KEY)
    return raw ? (JSON.parse(raw) as Paper[]) : []
  } catch {
    return []
  }
}

export function isInLibrary(id: string): boolean {
  return getLibrary().some((p) => p.id === id)
}

export function saveToLibrary(paper: Paper): void {
  const library = getLibrary()
  if (library.some((p) => p.id === paper.id)) return
  library.unshift(paper)
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(library))
}

export function removeFromLibrary(id: string): void {
  const library = getLibrary().filter((p) => p.id !== id)
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(library))
}
