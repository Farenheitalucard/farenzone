import { useSyncExternalStore } from 'react'
import { getConsoles, subscribeConsoles } from '../data/consoles'

export function useConsoles() {
  return useSyncExternalStore(subscribeConsoles, getConsoles)
}
