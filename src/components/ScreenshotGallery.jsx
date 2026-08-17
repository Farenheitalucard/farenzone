import { useState } from 'react'

export function ScreenshotGallery({ screenshots, title, trailer }) {
  const shots = (screenshots || []).filter(Boolean)
  const [active, setActive] = useState(0)
  const [broken, setBroken] = useState({})

  const images = shots.filter((s) => !broken[s])
  const hasVideo = Boolean(trailer)

  if (images.length === 0 && !hasVideo) return null

  const videoIndex = images.length
  const total = images.length + (hasVideo ? 1 : 0)
  const current = Math.min(active, total - 1)
  const isVideo = hasVideo && current === videoIndex

  return (
    <div className="screenshots">
      <div className="screenshots-main">
        {isVideo ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${trailer}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <img
            src={images[current]}
            alt={title}
            loading="lazy"
            onError={() => setBroken((b) => ({ ...b, [images[current]]: true }))}
          />
        )}
      </div>
      {total > 1 && (
        <div className="screenshots-thumbs">
          {images.map((s, i) => (
            <button
              key={s}
              type="button"
              className={`screenshot-thumb${i === current ? ' active' : ''}`}
              onClick={() => setActive(i)}
            >
              <img src={s} alt="" loading="lazy" />
            </button>
          ))}
          {hasVideo && (
            <button
              type="button"
              className={`screenshot-thumb screenshot-thumb-video${current === videoIndex ? ' active' : ''}`}
              onClick={() => setActive(videoIndex)}
            >
              <img
                src={`https://i.ytimg.com/vi/${trailer}/hqdefault.jpg`}
                alt={title}
                loading="lazy"
              />
              <span className="screenshot-play" aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
