// Usage: node html_to_pdf.js <input.html> <output.pdf>
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const [,, inputHtml, outputPdf] = process.argv;
  if (!inputHtml || !outputPdf) {
    console.error('Usage: node html_to_pdf.js <input.html> <output.pdf>');
    process.exit(1);
  }
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file:///' + path.resolve(inputHtml).replace(/\\/g, '/'));
  await page.pdf({ path: path.resolve(outputPdf), printBackground: true, width: '900px' });
  await browser.close();
  console.log('wrote', outputPdf);
})();
