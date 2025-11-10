// pages/credential/verify.js
import { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle,
  XCircle,
  Shield,
  User,
  Calendar,
  Hospital,
  Stethoscope,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';

export default function VerifyCredential() {
  const [vcInput, setVcInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    setCopied(false);

    let parsedVC;
    try {
      parsedVC = JSON.parse(vcInput);
    } catch (e) {
      setError('Invalid JSON. Please paste a valid signed credential.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/vc/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signedVC: parsedVC })
      });

      const data = await res.json();

    //   console.log(data)

      if (data.stat) {
        setResult(data);
      } else {
        setError(data.memo || 'Verification failed');
        setResult(data);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cs = result?.data?.holder || {};
  const patient = cs.name || {};
  const doctor = cs.doctor || {};
  const hospital = cs.hospital || {};

  console.log(patient)

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
            <h2 style={styles.title}>Verify Credential</h2>
            <p style={styles.subtitle}>
              Paste your signed verifiable credential to confirm authenticity.
            </p>
          </div>

          <textarea
            value={vcInput}
            onChange={(e) => setVcInput(e.target.value)}
            placeholder='Paste your signed VC JSON here...'
            rows={8}
            style={styles.textarea}
          />

          <button
            onClick={handleVerify}
            disabled={loading || !vcInput.trim()}
            style={{
              ...styles.button,
              opacity: loading || !vcInput.trim() ? 0.6 : 1,
              cursor: loading || !vcInput.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              <>Verifying...</>
            ) : (
              <>
                <Shield size={18} style={{ marginRight: 8 }} />
                Verify Credential
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
          {result && (
            <div
              style={{
                ...styles.resultCard,
                borderColor: result.stat ? '#22c55e' : '#ef4444',
                backgroundColor: result.stat ? '#f0fdf4' : '#fef2f2'
              }}
            >
              <div style={styles.resultHeader}>
                {result.stat ? (
                  <CheckCircle size={36} style={{ color: '#22c55e' }} />
                ) : (
                  <XCircle size={36} style={{ color: '#ef4444' }} />
                )}
                <div>
                  <h3
                    style={{
                      ...styles.resultTitle,
                      color: result.stat ? '#166534' : '#991b1b'
                    }}
                  >
                    {result.stat ? 'Verified Successfully' : 'Verification Failed'}
                  </h3>
                  <p style={styles.resultMemo}>{result.memo}</p>
                </div>
              </div>

              {result.stat && (
                <>
                  {/* Patient Header */}
                  <div style={styles.patientHeader}>
                    <div style={styles.photoPlaceholder}>
                      <User size={48} style={{ color: '#6b7280' }} />
                    </div>
                    <div>
                      <h4 style={styles.patientName}>{cs.name || 'User'}</h4>
                      <p style={styles.patientId}>DID: {cs.id || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Key Info */}
                  <div style={styles.infoGrid}>
                    <div style={styles.infoItem}>
                      <Hospital size={18} style={{ color: '#0070f3' }} />
                      <div>
                        <strong>Issuer</strong>
                        <p style={styles.infoValue}>
                          {result.data.issuer?.name || result.data.issuer?.id || 'Unknown'}
                        </p>
                        <p style={styles.infoValue}>
                          {result.data.issuer?.id || 'Unknown'}
                        </p>
                      </div>
                    </div>

                    {/* <div style={styles.infoItem}>
                      <Stethoscope size={18} style={{ color: '#10b981' }} />
                      <div>
                        <strong>Doctor</strong>
                        <p style={styles.infoValue}>{doctor.fullName || 'N/A'}</p>
                      </div>
                    </div> */}

                    <div style={styles.infoItem}>
                      <Calendar size={18} style={{ color: '#f59e0b' }} />
                      <div>
                        <strong>Issued On</strong>
                        <p style={styles.infoValue}>
                          {new Date(result.data.issued).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Clinical Details */}
                  {/* <div style={styles.detailSection}>
                    <h4 style={styles.detailTitle}>Clinical Summary</h4>
                    <div style={styles.detailGrid}>
                      <div><strong>Diagnosis:</strong> {cs.diagnosis || 'N/A'}</div>
                      <div><strong>Visit ID:</strong> {cs.visitId || 'N/A'}</div>
                      <div><strong>Department:</strong> {cs.department || 'N/A'}</div>
                      <div><strong>Follow-up:</strong> {cs.followUpDate || 'N/A'}</div>
                    </div>
                  </div> */}

                  {/* Security Badge */}
                  <div style={styles.secureBadge}>
                    <Shield size={16} />
                    <span>Secured with Ed25519Signature2020</span>
                  </div>

                  {/* Copy Result */}
                  <button onClick={copyToClipboard} style={styles.copyButton}>
                    {copied ? (
                      <>
                        <Check size={16} style={{ marginRight: 6 }} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={16} style={{ marginRight: 6 }} />
                        Copy Result
                      </>
                    )}
                  </button>
                </>
              )}
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
    borderWidth: '2px',
    borderStyle: 'solid',
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
  },
  resultMemo: {
    margin: '0.25rem 0 0 0',
    fontSize: '0.9rem',
    color: '#475569',
  },
  patientHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '1px dashed #e2e8f0',
  },
  photoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px dashed #cbd5e1',
  },
  patientName: {
    margin: 0,
    fontSize: '1.3rem',
    fontWeight: '600',
    color: '#1e293b',
  },
  patientId: {
    margin: '0.25rem 0 0 0',
    fontSize: '0.85rem',
    color: '#64748b',
  },
  infoGrid: {
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
  detailSection: {
    backgroundColor: '#f8fafc',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
  },
  detailTitle: {
    margin: '0 0 0.75rem 0',
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1e293b',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '0.5rem',
    fontSize: '0.9rem',
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
    margin: '1rem auto 0',
    maxWidth: 'fit-content',
  },
  copyButton: {
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#e0e7ff',
    color: '#4338ca',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
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