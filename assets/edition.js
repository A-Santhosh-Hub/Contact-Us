/* Small, framework-free enhancements. Content stays readable without animation. */
(() => {
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const storage = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch { /* Private browsing. */ } }
  };
  const motionMedia = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = storage.get('portfolio-motion') === 'off';
  const motionButton = $('.motion-toggle');
  function updateMotion() {
    const stopped = paused || motionMedia.matches;
    document.body.classList.toggle('motion-paused', stopped);
    motionButton.setAttribute('aria-pressed', String(stopped));
    motionButton.setAttribute('aria-label', stopped ? 'Enable decorative motion' : 'Pause decorative motion');
    $('span', motionButton).textContent = stopped ? 'off' : 'on';
  }
  updateMotion();
  motionMedia.addEventListener('change', updateMotion);
  motionButton.addEventListener('click', () => {
    paused = !document.body.classList.contains('motion-paused');
    storage.set('portfolio-motion', paused ? 'off' : 'on');
    updateMotion();
  });

  const stage = $('.creative-stage');
  if (stage && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let frame = null;
    stage.addEventListener('pointermove', event => {
      if (frame || document.body.classList.contains('motion-paused')) return;
      const { clientX, clientY } = event;
      frame = requestAnimationFrame(() => {
        const box = stage.getBoundingClientRect();
        const x = (clientX - box.left) / box.width, y = (clientY - box.top) / box.height;
        stage.style.setProperty('--shine-x', `${x * 100}%`);
        stage.style.setProperty('--shine-y', `${y * 100}%`);
        stage.style.setProperty('--orb-x', `${(x - .5) * 12}px`);
        stage.style.setProperty('--orb-y', `${(y - .5) * 12}px`);
        frame = null;
      });
    });
    stage.addEventListener('pointerleave', () => {
      if (frame) { cancelAnimationFrame(frame); frame = null; }
      stage.removeAttribute('style');
    });
  }

  // Original graphic covers replace remote placeholder images, never posed as screenshots.
  const covers = [
    ['OTHER\nDIMENSIONS.', '#30243b', '#b68ca3'], ['MAKE.\nCREATE.\nREPEAT.', '#223c3c', '#709b86'],
    ['YOUR\nWORLD.\nREIMAGINED.', '#2c2b46', '#a599c5'], ['HELLO,\nWORLD.', '#242c3c', '#708fa7'],
    ['PRESS\nPLAY.', '#422634', '#ae738c'], ['EVERY\nIDEA\nCOUNTS.', '#443626', '#beaa75'],
    ['LIFE.\nIN SYNC.', '#253a40', '#6aadae'], ['FEEL\nTHE\nFREQUENCY.', '#352849', '#927ba9'],
    ['MAKE\nIT ADD\nUP.', '#243b32', '#7aaf8a'], ['JUST\nONE\nMORE.', '#492c32', '#d59c78']
  ];
  $$('.project-card').forEach((card, index) => {
    const [symbol, background, glow] = covers[index % covers.length];
    const cover = document.createElement('div');
    cover.className = 'project-cover';
    cover.setAttribute('aria-hidden', 'true');
    cover.style.setProperty('--cover-bg', background);
    cover.style.setProperty('--cover-glow', glow);
    cover.style.setProperty('--cover-hue', `${[0,140,255,200,310,20,175,265,105,340][index % 10]}deg`);
    cover.style.setProperty('--cover-position', `${20 + index * 7}% center`);
    for (const [className, text] of [['cover-index', `SANSTUDIO ORIGINAL / ${String(index + 1).padStart(2, '0')}`], ['cover-orbit', ''], ['cover-icon', symbol], ['cover-label', 'INTERACTIVE EXPERIENCES / CONCEPT ART']]) {
      const span = document.createElement('span');
      span.className = className;
      span.textContent = text;
      cover.append(span);
    }
    card.prepend(cover);
    $('.project-thumbnail', card)?.remove();
  });

  // Native scrolling keeps every skill and certificate available to keyboard and touch.
  $$('.apple-skills-slider, .certificates-slider').forEach(region => {
    region.tabIndex = 0;
    region.setAttribute('role', 'region');
    region.setAttribute('aria-label', region.classList.contains('apple-skills-slider') ? 'Skills — scroll for more' : 'Certificates — scroll for more');
  });
  $$('.project-card, .certificate-card, .skill-link-card').forEach(card => {
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Open ${$('.project-title, .certificate-title, .skill-name', card)?.textContent || card.dataset.projectTitle}`);
    card.addEventListener('keydown', event => {
      if (event.target === card && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        card.click();
      }
    });
  });
  $$('.filter-btn').forEach(button => {
    button.setAttribute('aria-pressed', String(button.classList.contains('active')));
    button.addEventListener('click', () => {
      $$('.filter-btn').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    });
  });

  const resume = $('#resume-dropdown-btn');
  const resumeContainer = $('.resume-dropdown-container');
  resume.setAttribute('aria-controls', 'resume-dropdown-menu');
  resume.setAttribute('aria-expanded', 'false');
  new MutationObserver(() => resume.setAttribute('aria-expanded', String(resumeContainer.classList.contains('active')))).observe(resumeContainer, { attributes: true, attributeFilter: ['class'] });
  const menu = $('.nav-menu');
  menu.id = 'primary-navigation';
  menu.setAttribute('role', 'navigation');
  menu.setAttribute('aria-label', 'Main navigation');
  $('#hamburg').setAttribute('aria-controls', menu.id);
  document.addEventListener('click', event => {
    if (!$('#main-header').contains(event.target)) {
      menu.classList.remove('active');
      $('#hamburg').setAttribute('aria-expanded', 'false');
    }
  });

  // Direct links remain available if a project disallows iframe embedding.
  const modal = $('#project-modal');
  const help = document.createElement('p');
  help.className = 'preview-help';
  help.append('Some projects block embedded previews. ');
  const external = document.createElement('a');
  external.textContent = 'Open project ↗'; external.target = '_blank'; external.rel = 'noopener noreferrer';
  const source = document.createElement('a');
  source.textContent = 'View source ↗'; source.target = '_blank'; source.rel = 'noopener noreferrer';
  help.append(external, ' · ', source);
  $('.project-modal-header').after(help);
  $$('.project-card').forEach(card => card.addEventListener('click', () => {
    external.href = card.dataset.projectUrl;
    source.href = card.dataset.githubUrl;
  }));

  // Dialog focus containment, Escape, background inertness, and focus restoration.
  let activeDialog = null;
  let returnFocus = null;
  const backgroundNodes = [...document.body.children].filter(node => !node.classList.contains('modal') && !['SCRIPT', 'STYLE'].includes(node.tagName));
  const focusable = dialog => $$('a[href],button,input,textarea,[tabindex="0"]', dialog).filter(node => node.getClientRects().length && !node.disabled);
  function closeDialog(dialog) {
    dialog.classList.remove('open');
    if (dialog === modal) {
      $('#project-modal-iframe').removeAttribute('src');
      $('#project-modal-content').classList.remove('fullscreen');
      $('#project-modal-fullscreen').setAttribute('aria-pressed', 'false');
      $('#project-modal-fullscreen i').className = 'fa-solid fa-expand';
    }
  }
  $$('.modal').forEach(dialog => {
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-hidden', 'true');
    dialog.setAttribute('aria-labelledby', dialog.id === 'project-modal' ? 'project-modal-title' : 'modal-title');
    new MutationObserver(() => {
      const open = dialog.classList.contains('open');
      dialog.setAttribute('aria-hidden', String(!open));
      if (open && activeDialog !== dialog) {
        returnFocus = document.activeElement;
        activeDialog = dialog;
        document.body.classList.add('modal-active');
        backgroundNodes.forEach(node => node.inert = true);
        (focusable(dialog)[0] || dialog).focus();
      } else if (!open && activeDialog === dialog) {
        activeDialog = null;
        document.body.classList.remove('modal-active');
        backgroundNodes.forEach(node => node.inert = false);
        returnFocus?.focus({ preventScroll: true });
      }
    }).observe(dialog, { attributes: true, attributeFilter: ['class'] });
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (activeDialog) closeDialog(activeDialog);
      if (resumeContainer.classList.contains('active')) {
        resumeContainer.classList.remove('active');
        resume.focus();
      }
      if (menu.classList.contains('active')) {
        menu.classList.remove('active');
        $('#hamburg').setAttribute('aria-expanded', 'false');
        $('#hamburg').focus();
      }
    }
    if (event.key === 'Tab' && activeDialog) {
      const items = focusable(activeDialog);
      const first = items[0], last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  });

  // Reveals are one-time and opt out with the operating system motion preference.
  if ('IntersectionObserver' in window && !document.body.classList.contains('motion-paused')) {
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    }), { threshold: 0.06 });
    $$('.section-title, .timeline-item, .sanstudio-banner, .contact-form').forEach(element => {
      if (element.getBoundingClientRect().top > innerHeight) {
        element.classList.add('reveal-ready'); revealObserver.observe(element);
      }
    });
  }
  const progress = $('.reading-progress');
  let scheduled = false;
  function updateProgress() {
    const distance = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${distance > 0 ? scrollY / distance : 0})`;
    scheduled = false;
  }
  addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateProgress); } }, { passive: true });
  addEventListener('resize', updateProgress);
  updateProgress();
  $('#notification-toast').setAttribute('role', 'status');
  $('#notification-toast').setAttribute('aria-live', 'polite');
  const viewer = $('model-viewer');
  if (viewer) {
    const loadViewer = () => {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js';
      document.head.append(script);
      if (document.body.classList.contains('motion-paused')) viewer.removeAttribute('auto-rotate');
    };
    if ('IntersectionObserver' in window) {
      const viewerObserver = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) { loadViewer(); viewerObserver.disconnect(); }
      }, { rootMargin: '250px' });
      viewerObserver.observe(viewer);
    } else loadViewer();
    new MutationObserver(() => viewer.toggleAttribute('auto-rotate', !document.body.classList.contains('motion-paused'))).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }
  $('#name').autocomplete = 'name';
  $('#email').autocomplete = 'email';
})();
