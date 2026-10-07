/* Mechanical content reorganization for the cinematic edition. Run once. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const target = path.join(root, 'index.html');
let html = fs.readFileSync(target, 'utf8');
if (html.includes('assets/cinema.css')) { console.log('Cinematic content already installed.'); process.exit(0); }
const resume = html.match(/<div class="resume-dropdown-container"[\s\S]*?<\/div>\s*<\/div>/);
assert(resume, 'Resume links must be preserved');
const social = html.match(/<div class="social-links">[\s\S]*?<\/div>/);
assert(social, 'Social links must be preserved');
const start = html.indexOf('    <!-- Hero Section -->');
const end = html.indexOf('    <!-- Projects Section -->', start);
assert(start > 0 && end > start);
const hero = `    <!-- Scroll-driven opening chapter -->
    <section id="home" class="hero" aria-label="Santhosh — creative developer">
      <div class="hero-sticky">
        <div class="hero-landscape" aria-hidden="true"></div>
        <div class="hero-shade" aria-hidden="true"></div>
        <div class="hero-grain" aria-hidden="true"></div>
        <div class="hero-edition"><span>SANSTUDIO PRESENTS</span><span>THE 2026 EDITION</span></div>
        <div class="hero-title-stage">
          <span class="hero-numeral" aria-hidden="true">26</span>
          <h1 class="hero-wordmark"><span>SAN</span><span>THOSH</span></h1>
          <p class="hero-roles">DEVELOPER. DESIGNER. WORLD BUILDER.</p>
        </div>
        <div class="hero-bottom">
          <div class="hero-location"><span>BASED IN INDIA.</span><strong>BUILT FOR EVERYWHERE.</strong></div>
          <a href="#intro" class="enter-world">ENTER MY WORLD <span aria-hidden="true">↓</span></a>
          <div class="hero-availability"><i></i> OPEN FOR OPPORTUNITIES</div>
        </div>
        <div class="hero-chapter" aria-hidden="true">01 — THE BEGINNING</div>
      </div>
    </section>

    <section id="intro" class="manifesto cinematic-section">
      <div class="manifesto-inner">
        <span class="eyebrow">A PORTFOLIO BY SANTHOSH A</span>
        <h2 class="manifesto-title">BIG IDEAS.<br>NO LIMITS.</h2>
        <p>From the first line of code to the final frame.<br>I build digital experiences with a world of their own.</p>
        <div class="intro-actions"><a class="btn" href="#projects">EXPLORE THE WORK <span aria-hidden="true">↗</span></a>${resume[0]}</div>
        <div class="intro-meta"><span>FRONTEND DEVELOPMENT</span><span>UI / UX DESIGN</span><span>3D & INTERACTION</span></div>
      </div>
      <span class="manifesto-watermark" aria-hidden="true">S.</span>
    </section>

    <nav class="chapter-nav" aria-label="Portfolio chapters"><a href="#home" aria-label="Opening chapter" class="active"><span>01</span></a><a href="#projects" aria-label="Selected work"><span>02</span></a><a href="#about" aria-label="About Santhosh"><span>03</span></a><a href="#contact" aria-label="Contact"><span>04</span></a></nav>

`;
html = html.slice(0, start) + hero + html.slice(end);
html = html.replace('assets/edition.css', 'assets/cinema.css');
html = html.replace('<script src="assets/edition.js"></script>', '<script src="assets/edition.js"></script>\n    <script src="assets/cinema.js"></script>');
html = html.replace('<meta name="theme-color" content="#101019">', '<meta name="theme-color" content="#0c0d1b">\n    <link rel="preload" as="image" href="assets/coastal-city.png">');
html = html.replace('<a href="#home" class="logo" aria-label="Santhosh home"><span class="brand-mark">s.</span> santhosh<span class="brand-period">®</span></a>', '<a href="#home" class="logo" aria-label="Santhosh home">S<span class="logo-star">★</span></a>');
html = html.replace('<div class="container nav-container">', '<div class="container nav-container">\n            <span class="header-edition">SANTHOSH / 26</span>');
html = html.replace('<small>01 / SELECTED WORK</small>Made with care.<br><em>Built to be used.</em>', '<small>CHAPTER 02 / SELECTED WORK</small>WELCOME TO<br><em>THE PLAYGROUND.</em>');
html = html.replace('<small>02 / THE PERSON BEHIND THE PIXELS</small>A curious mind.<br><em>A builder at heart.</em>', '<small>CHAPTER 03 / THE CREATOR</small>MEET<br><em>SANTHOSH.</em>');
html = html.replace('<small>03 / MY TOOLBOX</small>Ideas need <em>good tools.</em>', '<small>THE LOADOUT</small>TOOLS OF<br><em>THE TRADE.</em>');
html = html.replace('<small>04 / THE JOURNEY SO FAR</small>Learning. Building.<br><em>Moving forward.</em>', '<small>THE STORY SO FAR</small>EVERY CHAPTER.<br><em>A LEVEL UP.</em>');
html = html.replace('<small>05 / ALWAYS LEARNING</small>Curiosity, <em>certified.</em>', '<small>UNLOCKED ALONG THE WAY</small>KEEP<br><em>LEARNING.</em>');
html = html.replace('<small>06 / YOUR NEXT IDEA</small>Let’s make<br><em>something great.</em>', '<small>CHAPTER 04 / THE NEXT ADVENTURE</small>GOT A<br><em>BIG IDEA?</em>');
html = html.replace('<div class="project-filters" data-aos="fade-up">', '<div class="work-toolbar"><div class="project-filters" data-aos="fade-up">');
html = html.replace('            <div class="swiper projects-slider">', '            <div class="slide-controls"><button class="slide-prev" type="button" aria-label="Previous project">←</button><span class="slide-count" aria-live="polite">01 / 10</span><button class="slide-next" type="button" aria-label="Next project">→</button></div></div>\n            <div class="swiper projects-slider" id="project-reel" tabindex="0" role="region" aria-label="Project reel — swipe or use arrow buttons">');
html = html.replace('            <div class="footer-content">', '            <div class="footer-cinema"><span>SEE YOU IN THE<br>NEXT CHAPTER.</span><a href="#home" aria-label="Back to top">↑</a></div>\n            <div class="footer-content">');
html = html.replace('<div class="footer-logo">Santhosh <span>A</span></div>', '<div class="footer-logo">SANTHOSH A</div>' + social[0]);
html = html.replace('    <div class="reading-progress" aria-hidden="true"></div>', '    <div class="reading-progress" aria-hidden="true"></div>\n    <div class="opening-sequence" aria-hidden="true"><div class="opening-mark">S<span>★</span></div><div class="opening-caption">SANSTUDIO PRESENTS</div></div>\n    <button class="skip-opening" type="button">SKIP INTRO ↗</button>\n    <button class="motion-toggle" type="button" aria-pressed="false">Motion <span>on</span></button>');
// A failed external image gets only one fallback attempt.
html = html.replaceAll('onerror="this.src=', 'onerror="this.onerror=null;this.src=');
fs.writeFileSync(target, html);
console.log('Installed cinematic content; preserved résumé, contact and all project links.');
