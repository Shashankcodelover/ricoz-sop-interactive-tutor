const puppeteer = require('puppeteer-core');
const fs = require('fs');

async function runBrowserTest() {
  console.log('--- Launching Dedicated Chrome Headless Instance ---');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1440, height: 900 }
  });

  console.log('Browser launched successfully.');
  const page = await browser.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.log(`[Browser Console Error]: ${msg.text()}`);
  });
  page.on('pageerror', err => console.log(`[Browser PageError]: ${err.message}`));

  const targetUrl = 'https://frontend-pi-ten-67.vercel.app';
  console.log(`--- Navigating to ${targetUrl} ---`);
  await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2000));

  const pageTitle = await page.title();
  console.log(`Page title: "${pageTitle}"`);

  // Screenshot 1: Initial Dark Theme Load
  await page.screenshot({ path: 'browser_test_1_dark.png', fullPage: true });
  console.log('Captured browser_test_1_dark.png');

  // --- 2. Test Theme Toggle (Dark -> Light) ---
  console.log('--- Testing Theme Switcher (Dark -> Light) ---');
  const themeBtn = await page.$('button[aria-label="Toggle theme"]');
  if (themeBtn) {
    await themeBtn.click();
    await new Promise(r => setTimeout(r, 1500));
    console.log('Toggled theme to Light.');
    await page.screenshot({ path: 'browser_test_2_light.png', fullPage: true });
    console.log('Captured browser_test_2_light.png');

    console.log('Toggling back to Dark Mode...');
    await themeBtn.click();
    await new Promise(r => setTimeout(r, 1000));
  } else {
    console.warn('Theme toggle button not found!');
  }

  // --- 3. Test Real User Input: PRD Scenario 1 (Leave Request) ---
  console.log('--- Testing Real Input: Leave & Emergency Absence SOP ---');
  const textarea = await page.$('textarea');
  if (textarea) {
    await textarea.click();
    await page.evaluate(() => {
      const el = document.querySelector('textarea');
      if (el) el.value = '';
    });
    await textarea.type('How do I apply for annual or emergency medical leave and what are the notice requirements?', { delay: 10 });
    
    const sendBtn = await page.$('button[type="submit"]');
    if (sendBtn) {
      await sendBtn.click();
      console.log('Submitted query: Leave SOP.');
      await new Promise(r => setTimeout(r, 4500));
      await page.screenshot({ path: 'browser_test_3_leave.png', fullPage: false });
      console.log('Captured browser_test_3_leave.png');
    }
  }

  // --- 4. Test Real User Input: PRD Scenario 2 (Expense Reimbursement) ---
  console.log('--- Testing Real Input: Expense Reimbursement SOP ---');
  if (textarea) {
    await textarea.click();
    await page.evaluate(() => {
      const el = document.querySelector('textarea');
      if (el) el.value = '';
    });
    await textarea.type('What is the reimbursement procedure for a project expense of 4,000 INR with GST invoice?', { delay: 10 });
    const sendBtn = await page.$('button[type="submit"]');
    if (sendBtn) {
      await sendBtn.click();
      console.log('Submitted query: Reimbursement SOP.');
      await new Promise(r => setTimeout(r, 4500));
      await page.screenshot({ path: 'browser_test_4_reimbursement.png', fullPage: false });
      console.log('Captured browser_test_4_reimbursement.png');
    }
  }

  // --- 5. Test Interactive SOP Stepper ---
  console.log('--- Testing SOP Stepper ---');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const b = buttons.find(btn => btn.textContent && btn.textContent.includes('SOP Stepper'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Toggle step completion
  await page.evaluate(() => {
    const checkButtons = Array.from(document.querySelectorAll('button[title*="Mark"]'));
    if (checkButtons.length > 0) checkButtons[0].click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'browser_test_5_stepper.png', fullPage: false });
  console.log('Captured browser_test_5_stepper.png');

  // --- 6. Test Knowledge Base Tab ---
  console.log('--- Testing Knowledge Base Explorer ---');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const b = buttons.find(btn => btn.textContent && btn.textContent.includes('Knowledge Base'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'browser_test_6_knowledge.png', fullPage: false });
  console.log('Captured browser_test_6_knowledge.png');

  // --- 7. Test Compliance Monitor Tab ---
  console.log('--- Testing Compliance Monitor ---');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const b = buttons.find(btn => btn.textContent && btn.textContent.includes('Compliance Monitor'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'browser_test_7_compliance.png', fullPage: false });
  console.log('Captured browser_test_7_compliance.png');

  await browser.close();
  console.log('All browser validations finished successfully!');
}

runBrowserTest().catch(err => {
  console.error('Browser testing failed:', err);
  process.exit(1);
});
