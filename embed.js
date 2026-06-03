(async function () {
  console.log("📦 embed.js is running...");

  const markets = document.querySelectorAll('.sixam-embed');
  console.log("Attempting to load meta.json and data.csv...");

  const [metaJson, dataText] = await Promise.all([
    fetch('https://starmencarnes.github.io/audience-analytics/meta.json').then(r => r.json()),
    fetch('https://starmencarnes.github.io/audience-analytics/data.csv').then(r => r.text())
  ]);

  console.log("Loaded meta.json:", metaJson.slice(0, 1));
  console.log("Loaded data.csv:", dataText.slice(0, 100));

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
    const ig = Number(get(dataHeaders, dataRow, 'IG Followers')).toLocaleString();
    const webUsers = Number(get(dataHeaders, dataRow, 'Monthly Web Users')).toLocaleString();
    const rawBizBrief = get(dataHeaders, dataRow, 'BizBrief Readers');
    const bizBrief = rawBizBrief ? Number(rawBizBrief).toLocaleString() : '';

    const totalAudience = (
      parseInt(nlReaders.replace(/,/g, '') || '0', 10) +
      parseInt(ig.replace(/,/g, '') || '0', 10) +
      parseInt(webUsers.replace(/,/g, '') || '0', 10)
    ).toLocaleString();

    const colorClass = `theme-${meta['Brand Color']?.toLowerCase() || 'default'}`;

    const iconMail = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>';
    const iconPhone = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>';
    const iconGlobe = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>';

    const bizBriefRow = bizBrief ? `
          <div class="audience-metric">
            <span class="audience-metric-icon">${iconMail}</span>
            <span class="audience-metric-value">${bizBrief}</span>
            <span class="audience-metric-label">Weekly BizBrief Readers</span>
          </div>` : '';

    const card = document.createElement('div');
    card.className = `analytics-sixam-card ${colorClass}`;
    card.id = mkt;
    card.innerHTML = `
      <div class="card-left">
        <img class="analyticslogo" src="https://starmencarnes.github.io/audience-analytics/logos/${mkt}_PrimaryColor-Transparent-1000x1000.png" alt="${mkt} logo" />
        <div class="analytics-city-name">${meta['City Name']}</div>
        <div class="analytics-launch-date">Launched ${meta['Launch Date']}</div>
        <a href="${meta['Audience Profile URL']}" target="_blank" class="analytics-cta-button">Audience Profile</a>
      </div>
      <div class="card-right">
        <div class="audience-total">
          <span class="audience-total-value">${totalAudience}</span>
          <span class="audience-total-label">Total Audience</span>
        </div>
        <div class="audience-metrics">
          <div class="audience-metric">
            <span class="audience-metric-icon">${iconMail}</span>
            <span class="audience-metric-value">${nlReaders}</span>
            <span class="audience-metric-label" data-tooltip="Average number of unique readers opening our newsletter each send">Daily Newsletter Readers</span>
          </div>
          ${bizBriefRow}
          <div class="audience-metric">
            <span class="audience-metric-icon">${iconPhone}</span>
            <span class="audience-metric-value">${ig}</span>
            <span class="audience-metric-label">Instagram Followers</span>
          </div>
          <div class="audience-metric">
            <span class="audience-metric-icon">${iconGlobe}</span>
            <span class="audience-metric-value">${webUsers}</span>
            <span class="audience-metric-label">Monthly Web Users</span>
          </div>
        </div>
      </div>
    `;

    // Create and insert anchor tag
    const anchor = document.createElement('a');
    anchor.className = 'AnchorLink';
    const anchorId = mkt === "6AM City" ? mkt : `${mkt}today`;
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