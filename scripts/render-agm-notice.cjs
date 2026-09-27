const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

(async () => {
  const root = path.resolve(__dirname, '..');
  const audit = path.join(root, 'audit', 'agm');
  const assets = path.join(root, 'public', 'notices');
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1100, height: 2000 }, deviceScaleFactor: 3 });
    await page.goto(pathToFileURL(path.join(audit, 'notice-layout.html')).href);
    await page.evaluate(() => document.fonts.ready);
    const source = JSON.parse(fs.readFileSync(path.join(audit, 'source-runs.json'), 'utf8'));
    const textComparison = await page.evaluate(source => source.filter(p => p.text.trim()).map(p => ({
      index: p.index,
      equal: document.getElementById(`p${p.index}`).textContent === p.text,
    })), source);
    if (textComparison.some(p => !p.equal)) throw new Error(`Source text mismatch: ${JSON.stringify(textComparison)}`);
    const metrics = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
      fontLoaded: document.fonts.check('27px Preeti'),
      paragraphs: document.querySelectorAll('p').length,
      overflow: [...document.querySelectorAll('p')].filter(p => p.scrollWidth > p.clientWidth).map(p => p.id),
    }));
    if (!metrics.fontLoaded || metrics.overflow.length) throw new Error(JSON.stringify(metrics));
    // Crop to the document content, retaining the outer white margin.
    const height = Math.ceil(await page.locator('main').evaluate(el => el.getBoundingClientRect().bottom + 14));
    await page.setViewportSize({ width: 1100, height });
    await page.screenshot({ path: path.join(assets, 'agm-notice-2083.png'), fullPage: true });
    await page.pdf({ path: path.join(assets, 'agm-notice-2083.pdf'), width: '1100px', height: `${height}px`, printBackground: true, margin: { top: '0', right: '0', bottom: '0', left: '0' }, scale: 1 });
    const report = { ...metrics, height, imageWidth: 3300, imageHeight: height * 3, pdfPages: 1, sourceTextCharacterMatch: textComparison.every(p => p.equal), sourceParagraphsChecked: textComparison.length };
    fs.writeFileSync(path.join(audit, 'render-report.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
