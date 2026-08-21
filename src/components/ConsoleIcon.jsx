import { getConsole } from '../data/consoles'

export function ConsoleIcon({ id, size = 16 }) {
  const consoleInfo = getConsole(id)
  if (!consoleInfo) return null

  const icon = consoleInfo.icon
  if (icon) {
    return (
      <img
        src={icon}
        alt={consoleInfo.name}
        className="console-logo"
        style={{ width: size, height: size, objectFit: 'contain' }}
      />
    )
  }

  return (
    <span
      className="console-tag-dot"
      style={{ width: size, height: size, background: consoleInfo.color, borderRadius: '50%', display: 'inline-block' }}
      aria-hidden="true"
    />
  )
}
