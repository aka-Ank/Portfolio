/**
 * WCAG 2.1 AA audit of both routes in both colour families.
 *
 * Complements `contrast-audit.test.ts`: that one proves the *token pairs* are
 * legal in isolation, this one proves the rendered pages are — it catches the
 * cases tokens cannot see, such as an opacity modifier applied in a className.
 *
 * Requires the dev or production server to already be running on :3000.
 *   npm run dev &  &&  npm run test:a11y
 */
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const targets = [
  ['/', 'light'], ['/', 'dark'],
  ['/classic', 'light'], ['/classic', 'dark'],
];

const browser = await chromium.launch();
let failed = 0;

for (const [path, family] of targets) {
  const ctx = await browser.newContext({
    colorScheme: family,
    viewport: { width: 1280, height: 900 },
  });
  // colorMode defaults to "auto", which follows the clock — so without pinning
  // it every run audits whichever family happens to match the time of day.
  await ctx.addInitScript((mode) => {
    localStorage.setItem(
      'portfolio-preferences',
      JSON.stringify({ state: { colorMode: mode, timeMode: 'day', ambience: 'clear' }, version: 0 }),
    );
  }, family);
  const page = await ctx.newPage();
  await page.goto(`http://localhost:3000${path}`, { waitUntil: 'networkidle' });
  // Let ThemeDriver settle so we audit the real rendered palette.
  await page.waitForFunction(() => document.documentElement.dataset.family !== undefined);
  const rendered = await page.evaluate(() => document.documentElement.dataset.family);

  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  console.log(`\n=== ${path} (requested ${family}, rendered ${rendered}) → ${violations.length} violations`);
  for (const v of violations) {
    failed++;
    console.log(`  [${v.impact}] ${v.id}: ${v.help}`);
    for (const n of v.nodes.slice(0, 3)) console.log(`      ${n.target.join(' ')}`);
  }
  await ctx.close();
}

await browser.close();
console.log(`\n${failed === 0 ? 'PASS — no violations' : `FAIL — ${failed} violation types`}`);
process.exit(failed === 0 ? 0 : 1);
