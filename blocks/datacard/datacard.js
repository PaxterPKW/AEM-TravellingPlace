import { readBlockConfig } from '../../scripts/aem.js';

const PIN_ICON = '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>';
const SWIPE_THRESHOLD = 80;

/* ─────────────────────────────────────────
   Page background
───────────────────────────────────────── */

/**
 * Crossfades the full-page blurred background to a new image.
 * Appends/removes `.datacard-bg` elements on <body>.
 * @param {string|null} imageUrl
 */
function updateBackground(imageUrl) {
  const prev = document.querySelector('.datacard-bg');

  if (!imageUrl) {
    if (prev) {
      prev.classList.remove('datacard-bg-active');
      prev.addEventListener('transitionend', () => prev.remove(), { once: true });
    }
    return;
  }

  const next = document.createElement('div');
  next.className = 'datacard-bg';
  next.style.backgroundImage = `url("${imageUrl}")`;
  document.body.prepend(next);

  requestAnimationFrame(() => {
    next.classList.add('datacard-bg-active');
    if (prev) {
      prev.classList.remove('datacard-bg-active');
      prev.addEventListener('transitionend', () => prev.remove(), { once: true });
    }
  });
}

/* ─────────────────────────────────────────
   Data fetcher
───────────────────────────────────────── */

function toSlug(str) {
  return str.toLowerCase().replace(/[^\w\u0E00-\u0E7F]+/g, '-').replace(/^-|-$/g, '') || 'place';
}

/**
 * Fetches card data from an AEM spreadsheet JSON endpoint.
 * Expects the standard AEM query-index shape: { data: [ {...}, ... ] }
 * @param {string} source  Path without .json extension, e.g. "/places"
 * @returns {Promise<Array.<Object.<string, string>>>}
 */
async function fetchCards(source) {
  try {
    const url = source.endsWith('.json') ? source : `${source}.json`;
    const resp = await fetch(url);
    if (!resp.ok) return [];
    const json = await resp.json();
    return json.data || [];
  } catch {
    return [];
  }
}

/* ─────────────────────────────────────────
   Content builders  (plain strings → HTML)
───────────────────────────────────────── */

function buildHeroHtml(imageUrl) {
  const src = imageUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800';
  return `<img src="${src}" alt="" loading="lazy" />`;
}

function buildTagsHtml(tags) {
  if (!tags) return '';
  return tags.split(',').map((t) => t.trim()).filter(Boolean)
    .map((t) => `<span class="genre-tag">${t}</span>`)
    .join('');
}

function buildHighlightsHtml(highlights) {
  if (!highlights) return '';
  return highlights.split(/[,\n]/).map((h) => h.trim()).filter(Boolean)
    .map((h) => `<li>${h}</li>`)
    .join('');
}

function buildCardHtml(data) {
  const heroHtml = buildHeroHtml(data.image);
  const title = data.title || 'สถานที่ท่องเที่ยว';
  const location = data.location || '';
  const tagsHtml = buildTagsHtml(data.tags);
  const summaryHtml = data.summary ? `<p>${data.summary}</p>` : '';
  const highlightsHtml = buildHighlightsHtml(data.highlights);
  const placeId = toSlug(title);

  return `
    <div class="place-card" data-place-id="${placeId}" data-image="${data.image || ''}">
      <div class="choice-overlay" aria-hidden="true">
        <span class="choice-label choice-love-label">LOVE</span>
        <span class="choice-label choice-skip-label">SKIP</span>
      </div>
      <div class="place-img-container">
        ${heroHtml}
        <div class="place-overlay"></div>
      </div>
      <div class="place-content">
        <div class="title-row">
          <h1 class="place-title">${title}</h1>
        </div>
        ${location ? `
        <div class="location">
          <svg class="location-icon" viewBox="0 0 24 24" aria-hidden="true">${PIN_ICON}</svg>
          <span>${location}</span>
        </div>` : ''}
        ${tagsHtml ? `<div class="genres">${tagsHtml}</div>` : ''}
        ${summaryHtml ? `
        <div class="description-section">
          <h5 class="section-title">SUMMARY</h5>
          <div class="place-description">${summaryHtml}</div>
        </div>` : ''}
        ${highlightsHtml ? `
        <div class="highlights-section">
          <h5 class="section-title">HIGHLIGHTS</h5>
          <ul class="highlights-list">${highlightsHtml}</ul>
        </div>` : ''}
        <div class="action-row">
          <button class="action-btn swipe-btn" type="button" aria-pressed="false" aria-label="Skip">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
            <span>Skip</span>
          </button>
          <button class="action-btn visited-btn" type="button" aria-pressed="false" aria-label="Visited">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
            <span>Visited</span>
          </button>
          <button class="action-btn love-btn" type="button" aria-pressed="false" aria-label="Love">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span>Love</span>
          </button>
        </div>
      </div>
    </div>`;
}

/* ─────────────────────────────────────────
   Stack height
───────────────────────────────────────── */

function syncStackHeight(stack) {
  const top = stack.querySelector('.place-card');
  if (!top) return;
  stack.style.height = `${top.offsetHeight + 32}px`;
}

/* ─────────────────────────────────────────
   Choice overlay
───────────────────────────────────────── */

function updateChoiceOverlay(card, dx) {
  const overlay = card.querySelector('.choice-overlay');
  if (!overlay) return;
  const progress = Math.min(Math.abs(dx) / SWIPE_THRESHOLD, 1);

  if (dx > 10) {
    overlay.dataset.choice = 'love';
    overlay.style.opacity = progress;
  } else if (dx < -10) {
    overlay.dataset.choice = 'skip';
    overlay.style.opacity = progress;
  } else {
    overlay.dataset.choice = '';
    overlay.style.opacity = '0';
  }
}

function resetOverlay(card) {
  const overlay = card.querySelector('.choice-overlay');
  if (!overlay) return;
  overlay.dataset.choice = '';
  overlay.style.opacity = '0';
}

/* ─────────────────────────────────────────
   Dismiss & snap
───────────────────────────────────────── */

function snapBack(card) {
  card.style.transition = 'transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
  card.style.transform = '';
  resetOverlay(card);
  card.addEventListener('transitionend', () => { card.style.transition = ''; }, { once: true });
}

function dismissCard(card, direction, onDone) {
  card.style.transition = 'none';
  const cls = { right: 'fly-right', left: 'fly-left', up: 'fly-up' };
  card.classList.add(cls[direction] ?? 'fly-left');
  card.addEventListener('animationend', () => { card.remove(); onDone?.(); }, { once: true });
}

function showEmptyState(stack) {
  stack.style.height = '';
  stack.innerHTML = `
    <div class="empty-state">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
      <p>คุณดูครบทุกสถานที่แล้ว!</p>
    </div>`;
}

/* ─────────────────────────────────────────
   Drag interaction
───────────────────────────────────────── */

function attachDrag(card, stack, onDismiss) {
  let startX = 0;
  let startY = 0;
  let isDragging = false;
  let dragConfirmed = false;
  let currentDx = 0;

  card.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (e.target.closest('button')) return;
    startX = e.clientX;
    startY = e.clientY;
    isDragging = true;
    dragConfirmed = false;
    currentDx = 0;
    card.setPointerCapture(e.pointerId);
  });

  card.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (!dragConfirmed) {
      if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
      if (Math.abs(dy) > Math.abs(dx)) { isDragging = false; return; }
      dragConfirmed = true;
      card.style.transition = 'none';
    }

    currentDx = dx;
    const rotate = dx / 15;
    card.style.transform = `translateX(${dx}px) translateY(${Math.abs(dx) * 0.04}px) rotate(${rotate}deg)`;
    updateChoiceOverlay(card, dx);
  });

  const endDrag = () => {
    if (!isDragging) return;
    isDragging = false;

    if (dragConfirmed && Math.abs(currentDx) >= SWIPE_THRESHOLD) {
      const direction = currentDx > 0 ? 'right' : 'left';
      const placeId = card.dataset.placeId || 'place';
      localStorage.setItem(`datacard-${placeId}-${direction === 'right' ? 'love' : 'swipe'}`, '1');
      dismissCard(card, direction, () => onDismiss());
    } else {
      snapBack(card);
    }
  };

  card.addEventListener('pointerup', endDrag);
  card.addEventListener('pointercancel', endDrag);
}

/* ─────────────────────────────────────────
   Button handlers (top card only)
───────────────────────────────────────── */

function initTopCard(card, stack, onDismiss) {
  const placeId = card.dataset.placeId || 'place';

  const visitedBtn = card.querySelector('.visited-btn');
  if (visitedBtn) {
    const key = `datacard-${placeId}-visited`;
    if (localStorage.getItem(key) === '1') {
      visitedBtn.classList.add('active');
      visitedBtn.setAttribute('aria-pressed', 'true');
    }
    visitedBtn.addEventListener('click', () => {
      localStorage.setItem(key, '1');
      visitedBtn.classList.add('active');
      visitedBtn.setAttribute('aria-pressed', 'true');
      dismissCard(card, 'up', () => onDismiss());
    });
  }

  const loveBtn = card.querySelector('.love-btn');
  if (loveBtn) {
    const key = `datacard-${placeId}-love`;
    if (localStorage.getItem(key) === '1') loveBtn.classList.add('active');
    loveBtn.addEventListener('click', () => {
      localStorage.setItem(key, '1');
      loveBtn.classList.add('active');
      dismissCard(card, 'right', () => onDismiss());
    });
  }

  const swipeBtn = card.querySelector('.swipe-btn');
  if (swipeBtn) {
    swipeBtn.addEventListener('click', () => {
      localStorage.setItem(`datacard-${placeId}-swipe`, '1');
      dismissCard(card, 'left', () => onDismiss());
    });
  }

  attachDrag(card, stack, onDismiss);
}

/* ─────────────────────────────────────────
   Block entry point
───────────────────────────────────────── */

/**
 * Loads and decorates the datacard block.
 *
 * Authored block structure (in Google Doc / Word):
 *   | Datacard |          |
 *   | source   | /places  |
 *
 * The "source" value is the path to an AEM spreadsheet (without .json).
 * AEM publishes the sheet as JSON at that path, e.g. /places.json,
 * with shape: { "total": N, "data": [ { image, title, location, tags, summary, highlights } ] }
 *
 * For local development, create /places.json in the project root as a mock.
 *
 * @param {Element} block
 */
export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  const source = cfg.source || '/places';

  const allCards = await fetchCards(source);
  block.innerHTML = `<div class="datacard-stack">${allCards.map(buildCardHtml).join('')}</div>`;

  const stack = block.querySelector('.datacard-stack');

  if (!allCards.length) {
    showEmptyState(stack);
    return;
  }

  let resizeObserver = null;

  function setupResizeObserver() {
    resizeObserver?.disconnect();
    const top = stack.querySelector('.place-card');
    if (!top) return;
    resizeObserver = new ResizeObserver(() => syncStackHeight(stack));
    resizeObserver.observe(top);
  }

  function onDismiss() {
    const next = stack.querySelector('.place-card');
    if (!next) {
      resizeObserver?.disconnect();
      showEmptyState(stack);
      updateBackground(null);
      return;
    }
    updateBackground(next.dataset.image);
    syncStackHeight(stack);
    setupResizeObserver();
    initTopCard(next, stack, onDismiss);
  }

  const topCard = stack.querySelector('.place-card');
  if (topCard) {
    updateBackground(topCard.dataset.image);
    initTopCard(topCard, stack, onDismiss);
    syncStackHeight(stack);
    setupResizeObserver();
  }
}
