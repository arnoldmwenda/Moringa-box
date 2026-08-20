import { useEffect, useMemo, useState } from "react";
import "./App.css";
import GridDistortion from "./components/GridDistortion";
import { searchWithBackend, transcribeWithAzure } from "./services/searchService";

const boxes = [
  {
    id: 1,
    title: "Daily Dose Box",
    category: "Everyday",
    description: "A simple daily ritual for steady energy and focus.",
    price: 34,
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 2,
    title: "Starter Kit",
    category: "Beginner",
    description: "Everything you need to make moringa part of your routine.",
    price: 28,
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 3,
    title: "Glow & Grow Box",
    category: "Wellness",
    description: "Plant-powered staples for your feel-good reset.",
    price: 42,
    image:
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 4,
    title: "Family Pantry Box",
    category: "Everyday",
    description: "A generous refill for shared kitchens and busy weeks.",
    price: 56,
    image:
      "https://images.unsplash.com/photo-1490474418585-ba9bad8dc0b3?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 5,
    title: "Focus Ritual Box",
    category: "Wellness",
    description: "A bright, grounded collection for deep work days.",
    price: 38,
    image:
      "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 6,
    title: "Refill Pouch Set",
    category: "Beginner",
    description: "Keep your favorite blends close and your cupboard calm.",
    price: 24,
    image:
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=85",
  },
];

const categories = ["All boxes", "Everyday", "Beginner", "Wellness"];
const pageSize = 3;
const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function App() {
  const [activeCategory, setActiveCategory] = useState("All boxes");
  const [page, setPage] = useState(1);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [searchStatus, setSearchStatus] = useState("");
  const [signedInUser, setSignedInUser] = useState(null);
  const [authStatus, setAuthStatus] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const [authMethod, setAuthMethod] = useState("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const filteredBoxes = useMemo(
    () =>
      activeCategory === "All boxes"
        ? boxes
        : boxes.filter((box) => box.category === activeCategory),
    [activeCategory],
  );
  const searchableBoxes = useMemo(
    () => filteredBoxes.map((box) => ({ ...box, name: box.title, type: box.category, updated: box.description })),
    [filteredBoxes],
  );
  useEffect(() => {
    let cancelled = false;
    setSearchResults(null);
    if (query.trim()) {
      searchWithBackend(searchableBoxes, query).then((results) => {
        if (!cancelled) setSearchResults(results);
      });
    }
    return () => { cancelled = true; };
  }, [query, searchableBoxes]);
  const displayedBoxes = query.trim()
    ? searchResults || searchableBoxes.filter((box) => `${box.title} ${box.category} ${box.description}`.toLowerCase().includes(query.toLowerCase()))
    : filteredBoxes;
  const totalPages = Math.max(1, Math.ceil(displayedBoxes.length / pageSize));
  const visibleBoxes = displayedBoxes.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  const cartTotal = cart.reduce((total, box) => total + box.price, 0);
  useEffect(() => {
    if (!googleClientId || document.getElementById("google-identity-script")) return undefined;
    const script = document.createElement("script");
    script.id = "google-identity-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response) => {
          try {
            const payload = JSON.parse(window.atob(response.credential.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
            setSignedInUser({ name: payload.name, email: payload.email, picture: payload.picture });
            setAuthStatus(`Signed in as ${payload.name}`);
          } catch {
            setAuthStatus("Google sign-in returned an invalid credential.");
          }
        },
      });
    };
    document.head.appendChild(script);
    return undefined;
  }, []);
  const signInWithGoogle = () => {
    if (!googleClientId) {
      setAuthStatus("Add REACT_APP_GOOGLE_CLIENT_ID to enable Google sign-in.");
      return;
    }
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      setAuthStatus("Loading Google sign-in...");
    }
  };
  const openLogin = () => {
    setLoginOpen(true);
    setAuthStatus("");
  };
  const signInWithEmail = (event) => {
    event.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setAuthStatus("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setAuthStatus("Password must be at least 6 characters.");
      return;
    }
    const name = email.split("@")[0].replace(/[._-]/g, " ");
    setSignedInUser({ name, email });
    setAuthStatus(`Signed in as ${email}`);
  };
  const signInWithMicrosoft = () => {
    setAuthStatus("Microsoft sign-in needs an Azure AD client ID in the app configuration.");
  };
  const changeCategory = (category) => {
    setActiveCategory(category);
    setPage(1);
  };
  const startVoiceSearch = async () => {
    if (isListening) return;
    setIsListening(true);
    setSearchStatus("Listening...");
    try {
      const result = await transcribeWithAzure();
      setQuery(result.text);
      setSearchStatus(`Searching for "${result.text}"`);
    } catch (error) {
      setSearchStatus(error.message);
    } finally {
      setIsListening(false);
    }
  };

  return (
    <main className="moringa-app">
      <header className="site-header">
        <a className="brand-row" href="#top" aria-label="Moringa Box home">
          <span className="brand-mark">M</span>
          <span>Moringa Box</span>
        </a>
        <nav className="site-nav" aria-label="main navigation">
          <a className="active" href="#boxes">
            Build your box
          </a>
          <a href="#why-moringa">Why moringa</a>
          <a href="#how-it-works">How it works</a>
        </nav>
        <div className="header-actions">
          <button className="login-btn" onClick={openLogin}>{signedInUser ? signedInUser.name : "Sign in"}</button>
          <button
            className="cart-btn"
            onClick={() => setCartOpen(true)}
            aria-label={`Open cart with ${cart.length} items`}
          >
            Cart <span>{cart.length}</span>
          </button>
        </div>
        {authStatus && <span className="auth-status" role="status">{authStatus}</span>}
      </header>

      <section className="hero-section" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Good things, grown naturally</p>
          <h1>A little green for your everyday.</h1>
          <p className="subtitle">
            Curated moringa boxes for simple rituals, bright energy, and a
            healthier pantry.
          </p>
          <a className="primary-btn" href="#boxes">
            Build your box <span aria-hidden="true">↗</span>
          </a>
          <div className="hero-note">
            <span>✳</span> Small-batch, thoughtfully packed
          </div>
        </div>
        <div className="hero-art" aria-label="Fresh greens and moringa leaves">
          <GridDistortion imageSrc="https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1200&q=90" grid={12} mouse={0.12} strength={0.16} relaxation={0.9} />
          <div className="hero-badge">
            Plant-powered
            <br />
            <strong>since 2024</strong>
          </div>
          <div className="leaf-shape leaf-one" />
          <div className="leaf-shape leaf-two" />
          <div className="hero-card">
            <span>THIS MONTH'S PICK</span>
            <strong>Daily Dose Box</strong>
            <small>Four pantry-friendly essentials</small>
          </div>
        </div>
      </section>

      <section className="benefit-strip" id="why-moringa">
        <div>
          <span className="benefit-icon">01</span>
          <p>
            <strong>Plant-powered</strong>
            <small>Simple ingredients you can recognize.</small>
          </p>
        </div>
        <div>
          <span className="benefit-icon">02</span>
          <p>
            <strong>Curated for you</strong>
            <small>Useful blends, never unnecessary extras.</small>
          </p>
        </div>
        <div>
          <span className="benefit-icon">03</span>
          <p>
            <strong>Delivered monthly</strong>
            <small>Fresh rituals at your own pace.</small>
          </p>
        </div>
      </section>

      <section className="catalog-section" id="boxes">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Choose your ritual</p>
            <h2>Find your kind of good.</h2>
          </div>
          <p className="section-copy">
            Start with one box or make it a monthly habit. Every collection is
            ready to fit into real life.
          </p>
        </div>
        <div className="catalog-toolbar">
          <div
            className="category-tabs"
            role="tablist"
            aria-label="box categories"
          >
            {categories.map((category) => (
              <button
                className={
                  activeCategory === category
                    ? "category-tab active"
                    : "category-tab"
                }
                key={category}
                onClick={() => changeCategory(category)}
                role="tab"
                aria-selected={activeCategory === category}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="catalog-search-wrap">
            <input className="catalog-search" aria-label="Search boxes" placeholder="Search boxes" value={query} onChange={(event) => { setPage(1); setQuery(event.target.value); setSearchStatus(event.target.value ? `Searching for "${event.target.value}"` : ""); }} />
            <button className={`voice-button ${isListening ? "listening" : ""}`} onClick={startVoiceSearch} aria-label="Start voice search" title="Voice search">{isListening ? "●" : "🎙"}</button>
          </div>
          <span className="result-count">{displayedBoxes.length} boxes</span>
        </div>
        {searchStatus && <p className="search-status" role="status">{searchStatus}</p>}
        <div className="box-grid">
          {visibleBoxes.map((box) => (
            <article className="box-card" key={box.id}>
              <div
                className="box-image"
                style={{ backgroundImage: `url(${box.image})` }}
              >
                <span className="box-category">{box.category}</span>
                <button className="heart-btn" aria-label={`Save ${box.title}`}>
                  ♡
                </button>
              </div>
              <div className="box-details">
                <div className="box-title-row">
                  <h3>{box.title}</h3>
                  <strong>KSh {box.price}</strong>
                </div>
                <p>{box.description}</p>
                <button
                  className="add-btn"
                  onClick={() =>
                    setCart((currentCart) => [...currentCart, box])
                  }
                >
                  Add to box <span aria-hidden="true">+</span>
                </button>
              </div>
            </article>
          ))}
        </div>
        <div className="pagination" aria-label="box pagination">
          <span>
            Page {page} of {totalPages}
          </span>
          <div>
            <button
              disabled={page === 1}
              onClick={() => setPage((currentPage) => currentPage - 1)}
              aria-label="Previous page"
            >
              ←
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((currentPage) => currentPage + 1)}
              aria-label="Next page"
            >
              →
            </button>
          </div>
        </div>
      </section>

      <section className="how-section" id="how-it-works">
        <p className="eyebrow">A softer way to shop</p>
        <h2>Choose well. Feel good. Repeat.</h2>
        <p>
          Build a box around the rituals you already have, then let Moringa Box
          handle the thoughtful restock.
        </p>
      </section>

      {cartOpen && (
        <div
          className="cart-overlay"
          role="presentation"
          onClick={() => setCartOpen(false)}
        >
          <aside
            className="cart-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="drawer-heading">
              <div>
                <p className="eyebrow">Your selection</p>
                <h2>Your box</h2>
              </div>
              <button
                className="close-btn"
                onClick={() => setCartOpen(false)}
                aria-label="Close cart"
              >
                ×
              </button>
            </div>
            {cart.length === 0 ? (
              <p className="cart-empty">
                Your box is empty. Add a ritual to get started.
              </p>
            ) : (
              <div className="cart-items">
                {cart.map((box, index) => (
                  <div className="cart-item" key={`${box.id}-${index}`}>
                    <span>{box.title}</span>
                    <strong>KSh {box.price}</strong>
                  </div>
                ))}
              </div>
            )}
            <div className="cart-total">
              <span>Total</span>
              <strong>KSh {cartTotal}</strong>
            </div>
            <button
              className="primary-btn checkout-btn"
              disabled={cart.length === 0}
            >
              Continue to checkout
            </button>
          </aside>
        </div>
      )}
      {loginOpen && (
        <div className="login-overlay" role="presentation" onClick={() => setLoginOpen(false)}>
          <section className="login-panel" role="dialog" aria-modal="true" aria-labelledby="login-title" onClick={(event) => event.stopPropagation()}>
            <GridDistortion imageSrc="https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1200&q=90" grid={10} mouse={0.1} strength={0.15} relaxation={0.9} className="login-distortion" />
            <div className="login-content">
              <button className="login-close" onClick={() => setLoginOpen(false)} aria-label="Close sign in">×</button>
              <span className="brand-mark login-mark">M</span>
              <p className="eyebrow">Welcome back</p>
              <h2 id="login-title">Sign in to Moringa Box</h2>
              <p className="login-copy">Keep your rituals, saved boxes, and next delivery in one place.</p>
              <div className="auth-methods" role="tablist" aria-label="Sign in methods">
                <button className={authMethod === "email" ? "auth-method active" : "auth-method"} onClick={() => setAuthMethod("email")} role="tab" aria-selected={authMethod === "email"}>Email</button>
                <button className={authMethod === "google" ? "auth-method active" : "auth-method"} onClick={() => setAuthMethod("google")} role="tab" aria-selected={authMethod === "google"}>Google</button>
                <button className={authMethod === "microsoft" ? "auth-method active" : "auth-method"} onClick={() => setAuthMethod("microsoft")} role="tab" aria-selected={authMethod === "microsoft"}>Microsoft</button>
              </div>
              {authMethod === "email" && <form className="email-login-form" onSubmit={signInWithEmail}>
                <label htmlFor="login-email">Email address</label>
                <input id="login-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
                <label htmlFor="login-password">Password</label>
                <input id="login-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" />
                <button className="google-login-btn" type="submit">Sign in with email</button>
              </form>}
              {authMethod === "google" && <button className="google-login-btn" onClick={signInWithGoogle}>Continue with Google</button>}
              {authMethod === "microsoft" && <button className="google-login-btn microsoft-login-btn" onClick={signInWithMicrosoft}>Continue with Microsoft</button>}
              {signedInUser && <p className="login-success" role="status">Signed in as {signedInUser.name}</p>}
              {authStatus && <p className="login-status" role="status">{authStatus}</p>}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default App;
