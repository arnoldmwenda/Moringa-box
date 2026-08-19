import { useMemo, useState } from 'react';
import './App.css';

const boxes = [
  { id: 1, title: 'Daily Dose Box', category: 'Everyday', description: 'A simple daily ritual for steady energy and focus.', price: 34, image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85' },
  { id: 2, title: 'Starter Kit', category: 'Beginner', description: 'Everything you need to make moringa part of your routine.', price: 28, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85' },
  { id: 3, title: 'Glow & Grow Box', category: 'Wellness', description: 'Plant-powered staples for your feel-good reset.', price: 42, image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=85' },
  { id: 4, title: 'Family Pantry Box', category: 'Everyday', description: 'A generous refill for shared kitchens and busy weeks.', price: 56, image: 'https://images.unsplash.com/photo-1490474418585-ba9bad8dc0b3?auto=format&fit=crop&w=900&q=85' },
  { id: 5, title: 'Focus Ritual Box', category: 'Wellness', description: 'A bright, grounded collection for deep work days.', price: 38, image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=900&q=85' },
  { id: 6, title: 'Refill Pouch Set', category: 'Beginner', description: 'Keep your favorite blends close and your cupboard calm.', price: 24, image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=85' },
];

const categories = ['All boxes', 'Everyday', 'Beginner', 'Wellness'];
const pageSize = 3;

function App() {
  const [activeCategory, setActiveCategory] = useState('All boxes');
  const [page, setPage] = useState(1);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const filteredBoxes = useMemo(() => activeCategory === 'All boxes' ? boxes : boxes.filter((box) => box.category === activeCategory), [activeCategory]);
  const totalPages = Math.ceil(filteredBoxes.length / pageSize);
  const visibleBoxes = filteredBoxes.slice((page - 1) * pageSize, page * pageSize);
  const cartTotal = cart.reduce((total, box) => total + box.price, 0);
  const changeCategory = (category) => { setActiveCategory(category); setPage(1); };

  return (
    <main className="moringa-app">
      <header className="site-header">
        <a className="brand-row" href="#top" aria-label="Moringa Box home"><span className="brand-mark">M</span><span>Moringa Box</span></a>
        <nav className="site-nav" aria-label="main navigation"><a className="active" href="#boxes">Build your box</a><a href="#why-moringa">Why moringa</a><a href="#how-it-works">How it works</a></nav>
        <div className="header-actions"><button className="login-btn">Sign in</button><button className="cart-btn" onClick={() => setCartOpen(true)} aria-label={`Open cart with ${cart.length} items`}>Cart <span>{cart.length}</span></button></div>
      </header>

      <section className="hero-section" id="top">
        <div className="hero-copy"><p className="eyebrow">Good things, grown naturally</p><h1>A little green for your everyday.</h1><p className="subtitle">Curated moringa boxes for simple rituals, bright energy, and a healthier pantry.</p><a className="primary-btn" href="#boxes">Build your box <span aria-hidden="true">↗</span></a><div className="hero-note"><span>✳</span> Small-batch, thoughtfully packed</div></div>
        <div className="hero-art" aria-label="Fresh greens and moringa leaves"><div className="hero-badge">Plant-powered<br /><strong>since 2024</strong></div><div className="leaf-shape leaf-one" /><div className="leaf-shape leaf-two" /><div className="hero-card"><span>THIS MONTH'S PICK</span><strong>Daily Dose Box</strong><small>Four pantry-friendly essentials</small></div></div>
      </section>

      <section className="benefit-strip" id="why-moringa"><div><span className="benefit-icon">01</span><p><strong>Plant-powered</strong><small>Simple ingredients you can recognize.</small></p></div><div><span className="benefit-icon">02</span><p><strong>Curated for you</strong><small>Useful blends, never unnecessary extras.</small></p></div><div><span className="benefit-icon">03</span><p><strong>Delivered monthly</strong><small>Fresh rituals at your own pace.</small></p></div></section>

      <section className="catalog-section" id="boxes">
        <div className="section-heading"><div><p className="eyebrow">Choose your ritual</p><h2>Find your kind of good.</h2></div><p className="section-copy">Start with one box or make it a monthly habit. Every collection is ready to fit into real life.</p></div>
        <div className="catalog-toolbar"><div className="category-tabs" role="tablist" aria-label="box categories">{categories.map((category) => <button className={activeCategory === category ? 'category-tab active' : 'category-tab'} key={category} onClick={() => changeCategory(category)} role="tab" aria-selected={activeCategory === category}>{category}</button>)}</div><span className="result-count">{filteredBoxes.length} boxes</span></div>
        <div className="box-grid">{visibleBoxes.map((box) => <article className="box-card" key={box.id}><div className="box-image" style={{ backgroundImage: `url(${box.image})` }}><span className="box-category">{box.category}</span><button className="heart-btn" aria-label={`Save ${box.title}`}>♡</button></div><div className="box-details"><div className="box-title-row"><h3>{box.title}</h3><strong>KSh {box.price}</strong></div><p>{box.description}</p><button className="add-btn" onClick={() => setCart((currentCart) => [...currentCart, box])}>Add to box <span aria-hidden="true">+</span></button></div></article>)}</div>
        <div className="pagination" aria-label="box pagination"><span>Page {page} of {totalPages}</span><div><button disabled={page === 1} onClick={() => setPage((currentPage) => currentPage - 1)} aria-label="Previous page">←</button><button disabled={page === totalPages} onClick={() => setPage((currentPage) => currentPage + 1)} aria-label="Next page">→</button></div></div>
      </section>

      <section className="how-section" id="how-it-works"><p className="eyebrow">A softer way to shop</p><h2>Choose well. Feel good. Repeat.</h2><p>Build a box around the rituals you already have, then let Moringa Box handle the thoughtful restock.</p></section>

      {cartOpen && <div className="cart-overlay" role="presentation" onClick={() => setCartOpen(false)}><aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping cart" onClick={(event) => event.stopPropagation()}><div className="drawer-heading"><div><p className="eyebrow">Your selection</p><h2>Your box</h2></div><button className="close-btn" onClick={() => setCartOpen(false)} aria-label="Close cart">×</button></div>{cart.length === 0 ? <p className="cart-empty">Your box is empty. Add a ritual to get started.</p> : <div className="cart-items">{cart.map((box, index) => <div className="cart-item" key={`${box.id}-${index}`}><span>{box.title}</span><strong>KSh {box.price}</strong></div>)}</div>}<div className="cart-total"><span>Total</span><strong>KSh {cartTotal}</strong></div><button className="primary-btn checkout-btn" disabled={cart.length === 0}>Continue to checkout</button></aside></div>}
    </main>
  );
}

export default App;
