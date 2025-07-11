# Google Sheets Product Status Monitor Bot

This Node.js bot monitors a public Google Sheet for specific product statuses and sends Telegram alerts when any status changes.  
No Google API access or OCR required — it scrapes the published HTML view of the sheet for fast, reliable operation.

## 🚀 Features

- **Monitors specific products/cells** in your Google Sheet (customizable)
- **Sends real-time Telegram alerts** only when a product status changes (no spam!)
- **No browser or Playwright needed:** HTML is parsed directly for maximum speed and reliability
- **Runs every 5 minutes via GitHub Actions** — zero server hosting required
- **Auto-tracks status history** in `status.json` (committed to the repo for audit/history)

---

## 📝 How It Works

1. Fetches the Google Sheet's public `/htmlview` as an HTML table.
2. Locates your specified product names in the table.
3. Reads the status cell next to each product.
4. Compares current status to the last saved status in `status.json`.
5. **Sends a Telegram message if (and only if) any status changes.**
6. Updates `status.json` and commits it to the repo.

---

## ⚙️ Setup Instructions

### 1. **Clone the Repo**

```bash
git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name
```

### 2. **Install Node.js Dependencies**

```bash
npm install
```

### 3. **Configure Your Monitored Products**

Edit the `monitor.js` file if you want to monitor different products or a different sheet.  
By default, it monitors:

- `STRAWBERRY KIWI (FROZEN)`
- `TIE GUAN YIN (FROZEN)`
- `WATERMELON (FROZEN)`

Adjust the `productNames` map to your needs.

### 4. **Set Up Telegram Bot**

- Create a Telegram bot via [@BotFather](https://t.me/botfather) and get your token.
- Start a chat with your bot or add it to a group.
- Get your chat ID. (See [this guide](https://core.telegram.org/bots/tutorial#obtain-your-chat-id).)
- Add your Telegram token and chat ID as GitHub secrets:

  - `TELEGRAM_BOT_TOKEN`
  - `TELEGRAM_CHAT_ID`

  (Go to **Settings → Secrets and variables → Actions** in your repo.)

### 5. **Enable GitHub Actions**

- No further setup needed; [monitor.yml](.github/workflows/monitor.yml) is ready to go.
- GitHub Actions will run every 5 minutes, monitor your sheet, and commit `status.json` on change.

---

## 🛠️ Manual Testing

You can test locally by running:

```bash
TELEGRAM_BOT_TOKEN=your_token TELEGRAM_CHAT_ID=your_chat_id node monitor.js
```

Or set those in a `.env` file and load with [dotenv](https://www.npmjs.com/package/dotenv) (optional).

---

## 📝 Customization

- **Monitor more/fewer products:** Just update the `productNames` object in `monitor.js`.
- **Monitor a different sheet:** Change the `SHEET_URL` constant.
- **Customize Telegram alerts:** Edit the `sendTelegram()` function.

---

## 📦 Files

- `monitor.js` — Main script
- `status.json` — Last known statuses (auto-generated)
- `.github/workflows/monitor.yml` — GitHub Actions automation
- `package.json` — Node.js dependencies

---

## 🏁 Example Telegram Alert

```
🔔 Status change for STRAWBERRY KIWI (FROZEN)
Previous: `OUT OF STOCK ❌`
Now: 🟢 *AVAILABLE 💪*
```

---

## 📜 License

MIT

---

## 💡 Credits

Built by IndominusD using ChatGPT 4.1

---

*Feel free to fork and adapt! For feature requests or bug reports, open an Issue.*
