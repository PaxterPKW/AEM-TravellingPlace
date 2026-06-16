import { readBlockConfig } from '../../scripts/aem.js';

const STORAGE_PREFIX = 'datacard-';

const RESET_ICON = `<path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99
  8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65
  4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>`;

function clearDatacardState() {
  Object.keys(localStorage)
    .filter((key) => key.startsWith(STORAGE_PREFIX))
    .forEach((key) => localStorage.removeItem(key));
}

/**
 * Loads and decorates the state-reset block.
 *
 * Renders a button that clears all datacard localStorage entries
 * (love / visited / swipe) and reloads the page.
 *
 * Authored block structure (in Google Doc / Word):
 *   | State Reset |                       |
 *   | label       | ล้างประวัติทั้งหมด   |  ← optional
 *
 * Omitting the label row uses the default Thai label.
 *
 * @param {Element} block
 */
export default function decorate(block) {
  const cfg = readBlockConfig(block);
  const label = cfg.label || 'รีเซ็ตการ์ดทั้งหมด';

  block.innerHTML = `
    <button class="state-reset-btn" type="button" aria-label="${label}">
      <svg viewBox="0 0 24 24" aria-hidden="true">${RESET_ICON}</svg>
      <span>${label}</span>
    </button>`;

  const btn = block.querySelector('.state-reset-btn');
  btn.addEventListener('click', () => {
    clearDatacardState();
    btn.classList.add('state-reset-done');
    btn.querySelector('span').textContent = 'รีเซ็ตแล้ว!';
    setTimeout(() => window.location.reload(), 800);
  });
}
