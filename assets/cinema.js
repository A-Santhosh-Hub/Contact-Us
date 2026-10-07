/* Native-scroll choreography: opening, pinned camera zoom, chapters and project reel. */
(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const clamp = value => Math.min(1, Math.max(0, value));
  const paused = () => document.body.classList.contains('motion-paused');
  const hero = $('#home');
  const intro = $('#intro');
  const world = $('.world-break');
  const header = $('#main-header');
  const menu = $('.nav-menu');
  let lastY = scrollY;
  let pending = false;
  let openingTimer;

  function finishOpening() {
    clearTimeout(openingTimer);
    document.body.classList.remove('opening-active');
    document.body.classList.add('opening-finished');
  }
  if (!paused() && !location.hash && scrollY < 30) {
    document.body.classList.add('opening-active');
    openingTimer = setTimeout(finishOpening, 2250);
  } else finishOpening();
  $('.skip-opening').addEventListener('click', finishOpening);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') finishOpening(); });

  // The header follows scroll direction. No wheel interception or scroll hijacking.
  function renderScroll() {
    const y = scrollY;
    const viewport = innerHeight;
    const heroRect = hero.getBoundingClientRect();
    const introRect = intro.getBoundingClientRect();
    const worldRect = world.getBoundingClientRect();
    const travel = Math.max(1, hero.offsetHeight - viewport);
    const progress = paused() ? 0 : clamp(-heroRect.top / travel);
    const introProgress = paused() ? 1 : clamp((viewport - introRect.top) / (viewport * .85));
    const chapterRects = $$('.chapter-nav a').map(link => ({ link, top: $(link.hash).getBoundingClientRect().top }));

    hero.style.setProperty('--scene-zoom', (1.02 + progress * .4).toFixed(4));
    hero.style.setProperty('--title-zoom', (1 + progress * 1.7).toFixed(4));
    hero.style.setProperty('--title-opacity', (1 - clamp(progress * 1.8)).toFixed(4));
    hero.style.setProperty('--scene-shade', (.85 + progress * .15).toFixed(4));
    hero.style.setProperty('--hero-bottom-y', `${progress * 70}px`);
    intro.style.setProperty('--intro-scale', (.84 + introProgress * .16).toFixed(4));
    intro.style.setProperty('--intro-y', `${(1 - introProgress) * 75}px`);
    intro.style.setProperty('--intro-opacity', (.2 + introProgress * .8).toFixed(4));
    const worldProgress = paused() ? .5 : clamp((viewport - worldRect.top) / (viewport + worldRect.height));
    world.style.setProperty('--world-zoom', (1.2 - worldProgress * .2).toFixed(4));
    world.style.setProperty('--world-y', `${(worldProgress - .5) * -90}px`);
    if (Math.abs(y - lastY) > 6) header.classList.toggle('header-away', !paused() && y > viewport * .5 && y > lastY && !menu.classList.contains('active'));
    if (y < 60) header.classList.remove('header-away');
    lastY = y;
    let active = chapterRects[0]?.link;
    for (const entry of chapterRects) if (entry.top <= viewport * .45) active = entry.link;
    chapterRects.forEach(({ link }) => {
      link.classList.toggle('active', link === active);
      if (link === active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
    pending = false;
  }
  function queueScroll() { if (!pending) { pending = true; requestAnimationFrame(renderScroll); } }
  addEventListener('scroll', queueScroll, { passive: true });
  addEventListener('resize', queueScroll);
  renderScroll();
  new MutationObserver(() => {
    if (paused()) finishOpening();
    queueScroll();
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });

  new MutationObserver(() => {
    const open = menu.classList.contains('active');
    document.body.classList.toggle('menu-open', open);
    $('#hamburg').setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    if (open) {
      header.classList.remove('header-away');
      menu.querySelector('a').focus({ preventScroll: true });
    }
  }).observe(menu, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Tab' || !menu.classList.contains('active')) return;
    const focusables = [...menu.querySelectorAll('a,button,[tabindex="0"]'), $('#hamburg')];
    const first = focusables[0], last = focusables.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  const reel = $('#project-reel');
  const previous = $('.slide-prev');
  const next = $('.slide-next');
  let reelFrame = null;
  function visibleCards() { return $$('.project-card').filter(card => !card.hidden); }
  function renderReel() {
    const cards = visibleCards();
    const reelBox = reel.getBoundingClientRect();
    const distances = cards.map(card => ({ card, box: card.getBoundingClientRect() }));
    let nearest = 0, distance = Infinity;
    distances.forEach(({ card, box }, index) => {
      const delta = Math.abs(box.left - reelBox.left);
      if (delta < distance) { nearest = index; distance = delta; }
      const factor = paused() ? 1 : 1 - Math.min(.045, Math.abs(box.left - reelBox.left) / Math.max(1,reelBox.width) * .045);
      card.style.setProperty('--cover-scale', factor.toFixed(4));
    });
    $('.slide-count').textContent = `${String(nearest + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
    previous.disabled = reel.scrollLeft < 5;
    next.disabled = reel.scrollLeft >= reel.scrollWidth - reel.clientWidth - 5;
    reelFrame = null;
  }
  function queueReel() { if (!reelFrame) reelFrame = requestAnimationFrame(renderReel); }
  function slide(direction) {
    const cards = visibleCards();
    const reelBox = reel.getBoundingClientRect();
    let nearest = 0, distance = Infinity;
    cards.forEach((card, index) => {
      const delta = Math.abs(card.getBoundingClientRect().left - reelBox.left);
      if (delta < distance) { nearest = index; distance = delta; }
    });
    const target = cards[Math.max(0, Math.min(cards.length - 1, nearest + direction))];
    if (target) reel.scrollTo({ left: reel.scrollLeft + target.getBoundingClientRect().left - reelBox.left, behavior: paused() ? 'instant' : 'smooth' });
  }
  previous.addEventListener('click', () => slide(-1));
  next.addEventListener('click', () => slide(1));
  reel.addEventListener('keydown', event => {
    if (event.target === reel && ['ArrowLeft','ArrowRight'].includes(event.key)) { event.preventDefault(); slide(event.key === 'ArrowLeft' ? -1 : 1); }
  });
  reel.addEventListener('scroll', queueReel, { passive: true });
  addEventListener('resize', queueReel);
  $$('.filter-btn').forEach(button => button.addEventListener('click', () => {
    reel.scrollTo({ left:0, behavior:'instant' }); queueReel();
  }));
  renderReel();
})();
