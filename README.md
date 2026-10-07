# Santhosh · Sunset Glass 2026

A static, responsive portfolio inspired by cinematic sunset colors and rounded glass interfaces. The original `index.hetml` is now the standard `index.html` entry point.

## Preview

Run `npm start` (or `npm.cmd start` in Windows PowerShell), then open http://127.0.0.1:4173. No build step is required. The preview server binds only to your computer.

To publish on your existing static host, upload `index.html` and the `assets/` folder together. This update has not been deployed.

## Structure

- `index.html`: portfolio content, project/resume links, SEO, and semantic page structure.
- `assets/base.css`: extracted base styles for the existing portfolio components.
- `assets/edition.css`: design tokens, sunset glass styling, artwork, responsive layouts, and accessibility preferences.
- `assets/core.js`: navigation, themes, project filters, dialogs, GitHub data, contact submission, and local time.
- `assets/edition.js`: original project covers, motion controls, keyboard/dialog accessibility, reveals, and deferred 3D loading.
- `scripts/serve.cjs`: dependency-free local preview server.
- `scripts/check.cjs`: browser regression checks; screenshots are saved in ignored `artifacts/`.

## What changed

Projects now appear immediately after the introduction. All ten projects retain their original live and repository links. Placeholder thumbnails are replaced by locally rendered graphic covers, explicitly labeled as concept artwork. Existing résumé choices, certificates, experience, and contact details are preserved.

The interface includes a floating glass navigation bar, a CSS studio illustration with pointer-reactive lighting, subtle floating motion, one-time section reveals, rounded cards, and light/dark themes. Small screens receive a stacked layout and an expandable navigation menu. Skills and certificates use native horizontal scrolling rather than autoplay carousels.

Motion follows the operating system's reduced-motion preference and can also be paused with the hero control. The OS preference takes precedence. Keyboard users can open cards with Enter/Space, close dialogs with Escape, and navigate inside them with contained focus. Reduced transparency and increased contrast preferences are supported.

The forced loading screen and AOS/Swiper dependencies were removed. The 3D viewer and GitHub requests load near their sections. The old unverified Lighthouse score block and generic case-study claims are not shown in this edition.

## Verification

Install development dependencies with `npm install`, start the preview server, and run `npm test`. On Windows with PowerShell script restrictions, use `npm.cmd`.

The checks use installed Microsoft Edge through Playwright. They cover 320, 390, 768, 1024, and 1440-pixel layouts, clipped project labels, filters, keyboard dialogs, focus restoration, résumé controls, theme persistence, mobile navigation, reduced motion, and contact-form serialization. Email transport is mocked: tests do not send messages. A separate pass blocks external requests to check graceful failure.

External fonts, icons, profile/certificate images, the 3D model, GitHub, and EmailJS still require connectivity. Live email delivery and third-party project availability have not been verified. Project hosts may block embedding; direct project/source links remain available. Existing content claims and supplied contact details were not independently audited.

## Design references

- [Rockstar Games / GTA VI](https://www.rockstargames.com/VI): cinematic presentation and expressive color inspiration.
- [Apple / Meet Liquid Glass](https://developer.apple.com/videos/play/wwdc2025/219/): glass materials, content legibility, and accessibility adaptations.
- [Apple / Materials](https://developer.apple.com/design/human-interface-guidelines/materials): layered navigation and controls.

The artwork is original CSS geometry. No Rockstar artwork or game assets are included.
