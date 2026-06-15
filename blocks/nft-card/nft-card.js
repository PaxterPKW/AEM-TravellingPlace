export default function decorate(block) {
  const rows = [...block.children];
  const [, dataRow] = rows;
  const cells = [...dataRow.children];

  const name = cells[0].textContent.trim();
  const img = cells[1].querySelector('img') || null;
  const price = cells[2].textContent.trim();
  const daysLeft = cells[3].textContent.trim();

  block.innerHTML = `
    <div class="card-container">
      <a href="/" class="hero-image-container">
        <img class="hero-image" src="${img?.src || ''}" alt="${name}"/>
      </a>
      <main class="main-content">
        <h1>${name}</h1>
        <div class="flex-row">
          <div class="time-left">
            <p>${daysLeft}</p>
          </div>
        </div>
      </main>
      <div class="card-attribute">
        <p>Price: <span>${price}</span></p>
      </div>
    </div>
  `;
}
