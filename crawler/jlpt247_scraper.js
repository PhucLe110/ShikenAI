/**
 * JLPT247.COM - Scraper chính thức (đã verified)
 * 
 * Cơ chế hoạt động:
 * 1. Vào trang đề thi → đọc câu hỏi + đáp án từ DOM (.watu-question)
 * 2. Click input.watupro-live-result-btn để trigger AJAX tới admin-ajax.php
 * 3. AJAX trả về HTML với class "correct-answer" đánh dấu đáp án đúng
 * 4. Parse kết quả từ #liveResult-{n} sau khi AJAX xong
 * 
 * CÁCH DÙNG:
 *   cd d:\ShikenAI\crawler
 *   node jlpt247_scraper.js
 * Sau đó: cd ..\be && npx ts-node src/scripts/seed.ts
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// ==========================
// CẤU HÌNH
// ==========================
const CONFIG = {
  examUrls: [
    // N1 - Pro
    { url: 'https://jlpt247.com/n1-jlpt-pro-1/', title: 'Đề thi JLPT N1 - Pro 1', level: 'N1', duration: 170 },
    { url: 'https://jlpt247.com/n1-jlpt-pro-2/', title: 'Đề thi JLPT N1 - Pro 2', level: 'N1', duration: 170 },
    { url: 'https://jlpt247.com/n1-jlpt-pro-3/', title: 'Đề thi JLPT N1 - Pro 3', level: 'N1', duration: 170 },
    { url: 'https://jlpt247.com/n1-jlpt-pro-4/', title: 'Đề thi JLPT N1 - Pro 4', level: 'N1', duration: 170 },
    { url: 'https://jlpt247.com/n1-jlpt-pro-5/', title: 'Đề thi JLPT N1 - Pro 5', level: 'N1', duration: 170 },
    { url: 'https://jlpt247.com/n1-jlpt-pro-6/', title: 'Đề thi JLPT N1 - Pro 6', level: 'N1', duration: 170 },
    { url: 'https://jlpt247.com/n1-jlpt-pro-7/', title: 'Đề thi JLPT N1 - Pro 7', level: 'N1', duration: 170 },

    // N1 - Online
    { url: 'https://jlpt247.com/n1-jlpt-1/', title: 'Đề thi JLPT N1 - Online 1', level: 'N1', duration: 170 },
    { url: 'https://jlpt247.com/n1-jlpt-2/', title: 'Đề thi JLPT N1 - Online 2', level: 'N1', duration: 170 },
    { url: 'https://jlpt247.com/n1-jlpt-3/', title: 'Đề thi JLPT N1 - Online 3', level: 'N1', duration: 170 },
    { url: 'https://jlpt247.com/n1-jlpt-4/', title: 'Đề thi JLPT N1 - Online 4', level: 'N1', duration: 170 },
    { url: 'https://jlpt247.com/n1-jlpt-5/', title: 'Đề thi JLPT N1 - Online 5', level: 'N1', duration: 170 },
    { url: 'https://jlpt247.com/n1-jlpt-6/', title: 'Đề thi JLPT N1 - Online 6', level: 'N1', duration: 170 },
    { url: 'https://jlpt247.com/n1-jlpt-8/', title: 'Đề thi JLPT N1 - Online 8', level: 'N1', duration: 170 },

    // N2 - Pro
    { url: 'https://jlpt247.com/n2-jlpt-pro-1/', title: 'Đề thi JLPT N2 - Pro 1', level: 'N2', duration: 170 },
    { url: 'https://jlpt247.com/n2-jlpt-pro-2/', title: 'Đề thi JLPT N2 - Pro 2', level: 'N2', duration: 170 },
    { url: 'https://jlpt247.com/n2-jlpt-pro-3/', title: 'Đề thi JLPT N2 - Pro 3', level: 'N2', duration: 170 },
    { url: 'https://jlpt247.com/n2-jlpt-pro-4/', title: 'Đề thi JLPT N2 - Pro 4', level: 'N2', duration: 170 },
    { url: 'https://jlpt247.com/n2-jlpt-pro-5/', title: 'Đề thi JLPT N2 - Pro 5', level: 'N2', duration: 170 },
    { url: 'https://jlpt247.com/n2-jlpt-pro-6/', title: 'Đề thi JLPT N2 - Pro 6', level: 'N2', duration: 170 },
    { url: 'https://jlpt247.com/n2-jlpt-pro-7/', title: 'Đề thi JLPT N2 - Pro 7', level: 'N2', duration: 170 },


    // N2 - Online
    { url: 'https://jlpt247.com/n2-jlpt-1/', title: 'Đề thi JLPT N2 - Online 1', level: 'N2', duration: 170 },
    { url: 'https://jlpt247.com/n2-jlpt-2/', title: 'Đề thi JLPT N2 - Online 2', level: 'N2', duration: 170 },
    { url: 'https://jlpt247.com/n2-jlpt-3/', title: 'Đề thi JLPT N2 - Online 3', level: 'N2', duration: 170 },
    { url: 'https://jlpt247.com/n2-jlpt-4/', title: 'Đề thi JLPT N2 - Online 4', level: 'N2', duration: 170 },
    { url: 'https://jlpt247.com/n2-jlpt-5/', title: 'Đề thi JLPT N2 - Online 5', level: 'N2', duration: 170 },
    { url: 'https://jlpt247.com/n2-jlpt-6/', title: 'Đề thi JLPT N2 - Online 6', level: 'N2', duration: 170 },
    { url: 'https://jlpt247.com/n2-jlpt-7/', title: 'Đề thi JLPT N2 - Online 7', level: 'N2', duration: 170 },
    { url: 'https://jlpt247.com/n2-jlpt-8/', title: 'Đề thi JLPT N2 - Online 8', level: 'N2', duration: 170 },

    // N3 - Pro
    { url: 'https://jlpt247.com/n3-jlpt-pro-1/', title: 'Đề thi JLPT N3 - Pro 1', level: 'N3', duration: 170 },
    { url: 'https://jlpt247.com/n3-jlpt-pro-2/', title: 'Đề thi JLPT N3 - Pro 2', level: 'N3', duration: 170 },
    { url: 'https://jlpt247.com/n3-jlpt-pro-3/', title: 'Đề thi JLPT N3 - Pro 3', level: 'N3', duration: 170 },
    { url: 'https://jlpt247.com/n3-jlpt-pro-4/', title: 'Đề thi JLPT N3 - Pro 4', level: 'N3', duration: 170 },
    { url: 'https://jlpt247.com/n3-jlpt-pro-5/', title: 'Đề thi JLPT N3 - Pro 5', level: 'N3', duration: 170 },
    { url: 'https://jlpt247.com/n3-jlpt-pro-6/', title: 'Đề thi JLPT N3 - Pro 6', level: 'N3', duration: 170 },
    { url: 'https://jlpt247.com/n3-jlpt-pro-7/', title: 'Đề thi JLPT N3 - Pro 7', level: 'N3', duration: 170 },

    // N3 - Online
    { url: 'https://jlpt247.com/n3-jlpt-1/', title: 'Đề thi JLPT N3 - Online 1', level: 'N3', duration: 170 },
    { url: 'https://jlpt247.com/n3-jlpt-2/', title: 'Đề thi JLPT N3 - Online 2', level: 'N3', duration: 170 },
    { url: 'https://jlpt247.com/n3-jlpt-3/', title: 'Đề thi JLPT N3 - Online 3', level: 'N3', duration: 170 },
    { url: 'https://jlpt247.com/n3-jlpt-4/', title: 'Đề thi JLPT N3 - Online 4', level: 'N3', duration: 170 },
    { url: 'https://jlpt247.com/n3-jlpt-5/', title: 'Đề thi JLPT N3 - Online 5', level: 'N3', duration: 170 },
    { url: 'https://jlpt247.com/n3-jlpt-6/', title: 'Đề thi JLPT N3 - Online 6', level: 'N3', duration: 170 },
    { url: 'https://jlpt247.com/n3-jlpt-7/', title: 'Đề thi JLPT N3 - Online 7', level: 'N3', duration: 170 },
    { url: 'https://jlpt247.com/n3-jlpt-8/', title: 'Đề thi JLPT N3 - Online 8', level: 'N3', duration: 170 },

    // N4 - Pro
    { url: 'https://jlpt247.com/n4-jlpt-pro-1/', title: 'Đề thi JLPT N4 - Pro 1', level: 'N4', duration: 125 },
    { url: 'https://jlpt247.com/n4-jlpt-pro-2/', title: 'Đề thi JLPT N4 - Pro 2', level: 'N4', duration: 125 },
    { url: 'https://jlpt247.com/n4-jlpt-pro-3/', title: 'Đề thi JLPT N4 - Pro 3', level: 'N4', duration: 125 },
    { url: 'https://jlpt247.com/n4-jlpt-pro-4/', title: 'Đề thi JLPT N4 - Pro 4', level: 'N4', duration: 125 },
    { url: 'https://jlpt247.com/n4-jlpt-pro-5/', title: 'Đề thi JLPT N4 - Pro 5', level: 'N4', duration: 125 },
    { url: 'https://jlpt247.com/n4-jlpt-pro-6/', title: 'Đề thi JLPT N4 - Pro 6', level: 'N4', duration: 125 },

    // N4 - Online
    { url: 'https://jlpt247.com/n4-jlpt-1/', title: 'Đề thi JLPT N4 - Online 1', level: 'N4', duration: 125 },
    { url: 'https://jlpt247.com/n4-jlpt-2/', title: 'Đề thi JLPT N4 - Online 2', level: 'N4', duration: 125 },
    { url: 'https://jlpt247.com/n4-jlpt-3/', title: 'Đề thi JLPT N4 - Online 3', level: 'N4', duration: 125 },
    { url: 'https://jlpt247.com/n4-jlpt-4/', title: 'Đề thi JLPT N4 - Online 4', level: 'N4', duration: 125 },
    { url: 'https://jlpt247.com/n4-jlpt-5/', title: 'Đề thi JLPT N4 - Online 5', level: 'N4', duration: 125 },
    { url: 'https://jlpt247.com/n4-jlpt-6/', title: 'Đề thi JLPT N4 - Online 6', level: 'N4', duration: 125 },

    // N5 - Pro
    { url: 'https://jlpt247.com/n5-jlpt-pro-1/', title: 'Đề thi JLPT N5 - Pro 1', level: 'N5', duration: 105 },
    { url: 'https://jlpt247.com/n5-jlpt-pro-2/', title: 'Đề thi JLPT N5 - Pro 2', level: 'N5', duration: 105 },
    { url: 'https://jlpt247.com/n5-jlpt-pro-3/', title: 'Đề thi JLPT N5 - Pro 3', level: 'N5', duration: 105 },
    { url: 'https://jlpt247.com/n5-jlpt-pro-4/', title: 'Đề thi JLPT N5 - Pro 4', level: 'N5', duration: 105 },
    { url: 'https://jlpt247.com/n5-jlpt-pro-5/', title: 'Đề thi JLPT N5 - Pro 5', level: 'N5', duration: 105 },
    { url: 'https://jlpt247.com/n5-jlpt-pro-6/', title: 'Đề thi JLPT N5 - Pro 6', level: 'N5', duration: 105 },

    // N5 - Online
    { url: 'https://jlpt247.com/n5-jlpt-1/', title: 'Đề thi JLPT N5 - Online 1', level: 'N5', duration: 105 },
    { url: 'https://jlpt247.com/n5-jlpt-2/', title: 'Đề thi JLPT N5 - Online 2', level: 'N5', duration: 105 },
    { url: 'https://jlpt247.com/n5-jlpt-3/', title: 'Đề thi JLPT N5 - Online 3', level: 'N5', duration: 105 },
    { url: 'https://jlpt247.com/n5-jlpt-4/', title: 'Đề thi JLPT N5 - Online 4', level: 'N5', duration: 105 },
    { url: 'https://jlpt247.com/n5-jlpt-5/', title: 'Đề thi JLPT N5 - Online 5', level: 'N5', duration: 105 },
    { url: 'https://jlpt247.com/n5-jlpt-6/', title: 'Đề thi JLPT N5 - Online 6', level: 'N5', duration: 105 },
  ],

  // Timing
  pageDelay: 2500,       // Đợi sau khi tải trang (ms)
  perButtonDelay: 200,   // Delay giữa mỗi nút See Answer (ms) — đủ để không spam
};
// ==========================

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/**
 * Map mondai index (0-based, theo thứ tự div.watupro_catpage) -> skill
 * JLPT chuẩn: mondai 1-4 = vocab/kanji, mondai 5-8 = grammar, mondai 9+ = reading
 */
function mondaiToSkill(mondaiIndex) {
  if (mondaiIndex <= 3) return 'vocab';
  if (mondaiIndex <= 7) return 'grammar';
  return 'reading';
}

/**
 * Cào toàn bộ câu hỏi từ 1 trang đề thi
 * Chiến lược:
 * 1. Đọc câu hỏi/đáp án từ DOM gốc (.watu-question)
 * 2. Click từng nút See Answer → đợi AJAX → đọc .correct-answer từ #liveResult-{n}
 */
async function scrapeExamPage(page, url) {
  console.log(`  → Đang tải: ${url}`);
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 40000 });
  await sleep(CONFIG.pageDelay);

  // Kiểm tra có quiz không
  const questionCount = await page.$eval('.quiz-area', el => el.querySelectorAll('.watu-question').length).catch(() => 0);
  if (questionCount === 0) {
    console.log('    ⚠ Không có câu hỏi trên trang này');
    return [];
  }
  console.log(`    Tìm thấy ${questionCount} câu hỏi`);

  // Bước 1: Đọc câu hỏi + đáp án từ DOM gốc
  // Xác định mondai index để map skill
  const rawQuestions = await page.evaluate(() => {
    const results = [];
    const catPages = document.querySelectorAll('.watupro_catpage');

    catPages.forEach((catPage, mondaiIdx) => {
      const blocks = catPage.querySelectorAll('.watu-question');

      blocks.forEach((block) => {
        // Lấy question ID từ input hidden
        const qIdInput = block.querySelector('input[name="question_id[]"]');
        const questionId = qIdInput?.value;

        // Lấy số thứ tự liveResult (từ id="question-{n}")
        const questionWrap = block.querySelector('[id^="questionWrap-"]');
        const liveResultNum = questionWrap?.id?.replace('questionWrap-', '');

        // Lấy text câu hỏi: trong .question-content > div (bỏ span.watupro_num)
        const questionContentDiv = block.querySelector('.question-content > div');
        let questionText = '';
        if (questionContentDiv) {
          // Clone để xóa số thứ tự
          const clone = questionContentDiv.cloneNode(true);
          clone.querySelector('.watupro_num')?.remove();
          questionText = clone.innerText?.trim() || clone.textContent?.trim() || '';
        }

        // Lấy các đáp án
        const choices = block.querySelectorAll('.watupro-question-choice');
        const options = [];
        const optionIds = []; // Lưu answer-id để map sau

        choices.forEach(choice => {
          const label = choice.querySelector('label');
          const input = choice.querySelector('input[type="radio"]');
          if (!label) return;

          // Text đáp án (bỏ A./B./C./D. prefix từ <i> tag)
          const clone = label.cloneNode(true);
          // span bên trong chứa text thật
          const spanText = clone.querySelector('span')?.innerText?.trim() || clone.innerText?.trim();
          const text = spanText || '';

          options.push(text);
          optionIds.push(input?.value || '');
        });

        if (questionText && options.length >= 2) {
          results.push({
            questionId,
            liveResultNum,
            mondaiIdx,
            text: questionText,
            options,
            optionIds,
            correctAnswer: '', // Sẽ điền sau khi click See Answer
          });
        }
      });
    });

    return results;
  });

  console.log(`    Parsed ${rawQuestions.length} câu hỏi từ DOM`);

  // Bước 2 & 3: Duyệt từng catpage (mondai), force hiện nó, click See Answer, đọc kết quả
  // WatuPRO hiển thị từng mondai riêng — cần force display:block cho từng cái
  const liveResults = {}; // map: liveResultNum -> correctAnswerText

  // Lấy danh sách tất cả catpage IDs
  const catPageIds = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.watupro_catpage')).map(el => el.id);
  });
  console.log(`    ${catPageIds.length} mondai (catpage), đang lấy đáp án...`);

  for (const catId of catPageIds) {
    // Force hiện catpage này
    await page.evaluate((id) => {
      document.querySelectorAll('.watupro_catpage').forEach(el => {
        el.style.display = 'none';
      });
      const target = document.getElementById(id);
      if (target) target.style.display = 'block';
    }, catId);

    // Click TỪNG nút See Answer trong catpage này và đợi nó tải xong (tuần tự)
    // Điều này giúp máy chủ không bị quá tải và trả về đầy đủ đáp án
    // Đếm số lượng nút cần click trong catpage này
    const btnCount = await page.evaluate((id) => {
      return document.querySelectorAll(`#${id} input.watupro-live-result-btn`).length;
    }, catId);

    if (btnCount === 0) continue;

    for (let i = 0; i < btnCount; i++) {
      // Tìm liveResult ID tương ứng bằng cách truy vấn lại DOM (tránh lỗi context detachment)
      const liveNum = await page.evaluate((id, idx) => {
        const btns = document.querySelectorAll(`#${id} input.watupro-live-result-btn`);
        if (!btns[idx]) return null;
        const onclick = btns[idx].getAttribute('onclick') || '';
        const m = onclick.match(/liveResult\(\d+,\s*(\d+)\)/);
        return m ? m[1] : null;
      }, catId, i);

      if (!liveNum) continue;

      // Click nút bằng JS
      await page.evaluate((id, idx) => {
        const btns = document.querySelectorAll(`#${id} input.watupro-live-result-btn`);
        if (btns[idx]) btns[idx].click();
      }, catId, i);

      // Đợi li.correct-answer xuất hiện trong liveResult này
      try {
        await page.waitForFunction((num) => {
          const el = document.getElementById('liveResult-' + num);
          if (!el) return false;
          // Có nội dung (bỏ cái loading.gif) và có thẻ <li>
          return el.querySelector('li.correct-answer') !== null || 
                 (el.style.display !== 'none' && !el.innerHTML.includes('loading.gif') && el.innerHTML.includes('<li'));
        }, { timeout: 8000 }, liveNum);
      } catch (e) {
        // Timeout, cứ tiếp tục với câu tiếp theo
      }

      await sleep(CONFIG.perButtonDelay); // Nghỉ ngắn giữa các câu
    }

    // Đọc kết quả từ liveResult bên trong catpage này

    const catResults = await page.evaluate((id) => {
      const map = {};
      const cat = document.getElementById(id);
      if (!cat) return map;
      cat.querySelectorAll('[id^="liveResult-"]').forEach(el => {
        const num = el.id.replace('liveResult-', '');
        const correctLi = el.querySelector('li.correct-answer');
        if (!correctLi) return;
        const span = correctLi.querySelector('span.answer');
        let text = span?.innerText?.trim() || correctLi.innerText?.trim() || '';
        text = text.replace(/^[A-D]\.\s*/i, '').replace(/\s*correct\s*$/i, '').trim();
        if (text) map[num] = text;
      });
      return map;
    }, catId);

    Object.assign(liveResults, catResults);
  }

  // Restore: hiện lại tất cả catpage
  await page.evaluate(() => {
    document.querySelectorAll('.watupro_catpage').forEach(el => {
      el.style.display = 'block';
    });
  });

  // Bước 4: Ghép đáp án đúng vào câu hỏi
  const finalQuestions = rawQuestions.map((q, idx) => {
    let correct = liveResults[q.liveResultNum] || '';
    
    // Đảm bảo correct answer match chính xác với một trong các options
    if (correct) {
      const matchedOption = q.options.find(opt => opt.includes(correct) || correct.includes(opt));
      if (matchedOption) correct = matchedOption;
    }

    return {
      id: idx + 1,
      text: q.text,
      options: q.options,
      correctAnswer: correct || q.options[0], // fallback
      skill: mondaiToSkill(q.mondaiIdx),
      isFallback: !correct
    };
  });

  // Thống kê
  const fallback = finalQuestions.filter(q => q.isFallback).length;
  const withAnswer = finalQuestions.length - fallback;
  if (fallback > 0) console.log(`    ⚠ ${fallback} câu dùng fallback (không tìm được đáp án)`);
  console.log(`    ✓ Đáp án: ${withAnswer}/${rawQuestions.length} câu`);

  // Xóa key nội bộ
  finalQuestions.forEach(q => delete q.isFallback);

  return finalQuestions;
}

/**
 * Main
 */
async function main() {
  console.log('🚀 Khởi động JLPT247 Scraper...');
  console.log(`📋 Tổng số đề cần cào: ${CONFIG.examUrls.length}\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1280, height: 900 },
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');


  const fs = require('fs');
  const path = require('path');
  const dataPath = path.join(__dirname, 'data', 'jlpt247_data.json');
  
  let allExams = [];
  if (fs.existsSync(dataPath)) {
    try {
      allExams = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      // Giữ lại 39 đề đầu tiên (từ 0 đến 38), bỏ đề 40 (index 39) bị lỗi giữa chừng
      allExams = allExams.slice(0, 39); 
      console.log(`Đã load ${allExams.length} đề thi thành công từ lần chạy trước.`);
    } catch (e) {
      console.error('Lỗi đọc file data cũ:', e);
    }
  }

  let successCount = allExams.length;
  let failCount = 0;

  // Bắt đầu cào tiếp từ đề 40 (index 39)
  for (let i = 39; i < CONFIG.examUrls.length; i++) {
    const examConfig = CONFIG.examUrls[i];
    console.log(`\n[${i + 1}/${CONFIG.examUrls.length}] 📖 ${examConfig.title}`);

    try {
      const questions = await scrapeExamPage(page, examConfig.url);

      if (questions.length > 0) {
        allExams.push({
          title: examConfig.title,
          level: examConfig.level,
          duration: examConfig.duration,
          questions,
        });
        successCount++;
        console.log(`    ✅ ${questions.length} câu hỏi`);
      } else {
        failCount++;
        console.log(`    ❌ Không cào được`);
      }
    } catch (err) {
      failCount++;
      console.error(`    ❌ Lỗi: ${err.message}`);
    }

    // Delay giữa các đề tránh bị block
    if (i < CONFIG.examUrls.length - 1) {
      await sleep(CONFIG.pageDelay);
    }
  }

  await browser.close();

  // Lưu kết quả
  const outputDir = path.join(__dirname, 'data');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, 'jlpt247_data.json');
  fs.writeFileSync(outputPath, JSON.stringify(allExams, null, 2), 'utf-8');

  console.log('\n' + '='.repeat(50));
  console.log(`🎉 Hoàn thành!`);
  console.log(`   ✅ Thành công: ${successCount} đề`);
  console.log(`   ❌ Thất bại:  ${failCount} đề`);
  console.log(`   📊 Tổng câu hỏi: ${allExams.reduce((s, e) => s + e.questions.length, 0)}`);
  console.log(`   📁 Lưu tại: ${outputPath}`);
  console.log('\n👉 Bước tiếp theo:');
  console.log('   cd ..\\be && npx ts-node src/scripts/seed.ts');
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
