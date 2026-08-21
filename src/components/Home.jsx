import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useConsoles } from '../hooks/useConsoles'
import { useGames } from '../hooks/useGames'
import { useLanguage } from '../language-context'
import { Cover } from './Cover'
import { ConsoleIcon } from './ConsoleIcon'

const CLIP_LENGTH = 20

const VIDEO_VERSION = 'v6'

const HERO_VIDEOS = [
  { file: '/videos/totk.mp4', title: 'The Legend of Zelda: Tears of the Kingdom' },
  { file: '/videos/ody.mp4', title: 'Super Mario Odyssey' },
  { file: '/videos/tomodachi.mp4', title: 'Tomodachi Life' },
  { file: '/videos/gow.mp4', title: 'God of War' },
  { file: '/videos/re2.mp4', title: 'Resident Evil 2' },
]

function shuffled(list) {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function HeroVideos() {
  const [videos] = useState(() => shuffled(HERO_VIDEOS))
  const [active, setActive] = useState(0)
  const els = useRef({})

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((i) => (i + 1) % videos.length)
    }, CLIP_LENGTH * 1000)
    return () => clearInterval(timer)
  }, [videos.length])

  useEffect(() => {
    Object.values(els.current).forEach((el) => {
      if (el) el.pause()
    })
    const el = els.current[active]
    if (el) {
      el.currentTime = 0
      el.play().catch(() => {})
    }
  }, [active, videos])

  return (
    <>
      <div className="hero-videos" aria-hidden="true">
        {videos.map((v, i) => (
          <div
            key={v.file}
            className={i === active ? 'hero-video active' : 'hero-video'}
          >
            <video
              ref={(el) => {
                els.current[i] = el
              }}
              src={`${v.file}?v=${VIDEO_VERSION}`}
              muted
              playsInline
              loop
              preload="auto"
            />
          </div>
        ))}
      </div>
      <span className="hero-game">{videos[active].title}</span>
    </>
  )
}

export function Home() {
  const { t } = useLanguage()
  const games = useGames()
  const consoles = useConsoles()

  return (
    <main className="page">
      <section className="hero">
        <HeroVideos />
      </section>

      <section className="section">
        <h2 className="section-title">{t.home.sectionTitle}</h2>
        <p className="section-subtitle">{t.home.sectionSubtitle}</p>
        <div className="home-console-rows">
          {consoles.map((c) => {
            const latest = games
              .filter((g) => g.console === c.id)
              .slice(-4)
              .reverse()
            return (
              <div key={c.id} className="home-console-row">
                <div className="home-row-head">
                  <div className="home-row-title-wrap">
                    <ConsoleIcon id={c.id} size={20} />
                    <h3 className="home-row-title">{c.name}</h3>
                    <span className="home-row-latest">{t.home.latest}</span>
                  </div>
                  <Link to={`/consola/${c.id}`} className="home-row-all">
                    {t.home.seeAll} →
                  </Link>
                </div>
                {latest.length === 0 ? (
                  <p className="no-games">{t.console.noGames}</p>
                ) : (
                  <div className="home-row-grid">
                    {latest.map((game) => (
                      <Link
                        key={game.id}
                        to={`/juego/${game.id}`}
                        className="game-card"
                      >
                        <Cover game={game} />
                        <div className="game-info">
                          <h3 className="game-title">{game.title}</h3>
                          <p className="game-meta">
                            {game.year} · {game.genre}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}
