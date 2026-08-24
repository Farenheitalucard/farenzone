import { useSyncExternalStore } from 'react'
import { getLoaded, subscribe } from '../data/store'

export function useLoaded() {
  return useSyncExternalStore(subscribe, getLoaded)
}
