document.addEventListener('DOMContentLoaded', async () => {
    const chatMessages = document.getElementById('chatMessages');
    const msgInput = document.getElementById('msgInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatToast = document.getElementById('chatToast');
    const closedPopup = document.getElementById('closedPopup');
    const closeReasonText = document.getElementById('closeReasonText');
    const chatInputArea = document.getElementById('chatInputArea');

    // ─── Session Management ───
    // If old session exists, check if it's still open. If closed/expired, create fresh one.
    let sessionId = localStorage.getItem('xinpay_chat_session');

    async function createNewSession() {
        const { data, error } = await supabaseClient
            .from('chat_sessions')
            .insert([{ status: 'open' }])
            .select()
            .single();

        if (data && !error) {
            sessionId = data.id;
            localStorage.setItem('xinpay_chat_session', sessionId);
            // Telegram: New chat session opened
            sendTelegramNotification(`🟢 <b>New Chat Session Opened</b>\n\nSession ID: <code>${sessionId}</code>\nTime: ${new Date().toLocaleString()}`);
            return true;
        } else {
            console.error("Failed to create session:", error);
            return false;
        }
    }

    if (sessionId) {
        // Check if existing session is still valid
        const { data, error } = await supabaseClient
            .from('chat_sessions')
            .select('status')
            .eq('id', sessionId)
            .single();

        if (!data || error || data.status === 'closed') {
            // Old session is closed or deleted — create fresh one
            localStorage.removeItem('xinpay_chat_session');
            if (!await createNewSession()) return;
        }
    } else {
        // No session exists — create new
        if (!await createNewSession()) return;
    }

    // ─── Load Global Toast from Admin Config ───
    async function loadToast() {
        try {
            const { data } = await supabaseClient.from('app_config').select('chat_toast, chat_toast_timer').eq('id', 1).single();
            if (data && data.chat_toast && data.chat_toast.trim().length > 0) {
                chatToast.innerText = data.chat_toast;
                chatToast.style.display = 'block';
                if (data.chat_toast_timer > 0) {
                    setTimeout(() => chatToast.style.display = 'none', data.chat_toast_timer * 1000);
                }
            }
        } catch (e) { }
    }
    loadToast();

    // ─── Poll for Admin Toast Updates (Binance-style top banner) ───
    let lastToastText = '';
    async function pollAdminToast() {
        try {
            const { data } = await supabaseClient.from('app_config').select('chat_toast, chat_toast_timer').eq('id', 1).single();
            if (data && data.chat_toast && data.chat_toast.trim() !== lastToastText) {
                lastToastText = data.chat_toast.trim();
                chatToast.innerText = lastToastText;
                chatToast.style.display = 'block';
                if (data.chat_toast_timer > 0) {
                    setTimeout(() => chatToast.style.display = 'none', data.chat_toast_timer * 1000);
                }
            }
        } catch (e) { }
    }
    setInterval(pollAdminToast, 5000); // Check every 5 seconds for new admin announcements

    // ─── Chat Messages Polling ───
    let lastMessageCount = 0;
    let pollingActive = true;

    async function pollChat() {
        if (!pollingActive) return;

        try {
            // Check session status
            const sessionRes = await supabaseClient.from('chat_sessions').select('status, close_message').eq('id', sessionId).single();
            if (sessionRes.data && sessionRes.data.status === 'closed') {
                closeReasonText.innerText = sessionRes.data.close_message || "Admin has closed this chat session.";
                closedPopup.classList.remove('hidden');
                chatInputArea.style.display = 'none';
                pollingActive = false;
                localStorage.removeItem('xinpay_chat_session'); // Clear so next visit creates new session
                return;
            }

            if (sessionRes.error && sessionRes.error.code === 'PGRST116') {
                localStorage.removeItem('xinpay_chat_session');
                closeReasonText.innerText = "Session expired.";
                closedPopup.classList.remove('hidden');
                pollingActive = false;
                return;
            }

            // Fetch messages
            const { data, error } = await supabaseClient
                .from('chat_messages')
                .select('*')
                .eq('session_id', sessionId)
                .order('created_at', { ascending: true });

            if (data && data.length > lastMessageCount) {
                chatMessages.innerHTML = '';
                data.forEach(msg => {
                    const el = document.createElement('div');
                    el.className = `message ${msg.sender === 'user' ? 'msg-user' : 'msg-admin'}`;

                    const d = new Date(msg.created_at);
                    const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

                    el.innerHTML = `${msg.message} <div class="msg-time">${timeStr}</div>`;
                    chatMessages.appendChild(el);
                });
                chatMessages.scrollTop = chatMessages.scrollHeight;
                lastMessageCount = data.length;
            }
        } catch (e) { }

        if (pollingActive) {
            setTimeout(pollChat, 3000);
        }
    }
    pollChat();

    // ─── Send Message ───
    async function sendMessage() {
        const text = msgInput.value.trim();
        if (!text) return;

        msgInput.value = '';
        msgInput.focus();

        await supabaseClient
            .from('chat_messages')
            .insert([{ session_id: sessionId, sender: 'user', message: text }]);

        // Telegram: User sent a message
        sendTelegramNotification(`💬 <b>New Client Message</b>\n\nSession: <code>${sessionId.substring(0, 8)}...</code>\nMessage: ${text}\nTime: ${new Date().toLocaleString()}`);

        pollChat(); // update instantly
    }

    sendBtn.addEventListener('click', sendMessage);
    msgInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
});
