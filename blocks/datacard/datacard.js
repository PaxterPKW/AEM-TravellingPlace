const PIN_ICON = '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>';

/**
 * Slugifies a string for use as a localStorage key.
 * @param {string} str
 */
function toSlug(str) {
  return str.toLowerCase().replace(/[^\w\u0E00-\u0E7F]+/g, '-').replace(/^-|-$/g, '') || 'place';
}

/**
 * Parses authored block rows into an array of card data objects.
 * Rows with first column text "---" (or empty both columns) act as card separators.
 * @param {Element} block
 * @returns {Array.<Object.<string, Element>>}
 */
function parseAllCards(block) {
  const cards = [];
  let current = {};

  [...block.children].forEach((row) => {
    const [keyCol, valCol] = [...row.children];
    const key = keyCol?.textContent.trim().toLowerCase() || '';

    if (key === '---' || (!key && !valCol?.textContent.trim())) {
      if (Object.keys(current).length) {
        cards.push(current);
        current = {};
      }
      return;
    }

    if (key && valCol) current[key] = valCol;
  });

  if (Object.keys(current).length) cards.push(current);
  return cards;
}

/**
 * Builds the hero image HTML, preserving <picture> for responsive images.
 * @param {Element|undefined} imageCol
 */
function buildHeroHtml(imageCol) {
  if (!imageCol) return '<img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800" alt="" loading="lazy" />';
  const picture = imageCol.querySelector('picture');
  if (picture) return picture.outerHTML;
  const img = imageCol.querySelector('img');
  if (img) return img.outerHTML;
  return '<img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800" alt="" loading="lazy" />';
}

/**
 * Builds genre tag chips from a comma-separated string.
 * @param {Element|undefined} tagsCol
 */
function buildTagsHtml(tagsCol) {
  if (!tagsCol) return '';
  return tagsCol.textContent
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => `<span class="genre-tag">${t}</span>`)
    .join('');
}

/**
 * Builds highlight list items from <li>, <p> tags, or comma-separated text.
 * @param {Element|undefined} highlightsCol
 */
function buildHighlightsHtml(highlightsCol) {
  if (!highlightsCol) return '';
  const items = [...highlightsCol.querySelectorAll('li, p')]
    .map((el) => el.textContent.trim())
    .filter(Boolean);
  if (items.length) return items.map((h) => `<li>${h}</li>`).join('');
  return highlightsCol.textContent
    .split(',')
    .map((h) => h.trim())
    .filter(Boolean)
    .map((h) => `<li>${h}</li>`)
    .join('');
}

/**
 * Builds the full HTML string for a single place card.
 * @param {Object.<string, Element>} data
 */
function buildCardHtml(data) {
  const heroHtml = buildHeroHtml(data.image);
  const title = data.title?.textContent.trim() || 'สถานที่ท่องเที่ยว';
  const location = data.location?.textContent.trim() || '';
  const tagsHtml = buildTagsHtml(data.tags);
  const summaryHtml = data.summary?.innerHTML.trim() || '';
  const highlightsHtml = buildHighlightsHtml(data.highlights);
  const placeId = toSlug(title);

  return `
    <div class="place-card" data-place-id="${placeId}">
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
          <button class="action-btn love-btn" type="button" data-action="love" aria-pressed="false">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span>Love</span>
          </button>
          <button class="action-btn visited-btn" type="button" data-action="visited" aria-pressed="false">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
            <span>Visited</span>
          </button>
          <button class="action-btn swipe-btn" type="button" data-action="swipe" aria-pressed="false">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M13.025 1l-2.847 2.828 6.176 6.176H0v3.992h16.354l-6.176 6.176L13.025 23 24 12z"/>
            </svg>
            <span>Swipe</span>
          </button>
        </div>

      </div>
    </div>`;
}

/**
 * Attaches localStorage toggle logic to each action button inside a card.
 * @param {Element} card
 */
function attachActionButtons(card) {
  const placeId = card.dataset.placeId || 'place';
  card.querySelectorAll('.action-btn[data-action]').forEach((btn) => {
    const { action } = btn.dataset;
    const storageKey = `datacard-${placeId}-${action}`;

    if (localStorage.getItem(storageKey) === '1') {
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
    }

    btn.addEventListener('click', () => {
      const isActive = btn.classList.toggle('active');
      btn.setAttribute('aria-pressed', String(isActive));
      if (isActive) {
        localStorage.setItem(storageKey, '1');
      } else {
        localStorage.removeItem(storageKey);
      }
    });
  });
}

/**
 * Sets the stack wrapper height to match the top card + peek offset.
 * @param {Element} stack
 */
function syncStackHeight(stack) {
  const topCard = stack.querySelector('.place-card');
  if (!topCard) return;
  stack.style.height = `${topCard.offsetHeight + 32}px`;
}

/**
 * Loads and decorates the datacard block.
 *
 * Authored block structure — multiple cards separated by a "---" row:
 *
 *   image      | <picture> or <img>
 *   title      | ชื่อสถานที่
 *   location   | เมือง, ประเทศ
 *   tags       | tag1, tag2, tag3
 *   summary    | <p>ข้อความ...</p>
 *   highlights | <ul><li>...</li></ul>
 *   ---        | (separator → starts next card)
 *   image      | ...
 *   title      | ...
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const allCards = parseAllCards(block);

  const stackHtml = allCards.map(buildCardHtml).join('');
  block.innerHTML = `<div class="datacard-stack">${stackHtml}</div>`;

  const stack = block.querySelector('.datacard-stack');

  block.querySelectorAll('.place-card').forEach((card) => {
    attachActionButtons(card);
  });

  syncStackHeight(stack);

  const ro = new ResizeObserver(() => syncStackHeight(stack));
  const topCard = stack.querySelector('.place-card');
  if (topCard) ro.observe(topCard);
}
