// Usage: node resize_image.js <input> <output> <maxWidth>
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const [,, input, output, maxWidthArg] = process.argv;
  const maxWidth = parseInt(maxWidthArg || '640', 10);
  const buf = fs.readFileSync(input);
  const b64 = buf.toString('base64');
  const ext = path.extname(input).slice(1);
  const mime = ext === 'png' ? 'image/png' : 'image/jpeg';

  const browser = await chromium.launch();
  const page = await browser.newPage();
  const html = `<img id="img" src="data:${mime};base64,${b64}">`;
  await page.setContent(html);
  await page.waitForSelector('#img');
  const dataUrl = await page.evaluate((maxW) => {
    return new Promise((resolve) => {
      const img = document.getElementById('img');
      const draw = () => {
        const scale = Math.min(1, maxW / img.naturalWidth);
        const w = Math.round(img.naturalWidth * scale);
        const h = Math.round(img.naturalHeight * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      if (img.complete) draw(); else img.onload = draw;
    });
  }, maxWidth);
  await browser.close();

  const outBuf = Buffer.from(dataUrl.split(',')[1], 'base64');
  fs.writeFileSync(output, outBuf);
  console.log('wrote', output, outBuf.length, 'bytes');
})();
