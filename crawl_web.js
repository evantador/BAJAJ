const puppeteer = require('puppeteer');

async function crawlWebsite(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const visitedUrls = new Set();

    async function visitPage(currentUrl) {
        if (visitedUrls.has(currentUrl)) return;
        visitedUrls.add(currentUrl);

        try {
            await page.goto(currentUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });

            const urls = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('a')).map(anchor => anchor.href);
            });

            console.log('URLs found on', currentUrl, ':', urls);
            
            for (const url of urls) {
                if (!visitedUrls.has(url)) {
                    await visitPage(url); // Recursive crawling
                }
            }
        } catch (error) {
            console.error('Error visiting page:', currentUrl, error);
        }
    }

    await visitPage(url);
    await browser.close();
}

crawlWebsite('http://localhost:3000/'); // Replace with the starting URL
