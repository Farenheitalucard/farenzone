import { useLanguage } from '../language-context'

function pageList(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const pages = new Set([1, total])
  for (let p = current - 1; p <= current + 1; p++) {
    if (p >= 1 && p <= total) pages.add(p)
  }
  const sorted = [...pages].sort((a, b) => a - b)
  const out = []
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push('…')
    out.push(sorted[i])
  }
  return out
}

export function Pagination({ page, totalPages, onChange }) {
  const { t } = useLanguage()
  if (totalPages <= 1) return null
  const list = pageList(page, totalPages)
  return (
    <nav className="pagination" aria-label={t.console.pagination}>
      <button
        type="button"
        className="page-btn"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
      >
        {t.console.prev}
      </button>
      {list.map((p, i) =>
        p === '…' ? (
          <span key={`dots-${i}`} className="page-dots">…</span>
        ) : (
          <button
            key={p}
            type="button"
            className={p === page ? 'page-btn active' : 'page-btn'}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        className="page-btn"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
      >
        {t.console.next}
      </button>
    </nav>
  )
}
