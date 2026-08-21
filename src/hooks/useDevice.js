import { useState, useEffect } from 'react'

function detect() {
  const w = window.innerWidth
  if (w > 1024) return 'pc'
  if (w > 640) return 'tablet'
  return 'mobile'
}

export function useDevice() {
  const [device, setDevice] = useState(detect)
  useEffect(() => {
    function onResize() { setDevice(detect()) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return device
}
