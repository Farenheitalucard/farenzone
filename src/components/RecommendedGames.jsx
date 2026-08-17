import { Link } from 'react-router-dom'
import { useGames } from '../hooks/useGames'
import { useLanguage } from '../language-context'
import { getConsole } from '../data/consoles'
import { Cover } from './Cover'
import { getRelatedGames } from '../utils/relatedGames'

export function RecommendedGames({ currentGame }) {
  const games = useGames()
  const { t } = useLanguage()

  const related = getRelatedGames(currentGame, games, 4)

  if (related.length === 0) return null

  return (
    <div className="recommended-section">
      <h2 className="details-title">{t.game.related}</h2>
      <div className="recommended-grid">
        {related.map((game) => {
          const consoleInfo = getConsole(game.console) || {
            name: game.console,
            color: '#888',
          }
          return (
            <Link
              key={game.id}
              to={`/juego/${game.id}`}
              className="game-card recommended-card"
            >
              <Cover game={game} />
              <div className="game-info">
                <h3 className="game-title">{game.title}</h3>
                <p className="game-meta">
                  {game.year} · {consoleInfo.name}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
