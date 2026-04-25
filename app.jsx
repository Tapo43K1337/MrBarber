/* global React, ReactDOM */
const { useState: useStateApp, useEffect: useEffectApp, useCallback: useCallbackApp } = React;

/** /record — запис, /about, /locations, … — секції лендінгу */
const PATH_SECTION = {
  about: 'about',
  locations: 'locations',
  services: 'services',
  masters: 'masters',
  gallery: 'gallery',
  reviews: 'reviews',
  contacts: 'contacts',
};

/** Префікс деплою (напр. /MrBarber) з __STATIC_BASE__ з sections.jsx — без слеша в кінці */
function appBaseNoSlash() {
  const sb = typeof window !== 'undefined' && window.__STATIC_BASE__;
  if (!sb || sb === '/') return '';
  return String(sb).replace(/\/+$/, '') || '';
}

/** Повний pathname для History API: /about → /MrBarber/about на GitHub Pages */
function appUrl(path) {
  const base = appBaseNoSlash();
  const p = !path || path === '/' || path === '' ? '/' : (path.startsWith('/') ? path : `/${path}`);
  if (!base) return p === '/' ? '/' : p;
  if (p === '/') return `${base}/`;
  return `${base}${p}`;
}

function normPath(u) {
  return (u || '/').replace(/\/$/, '') || '/';
}

function isHomePathname() {
  const cur = normPath(window.location.pathname);
  const base = appBaseNoSlash();
  if (!base) return cur === '/' || cur === '';
  const h = normPath(`${base}/`);
  return cur.toLowerCase() === h.toLowerCase() || cur.toLowerCase() === base.toLowerCase();
}

/** Логічний шлях без префікса репозиторію */
function stripAppBase(pathname) {
  const base = appBaseNoSlash();
  if (!base) return pathname || '/';
  const esc = base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`^${esc}`, 'i');
  if (!re.test(pathname || '')) return pathname || '/';
  let rest = (pathname || '').replace(re, '');
  if (!rest || rest === '') return '/';
  if (!rest.startsWith('/')) rest = `/${rest}`;
  return rest;
}

function isBookPath() {
  const logical = normPath(stripAppBase(window.location.pathname || '/'));
  return /\/record$/i.test(logical) || logical.toLowerCase() === '/record';
}

function fromPath() {
  let p = normPath(stripAppBase(window.location.pathname || '/'));
  if (p.toLowerCase() === '/index.html') p = '/';
  if (/\/index\.html$/i.test(p)) p = p.replace(/\/index\.html$/i, '') || '/';
  const m = p.match(/\/([a-z0-9-]+)(?:\/)?$/i);
  const key = m ? m[1].toLowerCase() : '';
  if (key === 'record') return { type: 'book' };
  if (PATH_SECTION[key]) return { type: 'section', id: PATH_SECTION[key] };
  if (p === '' || p === '/') return { type: 'home' };
  return { type: 'home' };
}

function App() {
  const [bookOpen, setBookOpen] = useStateApp(false);
  const [initial, setInitial] = useStateApp(null);

  const openBook = useCallbackApp((loc = null, service = null, master = null) => {
    setInitial({ loc, service, master });
    setBookOpen(true);
    if (!isBookPath()) {
      try {
        window.history.pushState({ book: 1 }, '', appUrl('/record'));
      } catch (e) {
        /* file:// or restricted */
      }
    }
  }, []);

  const closeBook = useCallbackApp(() => {
    if (isBookPath()) {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        try {
          window.history.replaceState(null, '', appUrl('/'));
        } catch (e) { /* */ }
        setBookOpen(false);
      }
    } else {
      setBookOpen(false);
    }
  }, []);

  const navigate = useCallbackApp(
    (path) => {
      if (path === '/record' || path === 'record') {
        openBook();
        return;
      }
      if (path === '' || path === null || path === undefined) {
        try {
          if (isBookPath() || !isHomePathname()) {
            window.history.pushState(null, '', appUrl('/'));
          }
        } catch (e) { /* */ }
        if (bookOpen) setBookOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const c = path.startsWith('/') ? path : `/${path}`;

      if (bookOpen) setBookOpen(false);

      if (c === '/' || c === '/top' || c === '/home') {
        try {
          const homeU = appUrl('/');
          if (isBookPath() || normPath(homeU) !== normPath(window.location.pathname)) {
            window.history.pushState(null, '', homeU);
          }
        } catch (e) { /* */ }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const targetU = appUrl(c);
      if (normPath(targetU) === normPath(window.location.pathname)) {
        const f = fromPath();
        if (f.type === 'section' && f.id) {
          document.getElementById(f.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return;
      }

      try {
        window.history.pushState(null, '', targetU);
      } catch (e) { /* */ }
      const last = c
        .replace(/\/$/, '')
        .split('/')
        .filter(Boolean)
        .pop() || '';
      const secId = PATH_SECTION[last];
      if (secId) {
        requestAnimationFrame(() =>
          document.getElementById(secId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        );
      }
    },
    [bookOpen, openBook]
  );

  useEffectApp(() => {
    const sync = () => {
      const f = fromPath();
      if (f.type === 'book') {
        setBookOpen(true);
        return;
      }
      setBookOpen(false);
      if (f.type === 'section' && f.id) {
        setTimeout(
          () => document.getElementById(f.id)?.scrollIntoView({ block: 'start', behavior: 'auto' }),
          0
        );
      } else if (f.type === 'home') {
        window.scrollTo(0, 0);
      }
    };
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  return (
    <React.Fragment>
      <div className="status">
        <span className="live" />
        Сьогодні вільно: 7 вікон — Воскресенська, 20 · 5 — просп. Яворницького, 20
      </div>
      <NavComponent onNavigate={navigate} />
      <Hero onBook={() => openBook()} />
      <About />
      <Locations onBook={(locId) => openBook(locId)} />
      <Gallery />
      <Services onBook={(loc, svc) => openBook(loc, svc)} />
      <Masters onBook={(loc, svc, mst) => openBook(loc, svc, mst)} />
      <Reviews />
      <Footer onNavigate={navigate} />
      <FAB onBook={() => openBook()} />
      <BookingModal open={bookOpen} onClose={closeBook} initial={initial} />
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
