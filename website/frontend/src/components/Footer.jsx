/**
 * Footer
 *
 * Minimal footer with project attribution and current year.
 */
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer
      className="mt-auto border-t"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="page-container py-8 sm:py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">

          {/* Left Side */}
          <div className="flex flex-col gap-1.5">
            <p
              className="text-sm font-semibold tracking-wide"
              style={{ color: 'var(--text-primary)' }}
            >
              C++ Rate Limiter
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              High-performance in-memory and distributed rate limiting
            </p>
          </div>

          {/* Right Side */}
          <nav aria-label="Footer navigation" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
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
      </div>
    </footer>
  )
}
