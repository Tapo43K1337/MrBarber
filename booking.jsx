/* global React */
const { useState: useStateB, useEffect: useEffectB, useMemo: useMemoB } = React;

const STEPS = [
  { id:1, label:'Філіал' },
  { id:2, label:'Майстер' },
  { id:3, label:'Послуга' },
  { id:4, label:'Дата' },
  { id:5, label:'Час' },
  { id:6, label:'Контакти' },
  { id:7, label:'Підтвердження' },
];

const TIME_SLOTS = ['10:00','10:45','11:30','12:15','13:00','13:45','14:30','15:15','16:00','16:45','17:30','18:15','19:00'];
const TAKEN = new Set(['11:30','13:45','17:30','19:00']);
const MONTHS = ['січень','лютий','березень','квітень','травень','червень','липень','серпень','вересень','жовтень','листопад','грудень'];
const DOW = ['ПН','ВТ','СР','ЧТ','ПТ','СБ','НД'];

function Calendar({ value, onChange }) {
  const [view, setView] = useStateB(() => {
    const d = new Date(); d.setDate(1); return d;
  });
  const monthDays = useMemoB(() => {
    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    const last = new Date(view.getFullYear(), view.getMonth()+1, 0);
    const startOffset = (first.getDay() + 6) % 7;
    const days = [];
    for (let i=0;i<startOffset;i++) days.push(null);
    for (let i=1;i<=last.getDate();i++) days.push(new Date(view.getFullYear(), view.getMonth(), i));
    while (days.length % 7) days.push(null);
    return days;
  }, [view]);
  const today = new Date(); today.setHours(0,0,0,0);
  const sameDay = (a,b) => a && b && a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();

  return (
    <div className="cal">
      <div className="cal-head">
        <div className="cal-month">{MONTHS[view.getMonth()].charAt(0).toUpperCase() + MONTHS[view.getMonth()].slice(1)} {view.getFullYear()}</div>
        <div className="cal-nav">
          <button onClick={() => setView(new Date(view.getFullYear(), view.getMonth()-1, 1))}>‹</button>
          <button onClick={() => setView(new Date(view.getFullYear(), view.getMonth()+1, 1))}>›</button>
        </div>
      </div>
      <div className="cal-grid">
        {DOW.map(d => <div key={d} className="cal-dow">{d}</div>)}
        {monthDays.map((d, i) => {
          if (!d) return <div key={i} />;
          const past = d < today;
          const isToday = sameDay(d, today);
          const isSel = sameDay(d, value);
          return (
            <button
              key={i}
              className={`cal-day ${past?'dim':''} ${isToday?'today':''} ${isSel?'sel':''}`}
              disabled={past}
              onClick={() => !past && onChange(d)}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BookingModal({ open, onClose, initial }) {
  const [step, setStep] = useStateB(1);
  const [data, setData] = useStateB({ loc:null, master:null, service:null, date:null, time:null, name:'', phone:'' });

  useEffectB(() => {
    if (open) {
      setStep(1);
      setData({
        loc: initial?.loc || null,
        master: initial?.master || null,
        service: initial?.service || null,
        date:null, time:null, name:'', phone:'',
      });
      // перехід тільки якщо вже є філіал (з картки локації) або майстер (з блоку команди) — послуга з прайсу не пропускає крок 1
      if (initial?.loc && !initial?.master && !initial?.service) setStep(2);
      if (initial?.master) setStep(3);
    }
  }, [open]);

  if (!open) return null;

  const sel = (k, v) => setData(d => ({ ...d, [k]: v }));
  const next = () => setStep(s => Math.min(7, s+1));
  const prev = () => setStep(s => Math.max(1, s-1));

  const canNext = (() => {
    if (step===1) return !!data.loc;
    if (step===2) return !!data.master;
    if (step===3) return !!data.service;
    if (step===4) return !!data.date;
    if (step===5) return !!data.time;
    if (step===6) return data.name.trim().length>1 && data.phone.replace(/\D/g,'').length>=9;
    return true;
  })();

  const svc = window.SERVICES.find(s => s.id === data.service);
  const mst = window.MASTERS.find(m => m.id === data.master);
  const loc = window.LOCATIONS.find(l => l.id === data.loc);

  return (
    <div className="modal-back" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose} aria-label="Закрити">✕</button>
        <div className="modal-head">
          <div className="modal-eyebrow">// Онлайн-запис</div>
          <div className="modal-title">
            {step===1 && 'Оберіть філіал'}
            {step===2 && 'Оберіть майстра'}
            {step===3 && 'Оберіть послугу'}
            {step===4 && 'Оберіть дату'}
            {step===5 && 'Оберіть час'}
            {step===6 && 'Ваші контакти'}
            {step===7 && 'Запис підтверджено'}
          </div>
        </div>
        {step !== 7 && (
          <>
            <div className="steps steps--desktop">
              {STEPS.slice(0, 6).map((s) => (
                <div key={s.id} className={`step ${s.id === step ? 'active' : ''} ${s.id < step ? 'done' : ''}`}>
                  <span className="stnum">{s.id < step ? '✓' : s.id}</span>
                  {s.label}
                </div>
              ))}
            </div>
            <nav
              className="steps steps--mob"
              aria-label={`Крок ${step} з 7: ${STEPS[step - 1].label}${step < 7 ? `, далі ${STEPS[step].label}` : ''}`}
            >
              <span className="steps-mob-current">
                <span className="steps-mob-num steps-mob-num--on">{step}</span>
                <span className="steps-mob-lbl">{STEPS[step - 1].label}</span>
              </span>
              {step < 7 && (
                <>
                  <span className="steps-mob-arrow" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path
                        d="M5 12h14m0 0-5-5m5 5-5 5"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="steps-mob-next">
                    <span className="steps-mob-num steps-mob-num--off">{step + 1}</span>
                    <span className="steps-mob-lbl">{STEPS[step].label}</span>
                  </span>
                </>
              )}
            </nav>
          </>
        )}
        <div className={`modal-body${step === 3 ? ' modal-body--svcStep' : ''}`}>
          {step===1 && (
            <div className="choose-grid">
              {window.LOCATIONS.map(l => (
                <button key={l.id} className={`choose ${data.loc===l.id?'sel':''}`} onClick={() => sel('loc', l.id)}>
                  <div className="choose-tag">{l.tag}</div>
                  <h4>{l.name}</h4>
                  <p>{l.address}</p>
                  <div className="meta"><span>{l.hours}</span><span>{l.phone}</span></div>
                </button>
              ))}
            </div>
          )}
          {step===2 && (
            <div className="master-cards">
              {window.MASTERS.map(m => (
                <button key={m.id} className={`mcard ${data.master===m.id?'sel':''}`} onClick={() => sel('master', m.id)}>
                  <div className="mcard-img">
                    <img
                      src={typeof window !== 'undefined' && window.assetPath ? window.assetPath(m.img) : m.img}
                      alt={m.name}
                    />
                  </div>
                  <div className="mcard-info">
                    <h4>{m.name}</h4>
                    <p>{m.spec}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {step===3 && (
            <div className="svc-list">
              {window.SERVICES.map(s => (
                <button key={s.id} className={`svc ${data.service===s.id?'sel':''}`} onClick={() => sel('service', s.id)}>
                  <div>
                    <h4>{s.name}</h4>
                    <p>{s.desc}</p>
                  </div>
                  <div className="price">{s.price.toLocaleString('uk-UA')}<em>₴</em></div>
                </button>
              ))}
            </div>
          )}
          {step===4 && (
            <Calendar value={data.date} onChange={(d) => sel('date', d)} />
          )}
          {step===5 && (
            <div>
              <div className="mono" style={{marginBottom:12}}>Вільні слоти · {data.date && data.date.toLocaleDateString('uk-UA')}</div>
              <div className="slots">
                {TIME_SLOTS.map(t => (
                  <button key={t} className={`slot ${TAKEN.has(t)?'taken':''} ${data.time===t?'sel':''}`} disabled={TAKEN.has(t)} onClick={() => sel('time', t)}>{t}</button>
                ))}
              </div>
            </div>
          )}
          {step===6 && (
            <div>
              <div className="field">
                <label>Ім’я</label>
                <input type="text" placeholder="Як до вас звертатись?" value={data.name} onChange={e => sel('name', e.target.value)} />
              </div>
              <div className="field">
                <label>Телефон</label>
                <input type="tel" placeholder="+380 …" value={data.phone} onChange={e => sel('phone', e.target.value)} />
              </div>
              <div className="summary" style={{marginTop:24}}>
                <h4>Підсумок</h4>
                <div className="summary-rows">
                  <div className="summary-row"><span className="k">Філіал</span><span className="v">{loc?.name}</span></div>
                  <div className="summary-row"><span className="k">Майстер</span><span className="v">{mst?.name}</span></div>
                  <div className="summary-row"><span className="k">Послуга</span><span className="v">{svc?.name}</span></div>
                  <div className="summary-row"><span className="k">Дата</span><span className="v">{data.date?.toLocaleDateString('uk-UA')}</span></div>
                  <div className="summary-row"><span className="k">Час</span><span className="v">{data.time}</span></div>
                </div>
                <div className="summary-total"><span>Разом</span><span>{svc != null ? svc.price.toLocaleString('uk-UA') : ''} ₴</span></div>
              </div>
            </div>
          )}
          {step===7 && (
            <div className="confirm">
              <div className="confirm-mark">✓</div>
              <h3>Готово, {data.name}!</h3>
              <p>
                Чекаємо вас <strong style={{color:'var(--paper)'}}>{data.date?.toLocaleDateString('uk-UA')}</strong> о <strong style={{color:'var(--paper)'}}>{data.time}</strong>.
                Ми перетелефонуємо на {data.phone}, щоб підтвердити запис. Якщо плани зміняться — зателефонуйте, зрозуміємо.
              </p>
              <div className="confirm-meta">
                {loc?.name} · {mst?.name} · {svc?.name}
              </div>
            </div>
          )}
        </div>
        <div className="modal-foot">
          {step > 1 && step < 7 && <button className="btn btn-ghost" onClick={prev}>← Назад</button>}
          {step === 1 && <span className="mono" style={{color:'var(--paper-dim)'}}>Середній час запису · 30 сек</span>}
          {step === 7 ? (
            <button className="btn btn-red" style={{marginLeft:'auto'}} onClick={onClose}>Закрити</button>
          ) : (
            <button
              className="btn btn-red"
              style={{marginLeft:'auto', opacity: canNext?1:0.4, pointerEvents: canNext?'auto':'none'}}
              onClick={next}
              disabled={!canNext}
            >
              {step === 6 ? 'Підтвердити запис →' : 'Далі →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

window.BookingModal = BookingModal;
