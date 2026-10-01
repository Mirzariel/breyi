import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { extname, join } from 'path';
const root = new URL('.', import.meta.url).pathname;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript' };
const srv = createServer(async (req, res) => {
  try { const p = join(root, decodeURIComponent(req.url.split('?')[0]));
    res.writeHead(200, { 'Content-Type': types[extname(p)] || 'application/octet-stream' }); res.end(await readFile(p));
  } catch { res.writeHead(404); res.end(); }
}).listen(8765);
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const views = process.argv.slice(2).length ? process.argv.slice(2) : ['hero', 'front', 'drawer'];
const W = +(process.env.W || 2400), H = +(process.env.H || 1500), OUT = process.env.OUT || 'out';
for (const v of views) {
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  page.on('console', m => console.log(v, m.text())); page.on('pageerror', e => console.log(v, 'ERR', e.message));
  await page.goto(`http://localhost:8765/render.html?view=${v}&w=${W}&h=${H}`);
  await page.waitForFunction(() => window.__done === true, null, { timeout: 600000 });
  await page.locator('canvas').screenshot({ path: `${OUT}/${v}.png`, omitBackground: true });
  const anchors = await page.evaluate(() => window.__anchors);
  (await import('fs')).writeFileSync(`${OUT}/${v}.anchors.json`, JSON.stringify(anchors, null, 1));
  console.log('rendered', v);
  await page.close();
}
await browser.close(); srv.close();
