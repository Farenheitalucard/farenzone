import { useSyncExternalStore } from 'react'
import { getHeaderConfig, subscribeHeaderConfig } from '../data/headerConfig'

export function useHeaderConfig() {
  return useSyncExternalStore(subscribeHeaderConfig, getHeaderConfig)
}
