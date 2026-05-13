const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeTudienJP() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1000 });

    const allData = {
        alphabet: [],
        kanji: [],
        word: [],
        grammar: []
    };

    // 1. Alphabet
    console.log('Scraping Alphabet...');
    await page.goto('https://tudienjp.com/alphabet', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 5000));
    allData.alphabet = await page.evaluate(() => {
        const results = [];
        document.querySelectorAll('.card-content.cpt').forEach(row => {
            const jp = row.querySelector('.cpt')?.innerText.trim();
            const romaji = row.querySelector('.col-md-8 div:nth-child(1)')?.innerText.trim();
            if (jp && romaji) results.push({ jp, romaji });
        });
        return results;
    });

    // 2. Kanji (N1-N5)
    for (let level = 5; level >= 1; level--) {
        console.log(`Scraping Kanji N${level}...`);
        await page.goto(`https://tudienjp.com/kanji/list?jlpt=${level}`, { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 5000));
        const items = await page.evaluate(() => {
            const results = [];
            document.querySelectorAll('.card-content.cpt').forEach(row => {
                const kanji = row.querySelector('.cpt')?.innerText.trim();
                const infoCol = row.querySelector('.col-md-8');
                const hanviet = infoCol?.querySelector('div:nth-child(1)')?.innerText.trim();
                const meaning = infoCol?.querySelector('div:nth-child(2)')?.innerText.trim();
                if (kanji) results.push({ kanji, hanviet, meaning });
            });
            return results;
        });
        allData.kanji.push(...items.map(i => ({ ...i, level: `N${level}` })));
    }

    // 3. Word (N1-N5)
    for (let level = 5; level >= 1; level--) {
        console.log(`Scraping Word N${level}...`);
        await page.goto(`https://tudienjp.com/word/list?jlpt=${level}`, { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 5000));
        const items = await page.evaluate(() => {
            const results = [];
            document.querySelectorAll('.card-content.cpt').forEach(row => {
                const wordCol = row.querySelector('.col-md-4');
                const infoCol = row.querySelector('.col-md-8');
                const word = wordCol?.querySelector('.cpt')?.innerText.trim();
                const reading = wordCol?.querySelector('div:nth-child(2)')?.innerText.trim();
                const meaning = infoCol?.querySelector('div:nth-child(1)')?.innerText.trim();
                if (word) results.push({ word, reading, meaning });
            });
            return results;
        });
        allData.word.push(...items.map(i => ({ ...i, level: `N${level}` })));
    }

    // 4. Grammar (N1-N5)
    for (let level = 5; level >= 1; level--) {
        console.log(`Scraping Grammar N${level}...`);
        await page.goto(`https://tudienjp.com/grammar/list?jlpt=${level}`, { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 5000));
        const items = await page.evaluate(() => {
            const results = [];
            document.querySelectorAll('.card-content.cpt').forEach(row => {
                const title = row.querySelector('.cpt')?.innerText.trim();
                const infoCol = row.querySelector('.col-md-8');
                const meaning = infoCol?.querySelector('div:nth-child(1)')?.innerText.trim();
                const category = infoCol?.querySelector('div:nth-child(2)')?.innerText.trim();
                if (title) results.push({ title, meaning, category });
            });
            return results;
        });
        allData.grammar.push(...items.map(i => ({ ...i, level: `N${level}` })));
    }

    fs.writeFileSync('tudien_data.json', JSON.stringify(allData, null, 2));
    console.log('TudienJP Scraping complete!');
    await browser.close();
}

scrapeTudienJP().catch(console.dir);
