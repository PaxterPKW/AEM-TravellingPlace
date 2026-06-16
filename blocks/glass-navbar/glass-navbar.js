const STORAGE_PREFIX = 'datacard-';

const RESET_PATH = `M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99
  8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04
  4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22
  1.78L13 11h7V4l-2.35 2.35z`;

function clearDatacardState() {
  Object.keys(localStorage)
    .filter((key) => key.startsWith(STORAGE_PREFIX))
    .forEach((key) => localStorage.removeItem(key));
}

/**
 * Loads and decorates the glass-navbar block.
 *
 * Compact dark pill bar with hamburger menu and state-reset button.
 * Hamburger opens a full-screen drawer with large nav links.
 *
 * Authored block structure (in Google Doc / Word):
 *   | Glass Navbar |                          |
 *   | [การ์ดสถานที่](/)                       |
 *   | [สถานที่เคยไปมาแล้ว](/visited)          |
 *   | [สถานที่ชอบ](/loved)                    |
 *
 * @param {Element} block
 */
export default function decorate(block) {
  const links = [...block.querySelectorAll('a')].map((a) => ({
    text: a.textContent.trim(),
    href: a.getAttribute('href') || '#',
  }));

  const currentPath = window.location.pathname;
  const drawerLinksHtml = links.map((link) => {
    let path;
    try { path = new URL(link.href, window.location.origin).pathname; } catch { path = link.href; }
    const active = path === currentPath ? ' active' : '';
    return `<a class="gn-drawer-link${active}" href="${link.href}">${link.text}</a>`;
  }).join('');

  block.innerHTML = `
    <div class="gn-bar">
      <button class="gn-toggle" type="button" aria-expanded="false" aria-label="เปิดเมนู">
        <svg class="gn-icon gn-icon-ham" viewBox="0 0 24 24" aria-hidden="true"
          fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
        <svg class="gn-icon gn-icon-x" viewBox="0 0 24 24" aria-hidden="true"
          fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="6" y1="6" x2="18" y2="18"/>
          <line x1="18" y1="6" x2="6" y2="18"/>
        </svg>
        <span class="gn-toggle-label">Menu</span>
      </button>

      <button class="gn-reset-btn" type="button" aria-label="รีเซ็ตการ์ดทั้งหมด">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="${RESET_PATH}"/></svg>
        <span>รีเซ็ต</span>
      </button>
    </div>

    <nav class="gn-drawer" aria-hidden="true" aria-label="Navigation menu">
      <p class="gn-drawer-label">เมนู</p>
      ${drawerLinksHtml}
    </nav>`;

  /* ── Reset ── */
  const resetBtn = block.querySelector('.gn-reset-btn');
  resetBtn.addEventListener('click', () => {
    clearDatacardState();
    resetBtn.classList.add('gn-reset-done');
    resetBtn.querySelector('span').textContent = 'รีเซ็ตแล้ว!';
    setTimeout(() => window.location.reload(), 800);
  });

  /* ── Drawer open / close ── */
  const toggle = block.querySelector('.gn-toggle');
  const toggleLabel = toggle.querySelector('.gn-toggle-label');
  const drawer = block.querySelector('.gn-drawer');

  const openDrawer = () => {
    block.classList.add('gn-open');
    drawer.classList.add('active');
    drawer.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'ปิดเมนู');
    toggleLabel.textContent = 'Close';
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    block.classList.remove('gn-open');
    drawer.classList.remove('active');
    drawer.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'เปิดเมนู');
    toggleLabel.textContent = 'Menu';
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => {
    if (block.classList.contains('gn-open')) closeDrawer();
    else openDrawer();
  });

  drawer.querySelectorAll('.gn-drawer-link').forEach((link) => {
    link.addEventListener('click', closeDrawer);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && block.classList.contains('gn-open')) closeDrawer();
  });
}
