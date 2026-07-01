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

  // Fetch both data.csv and meta.json to filter out 6am-purple markets
  const [dataText, metaJson] = await Promise.all([
    fetch('https://6am-city-inc.github.io/audience-analytics/data.csv').then(r => r.text()),
    fetch('https://6am-city-inc.github.io/audience-analytics/meta.json').then(r => r.json())
  ]);

  const rows = dataText.trim().split('\n').slice(1); // Skip header

  // Create a set of markets with 6am-purple brand color to exclude
  const purpleMarkets = new Set(
    metaJson
      .filter(entry => entry['Brand Color'] === '6am-purple')
      .map(entry => entry['Market'])
  );

  // Find insertion point - position after the 6am-city-newsletters header
  const insertionPoint = document.getElementById('6am-city-newsletters');
  const targetElement = insertionPoint ? insertionPoint.closest('.LogoListB') : null;
  let lastInserted = targetElement;

  // Only create containers for markets that are NOT 6am-purple
  rows.forEach(row => {
    const market = row.split(',')[0]?.trim();
    if (!market || purpleMarkets.has(market)) return;

    const container = document.createElement('div');
    container.className = 'sixam-embed';
    container.dataset.market = market;

    // Insert after the header or the last inserted element
    if (lastInserted && lastInserted !== document.body) {
      lastInserted.insertAdjacentElement('afterend', container);
      lastInserted = container;
    } else {
      document.body.appendChild(container);
    }
  });

  // Load embed.js last
  const script = document.createElement('script');
  script.src = 'https://6am-city-inc.github.io/audience-analytics/embed.js';
  script.defer = true;
  head.appendChild(script);
})();
