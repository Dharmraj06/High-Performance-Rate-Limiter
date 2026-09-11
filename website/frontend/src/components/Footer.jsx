/**
 * Footer
 *
 * Minimal footer with project attribution and current year.
 */
export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="mt-auto border-t"
      style={{ borderColor: 'var(--border)' }}
    >
      <div
        className="mx-auto flex flex-col items-center justify-between gap-3 px-6 py-8 sm:flex-row"
        style={{ maxWidth: '1100px' }}
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
