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

function getPath(href) {
  try {
    return new URL(href, window.location.origin).pathname;
  } catch {
    return href;
  }
}

function moveIndicator(indicator, item) {
  const el = indicator;
  el.style.width = `${item.offsetWidth}px`;
  el.style.left = `${item.offsetLeft}px`;
}

function buildItems(links) {
  const currentPath = window.location.pathname;
  return links.map((link) => {
    const active = getPath(link.href) === currentPath ? ' active' : '';
    return `<a class="gn-item${active}" href="${link.href}">${link.text}</a>`;
  }).join('');
}

function buildMobileLinks(links) {
  const currentPath = window.location.pathname;
  return links.map((link) => {
    const active = getPath(link.href) === currentPath ? ' active' : '';
    return `<a class="gn-mobile-link${active}" href="${link.href}">${link.text}</a>`;
  }).join('');
}

/**
 * Loads and decorates the glass-navbar block.
 *
 * Authored block structure (in Google Doc / Word):
 *   | Glass Navbar |                          |
 *   | [การ์ดสถานที่](/)                       |
 *   | [สถานที่เคยไปมาแล้ว](/visited)          |
 *   | [สถานที่ชอบ](/loved)                    |
 *
 * Each row contains one anchor tag = one nav item.
 * Left  : state-reset button
 * Center: nav menu with sliding glass indicator
 * Right : logo placeholder (reserved)
 *
 * @param {Element} block
 */
export default function decorate(block) {
  const links = [...block.querySelectorAll('a')].map((a) => ({
    text: a.textContent.trim(),
    href: a.getAttribute('href') || '#',
  }));

  block.innerHTML = `
    <nav class="gn-nav">
      <button class="gn-reset-btn" type="button" aria-label="รีเซ็ตการ์ดทั้งหมด">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="${RESET_PATH}"/>
        </svg>
        <span>รีเซ็ต</span>
      </button>

      <div class="gn-menu">
        <div class="gn-indicator" aria-hidden="true"></div>
        ${buildItems(links)}
      </div>

      <div class="gn-logo" aria-hidden="true"></div>

      <button class="gn-mobile-btn" type="button"
        aria-label="เปิดเมนู" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </nav>

    <div class="gn-mobile-menu" aria-hidden="true">
      ${buildMobileLinks(links)}
    </div>`;

  /* ── Sliding indicator ── */
  const indicator = block.querySelector('.gn-indicator');
  const items = [...block.querySelectorAll('.gn-item')];
  const menu = block.querySelector('.gn-menu');
  const activeItem = block.querySelector('.gn-item.active') || items[0];

  if (activeItem) {
    requestAnimationFrame(() => moveIndicator(indicator, activeItem));
  }

  items.forEach((item) => {
    item.addEventListener('mouseenter', () => moveIndicator(indicator, item));
    item.addEventListener('click', () => {
      items.forEach((i) => i.classList.remove('active'));
      item.classList.add('active');
    });
  });

  menu.addEventListener('mouseleave', () => {
    const current = block.querySelector('.gn-item.active') || items[0];
    if (current) moveIndicator(indicator, current);
  });

  /* ── Reset button ── */
  const resetBtn = block.querySelector('.gn-reset-btn');
  resetBtn.addEventListener('click', () => {
    clearDatacardState();
    resetBtn.classList.add('gn-reset-done');
    resetBtn.querySelector('span').textContent = 'รีเซ็ตแล้ว!';
    setTimeout(() => window.location.reload(), 800);
  });

  /* ── Mobile hamburger ── */
  const mobileBtn = block.querySelector('.gn-mobile-btn');
  const mobileMenu = block.querySelector('.gn-mobile-menu');

  const toggleMobile = (force) => {
    const open = typeof force === 'boolean' ? force : !mobileMenu.classList.contains('active');
    mobileBtn.classList.toggle('active', open);
    mobileBtn.setAttribute('aria-expanded', String(open));
    mobileMenu.classList.toggle('active', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
  };

  mobileBtn.addEventListener('click', () => toggleMobile());

  document.addEventListener('click', (e) => {
    if (!block.contains(e.target)) toggleMobile(false);
  });
}
