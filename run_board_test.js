const puppeteer = require('puppeteer-core');

async function testDualBoards() {
  console.log('--- Launching Dedicated Chrome for Board Deck Validation ---');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1750, height: 1100 }
  });

  const page = await browser.newPage();
  const targetUrl = 'https://frontend-pi-ten-67.vercel.app';
  console.log(`Navigating to ${targetUrl}...`);
  await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2000));

  // 1. Switch to Board View
  console.log('--- Clicking "Board View" Toggle ---');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const b = buttons.find(btn => btn.textContent && btn.textContent.trim() === 'Board View');
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  // Screenshot Board Deck
  await page.screenshot({ path: 'browser_test_8_board_deck.png', fullPage: false });
  console.log('Saved browser_test_8_board_deck.png');

  // 2. Click step inside Mobile Board simulation
  console.log('--- Testing step interaction inside Mobile 375 Board ---');
  await page.evaluate(() => {
    const stepCards = Array.from(document.querySelectorAll('div[class*="rounded-xl border text-xs cursor-pointer"]'));
    if (stepCards.length > 0) stepCards[0].click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // 3. Toggle theme while in Board view
  console.log('--- Testing Theme toggle in Board View ---');
  const themeBtn = await page.$('button[aria-label="Toggle theme"]');
  if (themeBtn) {
    await themeBtn.click();
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: 'browser_test_9_board_deck_dark.png', fullPage: false });
    console.log('Saved browser_test_9_board_deck_dark.png');
  }

  await browser.close();
  console.log('Dual Board Deck automation test completed successfully!');
}

testDualBoards().catch(err => {
  console.error('Board test error:', err);
  process.exit(1);
});
