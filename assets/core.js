/* Core portfolio interactions. No carousel or animation library required. */
(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  function stored(key, value) {
    try { return value === undefined ? localStorage.getItem(key) : localStorage.setItem(key, value); }
    catch { return null; }
  }
  function activate(element, callback) {
    element.addEventListener('click', callback);
    if (element.tagName !== 'BUTTON') element.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); callback(event); }
    });
  }
  const theme = $('#theme-toggle');
  function setTheme(dark) {
    document.body.classList.toggle('dark-mode', dark);
    theme.setAttribute('aria-pressed', String(dark));
    theme.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    $('meta[name="theme-color"]').content = dark ? '#0c0d1b' : '#f9e4d0';
  }
  setTheme(stored('theme') !== 'light');
  activate(theme, () => {
    const dark = !document.body.classList.contains('dark-mode');
    setTheme(dark); stored('theme', dark ? 'dark' : 'light');
  });
  const menu = $('.nav-menu');
  const hamburger = $('#hamburg');
  activate(hamburger, () => {
    const open = menu.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', String(open));
    hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  $$('.nav-link').forEach(link => link.addEventListener('click', () => {
    menu.classList.remove('active'); hamburger.setAttribute('aria-expanded', 'false');
  }));
  const resumeContainer = $('.resume-dropdown-container');
  $('#resume-dropdown-btn').addEventListener('click', () => {
    const open = resumeContainer.classList.toggle('active');
    $('#resume-chevron').style.transform = open ? 'rotate(180deg)' : '';
  });
  document.addEventListener('click', event => {
    if (!resumeContainer.contains(event.target)) resumeContainer.classList.remove('active');
  });
  $$('.filter-btn').forEach(button => button.addEventListener('click', () => {
    $$('.filter-btn').forEach(item => item.classList.toggle('active', item === button));
    $$('.project-card').forEach(card => card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter);
  }));

  const projectModal = $('#project-modal');
  const preview = $('#project-modal-iframe');
  function closeProject() {
    projectModal.classList.remove('open');
    preview.removeAttribute('src');
    $('#project-modal-content').classList.remove('fullscreen');
    $('#project-modal-fullscreen').setAttribute('aria-pressed', 'false');
    $('#project-modal-fullscreen i').className = 'fa-solid fa-expand';
  }
  $$('.project-card').forEach(card => card.addEventListener('click', () => {
    card.focus({ preventScroll: true });
    $('#project-modal-title').textContent = card.dataset.projectTitle;
    preview.src = card.dataset.projectUrl;
    $('#project-modal-new-tab').href = card.dataset.projectUrl;
    projectModal.classList.add('open');
  }));
  $('#project-modal-close').addEventListener('click', closeProject);
  projectModal.addEventListener('click', event => { if (event.target === projectModal) closeProject(); });
  $('#project-modal-fullscreen').addEventListener('click', () => {
    const expanded = $('#project-modal-content').classList.toggle('fullscreen');
    $('#project-modal-fullscreen').setAttribute('aria-pressed', String(expanded));
    $('#project-modal-fullscreen i').className = expanded ? 'fa-solid fa-compress' : 'fa-solid fa-expand';
  });
  const certificateModal = $('#certificate-modal');
  $$('.certificate-card').forEach(card => card.addEventListener('click', () => {
    card.focus({ preventScroll: true });
    const image = card.querySelector('img');
    $('#modal-image').src = image.src;
    $('#modal-image').alt = image.alt;
    $('#modal-title').textContent = card.querySelector('.certificate-title').textContent;
    $('#modal-issuer').textContent = card.querySelector('.certificate-issuer').textContent;
    $('#modal-desc').textContent = card.querySelector('.timeline-desc').textContent;
    certificateModal.classList.add('open');
  }));
  activate($('#modal-close'), () => certificateModal.classList.remove('open'));
  certificateModal.addEventListener('click', event => { if (event.target === certificateModal) certificateModal.classList.remove('open'); });
  $$('.skill-link-card').forEach(card => card.addEventListener('click', () => window.open(card.dataset.projectUrl, '_blank', 'noopener,noreferrer')));

  let notificationTimer;
  function notify(message, type = 'success') {
    const toast = $('#notification-toast');
    clearTimeout(notificationTimer);
    $('#notification-message').textContent = message;
    toast.className = `notification-toast ${type} show`;
    toast.querySelector('i').className = type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation';
    notificationTimer = setTimeout(() => toast.classList.remove('show'), 6000);
  }
  const form = $('#contact-form');
  let sending = false;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || form.elements.honeypot.value) return;
    const button = form.querySelector('button[type="submit"]');
    const fields = [...form.querySelectorAll('input,textarea')];
    sending = true; button.disabled = true; button.textContent = 'Sending…';
    form.setAttribute('aria-busy', 'true');
    fields.forEach(field => field.readOnly = true);
    form.elements.time.value = new Date().toISOString();
    let timeout;
    try {
      if (!window.emailjs) throw new Error('Email service unavailable');
      window.emailjs.init?.({ publicKey: 'XwZYY5Pd11xDF2JAX' });
      await Promise.race([
        window.emailjs.sendForm('service_w351mid', 'template_sie20zs', form),
        new Promise((_, reject) => timeout = setTimeout(() => reject(new Error('Delivery confirmation timed out')), 20000))
      ]);
      notify('Thank you! Your message has been sent.'); form.reset();
    } catch {
      notify('Could not confirm delivery. Please email arussanthosh@gmail.com directly.', 'error');
    } finally {
      clearTimeout(timeout); sending = false; button.disabled = false; button.textContent = 'Send Message';
      fields.forEach(field => field.readOnly = false); form.removeAttribute('aria-busy');
    }
  });

  async function githubStats() {
    const ids = ['gh-repos', 'gh-followers', 'gh-stars'];
    ids.forEach(id => { $('#' + id).textContent = '—'; });
    try {
      const [profileResponse, reposResponse] = await Promise.all([
        fetch('https://api.github.com/users/A-Santhosh-Hub', { signal: AbortSignal.timeout(8000) }),
        fetch('https://api.github.com/users/A-Santhosh-Hub/repos?per_page=100&sort=updated', { signal: AbortSignal.timeout(8000) })
      ]);
      if (profileResponse.ok) {
        const profile = await profileResponse.json();
        $('#gh-repos').textContent = profile.public_repos;
        $('#gh-followers').textContent = profile.followers;
      }
      if (reposResponse.ok) {
        const repos = await reposResponse.json();
        $('#gh-stars').textContent = repos.reduce((total, repo) => total + repo.stargazers_count, 0) + (repos.length === 100 ? '+' : '');
        $('#gh-stars').title = 'Stars across up to 100 most recently updated public repositories';
      }
    } catch { /* The profile link remains usable when the API is unavailable. */ }
  }
  if ('IntersectionObserver' in window) {
    const githubObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { githubStats(); githubObserver.disconnect(); }
    }, { rootMargin: '200px' });
    githubObserver.observe($('#github-stats'));
  } else githubStats();

  $('#current-year').textContent = new Date().getFullYear();
  function updateClock() {
    if (!document.hidden) $('#india-time').textContent = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true });
  }
  updateClock(); setInterval(updateClock, 30000);
  let ticking = false;
  function updateNavigation() {
    $('#main-header').classList.toggle('scrolled', scrollY > 50);
    const links = $$('.nav-link');
    let active = links[0], nearest = -Infinity;
    links.forEach(link => {
      const top = $(link.hash)?.getBoundingClientRect().top;
      if (top <= innerHeight * .35 && top > nearest) { active = link; nearest = top; }
    });
    links.forEach(link => {
      link.classList.toggle('active', link === active);
      if (link === active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
    ticking = false;
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(updateNavigation); } }, { passive: true });
  updateNavigation();
})();
