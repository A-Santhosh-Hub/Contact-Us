/* One-time, assertion-checked mechanical extraction of the original single file. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const file = path.join(root, 'index.html');
let html = fs.readFileSync(file, 'utf8');
if (html.includes('assets/base.css')) { console.log('Already migrated.'); process.exit(0); }
const style = html.match(/    <style>([\s\S]*?)    <\/style>/);
assert(style, 'Expected original base stylesheet');
const originalScript = html.match(/    <script>\s*\/\/ Initialize AOS[\s\S]*?    <\/script>/);
assert(originalScript, 'Expected original interaction script');
html = html.replace(style[0], '    <link rel="stylesheet" href="assets/base.css">');
html = html.replace(originalScript[0], '    <script src="assets/core.js"></script>');
// Replace the generic case-study template with the actual live preview.
const modalStart = html.indexOf('            <div class="project-modal-body">');
const modalEnd = html.indexOf('    <!-- Toast Notification Container -->', modalStart);
assert(modalStart > 0 && modalEnd > modalStart, 'Expected modal boundaries');
html = html.slice(0, modalStart) + `            <div class="project-modal-body">
                <div class="project-tab-pane active" id="tab-preview">
                    <iframe id="project-modal-iframe" title="Project live preview" referrerpolicy="strict-origin-when-cross-origin"></iframe>
                </div>
            </div>
        </div>
    </div>

` + html.slice(modalEnd);
// Lead with the portfolio itself; all project content and URLs are preserved.
const projectsStart = html.indexOf('    <!-- Projects Section -->');
const projectsEnd = html.indexOf('    <!-- GitHub Activity Section -->', projectsStart);
assert(projectsStart > 0 && projectsEnd > projectsStart, 'Expected project boundaries');
const projects = html.slice(projectsStart, projectsEnd);
html = html.slice(0, projectsStart) + html.slice(projectsEnd);
html = html.replace('    <!-- About Section -->', projects + '    <!-- About Section -->');
html = html.replace('03 / SELECTED WORK', '01 / SELECTED WORK').replace('01 / THE PERSON BEHIND THE PIXELS', '02 / THE PERSON BEHIND THE PIXELS').replace('02 / MY TOOLBOX', '03 / MY TOOLBOX');
// Add a document landmark around page content, keeping navigation and dialogs outside.
html = html.replace('    <!-- Hero Section -->', '    <main id="main-content">\n    <!-- Hero Section -->');
html = html.replace('    <!-- Footer -->', '    </main>\n    <!-- Footer -->');
fs.writeFileSync(path.join(root, 'assets/base.css'), style[1].trim() + '\n');
fs.writeFileSync(file, html);
console.log('Extracted base.css, switched to core.js, simplified project dialogs, reordered work.');
