(() => {
  'use strict';

  const NIKKAH_TIME = new Date('2026-11-15T16:00:00+05:00');
  const WHATSAPP_TEXT = "Assalam-o-Alaikum! InshaAllah I will attend Habia & Saad's Nikkah on Sunday, 15 November.";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Music ---------- */
  const audio = $('#nasheed');
  const musicBtn = $('#music');
  let musicOn = false;

  const setMusic = (on) => {
    musicOn = on;
    if (on) {
      audio.volume = 0.5;
      audio.play().catch(() => setMusic(false));
    } else {
      audio.pause();
    }
    musicBtn.classList.toggle('is-playing', on);
    musicBtn.setAttribute('aria-pressed', String(on));
    musicBtn.setAttribute('aria-label', on ? 'Pause nasheed' : 'Play nasheed');
  };

  musicBtn.addEventListener('click', () => setMusic(!musicOn));

  let resumeOnReturn = false;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      resumeOnReturn = musicOn;
      if (musicOn) setMusic(false);
    } else if (resumeOnReturn) {
      setMusic(true);
    }
  });

  /* ---------- Gate: crack the seal, raise the curtains ---------- */
  const gate = $('#gate');
  const seal = $('#open-seal');

  seal.addEventListener('click', () => {
    if (gate.classList.contains('is-cracking')) return;
    setMusic(true);
    gate.classList.add('is-cracking');

    const riseDelay = reducedMotion ? 0 : 450;
    setTimeout(() => {
      gate.classList.add('is-rising');
      document.body.classList.add('is-open');
    }, riseDelay);

    setTimeout(() => {
      gate.classList.add('is-gone');
      gate.setAttribute('aria-hidden', 'true');
    }, riseDelay + 2200);
  }, { once: false });

  /* ---------- Falling petals ---------- */
  const petals = $('#petals');
  if (petals && !reducedMotion) {
    const count = window.innerWidth < 600 ? 9 : 14;
    const rand = (a, b) => a + Math.random() * (b - a);
    for (let i = 0; i < count; i++) {
      const p = document.createElement('img');
      p.src = 'assets/petal.webp';
      p.alt = '';
      p.className = 'petal';
      p.style.left = `${rand(4, 96)}%`;
      p.style.setProperty('--size', `${rand(14, 28)}px`);
      p.style.setProperty('--dur', `${rand(10, 17)}s`);
      p.style.setProperty('--delay', `${rand(-16, 2)}s`);
      p.style.setProperty('--drift', `${rand(-60, 60)}px`);
      p.style.setProperty('--rot', `${rand(-420, 420)}deg`);
      petals.appendChild(p);
    }
  }

  /* ---------- Scroll parallax (transform only, one rAF per frame) ---------- */
  const layers = $$('[data-speed]').map((el) => ({ el, speed: parseFloat(el.dataset.speed) }));
  let ticking = false;

  const updateParallax = () => {
    const vh = window.innerHeight;
    for (const { el, speed } of layers) {
      const host = el.closest('section');
      const rect = host.getBoundingClientRect();
      if (rect.bottom < -100 || rect.top > vh + 100) continue;
      const offset = (rect.top + rect.height / 2) - vh / 2;
      el.style.setProperty('--py', `${(-offset * speed).toFixed(1)}px`);
    }
    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateParallax);
    }
  };

  if (!reducedMotion) {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    updateParallax();
  }

  /* ---------- Scroll cue hides after the first real scroll ---------- */
  const cue = $('#scroll-cue');
  const hideCue = () => {
    if (window.scrollY > 120) {
      cue.classList.add('is-hidden');
      window.removeEventListener('scroll', hideCue);
    }
  };
  window.addEventListener('scroll', hideCue, { passive: true });

  /* ---------- Couple arrives when the stage comes into view ---------- */
  const stage = $('#stage');
  if ('IntersectionObserver' in window && !reducedMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    io.observe(stage);
  } else {
    stage.classList.add('is-visible');
  }

  /* ---------- Countdown ---------- */
  const cdFields = ['days', 'hours', 'minutes', 'seconds'].map((k) => [k, $(`[data-cd="${k}"]`)]);
  const cdLabel = $('#countdown-label');
  let cdTimer;

  const renderCountdown = () => {
    const ms = Math.max(0, NIKKAH_TIME - Date.now());
    const s = Math.floor(ms / 1000);
    const parts = {
      days: Math.floor(s / 86400),
      hours: Math.floor((s % 86400) / 3600),
      minutes: Math.floor((s % 3600) / 60),
      seconds: s % 60
    };
    cdFields.forEach(([k, el]) => { el.textContent = String(parts[k]).padStart(2, '0'); });
    if (ms === 0) {
      cdLabel.textContent = 'Alhamdulillah, the Nikkah day is here';
      clearInterval(cdTimer);
    }
  };
  renderCountdown();
  cdTimer = setInterval(renderCountdown, 1000);

  /* ---------- WhatsApp links ---------- */
  $$('.contact[data-phone]').forEach((a) => {
    const digits = a.dataset.phone.replace(/\D/g, '');
    const intl = digits.startsWith('0') ? `92${digits.slice(1)}` : digits;
    a.href = `https://wa.me/${intl}?text=${encodeURIComponent(WHATSAPP_TEXT)}`;
  });
})();
