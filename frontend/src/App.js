import './App.css';

function App() {
  return (
    <main className="moringa-app">
      <aside className="sidebar">
        <div className="brand-row">
          <div className="brand-mark">M</div>
          <span>Moringa Box</span>
        </div>

        <nav className="nav" aria-label="sidebar navigation">
          <button className="nav-item active">Overview</button>
          <button className="nav-item">Files</button>
          <button className="nav-item">Shared</button>
          <button className="nav-item">Favorites</button>
          <button className="nav-item">Trash</button>
        </nav>

        <div className="storage-card">
          <p>Storage</p>
          <strong>0 GB</strong>
          <div className="progress-bar" aria-label="storage usage">
            <span className="empty-progress" />
          </div>
          <small>0 of 0 GB used</small>
        </div>
      </aside>

      <section className="content-panel">
        <header className="topbar">
          <div className="search-box">
            <span className="search-icon">⌕</span>
            <span>Search files</span>
          </div>

          <div className="topbar-actions">
            <button className="ghost-btn">Upload</button>
            <button className="primary-btn">Create</button>
          </div>
        </header>

        <section className="hero-section empty-state">
          <div className="hero-copy">
            <p className="eyebrow">Your workspace</p>
            <h1>No files yet.</h1>
            <p className="subtitle">
              Start by uploading your first document, folder, or project file.
            </p>

            <div className="cta-row">
              <button className="primary-btn">Upload file</button>
              <button className="ghost-btn">New folder</button>
            </div>
          </div>

          <div className="preview-card empty-preview" aria-label="workspace preview">
            <div className="preview-header">
              <span className="dot green" />
              <span className="dot amber" />
              <span className="dot red" />
            </div>

            <div className="preview-body empty-body">
              <div className="empty-folder">
                <span className="empty-title">No folders created</span>
                <small>0 items</small>
              </div>
            </div>
          </div>
        </section>

        <section className="stats-grid" aria-label="summary statistics">
          <article className="stat-card">
            <span className="stat-label">Files uploaded</span>
            <strong>0</strong>
          </article>
          <article className="stat-card">
            <span className="stat-label">Shared folders</span>
            <strong>0</strong>
          </article>
          <article className="stat-card">
            <span className="stat-label">Team members</span>
            <strong>0</strong>
          </article>
        </section>
      </section>
    </main>
  );
}

export default App;
