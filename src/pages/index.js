// pages/index.js
import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* === NAVBAR === */}
      <nav style={styles.navbar}>
        <div style={styles.navContainer}>
          <Link href="/" style={styles.logo}>
            NUVOWallet
          </Link>

          {/* Desktop Menu */}
          <div style={styles.navLinks}>
            <Link href="/credential/sign" style={styles.navLink}>
              Sign
            </Link>
            <Link href="/credential/verify" style={styles.navLink}>
              Verify
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            style={styles.hamburger}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? '×' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div style={styles.mobileMenu}>
            <Link href="/credential/sign" style={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>
              Sign Credential
            </Link>
            <Link href="/credential/verify" style={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>
              Verify Credential
            </Link>
          </div>
        )}
      </nav>

      {/* === HERO CONTENT === */}
      <div style={styles.container}>
        <div style={styles.hero}>
          <h1 style={styles.title}>Verifiable Credential Hub</h1>
          <p style={styles.subtitle}>
            Issue and verify self-sovereign health credentials using DID & Ed25519
          </p>
        </div>

        <div style={styles.grid}>
          <Link href="/credential/sign" style={styles.cardLink}>
            <div style={styles.cardSign}>
              <h2>Sign Credential</h2>
              <p>Paste an unsigned VC and get a signed, verifiable credential.</p>
              <span style={styles.arrow}>→</span>
            </div>
          </Link>

          <Link href="/credential/verify" style={styles.cardLink}>
            <div style={styles.cardVerify}>
              <h2>Verify Credential</h2>
              <p>Paste a signed VC to verify authenticity and view patient data.</p>
              <span style={styles.arrow}>→</span>
            </div>
          </Link>
        </div>

        <footer style={styles.footer}>
          Powered by <strong>nuvowallet</strong> | Ed25519Signature2020
        </footer>
      </div>
    </>
  );
}

// === STYLES ===
const styles = {
  // Navbar
  navbar: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    width: '100%',
  },
  navContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '64px',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937',
    textDecoration: 'none',
  },
  navLinks: {
    display: 'flex',
    gap: '2rem',
  },
  navLink: {
    fontSize: '1rem',
    fontWeight: '500',
    color: '#374151',
    textDecoration: 'none',
    padding: '0.5rem 0',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s',
  },
  hamburger: {
    display: 'none',
    fontSize: '1.8rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#374151',
  },
  mobileMenu: {
    position: 'absolute',
    top: '64px',
    left: 0,
    width: '100%',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    padding: '1rem 0',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
  },
  mobileLink: {
    display: 'block',
    padding: '0.75rem 1.5rem',
    color: '#374151',
    textDecoration: 'none',
    fontWeight: '500',
  },

  // Main Content
  container: {
    minHeight: 'calc(100vh - 64px)',
    backgroundColor: '#f9fafb',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 1rem',
  },
  hero: {
    textAlign: 'center',
    marginBottom: '3rem',
    maxWidth: '800px',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#6b7280',
    marginTop: '0.5rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    width: '100%',
    maxWidth: '1000px',
  },
  cardLink: {
    textDecoration: 'none',
  },
  cardSign: {
    backgroundColor: '#dbeafe',
    border: '2px solid #93c5fd',
    borderRadius: '12px',
    padding: '2rem',
    textAlign: 'center',
    transition: 'all 0.2s',
    cursor: 'pointer',
    position: 'relative',
  },
  cardVerify: {
    backgroundColor: '#d1fae5',
    border: '2px solid #6ee7b7',
    borderRadius: '12px',
    padding: '2rem',
    textAlign: 'center',
    transition: 'all 0.2s',
    cursor: 'pointer',
    position: 'relative',
  },
  arrow: {
    fontSize: '2rem',
    position: 'absolute',
    bottom: '1rem',
    right: '1.5rem',
    opacity: 0.7,
  },
  footer: {
    marginTop: '4rem',
    fontSize: '0.9rem',
    color: '#6b7280',
  },
};

// === Hover Effects ===
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    [style*="navLink"]:hover {
      color: #0070f3;
      border-bottom-color: #0070f3;
    }
    [style*="cardSign"]:hover,
    [style*="cardVerify"]:hover {
      transform: translateY(-8px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    }
    @media (max-width: 768px) {
      [style*="navLinks"] { display: none; }
      [style*="hamburger"] { display: block; }
    }
  `;
  document.head.appendChild(style);
}