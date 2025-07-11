import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1K5YiNTiJs6kKqYRAZlC22loqFJDjzBzfUCNPbpdLT4g/htmlview?gid=2029268226';
const STATUS_FILE = 'status.json';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const productRows = {
  C57: 57,
  C59: 59,
  C60: 60,
};

const productNames = {
  C57: "STRAWBERRY KIWI (FROZEN)",
  C59: "TIE GUAN YIN (FROZEN)",
  C60: "WATERMELON (FROZEN)",
};

const statusEmojis = {
  'AVAILABLE': '🟢',
  'LOW': '🟡',
  'OUT': '🔴',
  'OUT OF STOCK': '🔴'
};

async function getLastStatus() {
  try {
    const data = await fs.readFile(STATUS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return Object.fromEntries(Object.keys(productRows).map(k => [k, null]));
  }
}

async function saveStatus(status) {
  await fs.writeFile(STATUS_FILE, JSON.stringify(status, null, 2));
}

async function sendTelegram(msg) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('❗TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set');
    return;
  }
  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: msg,
      parse_mode: 'Markdown'
    })
  });
  const data = await res.json();
  console.log('Telegram API response:', data);
}

async function main() {
  const resp = await fetch(SHEET_URL);
  const html = await resp.text();
  const $ = cheerio.load(html);


  const productsToFind = Object.values(productNames).map(p => p.toUpperCase());
const found = {};

$('table.waffle tr').each((i, el) => {
  const tds = $(el).find('td');
  tds.each((j, td) => {
    const cellText = $(td).text().trim().toUpperCase();
    // Try to match any product
    for (const [cellKey, productName] of Object.entries(productNames)) {
      if (cellText === productName.toUpperCase()) {
        // Assume status is in the next cell (same row, next column)
        const statusCell = tds[j + 1];
        const status = statusCell ? $(statusCell).text().trim().toUpperCase() : null;
        found[cellKey] = status;
        console.log(`${cellKey}: ${productName} -> ${status}`);
      }
    }
  });
});

  // Compare to last run
  const lastValues = await getLastStatus();
  console.log('Last statuses:', lastValues);
  console.log('Current statuses:', found);

  const updates = [];
  for (const cell of Object.keys(productRows)) {
    const prev = lastValues[cell];
    const curr = found[cell];
    const emoji = statusEmojis[curr] || '❔';
    if (prev !== curr) {
      updates.push(`🔔 *Status change for ${productNames[cell]}*\nPrevious: \`${prev}\`\nNow: ${emoji} *${curr || 'UNKNOWN'}*`);
      lastValues[cell] = curr;
    }
  }

  if (updates.length > 0) {
    await sendTelegram(updates.join('\n\n'));
    await saveStatus(lastValues);
    console.log('✅ Alert sent and status.json updated.');
  } else {
    console.log('✅ No changes, no alert will be sent.');
  }
}

main();
