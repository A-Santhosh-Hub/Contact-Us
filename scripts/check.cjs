const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  fs.mkdirSync(path.join(__dirname, '../artifacts'), { recursive: true });
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelectorAll('.project-cover').length === 10);
  await page.evaluate(() => document.fonts.ready);
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 950 });
    await page.evaluate(() => scrollTo(0, 0));
    const overflow = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
    assert.ok(overflow.document <= width, `Horizontal overflow at ${width}: ${JSON.stringify(overflow)}`);
    const hero = await page.evaluate(() => ({ text: document.querySelector('.hero-text').getBoundingClientRect().top, art: document.querySelector('.creative-stage').getBoundingClientRect().top }));
    if (width <= 680) assert.ok(hero.text < hero.art, 'Introduction must precede artwork on mobile');
    const labelFits = await page.locator('.project-card').first().evaluate(card => {
      const parent = card.getBoundingClientRect(), title = card.querySelector('.project-title').getBoundingClientRect();
      return title.top >= parent.top && title.bottom <= parent.bottom;
    });
    assert.ok(labelFits, `Project title is clipped at ${width}px`);
    await page.screenshot({ path: `artifacts/viewport-${width}.png` });
    console.log(`PASS layout ${width}px`);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator('[data-filter="tools"]').click();
  assert.equal(await page.locator('.project-card:visible').count(), await page.locator('.project-card[data-category="tools"]').count());
  await page.locator('[data-filter="games"]').click();
  assert.equal(await page.locator('.project-card:visible').count(), 1);
  await page.locator('[data-filter="all"]').click();
  assert.equal(await page.locator('.project-card:visible').count(), 10);
  console.log('PASS project filters');
  await page.locator('.project-card').first().focus();
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.querySelector('#project-modal').classList.contains('open'));
  assert.equal(await page.locator('#project-modal').getAttribute('aria-hidden'), 'false');
  assert.ok(await page.locator('.preview-help a').first().getAttribute('href'));
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('#project-modal').classList.contains('open'));
  assert.equal(await page.evaluate(() => document.activeElement.classList.contains('project-card')), true);
  console.log('PASS project keyboard dialog and focus restoration');
  await page.locator('.certificate-card').first().focus();
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.querySelector('#certificate-modal').classList.contains('open'));
  await page.keyboard.press('Escape');
  console.log('PASS certificate dialog');
  await page.locator('#resume-dropdown-btn').click();
  assert.equal(await page.locator('#resume-dropdown-btn').getAttribute('aria-expanded'), 'true');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#resume-dropdown-btn').getAttribute('aria-expanded'), 'false');
  console.log('PASS resume menu');
  await page.locator('#theme-toggle').click();
  assert.equal(await page.evaluate(() => document.body.classList.contains('dark-mode')), false);
  await page.waitForTimeout(500);
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({ path: 'artifacts/light-desktop.png' });
  await page.reload({ waitUntil: 'domcontentloaded' });
  assert.equal(await page.evaluate(() => document.body.classList.contains('dark-mode')), false);
  await page.locator('#theme-toggle').click();
  console.log('PASS theme and persistence');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#hamburg').click();
  assert.equal(await page.locator('#hamburg').getAttribute('aria-expanded'), 'true');
  await page.locator('.nav-menu a[href="#projects"]').click();
  assert.equal(await page.locator('#hamburg').getAttribute('aria-expanded'), 'false');
  console.log('PASS mobile navigation');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await page.locator('.studio-window').evaluate(element => getComputedStyle(element).animationName), 'none');
  console.log('PASS reduced motion');
  // Replace only the provider transport: this test never sends email.
  await page.evaluate(() => {
    window.emailjs = { sendForm: async (_service, _template, form) => {
      window.__submitted = Object.fromEntries(new FormData(form));
      return { status: 200 };
    }};
  });
  await page.locator('#name').fill('Portfolio verification');
  await page.locator('#email').fill('test@example.com');
  await page.locator('#subject').fill('Local test, no email sent');
  await page.locator('#message').fill('Check that form fields are serialized while the form is sending.');
  await page.locator('#contact-form button[type="submit"]').click();
  await page.waitForFunction(() => window.__submitted);
  assert.equal(await page.evaluate(() => window.__submitted.name), 'Portfolio verification');
  assert.equal(await page.evaluate(() => window.__submitted.email_id), 'test@example.com');
  console.log('PASS contact form values (mock transport; no email sent)');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => { document.querySelector('#notification-toast').classList.remove('show'); document.querySelector('#projects').scrollIntoView({ block: 'start' }); });
  await page.screenshot({ path: 'artifacts/projects-desktop.png' });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const selector of ['.apple-skills-slider', '.certificates-slider']) {
      const scrolled = await page.locator(selector).evaluate(element => { element.scrollLeft = 230; const value = element.scrollLeft; element.scrollLeft = 0; return value; });
      assert.ok(scrolled > 0, `${selector} must be horizontally scrollable at ${width}px`);
    }
    for (const id of ['about', 'skills', 'education', 'contact']) {
      await page.locator('#' + id).evaluate(element => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
      await page.screenshot({ path: `artifacts/${id}-${width}.png` });
    }
  }
  const offline = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await offline.route('**/*', route => route.request().url().startsWith('http://127.0.0.1:4173') ? route.continue() : route.abort());
  const fallbackPage = await offline.newPage();
  fallbackPage.on('pageerror', error => errors.push(error.message));
  await fallbackPage.goto('http://127.0.0.1:4173', { waitUntil: 'domcontentloaded' });
  assert.equal(await fallbackPage.locator('.project-cover').count(), 10);
  await fallbackPage.emulateMedia({ reducedMotion: 'reduce' });
  await fallbackPage.locator('#name').fill('Offline verification');
  await fallbackPage.locator('#email').fill('test@example.com');
  await fallbackPage.locator('#subject').fill('No network');
  await fallbackPage.locator('#message').fill('Retain this draft when the email provider is unavailable.');
  await fallbackPage.locator('#contact-form button[type="submit"]').click();
  assert.equal(await fallbackPage.locator('#message').inputValue(), 'Retain this draft when the email provider is unavailable.');
  assert.equal(await fallbackPage.locator('#contact-form button[type="submit"]').isDisabled(), false);
  assert.match(await fallbackPage.locator('#notification-message').textContent(), /email.*directly/);
  console.log('PASS external-service failure: content usable, draft retained, email fallback shown');
  assert.deepEqual(errors, [], 'Unexpected browser JavaScript errors');
  console.log('PASS no uncaught JavaScript errors');
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
