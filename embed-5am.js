(async function () {
  console.log("📦 embed-5am.js is running...");

  const markets = document.querySelectorAll('.fiveam-embed');
  console.log("Attempting to load meta.json and 5am-data.csv...");

  const [metaJson, dataText] = await Promise.all([
    fetch('https://6am-city-inc.github.io/audience-analytics/meta.json').then(r => r.json()),
    fetch('https://6am-city-inc.github.io/audience-analytics/5am-data.csv').then(r => r.text())
  ]);

  console.log("Loaded meta.json:", metaJson.slice(0, 1));
  console.log("Loaded 5am-data.csv:", dataText.slice(0, 100));

  const parseCSV = text =>
    text
      .trim()
      .split('\n')
      .map(line => line.trim().split(','))
      .filter(row => row.length > 1 && row.some(cell => cell.trim() !== ''));

  const [dataHeaders, ...dataRows] = parseCSV(dataText);

  const metaMap = Object.fromEntries(
    metaJson.map(entry => [entry['Market'], entry])
  );

  markets.forEach(container => {
    const mkt = container.dataset.market;
    const dataRow = dataRows.find(r => r[0].trim() === mkt);
    const meta = metaMap[mkt];

    console.log("👉 Rendering for market:", mkt);
    if (!dataRow || !meta) {
      console.warn(`⚠️ Missing data for market: ${mkt}`);
      return;
    }

    const get = (headers, row, label) =>
      row[headers.indexOf(label)]?.trim() || '';

    const nlReaders = Number(get(dataHeaders, dataRow, 'Daily Newsletter Readers')).toLocaleString();

    const colorClass = `theme-${meta['Brand Color']?.toLowerCase() || 'default'}`;

    const iconMail = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>';

    const card = document.createElement('div');
    card.className = `analytics-sixam-card analytics-compact ${colorClass}`;
    card.id = mkt;
    card.innerHTML = `
      <img class="analyticslogo" src="https://6am-city-inc.github.io/audience-analytics/logos/${mkt}_PrimaryColor-Transparent-1000x1000.png" alt="${mkt} logo" />
      <div class="analytics-city-name">${meta['City Name']}</div>
      <div class="analytics-launch-date">Launched ${meta['Launch Date']}</div>
      <div class="audience-metric compact-metric">
        <span class="audience-metric-icon">${iconMail}</span>
        <span class="audience-metric-value">${nlReaders}</span>
        <span class="audience-metric-label" data-tooltip="Average number of unique readers opening our newsletter each send">Daily Newsletter Readers</span>
      </div>
      <a href="${meta['Audience Profile URL']}" target="_blank" class="analytics-cta-button">Audience Profile</a>
    `;

    // Create and insert anchor tag
    const anchor = document.createElement('a');
    anchor.className = 'AnchorLink';
    const anchorId = `${mkt}today`;
    anchor.id = anchorId;
    anchor.name = anchorId;
    anchor.setAttribute('data-cms-ai', '0');
    anchor.setAttribute('aria-label', 'Open this option');
    anchor.setAttribute('data-uw-rm-empty-ctrl', '');

    container.appendChild(anchor);
    container.appendChild(card);
  });

  window.requestAnimationFrame(() => {
    const anchor = window.location.hash?.substring(1);
    if (anchor) {
      const target = document.getElementById(anchor);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  });

})();