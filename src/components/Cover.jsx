import { useState } from 'react'

export function Cover({ game, size = 'card' }) {
  const [failed, setFailed] = useState(false)

  if (game.cover && !failed) {
    return (
      <div className={`cover cover-${size}`}>
        <img
          src={game.cover}
          alt={game.title}
          onError={() => setFailed(true)}
          loading="lazy"
        />
      </div>
    )
  }

  return (
    <div
      className={`cover cover-${size}`}
      style={{ background: `linear-gradient(135deg, ${game.color} 0%, #000000 180%)` }}
    >
      <span className="cover-title">{game.title}</span>
    </div>
  )
}
