/**
 * Footer
 *
 * Minimal footer with project attribution and current year.
 */
const MAX_W = {
  maxWidth: '1100px',
  marginLeft: 'auto',
  marginRight: 'auto',
  paddingLeft: '1.5rem',
  paddingRight: '1.5rem',
}

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="mt-auto border-t"
      style={{ borderColor: 'var(--border)' }}
    >
      <div
        className="flex flex-col items-start justify-between gap-3 py-8 sm:flex-row sm:items-center"
        style={MAX_W}
      >
        <p
          className="text-xs"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
        >
          C++ Rate Limiter &mdash; {year}
        </p>
        <p
          className="text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          High-performance in-memory &amp; distributed rate limiting
        </p>
      </div>
    </footer>
  )
}
