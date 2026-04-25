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

function isBookPath() {
  return /\/record\/?$/.test(window.location.pathname);
}

function fromPath() {
  let p = (window.location.pathname || '/').replace(/\/$/, '') || '/';
  if (/\/index\.html$/i.test(p) || p.toLowerCase() === 'index.html') p = '/';
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
        window.history.pushState({ book: 1 }, '', '/record');
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
          window.history.replaceState(null, '', '/');
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
          if (isBookPath() || window.location.pathname !== '/') {
            window.history.pushState(null, '', '/');
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
          if (isBookPath() || c !== window.location.pathname) {
            window.history.pushState(null, '', '/');
          }
        } catch (e) { /* */ }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (c === window.location.pathname) {
        const f = fromPath();
        if (f.type === 'section' && f.id) {
          document.getElementById(f.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return;
      }

      try {
        window.history.pushState(null, '', c);
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
      <NavComponent onBook={() => openBook()} onNavigate={navigate} />
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
