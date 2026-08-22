import { useState } from "react";
import Dither from "../components/Dither";
import "./LoginPage.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");

  const submit = (event) => {
    event.preventDefault();
    if (!email || password.length < 6) {
      setNotice("Use a valid email and a password with at least 6 characters.");
      return;
    }
    setNotice("Welcome back. Your account is ready.");
  };

  return (
    <main className="login-page">
      <Dither waveColor={[0.23, 0.55, 0.34]} waveSpeed={0.08} pixelSize={4} />
      <div className="login-page-shade" />
      <a className="login-back" href="/">← Moringa Box</a>
      <section className="login-card" aria-labelledby="login-page-title">
        <span className="brand-mark login-page-mark">M</span>
        <p className="eyebrow">Welcome back</p>
        <h1 id="login-page-title">Your good things, together.</h1>
        <p className="login-page-copy">Sign in to keep your saved boxes and everyday rituals close.</p>
        <form onSubmit={submit} className="login-page-form">
          <label htmlFor="page-login-email">Email address</label>
          <input id="page-login-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" />
          <label htmlFor="page-login-password">Password</label>
          <input id="page-login-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" autoComplete="current-password" />
          <button type="submit" className="login-page-submit">Sign in</button>
        </form>
        {notice && <p className="login-page-notice" role="status">{notice}</p>}
        <p className="login-page-footer">New to Moringa Box? <a href="mailto:hello@moringabox.example">Get in touch</a></p>
      </section>
    </main>
  );
}
