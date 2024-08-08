const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

async function scrapeMedalData() {
    let browser;
    try {
        console.log('Launching browser...');
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--disable-http2',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process'
            ]
        });
        const page = await browser.newPage();
        console.log('Navigating to Google search page...');
        await page.goto('https://www.google.com/search?q=Olympics+2024+medal+standings', { waitUntil: 'networkidle2', timeout: 60000 });

        console.log('Page loaded successfully. Extracting medal data...');
        const medalData = await page.evaluate(() => {
            const rows = document.querySelectorAll('table[aria-label="Teams"] tbody tr');
            let results = [];
            rows.forEach(row => {
                const cells = row.querySelectorAll('th, td');
                if (cells.length > 0) {
                    const team = cells[0].innerText.trim();
                    const gold = cells[1].innerText.trim();
                    const silver = cells[2].innerText.trim();
                    const bronze = cells[3].innerText.trim();
                    const total = cells[4].innerText.trim();

                    // Only add rows that have meaningful data
                    if (team && (gold || silver || bronze || total)) {
                        results.push({ team, gold, silver, bronze, total });
                    }
                }
            });
            return results;
        });

        console.log('Medal data extracted successfully:', medalData);
        return medalData;
    } catch (error) {
        console.error('Error fetching or parsing medal data:', error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/medals', async (req, res) => {
    try {
        console.log('Starting data fetch...');
        const data = await scrapeMedalData();
        console.log('Data fetched successfully:', data);
        res.json(data);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});