import "./App.css";

function App() {
  return (
    <div className="page">
      <main className="card">
        {/* Logo inspired wordmark */}
        <div className="wordmark">
          <span className="wordmark-main">plut</span>
          <span className="wordmark-dot" aria-hidden="true" />
        </div>
        <div className="wordmark-sub">MARKETING</div>

        {/* Coming soon */}
        <h1 className="coming-title">Coming Soon</h1>
        <p className="coming-text">
          We’re building something sharp and modern for brands and creators.
        </p>

        {/* Social links */}
        <div className="social-row">
          <a
            href="https://www.facebook.com/plutommcbd/"
            target="_blank"
            rel="noreferrer"
            className="social-pill"
          >
            <span className="social-icon">f</span>
            <span>Facebook</span>
          </a>
          <a
            href="https://www.instagram.com/plutommcbd/"
            target="_blank"
            rel="noreferrer"
            className="social-pill"
          >
            <span className="social-icon">ig</span>
            <span>Instagram</span>
          </a>
          <a
            href="https://www.tiktok.com/@plutommcbd"
            target="_blank"
            rel="noreferrer"
            className="social-pill"
          >
            <span className="social-icon">tt</span>
            <span>TikTok</span>
          </a>
        </div>
      </main>

      <footer className="footer">
        © {new Date().getFullYear()} Pluto Marketing
      </footer>
    </div>
  );
}

export default App;
