// pages/credential/sign.js
// pages/index.js
import Link from 'next/link';
import { useState } from 'react';
import {
  Shield,
  CheckCircle,
  Copy,
  Check,
  AlertCircle,
  FilePen,
  Key,
  Clock,
  Hospital,
  User
} from 'lucide-react';

export default function SignCredential() {
  const [vcInput, setVcInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSign = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    setCopied(false);

    let parsedVC;
    try {
      parsedVC = JSON.parse(vcInput);
    } catch (e) {
      setError('Invalid JSON. Please paste a valid unsigned credential.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/vc/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unsignedVC: parsedVC })
      });

      const data = await res.json();

      if (data.stat) {
        setResult(data);
      } else {
        setError(data.memo || 'Signing failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(result?.data?.signedVC, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const signedVC = result?.data?.signedVC;
  const issuer = signedVC?.issuer || {};
  const proof = signedVC?.proof || {};

  return (
    <div style={styles.page}>
      {/* Header */}

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

      <main style={styles.main}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.title}>Issue Credential</h2>
            <p style={styles.subtitle}>
              Paste your unsigned credential to sign 
            </p>
          </div>

          <textarea
            value={vcInput}
            onChange={(e) => setVcInput(e.target.value)}
            placeholder='Paste your unsigned VC JSON here...'
            rows={8}
            style={styles.textarea}
          />

          <button
            onClick={handleSign}
            disabled={loading || !vcInput.trim()}
            style={{
              ...styles.button,
              opacity: loading || !vcInput.trim() ? 0.6 : 1,
              cursor: loading || !vcInput.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              <>Signing...</>
            ) : (
              <>
                <FilePen size={18} style={{ marginRight: 8 }} />
                Sign Credential
              </>
            )}
          </button>

          {error && (
            <div style={styles.alertError}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* RESULT */}
          {result && result.stat && (
            <div style={styles.resultCard}>
              <div style={styles.resultHeader}>
                <CheckCircle size={36} style={{ color: '#22c55e' }} />
                <div>
                  <h3 style={styles.resultTitle}>Credential Signed Successfully</h3>
                  <p style={styles.resultMemo}>{result.memo || 'Signature applied securely.'}</p>
                </div>
              </div>

              {/* Issuer Info */}
              <div style={styles.issuerSection}>
                <div style={styles.issuerHeader}>
                  <Hospital size={20} style={{ color: '#0070f3' }} />
                  <div>
                    <strong>Issuer</strong>
                    <p style={styles.issuerDid}>{issuer.id || 'did:nuvowallet:medos'}</p>
                  </div>
                </div>
                <p style={styles.issuerName}>{issuer.name || 'medOS Hospital'}</p>
              </div>

              {/* Signature Info */}
              <div style={styles.signatureInfo}>
                <div style={styles.infoItem}>
                  <Key size={18} style={{ color: '#10b981' }} />
                  <div>
                    <strong>Signature Type</strong>
                    <p style={styles.infoValue}>Ed25519Signature2020</p>
                  </div>
                </div>

                <div style={styles.infoItem}>
                  <Clock size={18} style={{ color: '#f59e0b' }} />
                  <div>
                    <strong>Signed On</strong>
                    <p style={styles.infoValue}>
                      {proof.created
                        ? new Date(proof.created).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Just now'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Credential Preview */}
              <div style={styles.previewSection}>
                <h4 style={styles.previewTitle}>Signed Credential</h4>
                <pre style={styles.previewPre}>
                  {JSON.stringify(signedVC, null, 2)}
                </pre>
              </div>

              {/* Actions */}
              <div style={styles.actionBar}>
                <button onClick={copyToClipboard} style={styles.copyButton}>
                  {copied ? (
                    <>
                      <Check size={16} style={{ marginRight: 6 }} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={16} style={{ marginRight: 6 }} />
                      Copy Credential
                    </>
                  )}
                </button>

                <a
                  href="/credential/verify"
                  style={styles.verifyLink}
                  onClick={(e) => {
                    if (copied) return;
                    e.preventDefault();
                    copyToClipboard();
                    setTimeout(() => {
                      window.location.href = '/credential/verify';
                    }, 300);
                  }}
                >
                  Go to Verify
                </a>
              </div>

              {/* Security Badge */}
              <div style={styles.secureBadge}>
                <Shield size={16} />
                <span>Protected by Decentralized Identity</span>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer style={styles.footer}>
        <p>© 2025 nuvowallet. w3c Verifiable Credential.</p>
      </footer>
    </div>
  );
}



// === PROFESSIONAL STYLES ===
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







  page: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '1rem 0',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  main: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    padding: '2rem 1rem',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
    padding: '2rem',
    width: '100%',
    maxWidth: '800px',
    border: '1px solid #e2e8f0',
  },
  cardHeader: {
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 0.5rem 0',
  },
  subtitle: {
    color: '#64748b',
    margin: 0,
    fontSize: '1rem',
  },
  textarea: {
    width: '100%',
    padding: '1rem',
    fontFamily: 'monospace',
    fontSize: '0.9rem',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    marginBottom: '1rem',
    resize: 'vertical',
    minHeight: '160px',
  },
  button: {
    width: '100%',
    padding: '0.875rem',
    backgroundColor: '#0070f3',
    color: 'white',
    fontWeight: '600',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
    transition: 'background-color 0.2s',
  },
  alertError: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem',
    backgroundColor: '#fee2e2',
    border: '1px solid #fca5a5',
    borderRadius: '8px',
    color: '#991b1b',
    fontSize: '0.95rem',
    marginBottom: '1rem',
  },
  resultCard: {
    marginTop: '1.5rem',
    padding: '1.5rem',
    borderRadius: '12px',
    border: '2px solid #22c55e',
    backgroundColor: '#f0fdf4',
  },
  resultHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  resultTitle: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#166534',
  },
  resultMemo: {
    margin: '0.25rem 0 0 0',
    fontSize: '0.9rem',
    color: '#475569',
  },
  issuerSection: {
    backgroundColor: '#f8fafc',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
  },
  issuerHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.25rem',
  },
  issuerDid: {
    margin: 0,
    fontFamily: 'monospace',
    fontSize: '0.85rem',
    color: '#1e293b',
  },
  issuerName: {
    margin: '0.25rem 0 0 0',
    fontSize: '0.9rem',
    color: '#475569',
  },
  signatureInfo: {
    display: 'grid',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  infoValue: {
    margin: 0,
    fontSize: '0.95rem',
    color: '#1e293b',
  },
  previewSection: {
    backgroundColor: '#f1f5f9',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
  },
  previewTitle: {
    margin: '0 0 0.75rem 0',
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1e293b',
  },
  previewPre: {
    backgroundColor: '#ffffff',
    padding: '1rem',
    borderRadius: '6px',
    overflowX: 'auto',
    fontSize: '0.8rem',
    maxHeight: '300px',
    border: '1px solid #e2e8f0',
  },
  actionBar: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
  },
  copyButton: {
    flex: 1,
    padding: '0.75rem',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
  },
  verifyLink: {
    flex: 1,
    padding: '0.75rem',
    backgroundColor: '#e0e7ff',
    color: '#4338ca',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    transition: 'all 0.2s',
  },
  secureBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    color: '#059669',
    backgroundColor: '#ecfdf5',
    padding: '0.5rem 1rem',
    borderRadius: '999px',
    margin: '0 auto',
    maxWidth: 'fit-content',
  },
  footer: {
    textAlign: 'center',
    padding: '1.5rem',
    color: '#64748b',
    fontSize: '0.9rem',
    borderTop: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
  },
};