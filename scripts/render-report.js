const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const outputPath = process.argv[2];
  if (!outputPath) {
    console.error('?ъ슜踰? node render-report.js <output.pdf>');
    process.exit(1);
  }
  const html = fs.readFileSync('report.html', 'utf-8');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '18mm', bottom: '18mm', left: '15mm', right: '15mm' },
  });
  await browser.close();
  console.log(`?앹꽦 ?꾨즺: ${outputPath}`);
})();
