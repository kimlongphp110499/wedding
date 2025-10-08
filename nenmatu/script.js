// Wedding Invitation Interactions & Animations
// ================= SETUP =================
window.addEventListener('DOMContentLoaded', () => {
  initIntroAnimation();
});

// ================= INTRO ANIMATION =================
function initIntroAnimation() {
  const introOverlay = document.getElementById('intro-overlay');
  if (!introOverlay) return;
  // Quick debug flag: allow skipping the intro via URL (?skipIntro or #skipIntro)
  try {
    const url = new URL(window.location.href);
    const skip = url.searchParams.has('skipIntro') || window.location.hash === '#skipIntro';
    if (skip) {
      // Reveal card immediately for debugging/testing
      const card = document.querySelector('.card');
      if (card) card.style.visibility = 'visible';
      introOverlay.style.display = 'none';
      // still run main animations to initialize interactive parts
      runMainAnimations();
      return;
    }
  } catch (e) { /* ignore URL parsing errors */ }
  // if gsap not available, still attach click handler to open card
  if (!window.gsap) {
    const btn = document.getElementById('intro-text');
    if (btn) {
      btn.addEventListener('click', () => {
        document.querySelector('.card').style.visibility = 'visible';
        runMainAnimations();
        introOverlay.style.display = 'none';
      }, { once: true });
    }
    return;
  }

  // Create falling petals
  createFallingPetals();

  const introTl = gsap.timeline({ paused: true });

  // Keep heart visible and stable - no animations on it
  introTl
    .from('#intro-bride', { opacity: 0, x: 100, duration: 1.2, ease: 'back.out(1.5)' }, 0.5)
    .from('#intro-groom', { opacity: 0, x: -100, duration: 1.2, ease: 'back.out(1.5)' }, 0.5)
    .to(['#intro-bride', '#intro-groom'], { scale: 1.2, opacity: 0, duration: 0.8 }, '+=0.5');

  // Start intro only when the heart button is activated
  const openBtn = document.getElementById('intro-text');
  function startIntro() {
    // Auto-play music on user activation
    const audio = document.getElementById('main-audio');
    const toggle = document.getElementById('music-toggle');
    if (audio) {
      audio.volume = 0.8;
      audio.currentTime = 0;
      audio.play().then(() => {
        console.log('Audio playing');
        if (toggle) toggle.textContent = '🌼';
      }).catch(err => {
        console.warn('Audio play failed:', err);
      });
    }
    // Immediately trigger 3D door open so it responds right away to the user click.
    // When doors finish, fade out the overlay and then reveal the card (runMainAnimations).
    if (window.gsap) {
      try {
        const doorDuration = 1.0; // seconds
        const doorsTl = gsap.timeline({ onStart: () => {
          // hide the heart button when doors start to avoid overlap
          const heart = document.getElementById('intro-text');
          if (heart) heart.style.visibility = 'hidden';
        }, onComplete: () => {
          // fade overlay after doors finish
          gsap.to(introOverlay, { opacity: 0, duration: 0.6, onComplete: () => {
            introOverlay.style.display = 'none';
            runMainAnimations();
          } });
        }});
        doorsTl.to('#door-left', { transformOrigin: 'left center', rotateY: -100, duration: doorDuration, ease: 'power3.inOut' });
        doorsTl.to('#door-right', { transformOrigin: 'right center', rotateY: 100, duration: doorDuration, ease: 'power3.inOut' }, '<');
      } catch (e) {
        console.warn('Door animation failed', e);
        // fallback: reveal card immediately
        introOverlay.style.display = 'none';
        runMainAnimations();
      }
    } else {
      // If gsap isn't available, reveal card immediately (existing fallback path covers this earlier)
      introOverlay.style.display = 'none';
      runMainAnimations();
    }
    // play the rest of the intro timeline (visual elements animation)
    introTl.play();
  }

  if (openBtn) {
    openBtn.addEventListener('click', startIntro, { once: true });
    openBtn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); startIntro(); } }, { once: true });
  }
}

// ================= FALLING PETALS =================
function createFallingPetals() {
  const container = document.getElementById('falling-petals');
  if (!container) return;
  
  const petals = ['🌸', '🌺', '🌼', '🌻', '💮', '🏵️'];
  const petalCount = 20;
  
  for (let i = 0; i < petalCount; i++) {
    const petal = document.createElement('div');
    petal.className = 'petal';
    petal.textContent = petals[Math.floor(Math.random() * petals.length)];
    
    const left = Math.random() * 100;
    const size = Math.random() * 12 + 18;
    const delay = Math.random() * 5;
    const duration = Math.random() * 8 + 10;
    
    petal.style.cssText = `
      left: ${left}%;
      top: -50px;
      font-size: ${size}px;
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
    `;
    
    container.appendChild(petal);
  }
}

function runMainAnimations() {
  document.querySelector('.card').style.visibility = 'visible';
  initCountdown();
  spawnBackgroundHearts();
  initGSAP();
  initRSVP();
  initLottie();
  startSlides();
  initFireworks();
  showBouquet();
  spawnCardPetals();
}

// ================= COUNTDOWN =================
function initCountdown() {
  const target = new Date('2025-10-15T11:00:00+07:00').getTime();
  const dEl = document.getElementById('d');
  const hEl = document.getElementById('h');
  const mEl = document.getElementById('m');
  const sEl = document.getElementById('s');
  if (!dEl) return;
  const pad = n => String(n).padStart(2, '0');
  function tick() {
    const now = Date.now();
    let diff = target - now;
    if (diff <= 0) {
      dEl.textContent = hEl.textContent = mEl.textContent = sEl.textContent = '00';
      clearInterval(timer);
      return;
    }
    const d = Math.floor(diff / 86400000); diff %= 86400000;
    const h = Math.floor(diff / 3600000); diff %= 3600000;
    const m = Math.floor(diff / 60000); diff %= 60000;
    const s = Math.floor(diff / 1000);
    dEl.textContent = pad(d); hEl.textContent = pad(h); mEl.textContent = pad(m); sEl.textContent = pad(s);
  }
  tick();
  const timer = setInterval(tick, 1000);
}

// ================= HEARTS BACKGROUND =================
function spawnBackgroundHearts() {
  const wrap = document.getElementById('bg-hearts');
  if (!wrap) return;
  const total = 14;
  for (let i = 0; i < total; i++) {
    const h = document.createElement('div');
    h.className = 'floating-heart';
    const size = Math.random() * 18 + 10;
    const left = Math.random() * 100;
    const delay = Math.random() * 8;
    const duration = Math.random() * 18 + 18;
    h.style.cssText = `left:${left}%; bottom:-${size}px; font-size:${size}px; animation-duration:${duration}s; animation-delay:${delay}s;`;
    h.textContent = '❤';
    wrap.appendChild(h);
  }
}

// ================= GSAP ANIMATIONS =================
function initGSAP() {
  if (!window.gsap) return;
  const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: .9 } });
  tl.from('.card', { y: 40, opacity: 0 });
  tl.from('.names span', { y: 30, opacity: 0, stagger: .15 }, '-=.4');
  tl.from('.names em', { scale: 0, opacity: 0 }, '-=.5');
  tl.from('.date', { y: 20, opacity: 0 }, '-=.5');
  tl.from('.avatar-wrap', { scale: .6, opacity: 0, stagger: .15, ease: 'back.out(1.5)' }, '-=.3');
  tl.from('.countdown .time', { y: 24, opacity: 0, stagger: .07 }, '-=.2');
  tl.from('.info-item', { y: 24, opacity: 0, stagger: .1 }, '-=.4');
  tl.from('.rsvp-btn', { y: 24, opacity: 0 }, '-=.5');
}

// ================= RSVP INTERACTION =================
function initRSVP() {
  const btn = document.getElementById('rsvpBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    btn.disabled = true;
    btn.classList.add('active');
    flashMessage('Cảm ơn bạn đã xác nhận!');
    confettiBurst();
    setTimeout(() => { btn.disabled = false; btn.classList.remove('active'); }, 2600);
  });
}

function flashMessage(text) {
  const el = document.createElement('div');
  el.textContent = text;
  el.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:4000;font-family:Playfair Display,serif;';
  el.innerHTML = `<div style="background:#ffffffee;padding:26px 34px;border-radius:24px;font-size:20px;color:#d24e6c;box-shadow:0 10px 40px -8px rgba(0,0,0,.25);animation:pop .6s ease;">${text}</div>`;
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .5s';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 550);
  }, 1700);
}

// Simple confetti
function confettiBurst() {
  const colors = ['#ff8fa8', '#ffd3dd', '#ffc2d1', '#e98aa0', '#f7b7c8'];
  for (let i = 0; i < 32; i++) {
    const c = document.createElement('div');
    c.style.cssText = 'position:fixed;top:50%;left:50%;width:10px;height:10px;border-radius:50%;pointer-events:none;z-index:3000;';
    const col = colors[Math.random() * colors.length | 0];
    const x = (Math.random() - .5) * 520;
    const y = (Math.random() - .2) * 520;
    const s = Math.random() * 8 + 6;
    c.style.background = col;
    c.style.transform = 'translate(-50%,-50%)';
    document.body.appendChild(c);
    if (window.gsap) {
      gsap.to(c, { x, y, scale: s / 10, rotation: Math.random() * 540, opacity: 0, duration: 1.4 + Math.random() * .6, ease: 'power2.out', onComplete: () => c.remove() });
    } else {
      // fallback
      c.animate([
        { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
        { transform: `translate(${x}px,${y}px) scale(${s / 10})`, opacity: 0 }
      ], { duration: 1400 + Math.random() * 600, easing: 'ease-out', fill: 'forwards' }).onfinish = () => c.remove();
    }
  }
}

// ================= LOTTIE (Optional Decorative) =================
function initLottie() {
  if (!window.lottie) return;
  const container = document.getElementById('lottie-container');
  if (!container) return;
  Object.assign(container.style, { position: 'fixed', bottom: '14px', right: '14px', width: '90px', height: '90px', zIndex: 10, opacity: '.85', pointerEvents: 'none' });
  try {
    lottie.loadAnimation({
      container,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: 'https://assets10.lottiefiles.com/packages/lf20_qp1q7mct.json' // small heart animation
    });
  } catch (e) {
    console.warn('Lottie load failed', e);
  }
}

// ================= LOG =================
console.log('%c Wedding Invite Loaded ', 'background:#ffb3c6;color:#4a2; padding:4px 8px; border-radius:4px');

// ================= SLIDESHOW =================
function startSlides() {
  const groups = document.querySelectorAll('.slideshow');
  groups.forEach(group => {
    const slides = group.querySelectorAll('.avatar');
    if (slides.length <= 1) return;
    let index = 0;
    setInterval(() => {
      const current = slides[index];
      index = (index + 1) % slides.length;
      const next = slides[index];
      current.classList.remove('active');
      next.classList.add('active');
    }, 5000);
  });
}

// ================= FIREWORKS =================
function initFireworks() {
  const canvas = document.getElementById('fireworks-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  function resize() {
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
    ctx.scale(dpr, dpr);
  }
  resize();
  window.addEventListener('resize', resize);

  const particles = [];
  const trails = [];
  function spawnFirework() {
    const x = Math.random() * innerWidth * .6 + innerWidth * .2;
    const y = Math.random() * innerHeight * .3 + innerHeight * .15;
    const hue = Math.random() * 50 + 320; // pink-magenta palette
    const count = 48;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = Math.random() * 3.2 + 2.4;
      particles.push({
        x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 0, max: 70 + Math.random() * 30, hue, size: Math.random()*1.8+1.2
      });
    }
  }

  let lastSpawn = 0;
  function update(t) {
    requestAnimationFrame(update);
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    ctx.fillRect(0, 0, innerWidth, innerHeight);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.02; // gravity
      p.life++;
      const alpha = 1 - p.life / p.max;
      // trail
      trails.push({x:p.x, y:p.y, alpha, hue:p.hue, size:p.size});
      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue},95%,72%,${alpha})`;
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    // draw trails
    for (let i = trails.length -1; i >=0; i--) {
      const tr = trails[i];
      tr.alpha *= 0.92;
      if (tr.alpha < 0.03) { trails.splice(i,1); continue; }
      ctx.beginPath();
      ctx.fillStyle = `hsla(${tr.hue},95%,80%,${tr.alpha})`;
      ctx.arc(tr.x, tr.y, tr.size*0.7, 0, Math.PI*2);
      ctx.fill();
    }
    for (let i = particles.length - 1; i >= 0; i--) {
      if (particles[i].life >= particles[i].max) particles.splice(i, 1);
    }
    if (t - lastSpawn > 950 && particles.length < 520) {
      spawnFirework();
      lastSpawn = t;
    }
  }
  requestAnimationFrame(update);
  setTimeout(() => canvas.classList.add('active'), 1200); // fade in shortly after start
  // stop fireworks after intro (~10s)
  setTimeout(() => { canvas.classList.remove('active'); }, 12000);
}

// ================= BOUQUET BLOOM =================
function showBouquet() {
  const el = document.querySelector('.bouquet-bloom');
  if (!el) return;
  setTimeout(() => { el.classList.add('is-visible'); }, 2400);
}

// ================= EXTRA: Increase petals after intro =================
// Optionally add gentle continuous petals
setTimeout(() => {
  const container = document.getElementById('falling-petals');
  if (!container) return;
  for (let i = 0; i < 15; i++) {
    const petals = ['🌸', '🌺', '🌼', '🌻', '💮'];
    const petal = document.createElement('div');
    petal.className = 'petal';
    petal.textContent = petals[Math.random() * petals.length | 0];
    const left = Math.random() * 100;
    const size = Math.random() * 10 + 16;
    const delay = Math.random() * 4;
    const duration = Math.random() * 10 + 8;
    petal.style.cssText = `left:${left}%; top:-40px; font-size:${size}px; animation-duration:${duration}s; animation-delay:${delay}s;`;
    container.appendChild(petal);
  }
}, 5000);

// Internal card petals (gentler, fewer, looped)
function spawnCardPetals() {
  const layer = document.querySelector('.card-effects');
  if (!layer) return;
  const symbols = ['🌸','💮','🌺'];
  function drop() {
    if (!document.body.contains(layer)) return; // safety
    const p = document.createElement('div');
    p.className = 'petal';
    p.textContent = symbols[Math.random()*symbols.length|0];
    const left = Math.random()*90+5;
    const size = Math.random()*10+14;
    const dur = Math.random()*8+9;
    p.style.cssText = `left:${left}%; top:-30px; font-size:${size}px; animation-duration:${dur}s; opacity:.9;`;
    layer.appendChild(p);
    setTimeout(() => p.remove(), dur*1000);
    setTimeout(drop, Math.random()*1200+400);
  }
  drop();
}

// Music toggle control wiring
(function wireMusicToggle(){
  const toggle = document.getElementById('music-toggle');
  const audio = document.getElementById('main-audio');
  if (!toggle || !audio) return;
  toggle.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().then(() => {
        toggle.textContent = '🔊 Pause';
      }).catch(err => console.error('Music play failed', err));
    } else {
      audio.pause();
      toggle.textContent = '🎵 Play';
    }
  });
})();
