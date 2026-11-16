/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars -- Standalone browser QA evidence scripts. */
const { chromium } = require('C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');
const phase = process.argv[2] || 'baseline';
const out = path.join(__dirname, phase);
fs.mkdirSync(out, { recursive: true });
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:3001';
const events = [];
const failures = [];
const errors = [];
(async () => {
 const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
 const context = await browser.newContext({ viewport: { width: 1365, height: 900 } });
 const page = await context.newPage();
 page.on('requestfailed', r => failures.push({ url: r.url(), error: r.failure()?.errorText }));
 page.on('pageerror', e => errors.push(e.message));
 async function snap(name, observation) {
   await page.screenshot({ path: path.join(out, name + '.png'), fullPage: true });
   events.push({ name, observation, url: page.url(), text: await page.locator('body').innerText() });
 }
 async function go(route) { await page.goto(base + route, { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(1300); }
 async function closeDialog() { await page.keyboard.press('Escape'); await page.waitForTimeout(250); }
 try {
  await go('/');
  const skip = page.getByRole('button', { name: 'Skip intro', exact: true });
  if (await skip.isVisible()) await skip.click();
  await snap('01-landing', 'Landing first impression; collection must permit first product discovery.');
  await page.getByRole('link', { name: 'Discover the collection', exact: true }).dblclick();
  await page.waitForTimeout(1000);
  await snap('02-shop-double-primary', 'Double-click primary CTA; inspect whether shop inventory or an error appears.');
  const retry = page.getByRole('button', { name: 'Retry', exact: true });
  if (await retry.isVisible()) {
    await retry.click({ clickCount: 2 }); await page.waitForTimeout(1300);
    await snap('03-retry-loop', 'Double retry does not restore inventory when backend is unavailable.');
  }
  await page.getByRole('button', { name: 'Search the collection', exact: true }).click();
  await page.getByPlaceholder('Search clothing, jewelry, a favourite piece…').fill('<script>alert(1)</script> 🧨 \\ ../../ null @@@');
  await page.waitForTimeout(350);
  await snap('04-junk-search', 'Search accepts junk as text; must not execute markup, crash, or claim inventory is empty on fetch failure.');
  const searchRetry = page.getByRole('button', { name: 'Try again', exact: true });
  if (await searchRetry.isVisible()) { await searchRetry.click(); await page.waitForTimeout(1000); await snap('05-search-retry', 'Search recovery after failed collection.'); }
  await closeDialog();
  const jewelry = page.getByRole('button', { name: 'Jewelry', exact: true });
  if (await jewelry.isVisible()) { await jewelry.click({ clickCount: 2 }); await page.waitForTimeout(350); await snap('06-double-filter', 'Double category click should remain stable with no duplicate navigation.'); }
  await page.getByRole('button', { name: 'Open shopping bag, 0 items', exact: true }).click();
  await page.waitForTimeout(500);
  await snap('07-bag', 'Empty bag must distinguish an unavailable cart from a successfully loaded empty bag.');
  await closeDialog();
  await page.goBack({ waitUntil: 'domcontentloaded' }); await page.waitForTimeout(600);
  await snap('08-back-midflow', 'Browser Back after shop interaction; observe overlay or route state restoration.');
  await go('/account');
  await snap('09-account', 'Attempt account form; record visible account recovery if session cannot load.');
  const accountRetry = page.getByRole('button', { name: /try again|retry/i });
  if (await accountRetry.first().isVisible()) { await accountRetry.first().click({ clickCount: 2 }); await page.waitForTimeout(1000); await snap('10-account-double-retry', 'Double account retry; no crash expected.'); }
  await go('/checkout');
  await snap('11-checkout', 'Direct checkout recovery; no order or purchase attempted.');
  await page.goBack({ waitUntil: 'domcontentloaded' }); await page.waitForTimeout(500);
  await snap('12-back-checkout', 'Back mid checkout should restore prior account state.');
 } catch(e) { errors.push('Script step: ' + e.stack); await snap('error', 'Harness step stopped: ' + e.message).catch(()=>{}); }
 fs.writeFileSync(path.join(out, 'observations.json'), JSON.stringify({ persona:'breaker', phase, browser:'Real installed Google Chrome via Playwright, isolated context, headless', base, events, failures, errors, externalWrites:'None; no signup, contact, order or purchase submitted.' },null,2));
 console.log(JSON.stringify({phase, screenshots:events.map(e=>e.name), failures, errors},null,2));
 await browser.close();
})().catch(e=>{ console.error(e);process.exit(1); });
