import React, { useState, useEffect } from 'react';
import '../styles/NavBar.css';

const sections = [
  { id: 'architecture', label: 'Architecture' },
  { id: 'performance',  label: 'Performance'  },
  { id: 'roadmap',      label: 'Roadmap'       },
  { id: 'domains',      label: 'Domains'       },
  { id: 'trail',        label: 'Cognition Trail'},
];

function NavBar() {
  const [active, setActive]       = useState('');
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);

      let current = '';
      sections.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 100) current = id;
      });
      setActive(current);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMenuOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner">

        <button className="navbar__logo" onClick={scrollToTop}>
          <span className="navbar__logo-gen">GEN</span>
          <span className="navbar__logo-dash">-</span>
          <span className="navbar__logo-two">2</span>
        </button>

        <ul className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
          {sections.map(({ id, label }) => (
            <li key={id}>
              <button
                className={`navbar__link ${active === id ? 'navbar__link--active' : ''}`}
                onClick={() => scrollTo(id)}
              >
                {label}
                {active === id && <span className="navbar__link-dot" />}
              </button>
            </li>
          ))}
        </ul>

        <div className="navbar__badge">Confidential</div>

        <button
          className={`navbar__burger ${menuOpen ? 'navbar__burger--open' : ''}`}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>

      </div>
    </nav>
  );
}

export default NavBar;
