// Sticky nav background on scroll
const nav = document.getElementById('siteNav');
const onScroll = () => {
  if (window.scrollY > 40) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
};
window.addEventListener('scroll', onScroll, {passive:true});
onScroll();

// Dark / light theme toggle (desktop icon button + mobile menu row)
const ICON_SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.5M12 19v2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M2.5 12h2.5M19 12h2.5M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8"/></svg>';
const ICON_MOON = '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.5 14.7A8.5 8.5 0 0 1 9.3 3.5a.6.6 0 0 0-.7-.85A10 10 0 1 0 21.35 15.4a.6.6 0 0 0-.85-.7z"/></svg>';
const themeToggleDesktop = document.getElementById('themeToggleDesktop');
const themeToggleMobile = document.getElementById('themeToggleMobile');
const themeToggleMobileIcon = document.getElementById('themeToggleMobileIcon');
const themeToggleMobileLabel = document.getElementById('themeToggleMobileLabel');

const syncThemeUI = () => {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  if (themeToggleDesktop) themeToggleDesktop.innerHTML = isLight ? ICON_SUN : ICON_MOON;
  if (themeToggleMobileIcon) themeToggleMobileIcon.innerHTML = isLight ? ICON_SUN : ICON_MOON;
  if (themeToggleMobileLabel) themeToggleMobileLabel.textContent = isLight ? 'Light Mode' : 'Dark Mode';
};
const toggleTheme = () => {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  if (isLight) {
    document.documentElement.removeAttribute('data-theme');
    try { localStorage.setItem('wynnes-theme', 'dark'); } catch(e) {}
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    try { localStorage.setItem('wynnes-theme', 'light'); } catch(e) {}
  }
  syncThemeUI();
};
syncThemeUI();
if (themeToggleDesktop) themeToggleDesktop.addEventListener('click', toggleTheme);
if (themeToggleMobile) themeToggleMobile.addEventListener('click', toggleTheme);

// Mobile nav toggle (popup card + backdrop)
const navToggle = document.getElementById('navToggle');
const mobileMenuCard = document.getElementById('mobileMenuCard');
const mobileMenuBackdrop = document.getElementById('mobileMenuBackdrop');
const setNavOpen = (open) => {
  mobileMenuCard.classList.toggle('open', open);
  mobileMenuBackdrop.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
};
navToggle.addEventListener('click', () => setNavOpen(!mobileMenuCard.classList.contains('open')));
mobileMenuBackdrop.addEventListener('click', () => setNavOpen(false));
mobileMenuCard.querySelectorAll('a, button').forEach(el => el.addEventListener('click', () => setNavOpen(false)));

// Customer review carousel (fanned card stack)
const reviewStack = document.getElementById('reviewStack');
if (reviewStack) {
  const reviewCards = Array.from(reviewStack.querySelectorAll('.review-card'));
  const reviewDots = Array.from(document.querySelectorAll('.review-dot'));
  const total = reviewCards.length;
  let current = 0;

  const renderStack = () => {
    reviewCards.forEach((card, i) => {
      let offset = i - current;
      if (offset > total / 2) offset -= total;
      if (offset < -total / 2) offset += total;
      card.classList.remove('active', 'prev', 'next', 'far');
      if (offset === 0) card.classList.add('active');
      else if (offset === -1) card.classList.add('prev');
      else if (offset === 1) card.classList.add('next');
      else card.classList.add('far');
    });
    reviewDots.forEach((dot, i) => dot.classList.toggle('active', i === current));
  };
  const goTo = (i) => { current = (i + total) % total; renderStack(); };

  document.getElementById('reviewPrev').addEventListener('click', () => goTo(current - 1));
  document.getElementById('reviewNext').addEventListener('click', () => goTo(current + 1));
  reviewDots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
  reviewCards.forEach((card, i) => card.addEventListener('click', () => {
    if (card.classList.contains('prev')) goTo(current - 1);
    else if (card.classList.contains('next')) goTo(current + 1);
  }));

  // Touch swipe support
  let touchStartX = 0;
  reviewStack.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, {passive:true});
  reviewStack.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1));
  }, {passive:true});

  renderStack();
}

// Menu category tabs
const tabBtns = document.querySelectorAll('.tab-btn');
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-tab');
    tabBtns.forEach(b => { b.classList.toggle('active', b === btn); b.setAttribute('aria-selected', b === btn ? 'true' : 'false'); });
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === 'panel-' + target);
    });
  });
});

// Smooth scroll with nav offset
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function(e) {
    const id = this.getAttribute('href');
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const navH = document.getElementById('siteNav').offsetHeight;
    const y = target.getBoundingClientRect().top + window.pageYOffset - navH + 1;
    window.scrollTo({top:y, behavior:'smooth'});
  });
});

// Scroll reveal
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    }
  });
}, {threshold:0.12, rootMargin:'0px 0px -60px 0px'});
revealEls.forEach(el => io.observe(el));

// Active nav link on scroll
const sections = ['home','about','bestsellers','reviews','location','contact'].map(id => document.getElementById(id)).filter(Boolean);
const navA = document.querySelectorAll('.nav-link');
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = '#' + entry.target.id;
      navA.forEach(a => a.classList.toggle('active', a.getAttribute('href') === id));
    }
  });
}, {threshold:0.5, rootMargin:'-40% 0px -40% 0px'});
sections.forEach(s => navObserver.observe(s));

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();