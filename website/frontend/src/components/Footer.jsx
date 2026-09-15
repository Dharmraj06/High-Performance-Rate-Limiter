/**
 * Footer
 *
 * Minimal footer with project attribution and current year.
 */
import { Link } from 'react-router-dom'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="mt-auto border-t"
      style={{ borderColor: 'var(--border)' }}
    >
      <div
        className="page-container flex flex-col items-start justify-between gap-6 py-10 sm:flex-row sm:items-start"
      >
        <div className="flex flex-col gap-1.5">
          <p
            className="text-sm font-semibold tracking-wide"
            style={{ color: 'var(--text-primary)' }}
          >
            C++ Rate Limiter
          </p>
          <p
            className="text-sm max-w-sm leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            High-performance in-memory and distributed rate limiting
          </p>
          <p
            className="text-xs mt-3"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
          >
            C++23 &middot; Multithreading &middot; Redis &middot; CMake &mdash; &copy; {year}
          </p>
        </div>

        <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-6 mt-2 sm:mt-0">
          <a
            href="https://github.com/Dharmraj06/rate-limiter"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm no-underline transition-opacity hover:opacity-75"
            style={{ color: 'var(--text-secondary)' }}
          >
            GitHub
          </a>
          <Link
            to="/"
            className="text-sm no-underline transition-opacity hover:opacity-75"
            style={{ color: 'var(--text-secondary)' }}
          >
            Live Demo
          </Link>
          <Link
            to="/benchmarks"
            className="text-sm no-underline transition-opacity hover:opacity-75"
            style={{ color: 'var(--text-secondary)' }}
          >
            Benchmarks
          </Link>
        </nav>
      </div>
    </footer>
  )
}
