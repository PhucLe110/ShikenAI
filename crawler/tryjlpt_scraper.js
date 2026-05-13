const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function scrapeTryJLPT() {
  const url = 'https://tryjlpt.com/vi/exams/7'; // URL ví dụ
  console.log(`Starting scraper for ${url}`);

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    // Đợi danh sách câu hỏi render
    // Chú ý: Selector này mang tính chất minh họa, cần điều chỉnh theo HTML thực tế của trang
    await page.waitForSelector('.question-container', { timeout: 10000 });

    const questions = await page.evaluate(() => {
      const results = [];
      const questionBlocks = document.querySelectorAll('.question-container');

      questionBlocks.forEach((block, index) => {
        // Lấy nội dung câu hỏi
        const questionText = block.querySelector('.question-text')?.innerText.trim() || `Question ${index + 1}`;
        
        // Lấy 4 đáp án
        const answerElements = block.querySelectorAll('.answer-option');
        const answers = [];
        let correctAnswer = '';

        answerElements.forEach((ans, ansIdx) => {
          const text = ans.innerText.trim();
          answers.push(text);
          
          // Giả sử đáp án đúng có class .correct hoặc thẻ chứa data-correct="true"
          if (ans.classList.contains('correct') || ans.getAttribute('data-correct') === 'true') {
            correctAnswer = text;
          }
        });

        results.push({
          id: index + 1,
          question: questionText,
          options: answers,
          correctAnswer: correctAnswer || 'N/A (Cần script click để hiện đáp án)',
        });
      });

      return results;
    });

    console.log(`Scraped ${questions.length} questions successfully.`);

    // Lưu data vào thư mục data
    const dir = path.join(__dirname, 'data');
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    
    fs.writeFileSync(
      path.join(dir, 'tryjlpt_data.json'),
      JSON.stringify(questions, null, 2),
      'utf-8'
    );
    console.log('Data saved to data/tryjlpt_data.json');

  } catch (error) {
    console.error('Error while scraping:', error);
  } finally {
    await browser.close();
  }
}

scrapeTryJLPT();
