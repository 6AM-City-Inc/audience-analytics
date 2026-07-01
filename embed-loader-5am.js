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

  // Fetch 5am-data.csv to get market list
  const response = await fetch('https://6am-city-inc.github.io/audience-analytics/5am-data.csv');
  const text = await response.text();
  const rows = text.trim().split('\n').slice(1); // Skip header

  // Find the insertion point - look for the 5AM City header anchor or LogoListB div
  const insertionPoint = document.getElementById('5am-city-newsletters') ||
    document.querySelector('.LogoListB');

  // Find the target element (the LogoListB div)
  const targetElement = insertionPoint ? (insertionPoint.closest('.LogoListB') || insertionPoint) : null;

  // Keep track of where to insert the next element
  let lastInserted = targetElement;

  rows.forEach(row => {
    const market = row.split(',')[0]?.trim();
    if (!market) return;

    const container = document.createElement('div');
    container.className = 'fiveam-embed';
    container.dataset.market = market;

    // Insert after the target element or the last inserted element
    if (lastInserted && lastInserted !== document.body) {
      lastInserted.insertAdjacentElement('afterend', container);
      lastInserted = container; // Update to insert next one after this
    } else {
      document.body.appendChild(container);
    }
  });

  // Load embed-5am.js last
  const script = document.createElement('script');
  script.src = 'https://6am-city-inc.github.io/audience-analytics/embed-5am.js';
  script.defer = true;
  head.appendChild(script);
})();
