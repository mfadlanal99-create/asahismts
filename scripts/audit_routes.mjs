import { spawn } from 'node:child_process';
import http from 'node:http';
import puppeteer from 'puppeteer-core';

const PORT = 4173;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const ROUTES = [
  '/',
  '/sim/caliper',
  '/sim/fits-tolerances',
  '/sim/bore-gauge',
  '/sim/hardness',
  '/sim/alignment',
  '/sim/bearing',
  '/sim/vibration',
  '/sim/bolt-torque',
  '/sim/belt-gear',
  '/sim/gear-strength',
  '/sim/chain-conveyor',
  '/sim/rigging-lifting',
  '/sim/utm-testing',
  '/sim/beam-bending',
  '/sim/weld-strength',
  '/sim/thermal-expansion',
  '/sim/coupling',
  '/sim/lube',
  '/sim/pneumatic',
  '/sim/hydraulic',
  '/sim/pump',
  '/sim/valve-packing',
  '/sim/compressor',
  '/sim/bearing-basics',
  '/sim/vbelt-basics',
  '/sim/fasteners-basics',
  '/sim/motor-basics',
  '/sim/oil-grease-basics',
  '/sim/multimeter',
  '/sim/clamp-meter',
  '/sim/db-meter',
  '/sim/vibration-meter',
  '/sim/megohmmeter',
  '/sim/ir-thermometer',
  '/sim/laser-tachometer'
];

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 375, height: 812 }
];

const THEMES = ['light', 'dark'];
const LANGUAGES = ['en', 'id', 'ja'];

function checkServerReady(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}/`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function ensureServer() {
  const ready = await checkServerReady(PORT);
  if (ready) {
    console.log(`[audit] Preview server already running on port ${PORT}`);
    return null;
  }
  console.log(`[audit] Starting vite preview on port ${PORT}...`);
  const proc = spawn('node', ['node_modules/vite/bin/vite.js', 'preview', '--port', String(PORT), '--host', '127.0.0.1', '--strictPort'], {
    stdio: 'ignore',
    shell: false
  });
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 200));
    if (await checkServerReady(PORT)) {
      console.log(`[audit] Preview server active on port ${PORT}`);
      return proc;
    }
  }
  throw new Error(`Failed to start preview server on port ${PORT}`);
}

async function runAudit() {
  const serverProc = await ensureServer();
  let browser;

  const results = {
    totalRoutes: ROUTES.length,
    passedRoutes: 0,
    failedRoutes: 0,
    routes: {}
  };

  try {
    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    });

    const page = await browser.newPage();

    for (const route of ROUTES) {
      console.log(`\n==================================================`);
      console.log(`[audit] Testing route: ${route}`);
      const routeResult = {
        route,
        consoleErrors: [],
        pageErrors: [],
        overflowIssues: [],
        svgIssues: [],
        passed: true
      };

      // Listen for errors
      const errorListener = (err) => {
        const msg = err.message || String(err);
        console.error(`  [PAGE ERROR] ${msg}`);
        routeResult.pageErrors.push(msg);
      };
      const consoleListener = (msg) => {
        if (msg.type() === 'error') {
          const text = msg.text();
          // Filter out benign favicon or noise if any
          console.error(`  [CONSOLE ERROR] ${text}`);
          routeResult.consoleErrors.push(text);
        }
      };

      page.on('pageerror', errorListener);
      page.on('console', consoleListener);

      // Set initial localStorage before first load
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => {
        localStorage.setItem('asahi-smts-hide-welcome', 'true');
        localStorage.setItem('mechlab-theme', 'light');
        localStorage.setItem('asahi-smts-language', 'en');
      });

      // Reload so initial state takes effect cleanly without modal
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {
        // Fallback if idle takes too long
      });
      // Allow dynamic imports / Suspense to resolve
      await new Promise((r) => setTimeout(r, 600));

      for (const vp of VIEWPORTS) {
        await page.setViewport({ width: vp.width, height: vp.height });
        await new Promise((r) => setTimeout(r, 100));

        for (const theme of THEMES) {
          // Toggle theme
          await page.evaluate((th) => {
            const root = document.documentElement;
            if (th === 'dark') {
              root.classList.add('dark');
            } else {
              root.classList.remove('dark');
            }
            localStorage.setItem('mechlab-theme', th);
          }, theme);
          await new Promise((r) => setTimeout(r, 50));

          for (const lang of LANGUAGES) {
            // Set language via TopRibbon button click so React re-renders localized strings
            await page.evaluate((l) => {
              const target = l.toUpperCase();
              const btns = Array.from(document.querySelectorAll('div[role="group"] button'));
              const match = btns.find((b) => (b.textContent || '').trim().toUpperCase() === target);
              if (match) {
                match.click();
              } else {
                document.documentElement.lang = l;
                localStorage.setItem('asahi-smts-language', l);
              }
            }, lang);
            await new Promise((r) => setTimeout(r, 60));

            // Check document horizontal overflow
            const overflow = await page.evaluate(() => {
              const docEl = document.documentElement;
              const scrollW = docEl.scrollWidth;
              const clientW = docEl.clientWidth;
              const hasOverflow = scrollW > clientW + 1; // allow 1px subpixel rounding

              let overflowingElements = [];
              if (hasOverflow) {
                const all = document.querySelectorAll('*');
                for (const el of all) {
                  const rect = el.getBoundingClientRect();
                  if (rect.right > window.innerWidth + 2 && window.getComputedStyle(el).overflow !== 'hidden') {
                    overflowingElements.push({
                      tag: el.tagName,
                      id: el.id || '',
                      className: typeof el.className === 'string' ? el.className.slice(0, 50) : '',
                      right: Math.round(rect.right),
                      windowWidth: window.innerWidth
                    });
                    if (overflowingElements.length >= 3) break;
                  }
                }
              }
              return { hasOverflow, scrollW, clientW, overflowingElements };
            }, vp.name);

            if (overflow.hasOverflow) {
              const desc = `[${vp.name}|${theme}|${lang}] Horizontal overflow: scrollWidth ${overflow.scrollW} > clientWidth ${overflow.clientW} (elements: ${JSON.stringify(overflow.overflowingElements)})`;
              console.warn(`  [OVERFLOW] ${desc}`);
              routeResult.overflowIssues.push(desc);
            }

            // Check SVGs
            const svgAudit = await page.evaluate(() => {
              const svgs = Array.from(document.querySelectorAll('svg'));
              const issues = [];

              for (const svg of svgs) {
                // Ignore zero-sized hidden utility icons/defs
                if (svg.closest('[hidden]') || svg.style.display === 'none' || svg.style.visibility === 'hidden') {
                  continue;
                }
                const rect = svg.getBoundingClientRect();
                const isIcon = rect.width <= 32 && rect.height <= 32;

                // Primary simulator SVG or canvas SVG
                if (!isIcon && (rect.width === 0 || rect.height === 0)) {
                  issues.push({
                    type: 'zero_dimension',
                    tag: 'svg',
                    className: typeof svg.className === 'string' ? svg.className.slice(0, 50) : '',
                    viewBox: svg.getAttribute('viewBox'),
                    width: rect.width,
                    height: rect.height
                  });
                }

                // Check text elements clipping outside parent SVG bounding box
                const texts = Array.from(svg.querySelectorAll('text'));
                for (const text of texts) {
                  const textRect = text.getBoundingClientRect();
                  if (textRect.width === 0 && textRect.height === 0) continue;
                  // Allow 4px tolerance for font rendering overhang / subpixel rounding
                  if (
                    textRect.left < rect.left - 4 ||
                    textRect.top < rect.top - 4 ||
                    textRect.right > rect.right + 4 ||
                    textRect.bottom > rect.bottom + 4
                  ) {
                    issues.push({
                      type: 'text_outside_svg_bounds',
                      text: (text.textContent || '').trim().slice(0, 30),
                      textRect: {
                        left: Math.round(textRect.left),
                        top: Math.round(textRect.top),
                        right: Math.round(textRect.right),
                        bottom: Math.round(textRect.bottom)
                      },
                      svgRect: {
                        left: Math.round(rect.left),
                        top: Math.round(rect.top),
                        right: Math.round(rect.right),
                        bottom: Math.round(rect.bottom)
                      }
                    });
                    if (issues.length >= 5) break;
                  }
                }
              }
              return { svgCount: svgs.length, issues };
            });

            if (svgAudit.issues.length > 0) {
              for (const issue of svgAudit.issues) {
                const desc = `[${vp.name}|${theme}|${lang}] SVG Issue: ${JSON.stringify(issue)}`;
                console.warn(`  [SVG] ${desc}`);
                routeResult.svgIssues.push(desc);
              }
            }
          }
        }
      }

      page.off('pageerror', errorListener);
      page.off('console', consoleListener);

      const hasCriticalError = routeResult.pageErrors.length > 0 || routeResult.consoleErrors.length > 0;
      if (hasCriticalError) {
        routeResult.passed = false;
        results.failedRoutes++;
        console.log(`❌ ${route} FAILED (Errors: ${routeResult.pageErrors.length} page, ${routeResult.consoleErrors.length} console)`);
      } else {
        routeResult.passed = true;
        results.passedRoutes++;
        console.log(`✓ ${route} PASSED (0 errors, ${routeResult.overflowIssues.length} overflow warnings, ${routeResult.svgIssues.length} svg warnings)`);
      }

      results.routes[route] = routeResult;
    }

    console.log(`\n==================================================`);
    console.log(`AUDIT SUMMARY: ${results.passedRoutes}/${results.totalRoutes} routes passed clean.`);
    console.log(`==================================================\n`);

  } finally {
    if (browser) {
      await browser.close();
    }
    if (serverProc) {
      serverProc.kill();
    }
  }

  return results;
}

runAudit()
  .then((res) => {
    process.exit(res.failedRoutes > 0 ? 1 : 0);
  })
  .catch((err) => {
    console.error('Audit run fatal error:', err);
    process.exit(1);
  });
