import { NavLink } from 'react-router-dom'

const navLinks = [
  { to: '/', label: 'Overview' },
  { to: '/benchmarks', label: 'Benchmarks' },
]

const MAX_W = {
  maxWidth: '1100px',
  marginLeft: 'auto',
  marginRight: 'auto',
  paddingLeft: '1.5rem',
  paddingRight: '1.5rem',
}

export default function Navbar() {
  return (
    <header
      className="border-b"
      style={{
        backgroundColor: '#000000',
        borderColor: 'var(--border)',
      }}
    >
      <div
        className="flex items-center justify-between py-4"
        style={MAX_W}
      >
        {/* Wordmark */}
        <NavLink
          to="/"
          className="flex items-center gap-2.5 no-underline transition-opacity hover:opacity-75"
          style={{ textDecoration: 'none' }}
        >
          <span
            className="text-xs font-medium tracking-widest uppercase"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.12em' }}
          >
            C++
          </span>
          <span
            className="h-3.5 w-px"
            style={{ backgroundColor: 'var(--border)' }}
            aria-hidden="true"
          />
          <span
            className="text-sm font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            Rate Limiter
          </span>
        </NavLink>

        {/* Nav links */}
        <nav aria-label="Main navigation">
          <ul className="flex items-center gap-2 list-none">
            {navLinks.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  className="px-3 py-1.5 text-sm transition-colors no-underline block"
                  style={({ isActive }) => ({
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    borderBottom: isActive ? '1px solid var(--text-primary)' : '1px solid transparent',
                    fontWeight: isActive ? 500 : 400,
                    textDecoration: 'none',
                  })}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
