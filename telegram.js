// ─── Telegram Bot Notification Utility ───
const TG_BOT_TOKEN = '7969107308:AAEkeeIJr5JBJQm5CtIcwho-CQ1iN7q2EZk';
const TG_CHAT_IDS = ['8007853332', '7996892481', '8300832423'];

async function sendTelegramNotification(message) {
    for (const chatId of TG_CHAT_IDS) {
        try {
            await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'HTML'
                })
            });
        } catch (e) {
            console.warn('Telegram send failed for chat:', chatId, e);
        }
    }
}
