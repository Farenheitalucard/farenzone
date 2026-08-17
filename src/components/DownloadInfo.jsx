import { Cover } from './Cover'

export function DownloadInfo({ download, t, game }) {
  const rows = [
    { label: t.game.region, value: download?.region },
    { label: t.game.size, value: download?.size },
    { label: t.game.format, value: download?.format },
    { label: t.game.update, value: download?.update },
    { label: t.game.fw, value: download?.fw },
    { label: t.game.languages, value: download?.languages },
    { label: t.game.thanks, value: download?.thanks },
  ].filter((r) => r.value)

  const links = download?.links?.length > 0 ? download.links : []

  return (
    <div className="download-card">
      {game && (
        <div className="download-cover">
          <Cover game={game} size="large" />
        </div>
      )}
      {download && (rows.length > 0 || links.length > 0) && (
        <h2 className="details-title">{t.game.download}</h2>
      )}
      {rows.length > 0 && (
        <dl className="download-fields">
          {rows.map((r) => (
            <div className="download-field" key={r.label}>
              <dt>{r.label}</dt>
              <dd>{r.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {links.length > 0 && (
        <div className="download-links">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.url || '#'}
              target="_blank"
              rel="noreferrer"
              className={`download-btn${l.color ? ` download-btn-${l.color}` : ''}`}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
