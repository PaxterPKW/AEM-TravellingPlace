/**
 * loads and decorates the datacard block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  block.innerHTML = `
    <div class="place-card">
      <div class="place-img-container">
        <div class="place-img"></div>
        <div class="place-overlay"></div>
      </div>
      <div class="place-content">

        <div class="title-row">
          <h1 class="place-title">Railay Beach</h1>
        </div>

        <div class="location">
          <svg class="location-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <span>กระบี่, ประเทศไทย</span>
        </div>

        <div class="genres">
          <span class="genre-tag">ชายหาด</span>
          <span class="genre-tag">ผจญภัย</span>
          <span class="genre-tag">ธรรมชาติ</span>
        </div>

        <div class="description-section">
          <h5 class="section-title">SUMMARY</h5>
          <p class="place-description">
            อ่าวไร่เลย์เป็นคาบสมุทรที่ถูกล้อมรอบด้วยหน้าผาหินปูนสูงชันและทะเลสีฟ้าใสจนไม่สามารถเดินทางถึงได้ทางบก เสน่ห์ของที่นี่อยู่ที่ความบริสุทธิ์ของธรรมชาติ หาดทรายขาวนุ่ม และบรรยากาศที่แตกต่างจากที่ไหนในโลก
          </p>
        </div>

        <div class="highlights-section">
          <h5 class="section-title">HIGHLIGHTS</h5>
          <ul class="highlights-list">
            <li>หน้าผาหินปูนสูงชัน เหมาะสำหรับปีนผา</li>
            <li>เดินทางได้ทางเรือเท่านั้น</li>
            <li>ถ้ำพระนาง สถานที่ศักดิ์สิทธิ์ริมชายหาด</li>
            <li>พระอาทิตย์ตกดินที่สวยงามระดับโลก</li>
          </ul>
        </div>

        <div class="action-row">
          <button class="action-btn love-btn" type="button">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span>Love</span>
          </button>
          <button class="action-btn visited-btn" type="button">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
            <span>Visited</span>
          </button>
          <button class="action-btn swipe-btn" type="button">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M13.025 1l-2.847 2.828 6.176 6.176H0v3.992h16.354l-6.176 6.176L13.025 23 24 12z"/>
            </svg>
            <span>Swipe</span>
          </button>
        </div>

      </div>
    </div>
  `;
}
