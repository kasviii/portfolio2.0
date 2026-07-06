/* =========================================================
   BYTE — shared companion logic
   Works on any element with class="companion-wrap" containing:
   <img class="companion-base">, <img class="companion-eyes">,
   <img class="companion-expr">, and optionally a .speech-bubble
   ========================================================= */
const BYTE_IMGS = {
  blink:     'assets/character/blink.png',
  closed:    'assets/character/closed.png',
  peek:      'assets/character/peek.png',
  mad:       'assets/character/mad.png',
  surprised: 'assets/character/surprised.png',
  sleepy:    'assets/character/sleepy.png',
};

function mountCompanion(wrap, opts = {}) {
  const eyes = wrap.querySelector('.companion-eyes');
  const expr = wrap.querySelector('.companion-expr');
  const bubble = wrap.querySelector('.speech-bubble');
  let state = 'default', blinkTimer, idleTimer, resetTimer;
  const idleMs = opts.idleMs || 10000;

  function say(text, ms = 1600) {
    if (!bubble) return;
    bubble.textContent = text;
    bubble.classList.add('visible');
    setTimeout(() => bubble.classList.remove('visible'), ms);
  }

  function setState(s) {
    if (resetTimer && s !== 'blink') { clearTimeout(resetTimer); resetTimer = null; }
    state = s;
    if (s === 'default') {
      eyes.style.display = ''; expr.classList.remove('visible');
      scheduleBlink(); startIdle();
    } else {
      if (s !== 'blink') eyes.style.display = 'none';
      if (BYTE_IMGS[s]) { expr.src = BYTE_IMGS[s]; expr.classList.add('visible'); }
    }
  }

  function scheduleBlink() {
    clearTimeout(blinkTimer);
    blinkTimer = setTimeout(doBlink, 3000 + Math.random() * 3000);
  }
  function doBlink() {
    if (state !== 'default') { scheduleBlink(); return; }
    eyes.style.display = 'none'; expr.src = BYTE_IMGS.blink; expr.classList.add('visible');
    setTimeout(() => {
      expr.classList.remove('visible');
      if (state === 'default') eyes.style.display = '';
      scheduleBlink();
    }, 140);
  }
  function startIdle() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { if (state === 'default') setState('sleepy'); }, idleMs);
  }
  function resetIdle() {
    if (state === 'sleepy') setState('default');
    startIdle();
  }

  document.addEventListener('mousemove', resetIdle);
  document.addEventListener('keydown', resetIdle);

  document.addEventListener('mousemove', (e) => {
    if (state !== 'default') return;
    const rect = wrap.getBoundingClientRect();
    const cx = rect.left + rect.width * 0.5, cy = rect.top + rect.height * 0.42;
    const dx = e.clientX - cx, dy = e.clientY - cy;
    const angle = Math.atan2(dy, dx);
    const dist = Math.min(Math.sqrt(dx*dx + dy*dy), 220);
    const f = dist / 220;
    eyes.style.transform = `translate(${(Math.cos(angle)*f*12).toFixed(1)}px,${(Math.sin(angle)*f*9).toFixed(1)}px)`;
  });

  setState('default');
  return { setState, say };
}
