(async function () {
  const head = document.head;

  // Load font
  const font = document.createElement('link');
  font.rel = 'stylesheet';
  font.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap';
  head.appendChild(font);

  // Load CSS
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = 'https://6am-city-inc.github.io/audience-analytics/style.css';
  head.appendChild(style);

  // Wait until DOM is ready
  if (document.readyState === 'loading') {
    await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
  }

  // Fetch both data.csv and meta.json to filter by brand color
  const [dataText, metaJson] = await Promise.all([
    fetch('https://6am-city-inc.github.io/audience-analytics/data.csv').then(r => r.text()),
    fetch('https://6am-city-inc.github.io/audience-analytics/meta.json').then(r => r.json())
  ]);

  const rows = dataText.trim().split('\n').slice(1); // Skip header

  // Create a map of markets with 6am-purple brand color
  const purpleMarkets = new Set(
    metaJson
      .filter(entry => entry['Brand Color'] === '6am-purple')
      .map(entry => entry['Market'])
  );

  // Find the insertion point - look for the 6AM City header anchor
  const insertionPoint = document.getElementById('6am-city-newsletters');
  const targetElement = insertionPoint ? insertionPoint.closest('.LogoListB') : null;

  let lastInserted = null;

  // Only create containers for markets with 6am-purple brand color
  rows.forEach(row => {
    const market = row.split(',')[0]?.trim();
    if (!market || !purpleMarkets.has(market)) return;

    const container = document.createElement('div');
    container.className = 'sixam-embed';
    container.dataset.market = market;

    if (!lastInserted && targetElement) {
      // Insert first container before the LogoListB header
      targetElement.insertAdjacentElement('beforebegin', container);
      lastInserted = container;
    } else if (lastInserted) {
      // Insert subsequent containers after the previous one
      lastInserted.insertAdjacentElement('afterend', container);
      lastInserted = container;
    } else {
      // Fallback if no target element
      document.body.appendChild(container);
    }
  });

  // Note: embed.js will be loaded by embed-loader.js after all 6AM containers are created
})();
