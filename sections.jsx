/* global React */
const { useState, useEffect, useRef } = React;

/** База статики: каталог, де лежить sections.jsx (напр. /MrBarber/ на GitHub Pages) */
(function initStaticBase() {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  try {
    const el = document.querySelector('script[src*="sections.jsx"]');
    const raw = el && (el.src || el.getAttribute('src'));
    if (!raw) return;
    const u = new URL(raw, window.location.href);
    const path = u.pathname;
    const i = path.lastIndexOf('/');
    window.__STATIC_BASE__ = i <= 0 ? '/' : path.slice(0, i + 1);
  } catch (e) {
    window.__STATIC_BASE__ = '/';
  }
})();

/** Шлях до assets: спочатку від каталогу sections.jsx (правильно для …github.io/Repo/…) */
function assetPath(rel) {
  if (rel == null || rel === '') return rel;
  if (typeof rel !== 'string') return rel;
  if (/^https?:\/\//i.test(rel) || rel.startsWith('//') || rel.startsWith('data:')) return rel;
  const clean = rel.replace(/^\//, '');
  const sb = typeof window !== 'undefined' && window.__STATIC_BASE__;
  if (sb && sb !== '/') {
    return sb.endsWith('/') ? sb + clean : `${sb}/${clean}`;
  }
  const p = (typeof window !== 'undefined' && window.location && window.location.pathname) || '/';
  const segs = p.split('/').filter(Boolean);
  const routeSeg = { record: 1, about: 1, locations: 1, services: 1, masters: 1, gallery: 1, reviews: 1, contacts: 1, top: 1 };
  if (segs.length) {
    const last = segs[segs.length - 1];
    const key = (last || '').toLowerCase();
    if (/\.(html?|jsx)$/i.test(last)) segs.pop();
    else if (routeSeg[key]) segs.pop();
  }
  const base = segs.length ? `/${segs.join('/')}/` : '/';
  return base + clean;
}
if (typeof window !== 'undefined') window.assetPath = assetPath;

// ===== Logo (recreated from provided red striped mark) =====
const LogoMark = ({ size = 90, color = '#E10600' }) => (
  <svg width={size} height={size * 348 / 456} viewBox="0 0 456 348" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g fill={color}>
      <polygon points="180,0 280,0 220,90 120,90" />
      <polygon points="200,110 300,110 240,200 140,200" />
      <polygon points="220,220 320,220 260,310 160,310" />
    </g>
  </svg>
);

// ===== Real logo image =====
// у шапці (nav-logo-asset) розмір задає тільки CSS, щоб height:auto з інлайну не ламав max-height
const LogoImg = ({ size = 90, className = '', alt, role }) => {
  const isNavBar = /(^|\s)nav-logo-asset(\s|$)/.test(className);
  return (
    <img
      src={assetPath('assets/logo.png')}
      alt={alt !== undefined ? alt : 'MR. BARBER, барбершоп у Дніпрі'}
      className={className || undefined}
      role={role}
      style={isNavBar ? undefined : { width: size, height: 'auto' }}
    />
  );
};

// ===== Stripes accent =====
const Stripes = ({ count = 3, size = 'md' }) => (
  <span className={`stripes ${size}`}>
    {Array.from({ length: count }).map((_, i) => <i key={i} />)}
  </span>
);

// ===== DATA =====
const SOCIAL = {
  instagram: 'https://www.instagram.com/mr.barberdp/',
  whatsapp: 'https://wa.me/380971623913',
  telegram: 'https://t.me/+380971623913',
  viber: 'viber://chat?number=380971623913',
};

/** Simple Icons: офіційні SVG, фірмові кольори (https://github.com/simple-icons/simple-icons) */
const BRAND_SVG = (slug, colorHex) =>
  `https://cdn.simpleicons.org/${encodeURIComponent(slug)}/${colorHex}`;

const LOCATIONS = [
  {
    id: 'dnp-1',
    tag: 'Філіал 01',
    name: 'вул. Воскресенська, 20',
    address: 'м. Дніпро, вул. Воскресенська, 20',
    phone: '+380 97 162 39 13',
    hours: '10:00 — 20:00 · пн — сб',
    map: 'https://maps.app.goo.gl/uReFsQZs1kunjtTb9',
    coord: '48.4655° N, 35.0396° E',
    photo: 'assets/filial1.jpg',
  },
  {
    id: 'dnp-2',
    tag: 'Філіал 02',
    name: 'просп. Дмитра Яворницького, 20',
    address: 'м. Дніпро, просп. Дмитра Яворницького, 20',
    phone: '+380 97 162 39 13',
    hours: '10:00 — 20:00 · пн — сб',
    map: 'https://www.google.com/maps/search/?api=1&query=48.45768400438368%2C35.06076690572978',
    coord: '48.4577° N, 35.0608° E',
    /* фото: покладіть файл у MrBarber/assets/ і змініть ім’я/розширення за потреби */
    photo: 'assets/filial-02.jpg',
  },
];

const SERVICES = [
  { id: 'strizka',            num: '01', name: 'Стрижка',                            desc: '60 хв',   price: 800,  time: 60 },
  { id: 'strizka-mash',      num: '02', name: 'Стрижка машинкою',                    desc: '60 хв',   price: 600,  time: 60 },
  { id: 'dytacha',            num: '03', name: 'Дитяча стрижка (до 12 років)',     desc: '45 хв',   price: 600,  time: 45 },
  { id: 'boroda',             num: '04', name: 'Стрижка бороди',                    desc: '45 хв',   price: 500,  time: 45 },
  { id: 'strizka-boroda',     num: '05', name: 'Стрижка + стрижка бороди',         desc: '90 хв',   price: 1000, time: 90 },
  { id: 'mash-boroda',        num: '06', name: 'Стрижка машинкою + стрижка бороди',  desc: '75 хв',   price: 800,  time: 75 },
  { id: 'strizka-dytacha',    num: '07', name: 'Стрижка + дитяча стрижка',         desc: '90 хв',   price: 1100, time: 90 },
  { id: 'strizka-2dytjachi',  num: '08', name: 'Стрижка + дві дитячі стрижки',      desc: '120 хв',  price: 1500, time: 120 },
  { id: 'holinnia',           num: '09', name: 'Гоління',                           desc: '45 хв',   price: 600,  time: 45 },
  { id: 'strizka-holinnia',   num: '10', name: 'Стрижка + гоління',                 desc: '90 хв',   price: 1000, time: 90 },
];

const MASTERS = [
  { id: 'ilya', num: '01', name: 'Ілля', img: 'assets/master-2.jpg', spec: 'Барбер', exp: '5+ років', cuts: '2000', locationIds: ['dnp-1', 'dnp-2'] },
  { id: 'sergey', num: '02', name: 'Сергій', img: 'assets/master-3.jpg', spec: 'Барбер', exp: '5+ років', cuts: '5000' },
  { id: 'dmytro', num: '03', name: 'Дмитро', img: 'assets/master-1.jpg', spec: 'Барбер', exp: '5+ років', cuts: '3000' },
];

function masterBranchLine(m) {
  const ids = Array.isArray(m.locationIds) && m.locationIds.length ? m.locationIds : [LOCATIONS[0].id];
  return ids
    .map((id) => {
      const l = LOCATIONS.find((x) => x.id === id);
      return l ? `${l.tag} · ${l.name}` : '';
    })
    .filter(Boolean)
    .join(' / ');
}

const REVIEWS = [
  { name: 'Олександр К.', when: '2 тиж. тому', text: 'Ходжу давно — жодного разу не підвели. Стрижка саме така, як просив: уважно до деталей, без метушні.' },
  { name: 'Артем С.',      when: '1 міс. тому', text: 'Перший раз на гоління — тепер це ритуал. Атмосфера, музика, кава. Не просто барбершоп, а нормальне чоловіче місце.' },
  { name: 'Сергій П.',    when: '3 тиж. тому',  text: 'Бороду зробили за один візит так, як вдома за пів року не вийшло. Дякую команді.' },
];

// ===== NAV =====
const NAV_LINKS = [
  { path: '/about', label: 'Про нас' },
  { path: '/locations', label: 'Локації' },
  { path: '/services', label: 'Послуги' },
  { path: '/masters', label: 'Майстри' },
  { path: '/gallery', label: 'Галерея' },
  { path: '/contacts', label: 'Контакти' },
];

function Nav({ onBook, onNavigate }) {
  const [shrunk, setShrunk] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const onScroll = () => setShrunk(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const p = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = p; };
  }, [menuOpen]);

  useEffect(() => {
    const cl = 'nav-menu-open';
    if (menuOpen) document.body.classList.add(cl);
    else document.body.classList.remove(cl);
    return () => document.body.classList.remove(cl);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 901px)');
    const h = () => { if (mq.matches) setMenuOpen(false); };
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  return (
    <nav
      className={`nav ${shrunk ? 'shrink' : ''} ${menuOpen ? 'nav--menu-open' : ''}`}
      role="navigation"
    >
      {menuOpen && (
        <div className="nav-mob" id="nav-mobile-menu" role="dialog" aria-modal="true" aria-label="Навігація по сторінці">
          <button
            type="button"
            className="nav-mob-backdrop"
            aria-label="Закрити меню"
            onClick={closeMenu}
          />
          <div className="nav-mob-panel">
            {NAV_LINKS.map((x) => (
              <a
                key={x.path}
                href={x.path}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(x.path);
                  closeMenu();
                }}
              >
                {x.label}
              </a>
            ))}
            <button type="button" className="nav-mob-cta" onClick={() => { closeMenu(); onBook(); }}>
              Онлайн-запис
            </button>
          </div>
        </div>
      )}
      <div className="nav-inner">
        <a
          href="/"
          className="nav-logo"
          aria-label="MR. BARBER, на початок"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/');
            closeMenu();
          }}
        >
          {/* logo.png — лише знак (смужки), слова треба додати окремо */}
          <LogoImg className="nav-logo-asset" size={200} alt="" role="presentation" />
          <span className="nav-logo-text">MR. BARBER</span>
        </a>
        <div className="nav-links">
          {NAV_LINKS.map((x) => (
            <a
              key={x.path}
              href={x.path}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(x.path);
              }}
            >
              {x.label}
            </a>
          ))}
        </div>
        <button
          type="button"
          className={`nav-burger${menuOpen ? ' nav-burger--open' : ''}`}
          aria-label={menuOpen ? 'Закрити меню' : 'Відкрити меню'}
          aria-expanded={menuOpen}
          aria-controls="nav-mobile-menu"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
}

// ===== HERO =====
function Hero({ onBook }) {
  return (
    <section className="hero" id="top">
      <div className="hero-bg" />
      <div className="hero-grain" />
      <div className="hero-inner">
        <div className="hero-logo"><LogoImg size={160} /></div>
        <h1 className="display hero-title">
          MR.<span className="red">BARBER</span>
        </h1>
        <p className="hero-wordmark" aria-label="Haircut and shave">Haircut &amp; Shave</p>
        <div className="hero-sub">— Стрижка та гоління · з 2017 —</div>
      </div>
    </section>
  );
}

// ===== ABOUT =====
function About() {
  return (
    <section className="about section-pad" id="about">
      <div className="shell">
        <div className="about-grid">
          <div>
            <div className="eyebrow">// 01 — Про нас</div>
            <h2 className="display about-h" style={{marginTop:24}}>
              Не просто<br/>стрижка.<br/><em>Ритуал.</em>
            </h2>
            <p className="about-p">
              MR. BARBER — простір для тих, хто цінує деталі.
              Гарний віскі, перевірений інструмент, музика, розмови по суті — і стрижка, до якої нема за чим причепитися.
            </p>
            <p className="about-p">
              Працюємо з 2017 року. Два філіали в Дніпрі: Воскресенська і проспект Яворницького — ті самі стандарти та увага до деталей.
            </p>
            <div className="about-stats">
              <div><div className="num">9</div><div className="lbl">Років у справі</div></div>
              <div><div className="num">02</div><div className="lbl">Філіали</div></div>
              <div><div className="num">4.9</div><div className="lbl">Рейтинг Google</div></div>
            </div>
          </div>
          <div className="about-feats">
            {[
              { n:'01', t:'Досвідчені майстри', d:'Кожен — мінімум 5 років біля крісла. Постійне навчання та розвиток.' },
              { n:'02', t:'Інструмент', d:'Wahl, Andis, Babyliss. Стерильні леза. Авторські засоби.' },
              { n:'03', t:'Атмосфера', d:'Темне дерево, шкіряні крісла, вініловий програвач.' },
              { n:'04', t:'Без поспіху', d:'Стрижка не менше 45 хвилин. Жодних конвеєрів.' },
            ].map(f => (
              <div className="about-feat" key={f.n}>
                <div className="feat-num">{f.n}</div>
                <div>
                  <div className="feat-title">{f.t}</div>
                  <div className="feat-desc">{f.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ===== LOCATIONS =====
function LocationCard({ loc, onBook }) {
  return (
    <div className="loc-card">
      <div className="loc-photo">
        {loc.photo ? (
          <img
            className="loc-photo-img"
            src={assetPath(loc.photo)}
            alt={`MR. BARBER, ${loc.address}`}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="imgish" data-label={`Інтер’єр · ${loc.name}`} style={{ position: 'absolute', inset: 0 }} />
        )}
        <div className="loc-tag">{loc.tag}</div>
      </div>
      <div className="loc-body">
        <div>
          <div className="mono">{loc.coord}</div>
          <div className="loc-name">{loc.name}</div>
        </div>
        <div className="loc-rows">
          <div className="loc-row"><span className="k">Адреса</span><span className="v">{loc.address}</span></div>
          <div className="loc-row"><span className="k">Телефон</span><a className="v" href={`tel:${loc.phone.replace(/[\s-]/g, '')}`}>{loc.phone}</a></div>
          <div className="loc-row"><span className="k">Години</span><span className="v">{loc.hours}</span></div>
        </div>
        <div className="loc-actions">
          <a className="btn btn-ghost" href={loc.map} target="_blank" rel="noreferrer">↗ Маршрут</a>
          <button className="btn btn-red" onClick={() => onBook(loc.id)}>Записатися</button>
        </div>
      </div>
    </div>
  );
}

function Locations({ onBook }) {
  return (
    <section className="locations section-pad" id="locations">
      <div className="shell">
        <div className="section-head">
          <div>
            <div className="eyebrow">// 02 — Локації</div>
            <h2 style={{marginTop:18}}>Два філіали в<br/><span className="red">Дніпрі.</span></h2>
          </div>
          <p className="lead">
            Воскресенська і просп. Дмитра Яворницького, 20. Один телефон і месенджери — оберіть зручну адресу та записуйтеся.
          </p>
        </div>
        <div className="loc-grid">
          {LOCATIONS.map(l => <LocationCard key={l.id} loc={l} onBook={onBook} />)}
        </div>
      </div>
    </section>
  );
}

// ===== GALLERY =====
// 8 плиток, .gal-grid--eight. Фото філіалу 01 — assets/filial1.jpg (поза /gallery), у блоці атмосфери не підключається.
// objectPosition: за потреби
const GALLERY = [
  { id: 'a', src: 'assets/gallery/01-mural.jpg',  tag: 'Мурал · зал' },
  { id: 'b', src: 'assets/gallery/3foto.jpg',  tag: 'Світло в залі', objectPosition: '50% 50%' },
  { id: 'c', src: 'assets/gallery/5-facede.jpg',  tag: 'Вітрина косметики' },
  { id: 'd', src: 'assets/gallery/04-facade.jpg',  tag: 'Зал' },
  { id: 'f', src: 'assets/gallery/7-facade.jpg',  tag: 'У кріслі' },
  { id: 'g', src: 'assets/gallery/8-facade.jpg',  tag: 'Деталь · бренд' },
  { id: 'h', src: 'assets/gallery/9-facade.jpg',  tag: 'Інструменти' },
  { id: 'i', src: 'assets/gallery/6-facade.jpg', tag: 'Це ракурс', objectPosition: '50% 45%' },
];

function Gallery() {
  const [lightbox, setLightbox] = useState(null);
  const mobileRows = [GALLERY.slice(0, 2), GALLERY.slice(2, 4), GALLERY.slice(4, 6)];

  useEffect(() => {
    if (!lightbox) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(null);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [lightbox]);

  return (
    <section className="gallery section-pad" id="gallery">
      <div className="shell">
        <div className="section-head">
          <div>
            <div className="eyebrow">// 04 — Галерея</div>
            <h2 style={{ marginTop: 18 }}>Атмосфера.<br />У кадрі.</h2>
          </div>
          <p className="lead">Інтер’єр, робота майстрів, буденні моменти. Фото — наш салон.</p>
        </div>
        <div className="gal-grid gal-grid--eight">
          {GALLERY.map((it) => (
            <div
              className="gal-item"
              key={it.id}
              data-tag={it.tag}
              role="button"
              tabIndex={0}
              aria-label={`Розгорнути фото: ${it.tag}`}
              onClick={() => setLightbox({ src: it.src, tag: it.tag })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setLightbox({ src: it.src, tag: it.tag });
                }
              }}
            >
              <img
                src={assetPath(it.src)}
                alt=""
                loading="lazy"
                decoding="async"
                draggable={false}
                style={it.objectPosition ? { objectPosition: it.objectPosition } : undefined}
              />
            </div>
          ))}
        </div>
        <div className="gal-mobile-carousel" aria-label="Мобільна карусель галереї">
          {mobileRows.map((row, rowIdx) => (
            <div
              className="gal-m-row"
              key={`mobile-row-${rowIdx}`}
              data-dir={rowIdx % 2 === 1 ? 'left' : 'right'}
            >
              <div className="gal-m-track">
                {[...row, ...row].map((it, idx) => (
                  <button
                    type="button"
                    className="gal-m-item"
                    key={`${it.id}-${rowIdx}-${idx}`}
                    aria-label={`Розгорнути фото: ${it.tag}`}
                    onClick={() => setLightbox({ src: it.src, tag: it.tag })}
                  >
                    <img
                      src={assetPath(it.src)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      style={it.objectPosition ? { objectPosition: it.objectPosition } : undefined}
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {lightbox && (
        <div
          className="gal-lb"
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.tag}
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="gal-lb-close"
            aria-label="Закрити"
            onClick={() => setLightbox(null)}
          >
            ✕
          </button>
          <figure
            className="gal-lb-figure"
            onClick={(e) => e.stopPropagation()}
          >
            <img className="gal-lb-img" src={assetPath(lightbox.src)} alt={lightbox.tag} />
            <figcaption className="gal-lb-cap">{lightbox.tag}</figcaption>
          </figure>
        </div>
      )}
    </section>
  );
}

// ===== SERVICES =====
function Services({ onBook }) {
  return (
    <section className="services section-pad" id="services">
      <div className="shell">
        <div className="section-head">
          <div>
            <div className="eyebrow">// 05 — Послуги та ціни</div>
            <h2 style={{marginTop:18}}>Прайс.<br/><span className="red">Без сюрпризів.</span></h2>
          </div>
          <p className="lead">Ціни в грн. У вартість входять рушник, косметика, напій на вибір.</p>
        </div>
        <div className="serv-list">
          {SERVICES.map(s => (
            <div className="serv-row" key={s.id} onClick={() => onBook(null, s.id)}>
              <div className="serv-num">{s.num}</div>
              <div className="serv-name">{s.name}</div>
              <div className="serv-desc">{s.desc}</div>
              <div className="serv-price">{s.price.toLocaleString('uk-UA')} <em>₴</em></div>
              <div className="serv-arrow">Записатися</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ===== MASTERS =====
function Masters({ onBook }) {
  return (
    <section className="masters section-pad" id="masters">
      <div className="shell">
        <div className="section-head">
          <div>
            <div className="eyebrow">// 06 — Майстри</div>
            <h2 style={{marginTop:18}}>Команда.<br/>Кожен — майстер.</h2>
          </div>
          <p className="lead">Невелика команда — це свідомо. Ми обираємо, хто працює поруч.</p>
        </div>
        <div className="mast-grid">
          {MASTERS.map(m => (
            <div className="mast" key={m.id}>
              <div className="mast-photo">
                <img src={assetPath(m.img)} alt={m.name} />
                <div className="mast-meta">
                  <div className="mast-num">— Майстер {m.num}</div>
                  <div className="mast-name">{m.name}</div>
                  <div className="mast-spec">{m.spec}</div>
                </div>
              </div>
              <div className="mast-body">
                <div className="mast-row"><span>Досвід</span><strong>{m.exp}</strong></div>
                <div className="mast-row"><span>Стрижок</span><strong>{m.cuts}</strong></div>
                <div className="mast-row mast-row--branch">
                  <span>Філіал</span>
                  <strong>{masterBranchLine(m)}</strong>
                </div>
                <button className="btn btn-ghost mast-cta" onClick={() => onBook(null, null, m.id)}>Записатися до майстра</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ===== REVIEWS =====
function Reviews() {
  return (
    <section className="reviews section-pad" id="reviews">
      <div className="shell">
        <div className="section-head">
          <div>
            <div className="eyebrow">// 07 — Відгуки</div>
            <h2 style={{marginTop:18}}>Що кажуть<br/><span className="red">чоловіки.</span></h2>
          </div>
          <p className="lead">Перевірені відгуки в Google. Жодних ботів, жодних накруток.</p>
        </div>
        <div className="rev-grid">
          {REVIEWS.map((r, i) => (
            <div className="rev" key={i}>
              <div className="rev-stars">★ ★ ★ ★ ★</div>
              <p className="rev-text">«{r.text}»</p>
              <div className="rev-author">
                <div className="rev-avatar">{r.name.charAt(0)}</div>
                <div>
                  <div className="rev-name">{r.name}</div>
                  <div className="rev-when">{r.when}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ===== FOOTER =====
function Footer({ onNavigate }) {
  const go = (e, path) => {
    e.preventDefault();
    if (typeof onNavigate === 'function') onNavigate(path);
    else window.location.assign(path);
  };
  return (
    <footer className="footer" id="contacts">
      <div className="shell">
        <div className="foot-grid">
          <div className="foot-col">
            <div className="foot-logo">MR.<span style={{color:'var(--red)'}}>BARBER</span></div>
            <p style={{marginTop:18,color:'var(--paper-dim)',maxWidth:320}}>Преміальний чоловічий барбершоп.<br/>Дніпро, Україна · з 2017 року.</p>
            <div className="foot-soc">
              <a href={SOCIAL.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" title="Instagram" className="foot-soc-ico">
                <img src={BRAND_SVG('instagram', 'E4405F')} width="22" height="22" alt="" />
              </a>
              <a href={SOCIAL.telegram} target="_blank" rel="noreferrer" aria-label="Telegram" title="Telegram" className="foot-soc-ico">
                <img src={assetPath('assets/telegram.svg')} width="22" height="22" alt="" />
              </a>
              <a href={SOCIAL.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp" title="WhatsApp" className="foot-soc-ico">
                <img src={BRAND_SVG('whatsapp', '25D366')} width="22" height="22" alt="" />
              </a>
              <a href={SOCIAL.viber} aria-label="Viber" title="Viber" className="foot-soc-ico">
                <img src={assetPath('assets/viber.svg')} width="22" height="22" alt="" />
              </a>
            </div>
          </div>
          {LOCATIONS.map(l => (
            <div className="foot-col" key={l.id}>
              <h4>{l.name}</h4>
              <p>{l.address}</p>
              <a href={`tel:${l.phone.replace(/[\s-]/g, '')}`}>{l.phone}</a>
              <p style={{color:'var(--paper-dim)'}}>{l.hours}</p>
            </div>
          ))}
          <div className="foot-col foot-col--menu-desk" aria-label="Навігація по сторінці (десктоп)">
            <h4>Меню</h4>
            <a href="/about" onClick={(e) => go(e, '/about')}>Про нас</a>
            <a href="/services" onClick={(e) => go(e, '/services')}>Послуги</a>
            <a href="/masters" onClick={(e) => go(e, '/masters')}>Майстри</a>
            <a href="/gallery" onClick={(e) => go(e, '/gallery')}>Галерея</a>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2017 — 2026 · MR. BARBER</span>
          <span>Дніпро, Україна · З повагою</span>
        </div>
      </div>
    </footer>
  );
}

// ===== FAB =====
function FAB({ onBook }) {
  const fabRef = useRef(null);

  useEffect(() => {
    const fab = fabRef.current;
    const footer = document.querySelector('footer.footer');
    if (!fab || !footer) return undefined;

    const gap = 16;
    const gapTop = 12;
    const minBottom = 24;
    let raf = 0;

    const tick = () => {
      raf = 0;
      const docEl = document.documentElement;
      const innerH = (window.visualViewport?.height ?? window.innerHeight) || docEl.clientHeight;
      const fh = footer.getBoundingClientRect();
      const B = Math.max(minBottom, innerH - fh.top + gap);
      fab.style.bottom = `${B}px`;
      void fab.offsetHeight;

      const navEl = document.querySelector('nav.nav');
      const fabRect = fab.getBoundingClientRect();
      const navBottom = navEl ? navEl.getBoundingClientRect().bottom : 0;
      const overlapsNav = Boolean(navEl && fabRect.top < navBottom + gapTop);
      const spare = docEl.scrollHeight - innerH;
      const roomToEnd = docEl.scrollHeight - window.scrollY - innerH;
      const nearPageBottom = spare > 100 && roomToEnd <= 56;
      fab.classList.toggle('fab--hide-under-nav', overlapsNav || nearPageBottom);
    };

    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(tick);
    };

    tick();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener('scroll', schedule);
      vv.addEventListener('resize', schedule);
    }
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
    if (ro) ro.observe(footer);

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (vv) {
        vv.removeEventListener('scroll', schedule);
        vv.removeEventListener('resize', schedule);
      }
      if (raf) cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
      fab.classList.remove('fab--hide-under-nav');
      fab.style.bottom = '';
    };
  }, []);

  return (
    <div className="fab" ref={fabRef}>
      <div className="fab-soc">
        <a href={SOCIAL.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" title="Instagram" className="fab-soc-ico">
          <img src={BRAND_SVG('instagram', 'E4405F')} width="22" height="22" alt="" />
        </a>
        <a href={SOCIAL.telegram} target="_blank" rel="noreferrer" aria-label="Telegram" title="Telegram" className="fab-soc-ico">
                <img src={assetPath('assets/telegram.svg')} width="22" height="22" alt="" />
              </a>
              <a href={SOCIAL.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp" title="WhatsApp" className="fab-soc-ico">
                <img src={BRAND_SVG('whatsapp', '25D366')} width="22" height="22" alt="" />
              </a>
              <a href={SOCIAL.viber} aria-label="Viber" title="Viber" className="fab-soc-ico">
                <img src={assetPath('assets/viber.svg')} width="22" height="22" alt="" />
        </a>
      </div>
      <button className="fab-main" onClick={onBook}>
        <span className="dot" />
        Онлайн-запис
      </button>
    </div>
  );
}

window.NavComponent = Nav;
window.Hero = Hero;
window.About = About;
window.Locations = Locations;
window.Gallery = Gallery;
window.Services = Services;
window.Masters = Masters;
window.Reviews = Reviews;
window.Footer = Footer;
window.FAB = FAB;
window.LOCATIONS = LOCATIONS;
window.SOCIAL = SOCIAL;
window.SERVICES = SERVICES;
window.MASTERS = MASTERS;
window.LogoMark = LogoMark;
window.LogoImg = LogoImg;
