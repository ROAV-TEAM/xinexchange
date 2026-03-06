document.addEventListener('DOMContentLoaded', async () => {
    const chatMessages = document.getElementById('chatMessages');
    const msgInput = document.getElementById('msgInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatToast = document.getElementById('chatToast');
    const closedPopup = document.getElementById('closedPopup');
    const closeReasonText = document.getElementById('closeReasonText');
    const chatInputArea = document.getElementById('chatInputArea');

    // Check if session ID exists, otherwise create
    let sessionId = localStorage.getItem('xinpay_chat_session');

    // Create new session
    if (!sessionId) {
        const { data, error } = await supabaseClient
            .from('chat_sessions')
            .insert([{ status: 'open' }])
            .select()
            .single();

        if (data && !error) {
            sessionId = data.id;
            localStorage.setItem('xinpay_chat_session', sessionId);
        } else {
            console.error("Failed to create session:", error);
            return;
        }
    }

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

    // Fetch messages & poll
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
                pollingActive = false; // stop polling
                return;
            }

            if (sessionRes.error && sessionRes.error.code === 'PGRST116') {
                // Not found, maybe it was deleted (past 24h)
                localStorage.removeItem('xinpay_chat_session');
                // Could refresh to make a new one, but let's just act closed
                closeReasonText.innerText = "Session expired.";
                closedPopup.classList.remove('hidden');
                pollingActive = false;
                return;
            }

            // Fetch msgs
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

    // Send message
    async function sendMessage() {
        const text = msgInput.value.trim();
        if (!text) return;

        msgInput.value = '';
        msgInput.focus();

        await supabaseClient
            .from('chat_messages')
            .insert([{ session_id: sessionId, sender: 'user', message: text }]);

        pollChat(); // update instantly
    }

    sendBtn.addEventListener('click', sendMessage);
    msgInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
});
