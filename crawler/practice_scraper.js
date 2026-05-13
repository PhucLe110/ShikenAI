const puppeteer = require('puppeteer');
const fs = require('fs');
const cheerio = require('cheerio');

async function scrapeGrammar(level) {
    console.log(`Scraping Grammar ${level}...`);
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const url = `https://jlpt247.com/ngu-phap-${level.toLowerCase()}-jlpt/`;
    
    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        const html = await page.content();
        const $ = cheerio.load(html);
        
        const grammarPoints = [];
        $('.watu-question').each((i, el) => {
            const content = $(el).find('.question-content div').html();
            if (!content) return;
            
            const $content = cheerio.load('<div>' + content + '</div>');
            const title = $content('h6').first().text().trim();
            if (!title) return;

            const meaningJP = $content('h7:contains("[意味]")').next().text() || $content('h7:contains("[意味]")')[0]?.nextSibling?.nodeValue?.trim();
            const meaningEN = cleanJunk($content('h7:contains("[英訳]")').next().text() || $content('h7:contains("[英訳]")')[0]?.nextSibling?.nodeValue?.trim());
            const connection = $content('h7:contains("[接続]")').next().text() || $content('h7:contains("[接続]")')[0]?.nextSibling?.nodeValue?.trim();
            const meaningVN = $content('h7:contains("[VN]")').next().text() || $content('h7:contains("[VN]")')[0]?.nextSibling?.nodeValue?.trim();
            
            // Extract examples
            const examplesRaw = content.split('<h6>※ ※ ※ ※ ※</h6>')[1];
            const examples = [];
            if (examplesRaw) {
                const exParts = examplesRaw.split('=====');
                exParts.forEach(ex => {
                    const lines = ex.replace(/<br>/g, '\n').split('\n').map(l => l.trim()).filter(l => l);
                    if (lines.length >= 3) {
                        examples.push({
                            jp: lines[0].replace(/^\d+\//, '').trim(),
                            en: cleanJunk(lines[1]),
                            vn: lines[2]
                        });
                    }
                });
            }

            grammarPoints.push({
                title,
                level,
                meaning: {
                    jp: meaningJP || '',
                    en: meaningEN || '',
                    vn: meaningVN || ''
                },
                structure: connection || '',
                examples
            });
        });

        await browser.close();
        return grammarPoints;
    } catch (error) {
        console.error(`Error scraping ${level}:`, error);
        await browser.close();
        return [];
    }
}

async function scrapeITVocab() {
    console.log('Scraping IT Vocab...');
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const url = 'https://jlpt247.com/tu-vung-it/';
    
    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        const html = await page.content();
        const $ = cheerio.load(html);
        
        const vocabItems = [];
        $('table tr').each((i, el) => {
            const tds = $(el).find('td');
            if (tds.length >= 3) {
                const vn = $(tds[1]).text().trim();
                const jp = $(tds[2]).text().trim();
                if (vn && jp && vn !== 'Vietnamese' && jp !== 'Japanese') {
                    vocabItems.push({
                        word: jp,
                        meaning: vn,
                        category: 'IT'
                    });
                }
            }
        });

        await browser.close();
        return vocabItems;
    } catch (error) {
        console.error('Error scraping IT Vocab:', error);
        await browser.close();
        return [];
    }
}

function cleanJunk(text) {
    if (!text) return '';
    return text
        .replace(/Japanese language tutoring/gi, '')
        .replace(/Japanese language textbooks/gi, '')
        .trim();
}

async function main() {
    const allData = {
        grammar: [],
        vocab: []
    };

    // Scrape Grammar N1-N5
    for (const level of ['N1', 'N2', 'N3', 'N4', 'N5']) {
        const data = await scrapeGrammar(level);
        allData.grammar.push(...data);
    }

    // Scrape IT Vocab
    const itVocab = await scrapeITVocab();
    allData.vocab.push(...itVocab);

    fs.writeFileSync('practice_data.json', JSON.stringify(allData, null, 2));
    console.log('Scraping complete. Data saved to practice_data.json');
}

main();
