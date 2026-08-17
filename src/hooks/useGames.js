import { useSyncExternalStore } from 'react'
import { getGames, subscribe } from '../data/store'

export function useGames() {
  return useSyncExternalStore(subscribe, getGames)
}
